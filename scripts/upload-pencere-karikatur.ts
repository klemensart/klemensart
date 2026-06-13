/**
 * Pencere Bülteni — Delikli İlişkiler karikatürünü email-assets bucket'ına yükler.
 * Kullanım: npx tsx scripts/upload-pencere-karikatur.ts
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const LOCAL = "/Users/veyselkeremhun/Downloads/IMG_20260613_134051_357.jpg";
const BUCKET = "email-assets";
const PATH = "pencere-karikatur-delikli-iliskiler.jpg";

async function main() {
  const file = readFileSync(LOCAL);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(PATH, file, { contentType: "image/jpeg", upsert: true });

  if (error) {
    console.error("YÜKLEME HATASI:", error.message);
    return;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(PATH);
  console.log("✅ Yüklendi:");
  console.log(data.publicUrl);
}

main().catch(console.error);
