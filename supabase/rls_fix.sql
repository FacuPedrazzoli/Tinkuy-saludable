-- ===========================================
-- RLS FIX - Row Level Security Correcto
-- ===========================================

-- 1. PRIMERO: Desactivar RLS en todas las tablas para poder hacer cambios
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_updates DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- 2. BORRAR POLICIES VIEJAS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Anyone can view customers" ON customers;
DROP POLICY IF EXISTS "Anyone can insert customers" ON customers;
DROP POLICY IF EXISTS "Admins can update customers" ON customers;
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Editors can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Editors can manage product images" ON product_images;
DROP POLICY IF EXISTS "Anyone can view inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Anyone can insert inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can view order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
DROP POLICY IF EXISTS "Admins can update order items" ON order_items;

-- 3. USERS TABLE - Policies
-- Users pueden ver su propio perfil
CREATE POLICY "users_select_own" ON users FOR SELECT
USING (auth.uid() = id);

-- Users pueden actualizar su propio perfil (excepto role)
CREATE POLICY "users_update_own" ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins (owner/admin) pueden ver todos los usuarios
CREATE POLICY "users_select_admin" ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role IN ('owner', 'admin')
    )
);

-- Solo owner puede modificar roles y crear usuarios
CREATE POLICY "users_manage_owner" ON users FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'owner'
    )
);

-- 4. CUSTOMERS TABLE - Policies
-- Solo admins pueden ver clientes
CREATE POLICY "customers_select_admin" ON customers FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

-- Solo admins pueden insertar/actualizar clientes
CREATE POLICY "customers_insert_admin" ON customers FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

CREATE POLICY "customers_update_admin" ON customers FOR UPDATE
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

-- 5. CATEGORIES TABLE - Policies
-- Todos pueden ver categorías activas
CREATE POLICY "categories_select_all" ON categories FOR SELECT
USING (is_active = true OR auth.role() = 'authenticated');

-- Solo admins pueden gestionar categorías
CREATE POLICY "categories_all_admin" ON categories FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

-- 6. PRODUCTS TABLE - Policies
-- Todos pueden ver productos activos
CREATE POLICY "products_select_all" ON products FOR SELECT
USING (is_active = true OR auth.role() = 'authenticated');

-- Editores y admins pueden insertar productos
CREATE POLICY "products_insert_editor" ON products FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin', 'editor')
    )
);

-- Editores y admins pueden actualizar productos
CREATE POLICY "products_update_editor" ON products FOR UPDATE
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin', 'editor')
    )
);

-- Solo admins pueden eliminar productos
CREATE POLICY "products_delete_admin" ON products FOR DELETE
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

-- 7. PRODUCT_IMAGES TABLE - Policies
-- Todos pueden ver imágenes de productos activos
CREATE POLICY "product_images_select_all" ON product_images FOR SELECT
USING (true);

-- Editores y admins pueden gestionar imágenes
CREATE POLICY "product_images_all_editor" ON product_images FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin', 'editor')
    )
);

-- 8. INVENTORY_MOVEMENTS TABLE - Policies
-- Solo admins pueden ver movimientos
CREATE POLICY "inventory_select_admin" ON inventory_movements FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

-- Solo admins pueden insertar movimientos
CREATE POLICY "inventory_insert_admin" ON inventory_movements FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

-- 9. ORDERS TABLE - Policies
-- Admins pueden ver todas las órdenes
CREATE POLICY "orders_select_admin" ON orders FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

-- Cualquiera puede crear órdenes (checkout)
CREATE POLICY "orders_insert_all" ON orders FOR INSERT
WITH CHECK (true);

-- Solo admins pueden actualizar órdenes
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

-- 10. ORDER_ITEMS TABLE - Policies
-- Admins pueden ver todos los items
CREATE POLICY "order_items_select_admin" ON order_items FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

-- Cualquiera puede insertar items (necesario para checkout)
CREATE POLICY "order_items_insert_all" ON order_items FOR INSERT
WITH CHECK (true);

-- Solo admins pueden actualizar items
CREATE POLICY "order_items_update_admin" ON order_items FOR UPDATE
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

-- 11. ACTIVITY_LOGS TABLE - Policies
-- Solo admins pueden ver logs
CREATE POLICY "activity_logs_select_admin" ON activity_logs FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')
    )
);

-- El sistema puede insertar logs
CREATE POLICY "activity_logs_insert_system" ON activity_logs FOR INSERT
WITH CHECK (true);

-- 12. REENABLE RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 13. VERIFICAR
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
