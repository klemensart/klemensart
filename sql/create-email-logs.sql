-- email_logs: Her gönderilen e-posta için açılma/tıklanma/bounce takibi
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resend_email_id TEXT,
  subscriber_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT now(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  status TEXT DEFAULT 'sent'  -- sent, opened, clicked, bounced
);

-- Hızlı sorgular için indeksler
CREATE INDEX IF NOT EXISTS idx_email_logs_subscriber ON email_logs(subscriber_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON email_logs
  FOR ALL
  USING (true);
