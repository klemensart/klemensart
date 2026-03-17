CREATE TABLE IF NOT EXISTS meta_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_lead_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  form_id TEXT,
  page_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_meta_leads_email ON meta_leads(email);
