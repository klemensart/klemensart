-- marketplace_applications: WhatsApp numarası + önerilen tarihler
-- Mevcut kayıtlar için nullable, yeni başvurularda form tarafında zorunlu

ALTER TABLE marketplace_applications
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS proposed_dates text;
