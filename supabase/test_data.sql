-- ===========================================
-- REGENERAR DATOS DE PRUEBA CON RELACIONES
-- ===========================================

-- 1. Limpiar todo primero
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM customers;
DELETE FROM products;
DELETE FROM categories;

-- 2. Crear categorías
INSERT INTO categories (id, name, slug, description, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Frutos Secos', 'frutos-secos', 'Frutos secos orgánicos', true),
  ('a0000000-0000-0000-0000-000000000002', 'Semillas', 'semillas', 'Semillas para germinar y consumir', true),
  ('a0000000-0000-0000-0000-000000000003', 'Harinas', 'harinas', 'Harinas integrales y especiales', true),
  ('a0000000-0000-0000-0000-000000000004', 'Aceites', 'aceites', 'Aceites vírgenes y prensados en frío', true),
  ('a0000000-0000-0000-0000-000000000005', 'Miel y Endulzantes', 'miel-endulzantes', 'Miel pura y endulzantes naturales', true),
  ('a0000000-0000-0000-0000-000000000006', 'Infusiones', 'infusiones', 'Tés e infusiones naturales', true),
  ('a0000000-0000-0000-0000-000000000007', 'Snacks', 'snacks', 'Snacks saludables', true),
  ('a0000000-0000-0000-0000-000000000008', 'Suplementos', 'suplementos', 'Suplementos naturales', true);

-- 3. Crear productos
INSERT INTO products (id, name, slug, description, short_description, price, original_price, stock, is_featured, is_active, is_organic, is_gluten_free, is_vegan, is_keto, category_id, brand, tags, ingredients)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Almendras Orgánicas', 'almendras-organicas', 'Almendras orgánicas premium directo de Mendoza.', 'Almendras premium de cultivo orgánico', 8500, 10200, 15000, true, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000001', 'Tinkuy Orgánico', '{"orgánico","premium"}', 'Almendras crudas'),
  ('b0000000-0000-0000-0000-000000000002', 'Nueces de Brasil', 'nueces-brasil', 'Nueces de Brasil silvestre.', 'Ricas en selenio', 12000, NULL, 8000, true, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000001', 'Selva Viva', '{"selenio"}', 'Nueces de Brasil'),
  ('b0000000-0000-0000-0000-000000000003', 'Mix de Semillas', 'mix-semillas-germinar', 'Mezcla de semillas.', '4 variedades', 4200, 5000, 12000, false, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000002', 'GerminaYA', '{"germinado"}', 'Semillas mixtas'),
  ('b0000000-0000-0000-0000-000000000004', 'Chía Orgánica', 'chia-organica', 'Semillas de chía orgánicas.', 'Omega-3', 5500, NULL, 20000, true, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000002', 'Tinkuy Orgánico', '{"omega-3"}', 'Semillas de chía'),
  ('b0000000-0000-0000-0000-000000000005', 'Harina de Almendra', 'harina-almendra', 'Harina de almendra molida.', 'Sin TACC', 7800, 9000, 6000, false, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000003', 'Molienda Artesanal', '{"sin tacc"}', 'Almendras molidas'),
  ('b0000000-0000-0000-0000-000000000006', 'Harina de Coco', 'harina-coco', 'Harina de coco desengrasada.', 'Alta en fibra', 6200, NULL, 10000, false, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000003', 'Isla Verde', '{"sin tacc"}', 'Coco molido'),
  ('b0000000-0000-0000-0000-000000000007', 'Aceite de oliva virgen extra', 'aceite-oliva-virgen-extra', 'Aceite de oliva prensado en frío.', 'Prensado en frío', 15000, 18000, 5000, true, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000004', 'Olivares del Norte', '{"prensado frío"}', 'Aceitunas 100%'),
  ('b0000000-0000-0000-0000-000000000008', 'Aceite de Coco Virgen', 'aceite-coco-virgen', 'Aceite de coco virgen prensado en frío.', 'Multiusos', 8900, NULL, 8000, false, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000004', 'TropiCo', '{"virgen"}', 'Coco prensado'),
  ('b0000000-0000-0000-0000-000000000009', 'Miel de Quaní', 'miel-quani', 'Miel pura de abeja.', 'Miel nativa', 7500, NULL, 12000, true, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000005', 'Aromos del Litoral', '{"pura"}', 'Miel 100%'),
  ('b0000000-0000-0000-0000-000000000010', 'Miel de Eucalipto', 'miel-eucalipto', 'Miel de eucalipto.', 'Para la garganta', 6800, 7500, 10000, false, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000005', 'Colmenares del Sur', '{"eucalipto"}', 'Miel pura'),
  ('b0000000-0000-0000-0000-000000000011', 'Té Verde Matcha', 'te-verde-matcha', 'Matcha ceremonial.', 'Matcha premium', 18000, 22000, 3000, true, true, true, true, true, false, 'a0000000-0000-0000-0000-000000000006', 'Tea House', '{"matcha"}', 'Té verde molido'),
  ('b0000000-0000-0000-0000-000000000012', 'Té de Manzana y Canela', 'te-manzana-canela', 'Infusión natural.', 'Sin teína', 3500, NULL, 18000, false, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000006', 'Infusiones del Jardín', '{"sin teína"}', 'Manzana, canela'),
  ('b0000000-0000-0000-0000-000000000013', 'Barrita Energética Coco', 'barrita-energetica-coco', 'Barrita artesanal.', '3 ingredientes', 2500, NULL, 25000, true, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000007', 'NatuSnack', '{"artesanal"}', 'Coco, miel, sal'),
  ('b0000000-0000-0000-0000-000000000014', 'Mix de Frutos Secos Premium', 'mix-frutos-secos-premium', 'Mezcla de frutos secos.', 'Para tablas', 12000, 14500, 7000, true, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000001', 'Tinkuy Orgánico', '{"mix"}', 'Almendras, castañas, pecán'),
  ('b0000000-0000-0000-0000-000000000015', 'Pistachos Iranianos', 'pistachos-iranies', 'Pistachos naturales sin sal.', 'Natural sin sal', 14000, NULL, 6000, false, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000001', 'Persia Nuts', '{"irán"}', 'Pistachos enteros'),
  ('b0000000-0000-0000-0000-000000000016', 'Semillas de Girasol', 'semillas-girasol', 'Semillas de girasol descascaradas.', 'Para decoración', 3200, NULL, 22000, false, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000002', 'Campo Sol', '{"girasol"}', 'Semillas descascaradas'),
  ('b0000000-0000-0000-0000-000000000017', 'Semillas de Cáñamo', 'semillas-cañamo', 'Semillas de cáñamo peladas.', 'Alto proteína', 6800, 8000, 10000, true, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000002', 'Hemp Life', '{"proteína"}', 'Semillas peladas'),
  ('b0000000-0000-0000-0000-000000000018', 'Harina de Trigo Sarraceno', 'harina-trigo-sarraceno', 'Harina sin gluten.', 'Sin gluten', 5500, NULL, 8000, false, true, true, false, true, true, 'a0000000-0000-0000-0000-000000000003', 'Molino Andino', '{"sin tacc"}', 'Trigo sarraceno molido'),
  ('b0000000-0000-0000-0000-000000000019', 'Polen de Abeja', 'polen-abeja', 'Polen de abeja.', 'Rico en vitamina B', 9500, 11000, 5000, false, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000008', 'Aromos del Litoral', '{"córdoba"}', 'Polen 100%'),
  ('b0000000-0000-0000-0000-000000000020', 'Levadura Nutricional', 'levadura-nutricional', 'Levadura nutricional.', 'Vitamina B12 vegana', 4200, NULL, 14000, true, true, true, true, true, true, 'a0000000-0000-0000-0000-000000000008', 'VitaGreen', '{"b12"}', 'Levadura desactivada');

-- 4. Crear 20 clientes
INSERT INTO customers (id, email, full_name, phone, created_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'maria.gonzalez@mail.com', 'María González', '+5491134567890', NOW() - INTERVAL '90 days'),
  ('c0000000-0000-0000-0000-000000000002', 'juan.perez@mail.com', 'Juan Pérez', '+5491134567891', NOW() - INTERVAL '120 days'),
  ('c0000000-0000-0000-0000-000000000003', 'ana.lopez@mail.com', 'Ana López', '+5491134567892', NOW() - INTERVAL '60 days'),
  ('c0000000-0000-0000-0000-000000000004', 'carlos.martinez@mail.com', 'Carlos Martínez', '+5491134567893', NOW() - INTERVAL '150 days'),
  ('c0000000-0000-0000-0000-000000000005', 'laura.rodriguez@mail.com', 'Laura Rodríguez', '+5491134567894', NOW() - INTERVAL '45 days'),
  ('c0000000-0000-0000-0000-000000000006', 'diego.sanchez@mail.com', 'Diego Sánchez', '+5491134567895', NOW() - INTERVAL '180 days'),
  ('c0000000-0000-0000-0000-000000000007', 'carolina.gomez@mail.com', 'Carolina Gómez', '+5491134567896', NOW() - INTERVAL '30 days'),
  ('c0000000-0000-0000-0000-000000000008', 'felipe.diaz@mail.com', 'Felipe Díaz', '+5491134567897', NOW() - INTERVAL '75 days'),
  ('c0000000-0000-0000-0000-000000000009', 'patricia.moreno@mail.com', 'Patricia Moreno', '+5491134567898', NOW() - INTERVAL '100 days'),
  ('c0000000-0000-0000-0000-000000000010', 'roberto.hurtado@mail.com', 'Roberto Hurtado', '+5491134567899', NOW() - INTERVAL '15 days'),
  ('c0000000-0000-0000-0000-000000000011', 'elena.ruiz@mail.com', 'Elena Ruiz', '+5491134567900', NOW() - INTERVAL '50 days'),
  ('c0000000-0000-0000-0000-000000000012', 'manuel.torres@mail.com', 'Manuel Torres', '+5491134567901', NOW() - INTERVAL '85 days'),
  ('c0000000-0000-0000-0000-000000000013', 'sofia.castillo@mail.com', 'Sofía Castillo', '+5491134567902', NOW() - INTERVAL '20 days'),
  ('c0000000-0000-0000-0000-000000000014', 'andres.romero@mail.com', 'Andrés Romero', '+5491134567903', NOW() - INTERVAL '110 days'),
  ('c0000000-0000-0000-0000-000000000015', 'camila.fernandez@mail.com', 'Camila Fernández', '+5491134567904', NOW() - INTERVAL '35 days'),
  ('c0000000-0000-0000-0000-000000000016', 'pablo.navarro@mail.com', 'Pablo Navarro', '+5491134567905', NOW() - INTERVAL '65 days'),
  ('c0000000-0000-0000-0000-000000000017', 'valentina.vega@mail.com', 'Valentina Vega', '+5491134567906', NOW() - INTERVAL '55 days'),
  ('c0000000-0000-0000-0000-000000000018', 'agustina.blanco@mail.com', 'Agustina Blanco', '+5491134567907', NOW() - INTERVAL '40 days'),
  ('c0000000-0000-0000-0000-000000000019', 'matias.cruz@mail.com', 'Matías Cruz', '+5491134567908', NOW() - INTERVAL '95 days'),
  ('c0000000-0000-0000-0000-000000000020', 'lucia.mendez@mail.com', 'Lucía Méndez', '+5491134567909', NOW() - INTERVAL '25 days');

-- 5. Crear pedidos
INSERT INTO orders (id, customer_id, order_number, customer_email, customer_name, customer_phone, subtotal, discount_amount, total, status, payment_status, shipping_address, created_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'TNK-000001', 'maria.gonzalez@mail.com', 'María González', '+5491134567890', 12500, 0, 13000, 'delivered', 'paid', '{"street":"Av. Santa Fe","number":"1234","city":"Buenos Aires","state":"Buenos Aires","postal_code":"1059"}', NOW() - INTERVAL '10 days'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'TNK-000002', 'juan.perez@mail.com', 'Juan Pérez', '+5491134567891', 8500, 500, 9000, 'delivered', 'paid', '{"street":"Calle Corrientes","number":"567","city":"Córdoba","state":"Córdoba","postal_code":"5000"}', NOW() - INTERVAL '15 days'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'TNK-000003', 'ana.lopez@mail.com', 'Ana López', '+5491134567892', 15000, 0, 15500, 'shipped', 'paid', '{"street":"Av. Rivadavia","number":"890","city":"Buenos Aires","state":"Buenos Aires","postal_code":"1002"}', NOW() - INTERVAL '5 days'),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'TNK-000004', 'carlos.martinez@mail.com', 'Carlos Martínez', '+5491134567893', 6800, 0, 7300, 'preparing', 'paid', '{"street":"Calle San Martín","number":"234","city":"Rosario","state":"Santa Fe","postal_code":"2000"}', NOW() - INTERVAL '3 days'),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'TNK-000005', 'laura.rodriguez@mail.com', 'Laura Rodríguez', '+5491134567894', 22000, 2000, 23500, 'pending', 'pending', '{"street":"Av. Perón","number":"4567","city":"Mendoza","state":"Mendoza","postal_code":"5500"}', NOW() - INTERVAL '1 day'),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'TNK-000006', 'maria.gonzalez@mail.com', 'María González', '+5491134567890', 5500, 0, 6000, 'delivered', 'paid', '{"street":"Av. Santa Fe","number":"1234","city":"Buenos Aires","state":"Buenos Aires","postal_code":"1059"}', NOW() - INTERVAL '25 days'),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000007', 'TNK-000007', 'carolina.gomez@mail.com', 'Carolina Gómez', '+5491134567896', 18000, 0, 18500, 'shipped', 'paid', '{"street":"Calle Maipú","number":"789","city":"Tucumán","state":"Tucumán","postal_code":"4000"}', NOW() - INTERVAL '7 days'),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000008', 'TNK-000008', 'felipe.diaz@mail.com', 'Felipe Díaz', '+5491134567897', 7500, 0, 8000, 'cancelled', 'refunded', '{"street":"Av. Pellegrini","number":"345","city":"Santa Fe","state":"Santa Fe","postal_code":"3000"}', NOW() - INTERVAL '20 days'),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', 'TNK-000009', 'ana.lopez@mail.com', 'Ana López', '+5491134567892', 12000, 1000, 12700, 'preparing', 'paid', '{"street":"Av. Rivadavia","number":"890","city":"Buenos Aires","state":"Buenos Aires","postal_code":"1002"}', NOW() - INTERVAL '2 days'),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000010', 'TNK-000010', 'roberto.hurtado@mail.com', 'Roberto Hurtado', '+5491134567899', 35000, 0, 36000, 'pending', 'pending', '{"street":"Calle Lima","number":"123","city":"Salta","state":"Salta","postal_code":"4400"}', NOW() - INTERVAL '12 hours');

-- 6. Crear items de pedidos (columnas: id, order_id, product_id, product_name, product_price, quantity, weight, unit_price, total_price)
INSERT INTO order_items (id, order_id, product_id, product_name, product_price, quantity, weight, unit_price, total_price)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Almendras Orgánicas', 8500, 2, 500, 8500, 17000),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'Aceite de oliva virgen extra', 15000, 1, 500, 15000, 15000),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000009', 'Miel de Quaní', 7500, 1, 500, 7500, 7500),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Nueces de Brasil', 12000, 1, 250, 12000, 12000),
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'Chía Orgánica', 5500, 2, 300, 5500, 11000),
  ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000011', 'Té Verde Matcha', 18000, 1, 100, 18000, 18000),
  ('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000012', 'Té de Manzana y Canela', 3500, 2, 80, 3500, 7000),
  ('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000013', 'Barrita Energética Coco', 2500, 3, 40, 2500, 7500),
  ('e0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000014', 'Mix de Frutos Secos Premium', 12000, 1, 500, 12000, 12000),
  ('e0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Almendras Orgánicas', 8500, 3, 500, 8500, 25500),
  ('e0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000007', 'Aceite de oliva virgen extra', 15000, 2, 500, 15000, 30000),
  ('e0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000009', 'Miel de Quaní', 7500, 2, 500, 7500, 15000),
  ('e0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Harina de Almendra', 7800, 1, 400, 7800, 7800),
  ('e0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000016', 'Semillas de Girasol', 3200, 2, 250, 3200, 6400),
  ('e0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000017', 'Semillas de Cáñamo', 6800, 1, 200, 6800, 6800),
  ('e0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000019', 'Polen de Abeja', 9500, 1, 150, 9500, 9500),
  ('e0000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000020', 'Levadura Nutricional', 4200, 2, 200, 4200, 8400),
  ('e0000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000015', 'Pistachos Iranianos', 14000, 1, 300, 14000, 14000),
  ('e0000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000003', 'Mix de Semillas', 4200, 2, 200, 4200, 8400),
  ('e0000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000018', 'Harina de Trigo Sarraceno', 5500, 1, 500, 5500, 5500),
  ('e0000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000001', 'Almendras Orgánicas', 8500, 2, 500, 8500, 17000),
  ('e0000000-0000-0000-0000-000000000022', 'd0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'Nueces de Brasil', 12000, 2, 250, 12000, 24000),
  ('e0000000-0000-0000-0000-000000000023', 'd0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000014', 'Mix de Frutos Secos Premium', 12000, 2, 500, 12000, 24000),
  ('e0000000-0000-0000-0000-000000000024', 'd0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000005', 'Harina de Almendra', 7800, 1, 400, 7800, 7800);

-- 7. Actualizar stock
UPDATE products SET stock = stock - 1500 WHERE id = 'b0000000-0000-0000-0000-000000000001';
UPDATE products SET stock = stock - 750 WHERE id = 'b0000000-0000-0000-0000-000000000002';
UPDATE products SET stock = stock - 400 WHERE id = 'b0000000-0000-0000-0000-000000000003';
UPDATE products SET stock = stock - 600 WHERE id = 'b0000000-0000-0000-0000-000000000004';
UPDATE products SET stock = stock - 400 WHERE id = 'b0000000-0000-0000-0000-000000000005';
UPDATE products SET stock = stock - 1500 WHERE id = 'b0000000-0000-0000-0000-000000000007';
UPDATE products SET stock = stock - 1500 WHERE id = 'b0000000-0000-0000-0000-000000000009';
UPDATE products SET stock = stock - 160 WHERE id = 'b0000000-0000-0000-0000-000000000012';
UPDATE products SET stock = stock - 120 WHERE id = 'b0000000-0000-0000-0000-000000000013';
UPDATE products SET stock = stock - 1500 WHERE id = 'b0000000-0000-0000-0000-000000000014';
UPDATE products SET stock = stock - 300 WHERE id = 'b0000000-0000-0000-0000-000000000015';
UPDATE products SET stock = stock - 500 WHERE id = 'b0000000-0000-0000-0000-000000000016';
UPDATE products SET stock = stock - 200 WHERE id = 'b0000000-0000-0000-0000-000000000017';
UPDATE products SET stock = stock - 500 WHERE id = 'b0000000-0000-0000-0000-000000000018';
UPDATE products SET stock = stock - 150 WHERE id = 'b0000000-0000-0000-0000-000000000019';
UPDATE products SET stock = stock - 400 WHERE id = 'b0000000-0000-0000-0000-000000000020';

-- 8. Actualizar estadísticas de clientes
UPDATE customers SET total_orders = (
  SELECT COUNT(*) FROM orders WHERE orders.customer_id = customers.id AND orders.status != 'cancelled'
), total_spent = (
  SELECT COALESCE(SUM(total), 0) FROM orders WHERE orders.customer_id = customers.id AND orders.status != 'cancelled'
);

-- 9. Verificar
SELECT 'Pedidos con cliente:' as info, COUNT(*) as total FROM orders WHERE customer_id IS NOT NULL;
SELECT 'Pedidos con items:' as info, COUNT(DISTINCT oi.order_id) as total FROM order_items oi;
SELECT 'Productos con stock:' as info, COUNT(*) as total FROM products WHERE stock > 0;
