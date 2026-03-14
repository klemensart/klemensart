-- Haberlerin bülten içindeki sıralaması
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS newsletter_order INT DEFAULT 0;
