-- Duyuru Banner Sistemi — announcements tablosu
-- Bu SQL'i Supabase Dashboard → SQL Editor'de çalıştır

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT DEFAULT 'Detaylar',
  badge_text TEXT DEFAULT 'Yeni',
  is_active BOOLEAN DEFAULT true,
  pages TEXT[] DEFAULT ARRAY['homepage','atolyeler']::TEXT[],
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Herkes aktif duyuruları okuyabilir
CREATE POLICY "Public read active announcements"
  ON announcements FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Adminler tam erişim
CREATE POLICY "Admins full access"
  ON announcements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND role = 'admin')
  );
