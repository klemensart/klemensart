-- Klemens atölyelerine başlangıç tarihi ekle
-- Tarihi geçenler /atolyeler sayfasında deaktif görünecek

UPDATE marketplace_events SET event_date = '2026-03-10' WHERE slug = 'sanat-tarihinde-duygular-klemens';
UPDATE marketplace_events SET event_date = '2026-04-08' WHERE slug = 'modern-sanati-okumak-klemens';
UPDATE marketplace_events SET event_date = '2026-05-11' WHERE slug = 'ronesans-okuryazarligi-2-klemens';
UPDATE marketplace_events SET event_date = '2026-05-07' WHERE slug = 'kapsamli-sanat-tarihi-klemens';
UPDATE marketplace_events SET event_date = '2026-04-01' WHERE slug = 'leonardo-semineri-klemens';
UPDATE marketplace_events SET event_date = '2026-05-17' WHERE slug = 'sinema-klubu-klemens';
