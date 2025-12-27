-- Insert Kaspersky products into the products table
-- These IDs (1, 2, 3) match the hardcoded IDs in the Kaspersky page

INSERT INTO products (id, name, price, description, is_digital, sku, category, image) VALUES
(1, 'Kaspersky Standard', 39.99, 'Essential antivirus protection for your digital life', true, 'kaspersky-std-1yr', 'Antivirus', '/images/kaspersky-premium-1-year.webp'),
(2, 'Kaspersky Plus', 49.99, 'Advanced protection with privacy features', true, 'kaspersky-plus-1yr', 'Antivirus', '/images/kaspersky-premium-1-year.webp'),
(3, 'Kaspersky Premium', 99.99, 'Complete protection for your digital life', true, 'kaspersky-premium-1yr', 'Antivirus', '/images/kaspersky-premium-1-year.webp')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  is_digital = EXCLUDED.is_digital,
  sku = EXCLUDED.sku,
  category = EXCLUDED.category,
  image = EXCLUDED.image;