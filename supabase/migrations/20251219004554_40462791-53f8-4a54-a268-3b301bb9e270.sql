-- Add season/episode support columns to movies table
ALTER TABLE public.movies 
ADD COLUMN IF NOT EXISTS movie_type TEXT DEFAULT 'single' CHECK (movie_type IN ('single', 'season')),
ADD COLUMN IF NOT EXISTS season_number INTEGER,
ADD COLUMN IF NOT EXISTS video_links JSONB DEFAULT '[]'::jsonb;

-- Add comment for video_links column
COMMENT ON COLUMN public.movies.video_links IS 'Array of objects with name and url for episode links, e.g., [{"name": "Episode 1", "url": "https://..."}]';