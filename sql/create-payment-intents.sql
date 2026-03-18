-- payment_intents: PayTR ödeme başlatma → callback eşlemesi
-- create-token merchant_oid'i buraya yazar, callback buradan okur

CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_oid TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  workshop_id UUID REFERENCES workshops(id),
  single_video_id UUID,
  amount DECIMAL,
  phone TEXT,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

-- Service role (API route'ları) tam erişim
CREATE POLICY "Service role full access"
  ON payment_intents
  FOR ALL
  USING (true);
