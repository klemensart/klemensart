-- ============================================================
-- Faz 1B-Y2: Marketplace başvuru tablosu
-- Çalıştır: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. TABLO
CREATE TABLE IF NOT EXISTS marketplace_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Durum
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','reviewing','approved','rejected')),
  admin_note      text,
  reviewed_at     timestamptz,
  reviewed_by     uuid REFERENCES auth.users(id),

  -- 1. Adım: Kişisel bilgiler
  applicant_name           text NOT NULL,
  applicant_email          text NOT NULL,
  applicant_phone          text NOT NULL,
  applicant_website        text,

  -- 2. Adım: Atölye detayları
  workshop_topic           text NOT NULL,
  workshop_description     text NOT NULL,
  workshop_duration        text NOT NULL,
  workshop_price           text NOT NULL,
  target_audience          text,
  contact_channel          text NOT NULL
                           CHECK (contact_channel IN ('whatsapp','email','website','other')),
  contact_channel_detail   text NOT NULL,

  -- Meta
  terms_accepted           boolean NOT NULL DEFAULT false,
  user_id                  uuid REFERENCES auth.users(id),
  ip_address               text,
  user_agent               text
);

COMMENT ON TABLE marketplace_applications IS 'Marketplace düzenleyici başvuruları';

-- 2. İNDEKSLER
CREATE INDEX IF NOT EXISTS idx_marketplace_applications_status
  ON marketplace_applications (status);

CREATE INDEX IF NOT EXISTS idx_marketplace_applications_email
  ON marketplace_applications (applicant_email);

CREATE INDEX IF NOT EXISTS idx_marketplace_applications_created_at
  ON marketplace_applications (created_at DESC);

-- 3. RLS
ALTER TABLE marketplace_applications ENABLE ROW LEVEL SECURITY;

-- Admin okuma (SELECT)
CREATE POLICY "admin_select_marketplace_applications"
  ON marketplace_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );

-- Public insert (form submit) — sadece izin verilen kolonlar
CREATE POLICY "public_insert_marketplace_applications"
  ON marketplace_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- status mutlaka 'pending' olmalı (kötü niyetli override engeli)
    status = 'pending'
    AND admin_note IS NULL
    AND reviewed_at IS NULL
    AND reviewed_by IS NULL
  );

-- Admin güncelleme (UPDATE)
CREATE POLICY "admin_update_marketplace_applications"
  ON marketplace_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );

-- Admin silme (DELETE)
CREATE POLICY "admin_delete_marketplace_applications"
  ON marketplace_applications FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );

-- 4. updated_at TRIGGER
CREATE OR REPLACE FUNCTION update_marketplace_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_marketplace_applications_updated_at
  BEFORE UPDATE ON marketplace_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_applications_updated_at();
