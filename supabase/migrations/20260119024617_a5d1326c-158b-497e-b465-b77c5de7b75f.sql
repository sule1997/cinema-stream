-- Insert AdSense settings into app_settings if they don't exist
INSERT INTO public.app_settings (key, value, description)
VALUES 
  ('adsense_display_ad', '', 'AdSense Display Ad code for homepage'),
  ('adsense_in_article_ad', '', 'AdSense In-Article Ad code')
ON CONFLICT (key) DO NOTHING;