-- Create Study Rooms table
CREATE TABLE public.study_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Room Participants table
CREATE TABLE public.room_participants (
    room_id UUID REFERENCES public.study_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (room_id, user_id)
);

-- Create Room Messages table
CREATE TABLE public.room_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.study_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_ai BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Study Rooms Policies
CREATE POLICY "Anyone can view study rooms" ON public.study_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create study rooms" ON public.study_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Room creators can update study rooms" ON public.study_rooms FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Room creators can delete study rooms" ON public.study_rooms FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Room Participants Policies
CREATE POLICY "Anyone can view room participants" ON public.room_participants FOR SELECT USING (true);
CREATE POLICY "Users can join rooms" ON public.room_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.room_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Room Messages Policies
CREATE POLICY "Anyone can view room messages" ON public.room_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.room_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
