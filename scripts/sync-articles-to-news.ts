/**
 * Yayınlanmış articles'ı news_items'a senkronize et
 * Eksik olanları ekler, mevcut olanları atlar
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // 1. Yayınlanmış articles
  const { data: articles } = await sb
    .from("articles")
    .select("id,title,slug,description,image,date")
    .eq("status", "published");

  // 2. Mevcut news_items guid'leri
  const { data: existing } = await sb
    .from("news_items")
    .select("guid")
    .like("guid", "klemens-article-%");

  const existingIds = new Set(
    (existing || []).map((e) => e.guid.replace("klemens-article-", ""))
  );

  // 3. Eksikleri bul
  const missing = (articles || []).filter((a) => {
    return !existingIds.has(a.id);
  });

  console.log(`Yayınlanmış articles: ${articles?.length || 0}`);
  console.log(`Zaten news_items'ta: ${existingIds.size}`);
  console.log(`Eksik (eklenecek): ${missing.length}`);

  if (dryRun) {
    console.log("\n[DRY RUN]\n");
    for (const a of missing) {
      console.log(" ", a.title?.slice(0, 70));
    }
    return;
  }

  let added = 0;
  for (const a of missing) {
    const guid = `klemens-article-${a.id}`;
    const newsSlug = toSlug(a.title || "");

    const { error } = await sb.from("news_items").insert({
      guid,
      title: a.title,
      summary: a.description || null,
      url: `https://klemensart.com/icerikler/yazi/${a.slug}`,
      image_url: a.image || null,
      source_name: "Klemens",
      status: "published",
      is_manual: true,
      published_at: a.date || new Date().toISOString(),
      slug: newsSlug,
      sent_in_newsletter: true, // eski yazılar — tekrar bültene girmesin
    });

    if (error) {
      console.error(`HATA (${a.title}):`, error.message);
    } else {
      console.log(`✓ ${a.title?.slice(0, 60)}`);
      added++;
    }
  }

  // 4. Mevcut "new" status'taki Klemens yazılarını "published" yap
  const { data: newOnes } = await sb
    .from("news_items")
    .select("id,title")
    .eq("source_name", "Klemens")
    .eq("status", "new");

  if (newOnes && newOnes.length > 0) {
    const ids = newOnes.map((n) => n.id);
    await sb.from("news_items").update({ status: "published" }).in("id", ids);
    console.log(`\n${newOnes.length} Klemens haberi "new" → "published" yapıldı`);
  }

  console.log(`\nSonuç: ${added} eklendi`);
}

main();
