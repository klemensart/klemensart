-- ═══════════════════════════════════════════════════════
-- Harita Gamification Tables
-- Run in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. map_visits
CREATE TABLE map_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_slug TEXT NOT NULL,
  place_name TEXT NOT NULL,
  place_type TEXT NOT NULL,
  route_id INTEGER,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  visited_at TIMESTAMPTZ DEFAULT now(),
  visited_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, place_slug, visited_date)
);
CREATE INDEX idx_map_visits_user ON map_visits(user_id);
CREATE INDEX idx_map_visits_place ON map_visits(place_slug);

-- 2. map_badges
CREATE TABLE map_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  stars_earned INTEGER NOT NULL DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

-- 3. map_reviews
CREATE TABLE map_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_slug TEXT NOT NULL,
  place_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  user_display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_visible BOOLEAN DEFAULT true,
  UNIQUE(user_id, place_slug)
);
CREATE INDEX idx_map_reviews_place ON map_reviews(place_slug);

-- 4. map_user_stats
CREATE TABLE map_user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_visits INTEGER DEFAULT 0,
  total_stars INTEGER DEFAULT 0,
  total_badges INTEGER DEFAULT 0,
  total_routes_completed INTEGER DEFAULT 0,
  rank_name TEXT DEFAULT 'Meraklı',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════

ALTER TABLE map_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_user_stats ENABLE ROW LEVEL SECURITY;

-- map_visits: users read/insert own
CREATE POLICY "Users read own visits" ON map_visits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own visits" ON map_visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- map_badges: users read/insert own
CREATE POLICY "Users read own badges" ON map_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badges" ON map_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- map_reviews: anyone reads visible, users insert/update own
CREATE POLICY "Anyone reads visible reviews" ON map_reviews
  FOR SELECT USING (is_visible = true);
CREATE POLICY "Users insert own reviews" ON map_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON map_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- map_user_stats: users read own, insert/update own
CREATE POLICY "Users read own stats" ON map_user_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own stats" ON map_user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own stats" ON map_user_stats
  FOR UPDATE USING (auth.uid() = user_id);
