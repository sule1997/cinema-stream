-- Create movies table
CREATE TABLE public.movies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT floor(random() * 701 + 800)::integer,
  category text NOT NULL,
  release_year integer NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::integer,
  dj_name text NOT NULL,
  video_url text,
  google_drive_url text,
  image_path text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

-- Movies are viewable by everyone
CREATE POLICY "Movies are viewable by everyone"
ON public.movies FOR SELECT
USING (true);

-- Admins can do everything
CREATE POLICY "Admins can manage all movies"
ON public.movies FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- DJs can insert their own movies
CREATE POLICY "DJs can insert their own movies"
ON public.movies FOR INSERT
WITH CHECK (has_role(auth.uid(), 'dj') AND auth.uid() = created_by);

-- DJs can update their own movies
CREATE POLICY "DJs can update their own movies"
ON public.movies FOR UPDATE
USING (has_role(auth.uid(), 'dj') AND auth.uid() = created_by);

-- DJs can delete their own movies
CREATE POLICY "DJs can delete their own movies"
ON public.movies FOR DELETE
USING (has_role(auth.uid(), 'dj') AND auth.uid() = created_by);

-- Create storage bucket for movie posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('movie-posters', 'movie-posters', true);

-- Allow anyone to view movie posters
CREATE POLICY "Movie posters are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'movie-posters');

-- Allow authenticated users to upload posters
CREATE POLICY "Authenticated users can upload posters"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'movie-posters' AND auth.role() = 'authenticated');

-- Allow users to update their own posters
CREATE POLICY "Users can update their own posters"
ON storage.objects FOR UPDATE
USING (bucket_id = 'movie-posters' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own posters
CREATE POLICY "Users can delete their own posters"
ON storage.objects FOR DELETE
USING (bucket_id = 'movie-posters' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add updated_at trigger for movies
CREATE TRIGGER update_movies_updated_at
BEFORE UPDATE ON public.movies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_purchases table to track bought movies
CREATE TABLE public.user_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id uuid NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  purchased_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Enable RLS
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases"
ON public.user_purchases FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own purchases
CREATE POLICY "Users can insert their own purchases"
ON public.user_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);