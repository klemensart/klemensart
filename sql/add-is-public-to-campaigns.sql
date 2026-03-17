-- Kampanyaların web'de yayınlanmasını sağlayan is_public kolonu
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;