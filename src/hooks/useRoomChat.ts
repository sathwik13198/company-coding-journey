import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { startMentorChatSession, getRelevantContext } from "@/lib/gemini";

export interface RoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_ai: boolean;
  display_name?: string;
  avatar_url?: string | null;
}

const fetchProfilesForMessages = async (msgs: any[]): Promise<RoomMessage[]> => {
  if (!msgs || msgs.length === 0) return [];
  const userIds = Array.from(new Set(msgs.map(m => m.user_id)));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .in('user_id', userIds);

  return msgs.map(m => {
    const profile = profiles?.find(p => p.user_id === m.user_id);
    return {
      ...m,
      is_ai: m.is_ai ?? false,
      display_name: profile?.display_name ?? undefined,
      avatar_url: profile?.avatar_url ?? null,
    };
  });
};

export const useRoomChat = (roomId: string | undefined) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesRef = useRef<RoomMessage[]>([]);
  const lastFetchedAt = useRef<string | null>(null);

  // Keep ref in sync for use inside callbacks
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Adds new messages (deduped) to state
  const mergeNewMessages = (incoming: RoomMessage[]) => {
    setMessages(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const fresh = incoming.filter(m => !existingIds.has(m.id) && !m.id.startsWith('temp_'));
      if (fresh.length === 0) return prev;
      return [...prev.filter(m => !m.id.startsWith('temp_')), ...fresh].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  };

  // Initial load
  useEffect(() => {
    if (!roomId) return;

    const doInitialLoad = async () => {
      setLoading(true);
      const { data: msgs } = await supabase
        .from('room_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (msgs && msgs.length > 0) {
        const enriched = await fetchProfilesForMessages(msgs);
        setMessages(enriched);
        lastFetchedAt.current = enriched[enriched.length - 1].created_at;
      }
      setLoading(false);
    };

    doInitialLoad();
  }, [roomId]);

  // Polling fallback: poll every 3s for new messages from other users
  useEffect(() => {
    if (!roomId) return;

    const poll = async () => {
      const since = lastFetchedAt.current;
      let query = supabase
        .from('room_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (since) {
        query = query.gt('created_at', since);
      }

      const { data: newMsgs } = await query;

      if (newMsgs && newMsgs.length > 0) {
        const enriched = await fetchProfilesForMessages(newMsgs);
        mergeNewMessages(enriched);
        lastFetchedAt.current = enriched[enriched.length - 1].created_at;
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(poll, 3000);

    // Also try Supabase realtime as a bonus (works if the table is in the publication)
    const channel = supabase
      .channel(`room_msgs_rt_${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const newMsg = payload.new as any;
          if (messagesRef.current.find(m => m.id === newMsg.id)) return;
          const enriched = await fetchProfilesForMessages([newMsg]);
          mergeNewMessages(enriched);
          if (enriched[0]) lastFetchedAt.current = enriched[0].created_at;
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const sendMessage = async (content: string) => {
    if (!user || !roomId) {
      toast.error("You must be logged in to send a message.");
      return;
    }

    // Fetch the current user's own profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    // Optimistic insert
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: RoomMessage = {
      id: tempId,
      room_id: roomId,
      user_id: user.id,
      content,
      created_at: new Date().toISOString(),
      is_ai: false,
      display_name: profile?.display_name ?? "You",
      avatar_url: profile?.avatar_url ?? null,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    // Insert into DB
    const { data: inserted, error: insertError } = await supabase
      .from('room_messages')
      .insert({ room_id: roomId, user_id: user.id, content, is_ai: false })
      .select()
      .single();

    if (insertError) {
      toast.error("Failed to send message");
      setMessages(prev => prev.filter(m => m.id !== tempId));
      return;
    }

    // Replace temp message with real DB row
    setMessages(prev =>
      prev.map(m =>
        m.id === tempId ? { ...optimisticMsg, id: inserted.id, created_at: inserted.created_at } : m
      )
    );
    lastFetchedAt.current = inserted.created_at;

    // Intercept @mentor
    const triggersMentor = content.toLowerCase().includes('@mentor') || content.toLowerCase().includes('@ai');
    if (triggersMentor) {
      setIsAiLoading(true);
      try {
        const history = messagesRef.current
          .slice(-10)
          .filter(m => !m.id.startsWith('temp_'))
          .map(m => ({ role: m.is_ai ? "assistant" : "user" as "assistant" | "user", content: m.content }));

        const chatSession = startMentorChatSession(history);
        const contextStr = getRelevantContext(content);
        const result = await chatSession.sendMessage(content + contextStr);
        const aiResponse = await result.response.text();

        // Insert AI reply — polling on other clients will pick it up
        const { data: aiInserted } = await supabase
          .from('room_messages')
          .insert({ room_id: roomId, user_id: user.id, content: aiResponse, is_ai: true })
          .select()
          .single();

        // Show it immediately for the triggering user
        const aiMsg: RoomMessage = {
          id: aiInserted?.id ?? `temp_ai_${Date.now()}`,
          room_id: roomId,
          user_id: user.id,
          content: aiResponse,
          created_at: aiInserted?.created_at ?? new Date().toISOString(),
          is_ai: true,
          display_name: "AI Mentor",
          avatar_url: null,
        };
        setMessages(prev => [...prev, aiMsg]);
        if (aiInserted) lastFetchedAt.current = aiInserted.created_at;
      } catch (error: any) {
        console.error("AI Mentor Error:", error);
        toast.error(error.message || "AI Mentor failed to respond. Check your Gemini API key in Profile settings.");
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  return { messages, loading, isAiLoading, sendMessage };
};
