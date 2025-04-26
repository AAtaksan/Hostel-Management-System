-- Create service_requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL CHECK (category IN ('maintenance', 'cleaning', 'security', 'other')),
  priority VARCHAR NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'in-progress', 'resolved', 'rejected')),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own service requests" ON public.service_requests
  FOR SELECT USING (auth.uid() = profile_id);
  
CREATE POLICY "Admins can view all service requests" ON public.service_requests
  FOR SELECT USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
  
CREATE POLICY "Users can create their own service requests" ON public.service_requests
  FOR INSERT WITH CHECK (auth.uid() = profile_id);
  
CREATE POLICY "Admins can update any service request" ON public.service_requests
  FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
  
CREATE POLICY "Users can update their own service requests" ON public.service_requests
  FOR UPDATE USING (auth.uid() = profile_id AND status = 'pending');

-- Create trigger to update timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); 