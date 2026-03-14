-- ============================================================
-- Klemens Haber — Bozuk Feed'leri Düzelt + Yeni Kaynaklar Ekle
-- Supabase SQL Editor'de çalıştırın
-- ============================================================

-- 1. Gazete Duvar Kültür — URL düzelt (çalışan versiyon)
UPDATE news_feeds
SET url = 'https://www.gazeteduvar.com.tr/rss/kultur-sanat',
    name = 'Gazete Duvar — Kültür Sanat'
WHERE url = 'https://www.gazeteduvar.com.tr/rss/kultur';

-- 2. Bozuk feed'leri devre dışı bırak (RSS kapanmış veya 404)
UPDATE news_feeds SET is_active = false WHERE url IN (
  'https://www.aa.com.tr/tr/rss/default.aspx?cat=kultur-sanat',  -- AA 404
  'https://www.iha.com.tr/rss/kultur-sanat/',                     -- İHA 404
  'https://www.dha.com.tr/rss/kultur-sanat.xml',                  -- DHA 404
  'https://www.ntv.com.tr/sanat.rss',                             -- NTV 301/broken
  'https://www.gazeteduvar.com.tr/rss/sanat',                     -- GD Sanat 404 (kultur-sanat'a merge)
  'https://www.gazeteduvar.com.tr/rss/muzik',                     -- GD Müzik 404
  'https://bianet.org/rss/kultur',                                -- Bianet 404
  'https://www.artkolik.com/feed/',                               -- Artkolik — RSS format bozuk
  'https://manifold.press/feed'                                   -- Manifold — XML parse hatası
);

-- 3. Yeni çalışan kaynaklar ekle
INSERT INTO news_feeds (name, url, category) VALUES
  ('Hürriyet Kelebek',       'https://www.hurriyet.com.tr/rss/kelebek',                   'gazete'),
  ('Milliyet — Sanat',       'https://www.milliyet.com.tr/rss/rssNew/SanatRss.xml',       'gazete'),
  ('Habertürk — Kültür Sanat', 'https://www.haberturk.com/rss/kultur-sanat.xml',          'gazete'),
  ('Sözcü — Kültür Sanat',  'https://www.sozcu.com.tr/feeds-rss-category-kultur-sanat',   'gazete'),
  ('Sanat Karavani',         'https://www.sanatkaravani.com/feed/',                        'sanat-platformu')
ON CONFLICT (url) DO NOTHING;
