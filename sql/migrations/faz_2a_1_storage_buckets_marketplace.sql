-- Faz 2-A.1: Storage bucket'ları — people-avatars + marketplace-images
-- Kerem bu SQL'i Supabase Dashboard SQL Editor'dan çalıştıracak.

-- ═══════════════════════════════════════════
-- BUCKET'LAR
-- ═══════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'people-avatars',
  'people-avatars',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images',
  'marketplace-images',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════
-- RLS POLİÇELERİ — people-avatars
-- ═══════════════════════════════════════════

CREATE POLICY "Public avatars read" ON storage.objects
  FOR SELECT USING (bucket_id = 'people-avatars');

CREATE POLICY "Admin avatars insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'people-avatars'
    AND (auth.jwt() ->> 'email') = 'hunkerem@gmail.com'
  );

CREATE POLICY "Admin avatars update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'people-avatars'
    AND (auth.jwt() ->> 'email') = 'hunkerem@gmail.com'
  );

CREATE POLICY "Admin avatars delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'people-avatars'
    AND (auth.jwt() ->> 'email') = 'hunkerem@gmail.com'
  );

-- ═══════════════════════════════════════════
-- RLS POLİÇELERİ — marketplace-images
-- ═══════════════════════════════════════════

CREATE POLICY "Public marketplace-images read" ON storage.objects
  FOR SELECT USING (bucket_id = 'marketplace-images');

CREATE POLICY "Admin marketplace-images insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'marketplace-images'
    AND (auth.jwt() ->> 'email') = 'hunkerem@gmail.com'
  );

CREATE POLICY "Admin marketplace-images update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'marketplace-images'
    AND (auth.jwt() ->> 'email') = 'hunkerem@gmail.com'
  );

CREATE POLICY "Admin marketplace-images delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'marketplace-images'
    AND (auth.jwt() ->> 'email') = 'hunkerem@gmail.com'
  );
