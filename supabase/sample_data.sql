-- ===========================================
-- POBLAR BASE DE DATOS TINKUY
-- ===========================================

-- INSERTAR CATEGORÍAS
INSERT INTO categories (id, name, slug, description, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Frutos Secos', 'frutos-secos', 'Frutos secos orgánicos', true),
  ('c1000000-0000-0000-0000-000000000002', 'Semillas', 'semillas', 'Semillas para germinar y consumir', true),
  ('c1000000-0000-0000-0000-000000000003', 'Harinas', 'harinas', 'Harinas integrales y especiales', true),
  ('c1000000-0000-0000-0000-000000000004', 'Aceites', 'aceites', 'Aceites vírgenes y prensados en frío', true),
  ('c1000000-0000-0000-0000-000000000005', 'Miel y Endulzantes', 'miel-endulzantes', 'Miel pura y endulzantes naturales', true),
  ('c1000000-0000-0000-0000-000000000006', 'Infusiones', 'infusiones', 'Tés e infusiones naturales', true),
  ('c1000000-0000-0000-0000-000000000007', 'Snacks', 'snacks', 'Snacks saludables', true),
  ('c1000000-0000-0000-0000-000000000008', 'Suplementos', 'suplementos', 'Suplementos naturales', true);

-- ===========================================
-- 30 PRODUCTOS
-- ===========================================
INSERT INTO products (id, name, slug, description, short_description, price, original_price, stock, is_featured, is_active, is_organic, is_gluten_free, is_vegan, is_keto, category_id, brand, tags, ingredients, weight)
VALUES
('p1000000-0000-0000-0000-000000000001', 'Almendras Orgánicas', 'almendras-organicas', 'Almendras orgánicas premium directo de Mendoza. Ricas en proteínas y grasas saludables.', 'Almendras premium de cultivo orgánico', 8500, 10200, 45, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000001', 'Tinkuy Orgánico', '["orgánico","premium","mendoza"]', 'Almendras orgánicas crudas', 500),
('p1000000-0000-0000-0000-000000000002', 'Nueces de Brasil', 'nueces-brasil', 'Nueces de Brasil silvestre recolectadas en Bolivia. Alto contenido de selenio.', 'Ricas en selenio natural', 12000, NULL, 30, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000001', 'Selva Viva', '["selenio","silvestre"]', 'Nueces de Brasil enteras', 250),
('p1000000-0000-0000-0000-000000000003', 'Mix de Semillas para Germinar', 'mix-semillas-germinar', 'Mezcla de alfalfa, trébol, rabanito y fenogreco para germinar en casa.', '4 variedades para germinar', 4200, 5000, 60, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000002', 'GerminaYA', '["germinado","4 semillas"]', 'Semillas de alfalfa, trébol, rabanito, fenogreco', 200),
('p1000000-0000-0000-0000-000000000004', 'Chía Orgánica', 'chia-organica', 'Semillas de chía orgánicas de Salta. Excelente fuente de omega-3.', 'Omega-3 natural', 5500, NULL, 80, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000002', 'Tinkuy Orgánico', '["omega-3","orgánico","salta"]', 'Semillas de chía orgánicas', 300),
('p1000000-0000-0000-0000-000000000005', 'Harina de Almendra', 'harina-almendra', 'Harina de almendra molida en piedra. Sin TACC, ideal para repostería keto.', 'Harina sin gluten', 7800, 9000, 25, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000003', 'Molienda Artesanal', '["sin tacc","keto","artesanal"]', 'Almendras molidas 100%', 400),
('p1000000-0000-0000-0000-000000000006', 'Harina de Coco', 'harina-coco', 'Harina de coco desengrasada, alta en fibra. Perfecta para preparaciones sin gluten.', 'Alta en fibra', 6200, NULL, 40, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000003', 'Isla Verde', '["sin tacc","vegetal"]', 'Coco molido desengrasado', 350),
('p1000000-0000-0000-0000-000000000007', 'Aceite de oliva virgen extra', 'aceite-oliva-virgen-extra', 'Aceite de oliva prensado en frío de olivares de Catamarca. Denso y aromático.', 'Prensado en frío', 15000, 18000, 20, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000004', 'Olivares del Norte', '["prensado frío","catamarca","premium"]', 'Aceitunas de olivo 100%', 500),
('p1000000-0000-0000-0000-000000000008', 'Aceite de Coco Virgen', 'aceite-coco-virgen', 'Aceite de coco virgen prensado en frío. Multiusos: cocina, piel y cabello.', 'Multiusos cocina y belleza', 8900, NULL, 35, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000004', 'TropiCo', '["virgen","multiusos"]', 'Coco prensado en frío', 300),
('p1000000-0000-0000-0000-000000000009', 'Miel de Quaní', 'miel-quani', 'Miel pura de abeja nativa del norte argentino. Sabor único y propiedades medicinales.', 'Miel nativa del norte', 7500, NULL, 50, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000005', 'Aromos del Litoral', '["pura","nativa"]', 'Miel de abeja 100% pura', 500),
('p1000000-0000-0000-0000-000000000010', 'Miel de Eucalipto', 'miel-eucalipto', 'Miel de eucalipto cristalizada naturalmente. Ideal para garganta y resfriados.', 'Para la garganta', 6800, 7500, 40, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000005', 'Colmenares del Sur', '["eucalipto","cristalizada"]', 'Miel de eucalipto pura', 400),
('p1000000-0000-0000-0000-000000000011', 'Té Verde Japonés Matcha', 'te-verde-matcha', 'Matcha ceremonial de alta calidad importado de Japón. Ideal para lattes y repostería.', 'Matcha ceremonial premium', 18000, 22000, 15, true, true, true, true, true, false, 'c1000000-0000-0000-0000-000000000006', 'Tea House', '["matcha","japonés","ceremonial"]', 'Hojas de té verde molidas', 100),
('p1000000-0000-0000-0000-000000000012', 'Té de Manzana y Canela', 'te-manzana-canela', 'Infusión natural de manzana deshidratada con canela. Sin teína, ideal para cualquier hora.', 'Sin teína', 3500, NULL, 70, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000006', 'Infusiones del Jardín', '["sin teína","frutal"]', 'Manzana deshidratada, canela', 80),
('p1000000-0000-0000-0000-000000000013', 'Barrita Energética Coco', 'barrita-energetica-coco', 'Barrita artesanal de coco rallado y miel. Sin aditivos, solo 3 ingredientes.', 'Solo 3 ingredientes', 2500, NULL, 100, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000007', 'NatuSnack', '["artesanal","energética"]', 'Coco, miel, sal marina', 40),
('p1000000-0000-0000-0000-000000000014', 'Mix de Frutos Secos Premium', 'mix-frutos-secos-premium', 'Mezcla de almendras, castañas, pecán y pasas de uva. Picada gruesa, ideal para tablas.', 'Para tablas y picadas', 12000, 14500, 30, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000001', 'Tinkuy Orgánico', '["mix","premium"]', 'Almendras, castañas, pecán, pasas', 500),
('p1000000-0000-0000-0000-000000000015', 'Pistachos Iranianos', 'pistachos-iranies', 'Pistachos Iranianos naturales sin sal. Crocantes y de color verde intenso.', 'Natural sin sal', 14000, NULL, 25, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000001', 'Persia Nuts', '["irán","natural"]', 'Pistachos enteros naturales', 300),
('p1000000-0000-0000-0000-000000000016', 'Semillas de Girasol', 'semillas-girasol', 'Semillas de girasol descascaradas. Perfectas para adornar panes y ensaladas.', 'Para decoración de platos', 3200, NULL, 90, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000002', 'Campo Sol', '["girasol","crudas"]', 'Semillas de girasol descascaradas', 250),
('p1000000-0000-0000-0000-000000000017', 'Semillas de Cáñamo', 'semillas-cañamo', 'Semillas de cáñamo peladas. Alto contenido proteico, ideales para smoothies.', 'Alto proteína', 6800, 8000, 40, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000002', 'Hemp Life', '["proteína","smoothie"]', 'Semillas de cáñamo peladas', 200),
('p1000000-0000-0000-0000-000000000018', 'Harina de Trigo Sarraceno', 'harina-trigo-sarraceno', 'Harina de trigo sarraceno molida en piedra. Alternativa sin gluten para panadería.', 'Sin gluten', 5500, NULL, 35, false, true, true, false, true, true, 'c1000000-0000-0000-0000-000000000003', 'Molino Andino', '["sin tacc","panadería"]', 'Trigo sarraceno molido', 500),
('p1000000-0000-0000-0000-000000000019', 'Polen de Abeja', 'polen-abeja', 'Polen de abeja colectado en campos orgánicos de Córdoba. Rico en vitaminas del grupo B.', 'Rico en vitamina B', 9500, 11000, 20, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000008', 'Aromos del Litoral', '["córdoba","orgánico"]', 'Polen de abeja 100%', 150),
('p1000000-0000-0000-0000-000000000020', 'Levadura Nutricional', 'levadura-nutricional', 'Levadura nutricional desactivada. Fuente de vitamina B12 para veganos.', 'Vitamina B12 vegana', 4200, NULL, 55, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000008', 'VitaGreen', '["b12","vegana"]', 'Levadura nutricional desactivada', 200),
('p1000000-0000-0000-0000-000000000021', 'Pasas de Uva Orgánicas', 'pasas-uva-organicas', 'Pasas de uva orgánica sin sulfatos. Dulces y jugosas, ideales para snacks y repostería.', 'Sin sulfatos', 4800, NULL, 65, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000007', 'Viñas del Sol', '["orgánico","sin sulfatos"]', 'Uvas pasas orgánicas', 400),
('p1000000-0000-0000-0000-000000000022', 'Dátiles Medjool', 'dátiles-medjool', 'Dátiles Medjool Premium de Irán. Dulces, carnosos y sin hueso.', 'Premium de Irán', 8500, NULL, 30, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000007', 'Oasis Dates', '["medjool","irán"]', 'Dátiles Medjool enteros', 500),
('p1000000-0000-0000-0000-000000000023', 'Coco Rallado', 'coco-rallado', 'Coco rallado deshidratado sin azúcar. Ideal para repostería y cocina asiática.', 'Sin azúcar', 2800, NULL, 75, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000007', 'Isla Verde', '["coco","repostería"]', 'Coco deshidratado rallado', 200),
('p1000000-0000-0000-0000-000000000024', 'Stevia líquida', 'stevia-liquida', 'Endulzante natural de stevia puro. 300 veces más dulce que el azúcar.', '300x más dulce', 3500, NULL, 50, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000005', 'PureSweet', '["stevia","natural"]', 'Extracto de stevia rebaudiana', 100),
('p1000000-0000-0000-0000-000000000025', 'Maca Peruana', 'maca-peruana', 'Polvo de maca orgánica del Perú. Raíz andina conocida por sus propiedades energizantes.', 'Energizante andino', 7500, 9000, 35, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000008', 'Andes Power', '["perú","energizante"]', 'Raíz de maca molida', 250),
('p1000000-0000-0000-0000-000000000026', 'Cacao Nibs', 'cacao-nibs', 'Nibs de cacao crudo orgánico. Crujientes y llenos de antioxidantes.', 'Antioxidantes', 6200, NULL, 40, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000007', 'Cacao Pure', '["crudo","antioxidantes"]', 'Granos de cacao fermentados y secados', 200),
('p1000000-0000-0000-0000-000000000027', 'Avena Integral', 'avena-integral', 'Avena integral orgánica de Río Negro. Perfecta para desayunos y horneados.', 'De Río Negro', 3800, NULL, 80, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000003', 'Campos del Sur', '["integral","orgánica"]', 'Granos de avena enteros', 500),
('p1000000-0000-0000-0000-000000000028', 'Sal Rosa Himalaya', 'sal-rosa-himalaya', 'Sal rosa del Himalaya molida fina. Rica en minerales traza.', 'Rica en minerales', 2500, NULL, 100, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000005', 'Himalaya Salt', '["mineral","himalaya"]', 'Sal rosada molida', 300),
('p1000000-0000-0000-0000-000000000029', 'Granola Casera', 'granola-casera', 'Granola artesanal con almendras, coco y miel. Sin aceites añadidos.', 'Artesanal sin aceites', 5500, 6500, 45, false, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000007', 'Casa Granola', '["artesanal","sin aceite"]', 'Avena, almendra, coco, miel', 400),
('p1000000-0000-0000-0000-000000000030', 'Jalea Real', 'jalea-real', 'Jalea real fresca de colmenas de Tucumán. 100% pura sin conservantes.', '100% pura', 18000, 22000, 10, true, true, true, true, true, true, 'c1000000-0000-0000-0000-000000000008', 'Apiarios del Norte', '["tucumán","fresca"]', 'Jalea real pura', 20);

-- ===========================================
-- 80 CLIENTES
-- ===========================================
INSERT INTO customers (id, email, full_name, phone, created_at)
SELECT
  gen_random_uuid()::text,
  'cliente' || generate_series || '@mail.com',
  'Cliente ' || generate_series,
  '+54911' || LPAD(generate_series::text, 8, '0'),
  NOW() - (random() * INTERVAL '365 days')
FROM generate_series(1, 80);

-- ===========================================
-- PEDIDOS CON DIFERENTES ESTADOS
-- ===========================================
INSERT INTO orders (id, customer_id, order_number, subtotal, discount_amount, total, status, payment_status, shipping_address, created_at)
SELECT
  gen_random_uuid()::text,
  (SELECT id FROM customers ORDER BY random() LIMIT 1),
  'TNK-' || LPAD(gs::text, 6, '0'),
  (random() * 15000 + 2000)::numeric(10,2),
  CASE WHEN random() > 0.7 THEN (random() * 1000)::numeric(10,2) ELSE 0 END,
  (random() * 15000 + 2000 - CASE WHEN random() > 0.7 THEN random() * 1000 ELSE 0 END)::numeric(10,2),
  (ARRAY['pending','paid','preparing','shipped','delivered','cancelled','pending','paid','preparing','shipped','delivered','pending','paid','shipped','delivered','pending','paid','delivered','pending','cancelled'])[floor(random() * 18 + 1)::int],
  CASE WHEN random() > 0.3 THEN 'paid' ELSE 'pending' END,
  jsonb_build_object(
    'street', 'Calle ' || (random()*100)::int,
    'number', (random()*2000)::int,
    'city', (ARRAY['Buenos Aires','Córdoba','Rosario','Mendoza','Tucumán','Salta','Santa Fe','Mar del Plata','San Juan','Misiones'])[floor(random()*10+1)::int],
    'state', (ARRAY['Buenos Aires','Córdoba','Santa Fe','Mendoza','Tucumán','Salta','Entre Ríos','Chaco','Santiago del Estero','Jujuy'])[floor(random()*10+1)::int],
    'postal_code', LPAD((random()*9000+1000)::int::text, 4, '0')
  ),
  NOW() - (random() * INTERVAL '180 days') + (random() * INTERVAL '30 days')
FROM generate_series(1, 60) AS gs;

-- ===========================================
-- ITEMS DE PEDIDOS
-- ===========================================
DO $$
DECLARE
  order_rec RECORD;
  item_count INT;
  product_price NUMERIC;
  product_name_val TEXT;
  product_id_val TEXT;
BEGIN
  FOR order_rec IN SELECT id FROM orders LOOP
    item_count := floor(random() * 4 + 2)::int;
    FOR i IN 1..item_count LOOP
      SELECT id, name, price INTO product_id_val, product_name_val, product_price FROM products ORDER BY random() LIMIT 1;
      INSERT INTO order_items (id, order_id, product_id, product_name, quantity, weight, unit_price, total_price)
      VALUES (
        gen_random_uuid()::text,
        order_rec.id,
        product_id_val,
        product_name_val,
        floor(random() * 3 + 1)::int,
        (ARRAY[200,250,300,400,500])[floor(random() * 5 + 1)::int],
        product_price,
        product_price * (floor(random() * 3 + 1)::int)
      );
    END LOOP;
  END LOOP;
END $$;
