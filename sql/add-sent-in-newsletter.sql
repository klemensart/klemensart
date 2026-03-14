-- Haberlerin bültene dahil edilip edilmediğini takip eden kolon
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS sent_in_newsletter BOOLEAN DEFAULT false;
