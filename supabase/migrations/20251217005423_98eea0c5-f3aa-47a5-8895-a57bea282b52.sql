-- Create categories table
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create api_settings table for admin
CREATE TABLE public.api_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  api_key text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.api_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage API settings
CREATE POLICY "Admins can manage api settings"
ON public.api_settings FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create withdraw_requests table
CREATE TABLE public.withdraw_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  processed_by uuid REFERENCES auth.users(id),
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;

-- DJs can view their own requests
CREATE POLICY "DJs can view their own requests"
ON public.withdraw_requests FOR SELECT
USING (auth.uid() = user_id);

-- DJs can create their own requests
CREATE POLICY "DJs can create requests"
ON public.withdraw_requests FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'dj'));

-- Admins can view and manage all requests
CREATE POLICY "Admins can manage all requests"
ON public.withdraw_requests FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add is_blocked to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- Add earnings column to profiles for DJs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS earnings numeric DEFAULT 0;

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for api_settings updated_at
CREATE TRIGGER update_api_settings_updated_at
BEFORE UPDATE ON public.api_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update movies table to reference categories
ALTER TABLE public.movies 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);