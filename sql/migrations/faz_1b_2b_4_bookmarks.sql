-- Faz 1B-2B.4: Like → Bookmark dönüşümü
-- Tarih: 2026-04-20
-- Bu dosyayı Supabase Dashboard SQL Editor'da çalıştırın.

-- 1) Mevcut likes verisini yedekle
CREATE TABLE IF NOT EXISTS _backup_article_likes_20260420 AS
SELECT * FROM article_likes;

-- 2) Yeni article_bookmarks tablosu
CREATE TABLE IF NOT EXISTS article_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(article_slug, user_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON article_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_slug ON article_bookmarks(article_slug);

-- RLS
ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON article_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON article_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON article_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- 3) Eski article_likes tablosunu sil
DROP TABLE IF EXISTS article_likes;

-- NOT: _backup_article_likes_20260420 backup tablosu kalacak.
-- Gelecekte ihtiyaç olmazsa manuel silinebilir.
