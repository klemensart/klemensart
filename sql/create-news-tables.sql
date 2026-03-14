-- ============================================================
-- Klemens Haber Kürasyon Sistemi — Tablo Şeması
-- Supabase SQL Editor'de çalıştırın
-- ============================================================

-- 1. news_feeds — RSS kaynak beslemeleri
CREATE TABLE IF NOT EXISTS news_feeds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  url         TEXT NOT NULL UNIQUE,
  category    TEXT NOT NULL DEFAULT 'diger'
              CHECK (category IN ('ajans','gazete','sanat-platformu','dergi','diger')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  last_fetched_at TIMESTAMPTZ,
  last_error  TEXT,
  item_count  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. news_items — Haber öğeleri
CREATE TABLE IF NOT EXISTS news_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id     UUID REFERENCES news_feeds(id) ON DELETE SET NULL,
  guid        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  summary     TEXT,
  url         TEXT,
  image_url   TEXT,
  author      TEXT,
  source_name TEXT,
  published_at TIMESTAMPTZ,
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN ('new','published','dismissed')),
  is_manual   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_news_items_status ON news_items(status);
CREATE INDEX IF NOT EXISTS idx_news_items_feed_id ON news_items(feed_id);
CREATE INDEX IF NOT EXISTS idx_news_items_published_at ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_guid ON news_items(guid);
CREATE INDEX IF NOT EXISTS idx_news_feeds_is_active ON news_feeds(is_active);

-- 4. RLS
ALTER TABLE news_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- Service role (admin) full access
CREATE POLICY "service_role_full_access_feeds"
  ON news_feeds FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_role_full_access_items"
  ON news_items FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Public read for published news
CREATE POLICY "public_read_published_news"
  ON news_items FOR SELECT
  USING (status = 'published');

-- Public read for active feeds (for display purposes)
CREATE POLICY "public_read_active_feeds"
  ON news_feeds FOR SELECT
  USING (is_active = true);
