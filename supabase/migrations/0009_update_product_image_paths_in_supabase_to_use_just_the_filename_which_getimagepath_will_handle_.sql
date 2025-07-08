UPDATE public.products
    SET image = REPLACE(image, '/images/', '')
    WHERE image LIKE '/images/%';