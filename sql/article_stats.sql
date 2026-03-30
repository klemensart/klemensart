-- Makale görüntülenme sayacı
CREATE TABLE article_stats (
  slug text PRIMARY KEY,
  view_count integer DEFAULT 0
);

-- RLS
ALTER TABLE article_stats ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "article_stats_select" ON article_stats
  FOR SELECT USING (true);

-- Sadece service role yazabilir (API route üzerinden)
-- INSERT ve UPDATE için public policy yok, service role key kullanılacak

-- Increment fonksiyonu (atomic)
CREATE OR REPLACE FUNCTION increment_article_view(p_slug text)
RETURNS void AS $$
BEGIN
  INSERT INTO article_stats (slug, view_count)
  VALUES (p_slug, 1)
  ON CONFLICT (slug)
  DO UPDATE SET view_count = article_stats.view_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
