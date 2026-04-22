/**
 * Tek seferlik migration script:
 * articles.content içindeki boşluklu Supabase Storage URL'lerini düzeltir.
 *
 * Markdown image syntax'ında boşluk → %20 encode eder.
 * Örn: ![alt](https://...slug /file.webp) → ![alt](https://...slug%20/file.webp)
 *
 * Kullanım: npx tsx scripts/fix-article-image-urls.ts
 * --dry-run (varsayılan): sadece gösterir, DB'ye yazmaz
 * --apply: gerçekten günceller
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dryRun = !process.argv.includes("--apply");

// Supabase storage URL'lerindeki boşlukları %20'ye çevir
// Hedef: ![...](https://....supabase.co/storage/v1/object/public/...path with spaces...)
function fixImageUrls(content: string): string {
  return content.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)]*supabase[^)]*)\)/g,
    (_match, alt: string, url: string) => {
      const fixed = url.replace(/ /g, "%20");
      if (fixed !== url) {
        return `![${alt}](${fixed})`;
      }
      return _match;
    }
  );
}

async function main() {
  console.log(dryRun ? "=== DRY RUN ===" : "=== APPLYING FIXES ===");
  console.log();

  // Boşluk içeren Supabase URL'lerini ara
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, slug, content")
    .like("content", "%supabase.co/storage% %");

  if (error) {
    console.error("Sorgu hatası:", error.message);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log("Boşluklu URL içeren makale bulunamadı.");
    return;
  }

  console.log(`${articles.length} makale bulundu:\n`);

  let fixedCount = 0;

  for (const article of articles) {
    const fixed = fixImageUrls(article.content);

    if (fixed === article.content) continue;

    fixedCount++;
    console.log(`[${fixedCount}] "${article.title}" (${article.slug})`);

    // Değişen URL'leri göster
    const origUrls = article.content.match(/!\[[^\]]*\]\([^)]*supabase[^)]*\)/g) || [];
    const fixedUrls = fixed.match(/!\[[^\]]*\]\([^)]*supabase[^)]*\)/g) || [];
    for (let i = 0; i < origUrls.length; i++) {
      if (origUrls[i] !== fixedUrls[i]) {
        console.log(`  ESKİ: ${origUrls[i].slice(0, 120)}...`);
        console.log(`  YENİ: ${fixedUrls[i].slice(0, 120)}...`);
      }
    }
    console.log();

    if (!dryRun) {
      const { error: updateErr } = await supabase
        .from("articles")
        .update({ content: fixed })
        .eq("id", article.id);

      if (updateErr) {
        console.error(`  HATA: ${updateErr.message}`);
      } else {
        console.log("  Güncellendi.");
      }
    }
  }

  console.log(`\nToplam: ${fixedCount} makalede düzeltme ${dryRun ? "gerekli" : "yapıldı"}.`);
  if (dryRun && fixedCount > 0) {
    console.log("\nGerçekten uygulamak için: npx tsx scripts/fix-article-image-urls.ts --apply");
  }
}

main();
