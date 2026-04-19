-- =====================================================
-- PEOPLE tablosu — yazarlar ve atölye düzenleyicileri
-- Faz 1: Marketplace altyapısı — veri katmanı
-- Tarih: 2026-04-19
-- =====================================================

-- =====================================================
-- UP MIGRATION
-- =====================================================

CREATE TABLE public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  bio text,
  short_bio text,
  expertise text[] DEFAULT '{}',
  email text,
  instagram text,
  twitter text,
  linkedin text,
  website text,
  is_author boolean DEFAULT false,
  is_host boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- İndeksler
CREATE INDEX people_slug_idx ON people(slug);
CREATE INDEX people_is_host_idx ON people(is_host) WHERE is_host = true;
CREATE INDEX people_is_author_idx ON people(is_author) WHERE is_author = true;

-- RLS
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON people
  FOR SELECT USING (true);

CREATE POLICY "Admin write" ON people FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_people_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_people_updated_at();


-- =====================================================
-- DOWN MIGRATION (geri alma)
-- =====================================================
-- DROP TRIGGER IF EXISTS people_updated_at ON people;
-- DROP FUNCTION IF EXISTS update_people_updated_at();
-- DROP POLICY IF EXISTS "Public read" ON people;
-- DROP POLICY IF EXISTS "Admin write" ON people;
-- DROP TABLE IF EXISTS people;
