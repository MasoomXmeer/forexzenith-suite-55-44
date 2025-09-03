
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  first_name text,
  last_name text,
  account_type text default 'standard' check (account_type in ('standard', 'premium', 'vip')),
  balance numeric default 10000,
  equity numeric default 10000,
  margin numeric default 0,
  free_margin numeric default 10000,
  kyc_status text default 'pending' check (kyc_status in ('pending', 'verified', 'rejected')),
  is_affiliate boolean default false,
  referral_code text,
  referred_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup with proper security context
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, account_type, balance, equity, margin, free_margin, kyc_status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    'standard',
    10000,
    10000,
    0,
    10000,
    'pending'
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ language plpgsql security definer;

-- Create updated_at function and trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create a database function that can be called via RPC to create profiles
-- This allows the client to create profiles when the trigger approach doesn't work
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id uuid,
  user_email text,
  first_name text DEFAULT '',
  last_name text DEFAULT ''
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, account_type, balance, equity, margin, free_margin, kyc_status)
  VALUES (
    user_id,
    user_email,
    first_name,
    last_name,
    'standard',
    10000,
    10000,
    0,
    10000,
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$ language plpgsql security definer;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
