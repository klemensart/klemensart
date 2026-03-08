/**
 * Tek seferlik script: Son eklenen yazı için Instagram Story tasarımı üretir.
 * Kullanım: npx tsx scripts/generate-latest-story.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  console.error(".env.local dosyasını source edin: source .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function spaceCategory(cat: string): string {
  return cat
    .toUpperCase()
    .split("")
    .map((ch) => {
      if (ch === " ") return "  ";
      if (ch === "&") return " & ";
      return ch;
    })
    .join(" ")
    .replace(/\s{3,}/g, "   ")
    .trim();
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

  const categorySpaced = spaceCategory(article.category || "Odak");

  const canvasData = {
    backgroundColor: "#FFFBF7",
    objects: [
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
      {
        type: "image",
        x: 80,
        y: 60,
        width: 920,
        height: 620,
        src: article.image,
        opacity: 1,
        rotation: 0,
      },
      {
        type: "text",
        x: 80,
        y: 750,
        width: 920,
        text: categorySpaced,
        fontSize: 28,
        fontFamily: "Space Grotesk",
        fontStyle: "bold",
        fill: "#FF6D60",
        align: "left",
        opacity: 1,
        rotation: 0,
      },
      {
        type: "text",
        x: 80,
        y: 830,
        width: 920,
        text: article.description || article.title,
        fontSize: 38,
        fontFamily: "Cormorant Garamond",
        fontStyle: "normal",
        fill: "#2D2926",
        align: "left",
        opacity: 1,
        rotation: 0,
      },
      {
        type: "text",
        x: 80,
        y: 1760,
        width: 920,
        text: `— ${article.author || "Klemens Art"}`,
        fontSize: 26,
        fontFamily: "Space Grotesk",
        fontStyle: "normal",
        fill: "#8C857E",
        align: "left",
        opacity: 1,
        rotation: 0,
      },
    ],
  };

  // Designs tablosuna kaydet
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
      created_by: null, // script üzerinden, user yok
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
