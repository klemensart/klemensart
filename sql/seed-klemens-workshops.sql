-- Klemens atölyelerini marketplace_events'e ekle
-- Sadece aktif / satışta olanlar
-- ON CONFLICT ile idempotent — tekrar çalıştırılabilir

INSERT INTO marketplace_events (
  slug, title, category, city, district,
  price, currency, image_url,
  organizer_name, organizer_url,
  duration_note, description, short_description,
  is_featured, is_klemens, detail_slug, status
) VALUES
-- 1. Sanat Tarihinde Duygular
(
  'sanat-tarihinde-duygular-klemens',
  'Sanat Tarihinde Duygular',
  'sanat-tarihi', 'Online', NULL,
  1500, 'TRY', '/images/workshops/sanat-tarihinde-duygular-square.webp',
  'Klemens Art', 'https://klemensart.com',
  '3 Hafta', 'Korku, haz ve öfkenin sanat tarihindeki izleri — mitolojiden modern tablolara, 3 haftalık canlı keşif.',
  'Korku, haz ve öfkenin sanat tarihindeki izleri — 3 haftalık canlı Zoom atölyesi.',
  true, true, 'sanat-tarihinde-duygular', 'active'
),
-- 2. Modern Sanatı Okumak
(
  'modern-sanati-okumak-klemens',
  'Modern Sanatı Okumak',
  'sanat-tarihi', 'Online', NULL,
  6000, 'TRY', '/images/workshops/modern-sanat-atolyesi-square.webp',
  'Klemens Art', 'https://klemensart.com',
  '10 Hafta', 'Empresyonizmden Kavramsal Sanata, 10 haftada modern sanatın dilini ve felsefesini öğrenin.',
  'Empresyonizmden Kavramsal Sanata, 10 haftada modern sanatın dili.',
  true, true, 'modern-sanat-atolyesi', 'active'
),
-- 3. Rönesans Okur-Yazarlığı
(
  'ronesans-okuryazarligi-2-klemens',
  'Rönesans Okur-Yazarlığı',
  'sanat-tarihi', 'Online', NULL,
  4500, 'TRY', '/images/workshops/ronesans-atolyesi-square.webp',
  'Klemens Art', 'https://klemensart.com',
  '8 Hafta', '8 haftada Floransa, Roma, Venedik ve Milano''nun ustalarını öğren. 6 ay kayıt erişimi ve PDF çalışma dokümanları dahil.',
  '8 haftada Rönesans''ın ustalarını öğrenin. 6 ay kayıt erişimi.',
  true, true, 'ronesans-okuryazarligi-2', 'active'
),
-- 4. Kapsamlı Sanat Tarihi
(
  'kapsamli-sanat-tarihi-klemens',
  'Kapsamlı Sanat Tarihi',
  'sanat-tarihi', 'Online', NULL,
  6000, 'TRY', '/images/workshops/kapsamli-sanat-tarihi-kart.webp',
  'Klemens Art', 'https://klemensart.com',
  '10 Hafta', 'Antik Yunan''dan günümüze sanatın dönüm noktaları, büyük ustaların hayatları ve başlıca akımlar. 10 haftalık kapsamlı program.',
  'Antik Yunan''dan günümüze sanat tarihinin 10 haftalık yolculuğu.',
  true, true, 'kapsamli-sanat-tarihi', 'active'
),
-- 5. Leonardo da Vinci Semineri
(
  'leonardo-semineri-klemens',
  'Leonardo da Vinci Semineri',
  'sanat-tarihi', 'Online', NULL,
  600, 'TRY', '/images/workshops/leonardo-da-vinci-square.webp',
  'Klemens Art', 'https://klemensart.com',
  'Tek Oturum', 'Mona Lisa''nın gizemi, Son Akşam Yemeği''nin ötesi — tek oturumda Leonardo''nun evrenini keşfedin.',
  'Rönesans''ın en büyük dehası Leonardo da Vinci — tek oturumluk yolculuk.',
  true, true, 'leonardo-da-vinci-semineri', 'active'
),
-- 6. Sinema Kulübü
(
  'sinema-klubu-klemens',
  'Sinema Kulübü',
  'sinema', 'Online', NULL,
  150, 'TRY', NULL,
  'Klemens Art', 'https://klemensart.com',
  'Ayda 1', 'Sinema topluluğumuzla ayda bir Zoom''da buluşuyoruz. Film analizleri, tartışmalar ve derinlemesine sinema sohbetleri.',
  'Ayda bir Zoom buluşması — film analizleri ve sinema sohbetleri.',
  true, true, 'sinema-klubu', 'active'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  city = EXCLUDED.city,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  duration_note = EXCLUDED.duration_note,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  is_featured = EXCLUDED.is_featured,
  is_klemens = EXCLUDED.is_klemens,
  detail_slug = EXCLUDED.detail_slug,
  status = EXCLUDED.status;
