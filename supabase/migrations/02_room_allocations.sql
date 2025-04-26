-- Create room_allocations table (junction table for students and rooms)
CREATE TABLE IF NOT EXISTS public.room_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a partial unique index instead of using UNIQUE with WHERE clause
CREATE UNIQUE INDEX idx_room_allocations_current_profile 
ON public.room_allocations (profile_id)
WHERE (is_current = TRUE);

-- Enable RLS
ALTER TABLE public.room_allocations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own allocations" ON public.room_allocations
  FOR SELECT USING (auth.uid() = profile_id);
  
CREATE POLICY "Admins can view all allocations" ON public.room_allocations
  FOR SELECT USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
  
CREATE POLICY "Only admins can manage allocations" ON public.room_allocations
  FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Create trigger to update timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.room_allocations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); 