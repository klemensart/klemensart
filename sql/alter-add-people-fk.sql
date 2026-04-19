-- =====================================================
-- FK kolonları: articles.author_id + marketplace_events.host_id
-- people tablosu oluşturulup veri taşındıktan SONRA çalıştırın
-- Tarih: 2026-04-19
-- =====================================================

-- =====================================================
-- UP MIGRATION
-- =====================================================

ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES people(id);
ALTER TABLE marketplace_events ADD COLUMN IF NOT EXISTS host_id uuid REFERENCES people(id);

CREATE INDEX IF NOT EXISTS articles_author_id_idx ON articles(author_id);
CREATE INDEX IF NOT EXISTS marketplace_events_host_id_idx ON marketplace_events(host_id);


-- =====================================================
-- DOWN MIGRATION (geri alma)
-- =====================================================
-- DROP INDEX IF EXISTS marketplace_events_host_id_idx;
-- DROP INDEX IF EXISTS articles_author_id_idx;
-- ALTER TABLE marketplace_events DROP COLUMN IF EXISTS host_id;
-- ALTER TABLE articles DROP COLUMN IF EXISTS author_id;
