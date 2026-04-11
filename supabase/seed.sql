-- Seed Products from src/data/products.ts

-- Floral Print Summer Dress
INSERT INTO public.products (name, slug, price, sale_price, category_id, stock, sku, short_description, description, images, is_new, is_best_seller, is_featured)
SELECT 
    'Floral Print Summer Dress', 
    'floral-summer-dress', 
    89.00, 
    69.00, 
    id, 
    25, 
    'DR-FLR-001', 
    'Light and airy floral dress perfect for summer days.', 
    'Embrace the warm weather with this stunning floral print summer dress. Featuring a flattering A-line silhouette, breathable cotton blend fabric, and a delicate tie-waist detail. Perfect for picnics, garden parties, or casual weekend outings.', 
    ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80', 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80'], 
    true, 
    false, 
    true
FROM public.categories WHERE slug = 'dresses'
ON CONFLICT (slug) DO NOTHING;

-- Classic Evening Gown
INSERT INTO public.products (name, slug, price, sale_price, category_id, stock, sku, short_description, description, images, is_new, is_best_seller, is_featured)
SELECT 
    'Classic Evening Gown', 
    'classic-evening-gown', 
    249.00, 
    NULL, 
    id, 
    10, 
    'DR-EVG-002', 
    'Elegant floor-length gown for special occasions.', 
    'Make an unforgettable entrance in this classic evening gown. Crafted from luxurious silk-blend satin, it features a draped neckline, a thigh-high slit, and a form-fitting silhouette that flatters every curve. Elevate your formalwear wardrobe with this timeless piece.', 
    ARRAY['https://images.unsplash.com/photo-1566160918074-60124ad722ba?w=800&q=80', 'https://images.unsplash.com/photo-1566160918074-60124ad722ba?w=800&q=80'], 
    false, 
    true, 
    true
FROM public.categories WHERE slug = 'dresses'
ON CONFLICT (slug) DO NOTHING;

-- Bohemian Maxi Dress
INSERT INTO public.products (name, slug, price, sale_price, category_id, stock, sku, short_description, description, images, is_new, is_best_seller, is_featured)
SELECT 
    'Bohemian Maxi Dress', 
    'boho-maxi-dress', 
    119.00, 
    99.00, 
    id, 
    30, 
    'DR-MAX-003', 
    'Flowy maxi dress with intricate embroidery.', 
    'Channel your inner free spirit with this gorgeous bohemian maxi dress. The lightweight, crinkled fabric drapes beautifully, while the detailed embroidery along the neckline and cuffs adds a touch of artisan charm. Style with sandals or boots for a versatile look.', 
    ARRAY['https://images.unsplash.com/photo-1515347619362-e6fd236aee18?w=800&q=80', 'https://images.unsplash.com/photo-1515347619362-e6fd236aee18?w=800&q=80'], 
    true, 
    false, 
    false
FROM public.categories WHERE slug = 'dresses'
ON CONFLICT (slug) DO NOTHING;

-- Chic Wrap Dress
INSERT INTO public.products (name, slug, price, sale_price, category_id, stock, sku, short_description, description, images, is_new, is_best_seller, is_featured)
SELECT 
    'Chic Wrap Dress', 
    'chic-wrap-dress', 
    135.00, 
    NULL, 
    id, 
    15, 
    'DR-WRP-004', 
    'Versatile wrap dress suitable for work or dinner.', 
    'The ultimate wardrobe staple, this chic wrap dress effortlessly transitions from day to night. Made from a premium, wrinkle-resistant jersey fabric, it offers a comfortable, customizable fit that accentuates the waist. A must-have for the modern woman.', 
    ARRAY['https://images.unsplash.com/photo-1618932260643-ee43e602fded?w=800&q=80', 'https://images.unsplash.com/photo-1618932260643-ee43e602fded?w=800&q=80'], 
    false, 
    false, 
    true
