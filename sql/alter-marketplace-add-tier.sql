-- =====================================================
-- marketplace_events.tier kolonu
-- Etkinlik katmanı: klemens / kulup / network
-- Tarih: 2026-04-19
-- =====================================================

-- UP MIGRATION
ALTER TABLE marketplace_events
  ADD COLUMN IF NOT EXISTS tier text DEFAULT 'network'
  CHECK (tier IN ('klemens', 'kulup', 'network'));

CREATE INDEX IF NOT EXISTS idx_mp_tier ON marketplace_events(tier);

-- Klemens'in etkinliklerini işaretle
UPDATE marketplace_events
SET tier = 'klemens'
WHERE host_id = '382ee3b9-338a-48fb-877d-1827c8edef6a';

-- DOWN MIGRATION
-- DROP INDEX IF EXISTS idx_mp_tier;
-- ALTER TABLE marketplace_events DROP COLUMN IF EXISTS tier;
