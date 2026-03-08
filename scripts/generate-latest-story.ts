/**
 * Tek seferlik script: Son eklenen yazı için Instagram Story tasarımı üretir.
 * Kullanım: npx tsx scripts/generate-latest-story.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  console.error(".env.local dosyasını source edin: set -a && source .env.local && set +a");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function formatCategory(cat: string): string {
  return cat.toUpperCase();
}

async function main() {
  // Son yazıyı getir
  const { data: article, error } = await supabase
    .from("articles")
    .select("id, title, description, author, category, image, date")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error || !article) {
    console.error("Yazı bulunamadı:", error?.message);
    process.exit(1);
  }

  console.log("Son yazı bulundu:");
  console.log(`  Başlık: ${article.title}`);
  console.log(`  Kategori: ${article.category}`);
  console.log(`  Yazar: ${article.author}`);
  console.log(`  Spot: ${article.description?.slice(0, 80)}...`);
  console.log(`  Görsel: ${article.image?.slice(0, 60)}...`);
  console.log();

  const category = formatCategory(article.category || "Odak");

  const canvasData = {
    backgroundColor: "#FFFBF7",
    objects: [
      // Krem arka plan
      {
        type: "shape",
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        fill: "#FFFBF7",
        shapeType: "rect",
        opacity: 1,
        rotation: 0,
      },
      // Cover görseli
      {
        type: "image",
        x: 80,
        y: 70,
        width: 920,
        height: 640,
        src: article.image,
        opacity: 1,
        rotation: 0,
      },
      // Kategori — Montserrat Bold, #ff6c5f, yüksek letter-spacing
      {
        type: "text",
        x: 80,
        y: 790,
        width: 920,
        text: category,
        fontSize: 26,
        fontFamily: "Montserrat",
        fontStyle: "bold",
        fill: "#ff6c5f",
        align: "left",
        letterSpacing: 12,
        lineHeight: 1.2,
        opacity: 1,
        rotation: 0,
      },
      // Spot — Montserrat, #2c3e50, ferah satır aralığı
      {
        type: "text",
        x: 80,
        y: 870,
        width: 920,
        text: article.description || article.title,
        fontSize: 36,
        fontFamily: "Montserrat",
        fontStyle: "normal",
        fill: "#2c3e50",
        align: "left",
        letterSpacing: 0,
        lineHeight: 1.65,
        opacity: 1,
        rotation: 0,
      },
      // Yazar — gövdenin hemen altında
      {
        type: "text",
        x: 80,
        y: 1400,
        width: 920,
        text: `— ${article.author || "Klemens Art"}`,
        fontSize: 26,
        fontFamily: "Montserrat",
        fontStyle: "normal",
        fill: "#2c3e50",
        align: "left",
        letterSpacing: 0,
        lineHeight: 1.2,
        opacity: 1,
        rotation: 0,
      },
    ],
  };

  // Eski story'yi sil (varsa)
  const { data: existing } = await supabase
    .from("designs")
    .select("id")
    .like("name", `Story — ${article.title}%`);

  if (existing && existing.length > 0) {
    const ids = existing.map((d: { id: string }) => d.id);
    await supabase.from("designs").delete().in("id", ids);
    console.log(`Eski ${ids.length} story silindi.`);
  }

  // Yeni story kaydet
  const { data: design, error: insertErr } = await supabase
    .from("designs")
    .insert({
      name: `Story — ${article.title}`,
      platform: "instagram-story",
      width: 1080,
      height: 1920,
      canvas_data: canvasData,
      thumbnail_url: null,
      is_template: false,
      created_by: null,
    })
    .select("id")
    .single();

  if (insertErr) {
    console.error("Tasarım kaydedilemedi:", insertErr.message);
    process.exit(1);
  }

  console.log("Story tasarımı oluşturuldu!");
  console.log(`  Design ID: ${design.id}`);
  console.log(`  Editörde aç: /admin/tasarim/${design.id}`);
  console.log(`  PNG olarak indirebilirsiniz.`);
}

main();
