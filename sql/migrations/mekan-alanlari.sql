-- Mekan bilgisi alanları (başvuru formundan gelen)
ALTER TABLE marketplace_applications
  ADD COLUMN IF NOT EXISTS venue_name TEXT,
  ADD COLUMN IF NOT EXISTS venue_address TEXT;
