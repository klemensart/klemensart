-- news_items status constraint'ine 'archived' ekle
ALTER TABLE news_items DROP CONSTRAINT IF EXISTS news_items_status_check;
ALTER TABLE news_items ADD CONSTRAINT news_items_status_check
  CHECK (status IN ('new', 'published', 'dismissed', 'archived'));
