import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface StudyRoom {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  participant_count?: number;
}

export const useRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // get rooms the user is in
    const { data: parts } = await supabase
      .from('room_participants')
      .select('room_id')
      .eq('user_id', user.id);

    const roomIds = parts?.map(p => p.room_id) || [];

    if (roomIds.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    const { data: roomData, error } = await supabase
      .from('study_rooms')
      .select('*')
      .in('id', roomIds)
      .order('created_at', { ascending: false });

    if (!error && roomData) {
      // get participant counts
      const { data: counts } = await supabase
        .from('room_participants')
        .select('room_id');

      const roomsWithCounts = roomData.map(r => ({
        ...r,
        participant_count: counts?.filter(c => c.room_id === r.id).length || 1
      }));
      setRooms(roomsWithCounts);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  const createRoom = async (name: string) => {
    if (!user) return null;
    const { data: room, error: roomError } = await supabase
      .from('study_rooms')
      .insert({ name, created_by: user.id })
      .select()
      .single();

    if (roomError || !room) {
      toast.error("Failed to create room");
      return null;
    }

    // Join the room instantly
    await supabase.from('room_participants').insert({
      room_id: room.id,
      user_id: user.id
    });

    toast.success("Room created successfully!");
    await fetchRooms();
    return room.id;
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from('room_participants')
      .insert({ room_id: roomId, user_id: user.id });

    if (error) {
      if (error.code !== '23505') {
        toast.error("Failed to join room. It may not exist.");
        return false;
      }
    }

    toast.success("Joined room successfully!");
    await fetchRooms();
    return true;
  };

  const deleteRoom = async (roomId: string): Promise<boolean> => {
    if (!user) return false;

    const room = rooms.find(r => r.id === roomId);
    if (!room) { toast.error("Room not found"); return false; }
    if (room.created_by !== user.id) {
      toast.error("Only the room creator can delete this room");
      return false;
    }

    const { error } = await supabase.from('study_rooms').delete().eq('id', roomId);
    if (error) { toast.error("Failed to delete room"); return false; }

    toast.success("Room deleted");
    setRooms(prev => prev.filter(r => r.id !== roomId));
    return true;
  };

  return { rooms, loading, fetchRooms, createRoom, joinRoom, deleteRoom };
};
