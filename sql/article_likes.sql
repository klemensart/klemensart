-- Makale Beğeni Sistemi
-- Supabase SQL Editor'da çalıştırın

CREATE TABLE article_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_slug, user_id)
);

CREATE INDEX idx_article_likes_slug ON article_likes(article_slug);

-- RLS
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;

-- Herkes beğeni sayısını görebilir
CREATE POLICY "article_likes_select" ON article_likes
  FOR SELECT USING (true);

-- Giriş yapmış kullanıcılar kendi beğenilerini ekleyebilir
CREATE POLICY "article_likes_insert" ON article_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi beğenilerini silebilir
CREATE POLICY "article_likes_delete" ON article_likes
  FOR DELETE USING (auth.uid() = user_id);
