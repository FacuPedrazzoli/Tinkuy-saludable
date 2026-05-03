-- ============================================================
-- STORAGE - BUCKET PRODUCTS (ejecutar en SQL Editor)
-- ============================================================

-- Crear bucket (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- POLICIES RLS PARA STORAGE
-- ============================================================

-- Eliminar políticas existentes (si hay conflictos)
DROP POLICY IF EXISTS "Anyone can upload to products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload to products" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view products images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;

-- 1. Cualquiera puede VER las imágenes (público)
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'products'
);

-- 2. Usuarios autenticados pueden SUBIR imágenes
CREATE POLICY "Authenticated can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = 'products'
);

-- 3. Usuarios autenticados pueden ELIMINAR sus propias imágenes
CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'products'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- 4. Solo admins pueden ACTUALIZAR (por si se necesita)
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products'
)
WITH CHECK (
  bucket_id = 'products'
);
