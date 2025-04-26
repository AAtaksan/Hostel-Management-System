-- Create notices table
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  tags JSONB DEFAULT '[]'::jsonb,
  author UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone authenticated can view notices" ON public.notices
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Only admins can create notices" ON public.notices
  FOR INSERT WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
  
CREATE POLICY "Only admins can update notices" ON public.notices
  FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
  
CREATE POLICY "Only admins can delete notices" ON public.notices
  FOR DELETE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Create trigger to update timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.notices
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); 