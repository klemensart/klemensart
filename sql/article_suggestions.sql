-- Satır İçi Düzeltme Önerisi Sistemi
-- Supabase SQL Editor'da çalıştırın

CREATE TABLE article_suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  original_text text NOT NULL,
  suggested_text text NOT NULL,
  context_before text NOT NULL DEFAULT '',
  context_after text NOT NULL DEFAULT '',
  created_by uuid NOT NULL,
  created_by_name text NOT NULL DEFAULT '',
  created_by_role text NOT NULL DEFAULT 'editor',
  note text DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_suggestions_article ON article_suggestions(article_id, status);
