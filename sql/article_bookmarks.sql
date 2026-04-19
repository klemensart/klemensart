-- article_bookmarks — kullanıcıların yazı kaydetme sistemi
CREATE TABLE article_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(article_slug, user_id)
);

CREATE INDEX idx_bookmarks_user ON article_bookmarks(user_id);
CREATE INDEX idx_bookmarks_slug ON article_bookmarks(article_slug);

ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON article_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON article_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON article_bookmarks
  FOR DELETE USING (auth.uid() = user_id);
