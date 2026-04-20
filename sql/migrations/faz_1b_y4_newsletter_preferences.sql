-- ============================================================
-- Faz 1B-Y4: Newsletter tercih kolonları
-- Bu SQL Supabase Dashboard SQL Editor'da manuel çalıştırılmalı.
-- ============================================================

-- 1. Newsletter tercih kolonları ekle
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS weekly_subscribed BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS thematic_subscribed BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS preference_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- 2. Mevcut aboneleri "her ikisine" migrate et
UPDATE subscribers
SET
  weekly_subscribed = true,
  thematic_subscribed = true
WHERE weekly_subscribed IS NULL OR thematic_subscribed IS NULL;

-- 3. Preference token indeksi (lookup için)
CREATE INDEX IF NOT EXISTS idx_subscribers_preference_token
  ON subscribers(preference_token);

-- 4. Active + weekly için composite index (cron hızlı çalışsın)
CREATE INDEX IF NOT EXISTS idx_subscribers_active_weekly
  ON subscribers(is_active, weekly_subscribed)
  WHERE is_active = true;

-- 5. Active + thematic için composite index
CREATE INDEX IF NOT EXISTS idx_subscribers_active_thematic
  ON subscribers(is_active, thematic_subscribed)
  WHERE is_active = true;

-- 6. Açıklama
COMMENT ON COLUMN subscribers.weekly_subscribed IS 'Haftalık (Pazar) bülten tercihi';
COMMENT ON COLUMN subscribers.thematic_subscribed IS 'Tematik (2 aylık) bülten tercihi';
COMMENT ON COLUMN subscribers.preference_token IS 'Abone tercihlerini güncellemek için kişisel token (email link URL parametresi)';
