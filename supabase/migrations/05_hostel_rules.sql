-- Create hostel_rules table
CREATE TABLE IF NOT EXISTS public.hostel_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.hostel_rules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone authenticated can view rules" ON public.hostel_rules
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Only admins can manage rules" ON public.hostel_rules
  FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Create trigger to update timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.hostel_rules
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); 