FROM public.categories WHERE slug = 'dresses'
ON CONFLICT (slug) DO NOTHING;

-- Casual Denim Overall Dress
INSERT INTO public.products (name, slug, price, sale_price, category_id, stock, sku, short_description, description, images, is_new, is_best_seller, is_featured)
SELECT 
    'Casual Denim Overall Dress', 
    'denim-overall-dress', 
    75.00, 
    NULL, 
    id, 
    40, 
    'DR-DNM-005', 
    'Playful and comfortable denim overall dress.', 
    'Add a playful touch to your casual lineup with this denim overall dress. Constructed from durable, vintage-wash denim, it features adjustable straps, functional pockets, and a relaxed fit. Layer it over your favorite tees or sweaters for year-round style.', 
    ARRAY['https://images.unsplash.com/photo-1622122201714-3a726ef4ba95?w=800&q=80', 'https://images.unsplash.com/photo-1622122201714-3a726ef4ba95?w=800&q=80'], 
    false, 
    true, 
    false
FROM public.categories WHERE slug = 'dresses'
ON CONFLICT (slug) DO NOTHING;

-- Lace Cocktail Midi
INSERT INTO public.products (name, slug, price, sale_price, category_id, stock, sku, short_description, description, images, is_new, is_best_seller, is_featured)
SELECT 
    'Lace Cocktail Midi', 
    'lace-cocktail-midi', 
    180.00, 
    150.00, 
    id, 
    20, 
    'DR-LCE-006', 
    'Sophisticated midi dress featuring delicate lace detailing.', 
    'Exude sophistication in this stunning lace cocktail midi dress. The intricate lace overlay, scalloped edges, and semi-sheer sleeves create a romantic and polished look. Ideal for weddings, cocktail parties, and upscale events.', 
    ARRAY['https://images.unsplash.com/photo-1595777457583-95e059f581ce?w=800&q=80', 'https://images.unsplash.com/photo-1595777457583-95e059f581ce?w=800&q=80'], 
    true, 
    false, 
    false
FROM public.categories WHERE slug = 'dresses'
ON CONFLICT (slug) DO NOTHING;

-- Ribbed Knit Bodycon
INSERT INTO public.products (name, slug, price, sale_price, category_id, stock, sku, short_description, description, images, is_new, is_best_seller, is_featured)
SELECT 
    'Ribbed Knit Bodycon', 
    'ribbed-knit-bodycon', 
    65.00, 
    NULL, 
    id, 
    50, 
    'DR-KNT-007', 
    'Figure-hugging ribbed knit dress for everyday wear.', 
    'Embrace comfort without compromising on style in this ribbed knit bodycon dress. The stretchy, medium-weight fabric hugs your curves perfectly while providing all-day comfort. Dress it up with heels or keep it casual with sneakers.', 
    ARRAY['https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&q=80', 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&q=80'], 
    false, 
    true, 
    true
FROM public.categories WHERE slug = 'dresses'
ON CONFLICT (slug) DO NOTHING;

-- Polka Dot Midi Dress
INSERT INTO public.products (name, slug, price, sale_price, category_id, stock, sku, short_description, description, images, is_new, is_best_seller, is_featured)
SELECT 
    'Polka Dot Midi Dress', 
    'polka-dot-midi', 
    95.00, 
    75.00, 
    id, 
    35, 
    'DR-PLK-008', 
    'Retro-inspired polka dot dress with a modern twist.', 
    'Bring a touch of retro charm to your wardrobe with this polka dot midi dress. Featuring a sweetheart neckline, puff sleeves, and a tiered skirt, it offers a fun and feminine aesthetic. Perfect for dates, brunch, or exploring the city.', 
    ARRAY['https://images.unsplash.com/photo-1605763240000-7e93b172d754?w=800&q=80', 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?w=800&q=80'], 
    true, 
    false, 
    true
FROM public.categories WHERE slug = 'dresses'
ON CONFLICT (slug) DO NOTHING;
