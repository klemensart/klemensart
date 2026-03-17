/**
 * Adnan Çoker story görseli — dış URL'yi Supabase Storage'a yükle ve canvas'ı güncelle
 * Kullanım: set -a && source .env.local && set +a && npx tsx scripts/fix-coker-story-image.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Env değişkenleri eksik.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EXTERNAL_URL =
  "https://www.gazetekritik.com/cropImages/1280x720/uploads/haberler/2026/3/7214-adnan-cokerin-mutlak-siyah-sergisi-17-martta-sanatseverlerle-bulusuyor.jpg";

const DESIGN_ID = "2176f4e8-8a55-4459-b12b-4f87f94fac09";
const EVENT_ID = "95063136-0634-4178-9d17-a99969b2a2a9";

async function main() {
  // 1. Görseli indir
  console.log("1) Görsel indiriliyor...");
  const res = await fetch(EXTERNAL_URL);
  if (!res.ok) {
    console.error(`Görsel indirilemedi: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";
  console.log(`   Boyut: ${(buffer.length / 1024).toFixed(0)} KB, Tür: ${contentType}`);

  // 2. Supabase Storage'a yükle
  console.log("2) Supabase Storage'a yükleniyor...");
  const storagePath = "events/adnan-coker-mutlak-siyah.jpg";

  const { error: uploadErr } = await supabase.storage
    .from("design-assets")
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadErr) {
    console.error("Yükleme hatası:", uploadErr.message);
    process.exit(1);
  }

  const publicUrl = `${url}/storage/v1/object/public/design-assets/${storagePath}`;
  console.log(`   Yüklendi: ${publicUrl}`);

  // 3. Story canvas_data'daki image src'yi güncelle
  console.log("3) Story canvas güncelleniyor...");

  const { data: design, error: fetchErr } = await supabase
    .from("designs")
    .select("canvas_data")
    .eq("id", DESIGN_ID)
    .single();

  if (fetchErr || !design) {
    console.error("Design bulunamadı:", fetchErr?.message);
    process.exit(1);
  }

  const canvas = design.canvas_data as { objects: Array<{ type: string; src?: string }> };
  for (const obj of canvas.objects) {
    if (obj.type === "image" && obj.src) {
      obj.src = publicUrl;
    }
  }

  const { error: updateErr } = await supabase
    .from("designs")
    .update({ canvas_data: canvas })
    .eq("id", DESIGN_ID);

  if (updateErr) {
    console.error("Canvas güncelenemedi:", updateErr.message);
    process.exit(1);
  }
  console.log("   Canvas güncellendi!");

  // 4. Event image_url'yi de güncelle
  console.log("4) Etkinlik görseli güncelleniyor...");

  const { error: eventErr } = await supabase
    .from("events")
    .update({ image_url: publicUrl })
    .eq("id", EVENT_ID);

  if (eventErr) {
    console.error("Etkinlik görseli güncellenemedi:", eventErr.message);
  } else {
    console.log("   Etkinlik görseli güncellendi!");
  }

  console.log("\nTamam! Sayfayı yenile — görsel artık görünecek.");
}

main();
