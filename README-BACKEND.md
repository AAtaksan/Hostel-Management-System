# Dormitory Management System - Supabase Backend Setup

This document provides instructions for setting up the Supabase backend for the Dormitory Management System.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created
3. Node.js and npm installed on your machine

## Step 1: Setting Up Supabase Authentication

Authentication has already been set up according to instructions in the main README.md file. Make sure you've:

1. Created your Supabase project
2. Added your Supabase URL and anon key to the .env file
3. Set up the profiles table for authentication

## Step 2: Creating Database Tables

You need to create the following tables in your Supabase database. You can use the SQL in the `supabase/migrations` folder or follow these steps manually:

### 1. Set Up Helper Functions

First, create a function to automatically update timestamps:

```sql
-- Create set_updated_at function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. Create Rooms Table

```sql
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
```

### 3. Create Room Allocations Table

```sql
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

-- Create a partial unique index to ensure a student can only have one current allocation
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
```

### 4. Create Service Requests Table

```sql
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
```

### 5. Create Notices Table

```sql
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
```

### 6. Create Hostel Rules Table

```sql
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
```

### 7. Create Payments Table

```sql
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
```

### 8. Update Profiles Table for Student Information

```sql
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
```

## Step 3: Setting Up Initial Data

Once tables are created, you may want to seed some initial data:

### 1. Create First Admin User

1. Create a user through the Authentication tab in Supabase Dashboard
2. Set the user metadata to include `role: "admin"`
3. Add the user to the profiles table:

```sql
INSERT INTO profiles (id, email, name, role)
VALUES (
  'USER_UUID_FROM_AUTH', 
  'admin@example.com', 
  'Admin User', 
  'admin'
);
```

### 2. Add Sample Rooms

```sql
INSERT INTO rooms (number, type, block, capacity, status, price, features, floor)
VALUES 
  ('101', 'single', 'A', 1, 'available', 5000, '["bed", "desk", "wifi"]', 1),
  ('102', 'double', 'A', 2, 'available', 3500, '["bed", "desk", "wifi", "bathroom"]', 1),
  ('201', 'single', 'B', 1, 'available', 5500, '["bed", "desk", "wifi", "AC"]', 2);
```

### 3. Add Sample Hostel Rules

```sql
INSERT INTO hostel_rules (title, description, category, is_active)
VALUES 
  ('Quiet Hours', 'Quiet hours are from 10:00 PM to 6:00 AM.', 'general', true),
  ('Visitors', 'Visitors are allowed from 8:00 AM to 8:00 PM.', 'visitors', true),
  ('Cleanliness', 'Keep your room and common areas clean.', 'general', true);
```

## Step 4: Testing the Backend

Test your Supabase backend integration with the frontend:

1. Ensure your .env file has the correct Supabase URL and anon key
2. Start your app with `npx expo start`
3. Try to:
   - Log in as an admin user
   - Create a new student account
   - Assign a room to a student
   - Submit a service request
   - View all students and rooms

## Step 5: Enable Realtime Features

For real-time updates, you need to enable realtime for your tables:

1. Go to your Supabase dashboard
2. Navigate to Database > Replication
3. Enable replication for the following tables:
   - profiles
   - rooms
   - room_allocations
   - service_requests
   - notices
   - hostel_rules
   - payments

## Common Issues and Troubleshooting

### 1. SQL Syntax Errors

If you encounter syntax errors like:
```
ERROR: 42601: syntax error at or near "WHERE"
LINE 11: UNIQUE(profile_id, is_current) WHERE (is_current = TRUE)
```

This is because PostgreSQL doesn't support the `WHERE` clause in a `UNIQUE` constraint directly. Instead, use a partial unique index as shown in the room_allocations table creation script.

### 2. Permission Denied Errors

If you see permission denied errors, check your Row Level Security (RLS) policies. Ensure that:
- Users have the correct role (student/admin) in their JWT
- Policies are properly defined for each operation (SELECT, INSERT, UPDATE, DELETE)

### 3. Missing Data

If data isn't loading properly:
- Check the Network tab in browser devtools for failing API requests
- Verify that the authenticated user has the correct permissions
- Check for errors in your DataContext.tsx

### 4. Admin Operations Not Working

For admin operations:
- Ensure the user has `role: "admin"` in their user metadata
- Verify that RLS policies are checking the JWT correctly 