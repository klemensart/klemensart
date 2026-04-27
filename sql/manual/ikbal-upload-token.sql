-- İkbal Özpınar için upload token üretimi
-- Supabase Dashboard > SQL Editor'dan çalıştır.
-- Tarih: 2026-04-27

UPDATE marketplace_applications
SET
  upload_token = gen_random_uuid(),
  upload_token_expires_at = now() + interval '30 days'
WHERE applicant_email = 'ikbalozpinar@gmail.com'
  AND status = 'approved'
  AND upload_token IS NULL
RETURNING upload_token, applicant_name, applicant_email;

-- Çıktıdaki upload_token değerini al ve İkbal'e şu linki gönder:
-- https://klemensart.com/duzenleyici/{upload_token}
