ALTER TABLE landing_pages ADD COLUMN banner_old_price TEXT;
ALTER TABLE landing_pages ADD COLUMN banner_new_price TEXT;
ALTER TABLE landing_pages ADD COLUMN show_banner BOOLEAN DEFAULT FALSE;
