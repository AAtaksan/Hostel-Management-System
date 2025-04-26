-- Add additional fields to profiles table for student information
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admission_number VARCHAR;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department VARCHAR;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS year_of_study INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue'));

-- Update RLS policies
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'); 