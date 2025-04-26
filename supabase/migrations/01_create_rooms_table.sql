-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  block VARCHAR NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('available', 'full', 'maintenance')),
  price NUMERIC(10, 2) NOT NULL,
  features JSONB,
  floor INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read
CREATE POLICY "Anyone can view rooms" ON public.rooms
  FOR SELECT USING (auth.role() = 'authenticated');
  
-- Create policy to allow only admins to insert/update/delete
CREATE POLICY "Only admins can insert rooms" ON public.rooms
  FOR INSERT WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
  
CREATE POLICY "Only admins can update rooms" ON public.rooms
  FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
  
CREATE POLICY "Only admins can delete rooms" ON public.rooms
  FOR DELETE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Create trigger to update timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); 