-- Sanat Raundu: Trivia tabloları
-- quiz_results.score sütununu genişlet (mevcut veriler korunur)
ALTER TABLE quiz_results ALTER COLUMN score TYPE NUMERIC(7,1);

-- Trivia kategorileri
CREATE TABLE trivia_categories (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT NOT NULL DEFAULT '🎨',
  color TEXT NOT NULL DEFAULT '#C9A84C',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trivia soruları
CREATE TABLE trivia_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_slug TEXT NOT NULL REFERENCES trivia_categories(slug) ON DELETE CASCADE,
  question TEXT NOT NULL,
  image_url TEXT,
  options JSONB NOT NULL, -- ["A","B","C","D"]
  correct_answer TEXT NOT NULL,
  fun_fact TEXT,
  difficulty TEXT NOT NULL DEFAULT 'orta' CHECK (difficulty IN ('kolay', 'orta', 'zor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_trivia_questions_category ON trivia_questions(category_slug);
CREATE INDEX idx_trivia_questions_cat_diff ON trivia_questions(category_slug, difficulty);

-- RLS
ALTER TABLE trivia_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trivia_categories_select" ON trivia_categories
  FOR SELECT USING (true);

CREATE POLICY "trivia_questions_select" ON trivia_questions
  FOR SELECT USING (true);
