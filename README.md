# Authentication with Supabase

This project uses Supabase for authentication. Follow these steps to set up authentication for your project.

## Supabase Setup

1. **Create a Supabase Account**
   - Go to [Supabase](https://supabase.com/) and sign up
   - Create a new project

2. **Get Your API Keys**
   - From your Supabase project dashboard, go to Project Settings > API
   - Copy your Project URL and anon/public key

3. **Set Environment Variables**
   - Create a `.env` file in the root of your project
   - Add the following:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```
   - Ensure that your `.gitignore` file includes `.env` to keep your keys secure

4. **Set Up Database Tables**
   - Go to the SQL Editor in your Supabase dashboard
   - Run the following SQL to create a profiles table:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

5. **Configure Authentication Settings**
   - In your Supabase dashboard, go to Authentication > Settings
   - Configure the Site URL to match your app's URL
   - Enable Email provider in Authentication > Providers
   - Customize email templates in Authentication > Email Templates if needed

## Testing Your Setup

1. Run your app
2. Try to sign up with a new account
3. Check the Supabase Authentication dashboard to verify the user was created
4. Check the profiles table to verify a profile was created for the user

## Troubleshooting Common Issues

### Unable to resolve "expo-constants" from "lib\supabase.ts"

If you encounter this error, install the package using:
```
npx expo install expo-constants
```

### Unable to resolve "./SupabaseClient" from "@supabase/supabase-js"

This error occurs when the Supabase package isn't properly installed or there's an issue with dependencies. Fix it by:

1. Reinstall the Supabase package:
   ```
   npm uninstall @supabase/supabase-js
   npx expo install @supabase/supabase-js
   ```

2. Make sure the URL polyfill is installed and imported:
   ```
   npx expo install react-native-url-polyfill
   ```

3. Create a `lib/polyfills.ts` file with:
   ```typescript
   import 'react-native-url-polyfill/auto';
   ```

4. Import the polyfill in your Supabase client:
   ```typescript
   import './polyfills';
   import { createClient } from '@supabase/supabase-js';
   ```

### Error: supabase.auth.setStorageAdapter is not a function

This error occurs because the `setStorageAdapter` method has been deprecated or removed in newer Supabase versions. Instead, provide the storage adapter when creating the client:

1. Update your `lib/supabase.ts` file:
   ```typescript
   import './polyfills';
   import { createClient } from '@supabase/supabase-js';
   import * as SecureStore from 'expo-secure-store';
   import { Platform } from 'react-native';

   // Create custom storage adapter
   const customStorage = {
     getItem: async (key) => {
       if (Platform.OS === 'web') {
         return localStorage.getItem(key);
       } else {
         return SecureStore.getItemAsync(key);
       }
     },
     setItem: async (key, value) => {
       if (Platform.OS === 'web') {
         localStorage.setItem(key, value);
       } else {
         await SecureStore.setItemAsync(key, value);
       }
     },
     removeItem: async (key) => {
       if (Platform.OS === 'web') {
         localStorage.removeItem(key);
       } else {
         await SecureStore.deleteItemAsync(key);
       }
     },
   };

   export const supabase = createClient(
     process.env.EXPO_PUBLIC_SUPABASE_URL || '',
     process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
     {
       auth: {
         storage: customStorage,
         autoRefreshToken: true,
         persistSession: true,
         detectSessionInUrl: true,
       },
     }
   );
   ```

2. And remove any calls to `setStorageAdapter` in your auth context.

### Environment Variable Issues

If your environment variables aren't working:

1. Make sure you have a `.env` file in your project root
2. Check that the variable names start with `EXPO_PUBLIC_`
3. Restart your development server with:
   ```
   npx expo start --clear
   ``` 