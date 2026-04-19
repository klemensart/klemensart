-- Pazaryeri: Sanat atölyeleri & workshop'lar tablosu
CREATE TABLE marketplace_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  category text NOT NULL,
  city text NOT NULL,
  district text,
  venue_name text,
  venue_address text,
  organizer_name text NOT NULL,
  organizer_url text,
  organizer_phone text,
  organizer_email text,
  organizer_logo_url text,
  price integer DEFAULT 0,
  price_options jsonb,
  currency text DEFAULT 'TRY',
  event_date timestamptz NOT NULL,
  end_date timestamptz,
  event_time_note text,
  duration_note text,
  recurring boolean DEFAULT false,
  recurring_note text,
  image_url text,
  gallery_urls jsonb,
  max_participants integer,
  is_featured boolean DEFAULT false,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketplace_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON marketplace_events FOR SELECT USING (true);
CREATE POLICY "Admin write" ON marketplace_events FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE INDEX idx_mp_status_date ON marketplace_events (status, event_date);
CREATE INDEX idx_mp_slug ON marketplace_events (slug);
CREATE INDEX idx_mp_city ON marketplace_events (city);
