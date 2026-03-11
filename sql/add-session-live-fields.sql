-- Canlı oturum desteği: session_date, zoom_url, status alanları
-- Supabase SQL Editor'da çalıştırın

ALTER TABLE workshop_sessions
  ADD COLUMN session_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN zoom_url TEXT,
  ADD COLUMN status TEXT DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'live', 'completed'));
