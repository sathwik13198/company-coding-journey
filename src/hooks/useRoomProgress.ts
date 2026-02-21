import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Participant {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  progress_data: Record<string, string> | null;
}

export const useRoomProgress = (roomId: string | undefined) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const fetchParticipants = async () => {
      const { data: parts, error: partsError } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId);

      if (partsError || !parts || parts.length === 0) {
        setParticipants([]);
        setLoading(false);
        return;
      }

      const userIds = parts.map(p => p.user_id);

      // Correct: query profiles by user_id, not id
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const { data: progress } = await supabase
        .from('user_progress')
        .select('user_id, progress_data')
        .in('user_id', userIds);

      const combined: Participant[] = parts.map(p => {
        const profile = profiles?.find(prof => prof.user_id === p.user_id) || null;
        const prog = progress?.find(pr => pr.user_id === p.user_id);

        let parsedProgress = null;
        if (prog?.progress_data) {
          try {
            parsedProgress = typeof prog.progress_data === 'string'
              ? JSON.parse(prog.progress_data)
              : prog.progress_data;
          } catch (e) {
            console.error("Failed to parse progress data", e);
          }
        }

        return {
          user_id: p.user_id,
          display_name: profile?.display_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
          progress_data: parsedProgress,
        };
      });

      setParticipants(combined);
      setLoading(false);
    };

    fetchParticipants();
    const interval = setInterval(fetchParticipants, 15000);
    return () => clearInterval(interval);
  }, [roomId]);

  return { participants, loading };
};
