-- Add 'anggota' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'anggota';

-- Add status columns to anggota table
ALTER TABLE public.anggota 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status_anggota character varying DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_anggota_user_id ON public.anggota(user_id);
CREATE INDEX IF NOT EXISTS idx_anggota_status ON public.anggota(status_anggota);

-- Update RLS policy: Members can view their own data
CREATE POLICY "Members can view their own data" 
ON public.anggota 
FOR SELECT 
USING (
  auth.uid() = user_id OR is_staff(auth.uid())
);

-- Update RLS policy: Members can update limited fields of their own data
CREATE POLICY "Members can update own profile" 
ON public.anggota 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to check if user is anggota with active status
CREATE OR REPLACE FUNCTION public.is_active_anggota(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.anggota
    WHERE user_id = _user_id
      AND status_anggota = 'active'
  )
$$;

-- Create function to get anggota status
CREATE OR REPLACE FUNCTION public.get_anggota_status(_user_id uuid)
RETURNS character varying
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status_anggota
  FROM public.anggota
  WHERE user_id = _user_id
  LIMIT 1
$$;