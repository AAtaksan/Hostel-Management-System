-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  receipt_number VARCHAR,
  description TEXT,
  payment_method VARCHAR NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = profile_id);
  
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
  
CREATE POLICY "Only admins can manage payments" ON public.payments
  FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Create trigger to update timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); 