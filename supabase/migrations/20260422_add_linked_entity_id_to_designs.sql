-- Designs tablosuna linked_entity_id kolonu ekle
-- Atölye, yazı vb. kaynaklara bağlantı kurmak için kullanılır
ALTER TABLE designs ADD COLUMN IF NOT EXISTS linked_entity_id text;
CREATE INDEX IF NOT EXISTS idx_designs_linked_entity_id ON designs (linked_entity_id) WHERE linked_entity_id IS NOT NULL;
