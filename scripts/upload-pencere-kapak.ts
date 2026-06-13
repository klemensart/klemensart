/**
 * Pencere Bülteni — kapak görselini email-assets'e yükler + hediye klasörünü listeler.
 * Kullanım: npx tsx scripts/upload-pencere-kapak.ts
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const LOCAL = "/Users/veyselkeremhun/Downloads/Pencere_Yeni.png";
const BUCKET = "email-assets";
const PATH = "pencere-bulten-kapak.png";

async function main() {
  const file = readFileSync(LOCAL);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(PATH, file, { contentType: "image/png", upsert: true });

  if (error) {
    console.error("KAPAK YÜKLEME HATASI:", error.message);
  } else {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(PATH);
    console.log("✅ Kapak yüklendi:");
    console.log(data.publicUrl);
  }

  // Topkapı müze rehberi PDF
  const pdfLocal = "/Users/veyselkeremhun/Downloads/KLEMENS-TOPKAPI-Rehber.pdf";
  const pdfPath = "bulten-hediye/muzede-1-saat-topkapi-sarayi-muzesi.pdf";
  const pdf = readFileSync(pdfLocal);
  const { error: pdfErr } = await supabase.storage
    .from(BUCKET)
    .upload(pdfPath, pdf, { contentType: "application/pdf", upsert: true });
  if (pdfErr) {
    console.error("PDF YÜKLEME HATASI:", pdfErr.message);
  } else {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(pdfPath);
    console.log("\n✅ Rehber PDF yüklendi:");
    console.log(data.publicUrl);
  }
}

main().catch(console.error);
