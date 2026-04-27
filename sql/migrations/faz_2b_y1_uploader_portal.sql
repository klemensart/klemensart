-- Faz 2B-Y1: Düzenleyici Upload Portalı — marketplace_applications yeni kolonlar
-- Kerem bu SQL'i Supabase Dashboard SQL Editor'dan çalıştıracak.
-- Tarih: 2026-04-27

-- ═══════════════════════════════════════════
-- YENI KOLONLAR
-- ═══════════════════════════════════════════

-- Token: Onay sırasında üretilir, düzenleyiciye özel link oluşturur
ALTER TABLE marketplace_applications
  ADD COLUMN IF NOT EXISTS upload_token UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS upload_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS materials_submitted_at TIMESTAMPTZ;

-- Düzenleyicinin yüklediği materyaller
ALTER TABLE marketplace_applications
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS detailed_bio TEXT,
  ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS venue_url TEXT;

-- Düzenleyicinin upload sırasında doldurduğu ek bilgiler
ALTER TABLE marketplace_applications
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS max_participants INTEGER,
  ADD COLUMN IF NOT EXISTS proposed_dates_final TEXT;

-- ═══════════════════════════════════════════
-- INDEX
-- ═══════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_marketplace_applications_upload_token
  ON marketplace_applications(upload_token);

-- ═══════════════════════════════════════════
-- STORAGE BUCKET: marketplace-uploads
-- ═══════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-uploads',
  'marketplace-uploads',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════
-- RLS POLİÇELERİ — marketplace-uploads
-- ═══════════════════════════════════════════

-- Herkes okuyabilir (görseller siteye gömülecek)
CREATE POLICY "Public marketplace-uploads read" ON storage.objects
  FOR SELECT USING (bucket_id = 'marketplace-uploads');

-- Insert: Public (token doğrulaması API tarafında yapılacak, service_role key ile yükleniyor)
CREATE POLICY "Service marketplace-uploads insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'marketplace-uploads');

-- Update/Delete: Sadece admin
CREATE POLICY "Admin marketplace-uploads update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'marketplace-uploads'
    AND (auth.jwt() ->> 'email') = 'hunkerem@gmail.com'
  );

CREATE POLICY "Admin marketplace-uploads delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'marketplace-uploads'
    AND (auth.jwt() ->> 'email') = 'hunkerem@gmail.com'
  );
