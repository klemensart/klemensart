-- artworks: Müze API'lerinden çekilen sanat eserleri arşivi
-- Kaynaklar: Metropolitan Museum of Art, Rijksmuseum, Art Institute of Chicago

CREATE TABLE IF NOT EXISTS artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL,
  artwork_title TEXT NOT NULL,
  year TEXT,
  medium TEXT,
  image_url TEXT,
  museum TEXT NOT NULL,  -- "Metropolitan Museum of Art", "Rijksmuseum", "Art Institute of Chicago"
  created_at TIMESTAMP DEFAULT now(),

  UNIQUE(artist_name, artwork_title)
);

ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Service role (API route'ları) tam erişim
CREATE POLICY "Service role full access"
  ON artworks
  FOR ALL
  USING (true);
