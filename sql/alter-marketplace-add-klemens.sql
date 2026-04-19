-- Klemens atölyelerini marketplace_events tablosuna dahil etmek için
-- is_klemens: Klemens'in kendi atölyeleri
-- detail_slug: Klemens detay sayfasına yönlendirme (hardcoded /atolyeler/[slug])

ALTER TABLE marketplace_events ADD COLUMN is_klemens boolean DEFAULT false;
ALTER TABLE marketplace_events ADD COLUMN detail_slug text;
ALTER TABLE marketplace_events ALTER COLUMN event_date DROP NOT NULL;

CREATE INDEX idx_mp_is_klemens ON marketplace_events (is_klemens);
