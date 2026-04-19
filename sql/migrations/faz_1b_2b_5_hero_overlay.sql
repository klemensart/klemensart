-- Faz 1B-2B.5: Cover image overlay başlık toggle
-- Tarih: 2026-04-20
-- Bu dosyayı Supabase Dashboard SQL Editor'da çalıştırın.

ALTER TABLE articles
ADD COLUMN IF NOT EXISTS hero_overlay_enabled BOOLEAN DEFAULT false NOT NULL;

COMMENT ON COLUMN articles.hero_overlay_enabled IS
'Cover image overlay başlık modu. true ise başlık + spot görselin üzerinde overlay olarak gösterilir (Aeon stili). false ise mevcut hibrit (görsel üstte, başlık altta).';
