-- Kullanıcı izleme (purchase funnel tracking)
CREATE TABLE IF NOT EXISTS user_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type  TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id),
  anonymous_id TEXT,
  workshop_id  UUID,
  workshop_slug TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- İndeksler
CREATE INDEX idx_user_events_type       ON user_events (event_type);
CREATE INDEX idx_user_events_user       ON user_events (user_id);
CREATE INDEX idx_user_events_anon       ON user_events (anonymous_id);
CREATE INDEX idx_user_events_workshop   ON user_events (workshop_id);
CREATE INDEX idx_user_events_created    ON user_events (created_at DESC);

-- RLS
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Herkes INSERT yapabilsin (anonim tracking)
CREATE POLICY "Anyone can insert events"
  ON user_events FOR INSERT
  WITH CHECK (true);

-- SELECT yok (admin client ile okunur)
