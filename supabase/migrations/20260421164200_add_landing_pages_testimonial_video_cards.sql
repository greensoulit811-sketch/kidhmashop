ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS testimonial_cards JSONB DEFAULT '[]'::JSONB;
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS video_cards JSONB DEFAULT '[]'::JSONB;
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS hero_avatar TEXT;
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS cta_button_color TEXT DEFAULT '#fb923c';
