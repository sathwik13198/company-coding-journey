import { useState, useEffect } from "react";
import { startMentorChatSession, getRelevantContext } from "@/lib/gemini";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = "leettracker_ai_mentor_history_v2";

export function useAIChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: ChatSession[] = JSON.parse(stored);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        } else {
          createNewSession();
        }
      } catch (e) {
        console.error("Failed to parse chat history", e);
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const activeMessages = sessions.find(s => s.id === activeSessionId)?.messages || [];

  // Initialize chat session when needed (or on mount if we have history)
  useEffect(() => {
    if (!activeSessionId) return;
    try {
      const session = startMentorChatSession(activeMessages);
      setChatSession(session);
    } catch (error: any) {
      console.error("Failed to init chat session", error);
      // Don't toast here to avoid spamming on mount if API key is missing
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId]); // Init when switching sessions

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(updated.length > 0 ? updated[0].id : null);
        if (updated.length === 0) {
          // We need to delay creation slightly so the state settles, or just create it immediately
          setTimeout(createNewSession, 0);
        }
      }
      return updated;
    });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        // Generate a title based on the first message if it's "New Chat"
        const title = s.title === "New Chat" && s.messages.length === 0
          ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
          : s.title;

        return { ...s, title, updatedAt: Date.now(), messages: [...s.messages, userMsg] };
      }
      return s;
    }));

    setLoading(true);

    try {
      let currentSession = chatSession;
      if (!currentSession) {
        // Try to init again if it failed before (e.g. user just added API key)
        currentSession = startMentorChatSession(activeMessages);
        setChatSession(currentSession);
      }

      const contextStr = getRelevantContext(content);
      const result = await currentSession.sendMessage(content + contextStr);
      const responseText = await result.response.text();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: Date.now(),
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, updatedAt: Date.now(), messages: [...s.messages, assistantMsg] };
        }
        return s;
      }));
    } catch (error: any) {
      console.error("Chat Error:", error);
      toast.error(error.message || "Failed to get response from AI Mentor.");
      // Remove the user message if the request failed
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: s.messages.filter(m => m.id !== userMsg.id) };
        }
        return s;
      }));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [], updatedAt: Date.now() };
      }
      return s;
    }));
    try {
      const newSession = startMentorChatSession([]);
      setChatSession(newSession);
      toast.success("Current chat memory cleared");
    } catch (e) {
      // Ignore
    }
  };

  return {
    sessions,
    activeSessionId,
    activeMessages,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    loading,
    sendMessage,
    clearHistory,
  };
}
