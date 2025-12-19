-- Add status column to movies table for review system
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';

-- Create app_settings table for admin toggles like review_required
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view app settings
CREATE POLICY "App settings are viewable by everyone" 
ON public.app_settings 
FOR SELECT 
USING (true);

-- Only admins can manage app settings
CREATE POLICY "Admins can manage app settings" 
ON public.app_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default setting for movie review
INSERT INTO public.app_settings (key, value, description) 
VALUES ('movie_review_required', 'false', 'When enabled, DJ movies require admin approval before going live')
ON CONFLICT (key) DO NOTHING;

-- Create trigger for updated_at on app_settings
CREATE OR REPLACE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();