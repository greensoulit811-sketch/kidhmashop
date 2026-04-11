-- Add video_url field to landing_pages
ALTER TABLE public.landing_pages
ADD COLUMN video_url TEXT;
