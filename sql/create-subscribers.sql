-- subscribers: E-bülten aboneleri
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMP DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'website'
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Service role (API route'ları) tam erişim
CREATE POLICY "Service role full access"
  ON subscribers
  FOR ALL
  USING (true);

-- Public insert (herkes abone olabilir)
CREATE POLICY "Public insert"
  ON subscribers
  FOR INSERT
  WITH CHECK (true);
