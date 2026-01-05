-- Add subscription_expires_at to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Insert default subscription price setting if it doesn't exist
INSERT INTO public.app_settings (key, value, description)
VALUES ('subscription_price', '5000', 'Monthly subscription price in Tsh')
ON CONFLICT (key) DO NOTHING;