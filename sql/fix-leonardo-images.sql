-- Leonardo soruları: Wikipedia URL'lerini yerel görsellere güncelle
-- Çalıştır: Supabase SQL Editor

UPDATE trivia_questions
SET image_url = '/images/testler/ronesans/mona-lisa.webp'
WHERE category_slug = 'leonardo-atolyesi'
  AND correct_answer = 'Mona Lisa';

UPDATE trivia_questions
SET image_url = '/images/testler/ronesans/son-aksam-yemegi.webp'
WHERE category_slug = 'leonardo-atolyesi'
  AND correct_answer = 'Son Akşam Yemeği';

UPDATE trivia_questions
SET image_url = '/images/testler/ronesans/vitruvius-adami.webp'
WHERE category_slug = 'leonardo-atolyesi'
  AND correct_answer = 'Vitruvius Adamı';

UPDATE trivia_questions
SET image_url = '/images/testler/ronesans/kayaliklar-meryemi.webp'
WHERE category_slug = 'leonardo-atolyesi'
  AND correct_answer = 'Kayalıklar Bakiresi';

-- Gelincikli Kadın: Wikipedia engelledi, şimdilik NULL bırak
-- (Daha sonra elle eklenebilir)
UPDATE trivia_questions
SET image_url = NULL
WHERE category_slug = 'leonardo-atolyesi'
  AND correct_answer = 'Gelincikli Kadın';
