-- Quiz sonuçları tablosu (liderlik tablosu + rozet kayıt)
CREATE TABLE quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Anonim',
  quiz_slug TEXT NOT NULL DEFAULT 'ronesans-quiz',
  score NUMERIC(3,1) NOT NULL,
  badge TEXT NOT NULL,
  time_seconds INTEGER,
  mode TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_quiz_results_slug ON quiz_results(quiz_slug);
CREATE INDEX idx_quiz_results_leaderboard ON quiz_results(quiz_slug, score DESC, time_seconds ASC NULLS LAST);
CREATE INDEX idx_quiz_results_user ON quiz_results(user_id) WHERE user_id IS NOT NULL;

-- RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_results_select" ON quiz_results
  FOR SELECT USING (true);

CREATE POLICY "quiz_results_insert" ON quiz_results
  FOR INSERT WITH CHECK (true);
