-- Quiz başarı kuponları tablosu
CREATE TABLE quiz_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  quiz_slug TEXT NOT NULL,
  workshop_slug TEXT NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 10,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX idx_quiz_coupons_code ON quiz_coupons(code);
CREATE INDEX idx_quiz_coupons_user ON quiz_coupons(user_id) WHERE user_id IS NOT NULL;

-- RLS
ALTER TABLE quiz_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_coupons_select_own" ON quiz_coupons
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.uid() IS NOT NULL
  );

CREATE POLICY "quiz_coupons_insert" ON quiz_coupons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "quiz_coupons_update" ON quiz_coupons
  FOR UPDATE USING (true);
