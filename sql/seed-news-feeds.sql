-- ============================================================
-- Klemens Haber Kürasyon — RSS Kaynak Seed Data
-- create-news-tables.sql çalıştırıldıktan SONRA çalıştırın
-- ============================================================

INSERT INTO news_feeds (name, url, category) VALUES
  -- Ajanslar
  ('Anadolu Ajansı — Kültür Sanat',  'https://www.aa.com.tr/tr/rss/default.aspx?cat=kultur-sanat', 'ajans'),
  ('İHA — Kültür Sanat',             'https://www.iha.com.tr/rss/kultur-sanat/',                   'ajans'),
  ('DHA — Kültür Sanat',             'https://www.dha.com.tr/rss/kultur-sanat.xml',                'ajans'),

  -- Gazeteler
  ('CNN Türk — Kültür Sanat',        'https://www.cnnturk.com/feed/rss/kultur-sanat/news',         'gazete'),
  ('Sabah — Kultur Sanat',           'https://www.sabah.com.tr/rss/kultur-sanat.xml',              'gazete'),
  ('NTV — Sanat',                    'https://www.ntv.com.tr/sanat.rss',                           'gazete'),
  ('Cumhuriyet — Kültür Sanat',      'https://www.cumhuriyet.com.tr/rss/8',                        'gazete'),

  -- Sanat Platformları
  ('Gazete Duvar — Kültür',          'https://www.gazeteduvar.com.tr/rss/kultur',                  'sanat-platformu'),
  ('Gazete Duvar — Sanat',           'https://www.gazeteduvar.com.tr/rss/sanat',                   'sanat-platformu'),
  ('Gazete Duvar — Sinema',          'https://www.gazeteduvar.com.tr/rss/sinema',                  'sanat-platformu'),
  ('Gazete Duvar — Müzik',           'https://www.gazeteduvar.com.tr/rss/muzik',                   'sanat-platformu'),
  ('Bianet — Kültür',                'https://bianet.org/rss/kultur',                              'sanat-platformu'),
  ('Artkolik',                       'https://www.artkolik.com/feed/',                             'sanat-platformu'),
  ('ArtDog İstanbul',                'https://www.artdogistanbul.com/feed/',                       'sanat-platformu'),
  ('Gazete Sanat',                   'https://gazetesanat.com/feed/',                              'sanat-platformu'),
  ('Argonotlar',                     'https://argonotlar.com/feed/',                               'sanat-platformu'),

  -- Dergiler
  ('Altyazı',                        'https://altyazi.net/feed/',                                  'dergi'),
  ('Bant Mag',                       'https://bantmag.com/feed/',                                  'dergi'),
  ('Arkitera',                       'https://www.arkitera.com/feed/',                             'dergi'),
  ('Nouvart',                        'https://nouvart.net/feed/',                                  'dergi'),
  ('Manifold',                       'https://manifold.press/feed',                                'dergi'),

  -- Diğer
  ('Edebiyat Haber',                 'https://www.edebiyathaber.net/feed/',                        'diger'),
  ('Fikir Türü',                     'https://www.fikirturu.com/feed',                             'diger'),
  ('Vesaire Press',                  'https://vesaire.press/feed/',                                'diger')

ON CONFLICT (url) DO NOTHING;
