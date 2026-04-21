-- ============================================================
-- Faz 2B-1: Klemens-hosted etkinlikler için kayıt sistemi
-- ============================================================

-- ── A) events tablosuna yeni kolonlar ────────────────────────
ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity integer;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_email text;

-- slug unique constraint (null değerler çakışmaz)
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique ON events (slug) WHERE slug IS NOT NULL;

-- ── B) event_registrations tablosu ───────────────────────────
CREATE TABLE IF NOT EXISTS event_registrations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id           uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id            uuid REFERENCES auth.users(id),
  name               text NOT NULL,
  email              text NOT NULL,
  phone              text,
  note               text,
  status             text NOT NULL DEFAULT 'confirmed',
  registered_at      timestamptz DEFAULT now(),
  cancelled_at       timestamptz,
  confirmation_token uuid DEFAULT gen_random_uuid()
);

-- Aynı email + etkinlik çiftini engelle
CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_event_email_unique
  ON event_registrations (event_id, email);

-- Hızlı filtreleme
CREATE INDEX IF NOT EXISTS event_registrations_event_status_idx
  ON event_registrations (event_id, status);

-- ── C) RLS ───────────────────────────────────────────────────
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Herkes kayıt olabilsin (anon dahil)
CREATE POLICY "anon_insert_registration"
  ON event_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Sadece service_role (admin) okuyabilsin
CREATE POLICY "service_select_registration"
  ON event_registrations FOR SELECT
  TO service_role
  USING (true);

-- Sadece service_role (admin) güncelleyebilsin
CREATE POLICY "service_update_registration"
  ON event_registrations FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated kullanıcılar kendi kayıtlarını görebilsin (token ile iptal için)
CREATE POLICY "user_select_own_registration"
  ON event_registrations FOR SELECT
  TO anon, authenticated
  USING (true);
