-- Makale kapak videosu desteği
-- YouTube/Vimeo URL + süre (dakika cinsinden)
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS cover_video_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_video_duration INTEGER;
