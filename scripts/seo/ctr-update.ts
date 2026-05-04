/**
 * SEO CTR iyileştirme — düşük CTR'li makalelerin meta description'larını günceller.
 * Tek seferlik çalıştırılacak script.
 *
 * Kullanım: npx tsx scripts/seo/ctr-update.ts
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GSC raporundan: imp>500, CTR<%2.5 olan makale sayfaları
const updates: { slug: string; meta_description: string }[] = [
  {
    slug: "turk-sanatinda-islamiyet-sonrasi-donem-saraydan-sokaga-evrilen-estetik",
    meta_description:
      "İslamiyet sonrası Türk sanatı nasıl dönüştü? Selçuklu'dan Osmanlı'ya, saraydan halka inen estetik yolculuğu — hat, minyatür, çini ve mimari.",
  },
  {
    slug: "sanatlarin-tanrisi-apollonun-evi-delos-adasi",
    meta_description:
      "Apollon'un doğduğu kutsal ada Delos: antik tapınaklar, mozaikler ve Akdeniz'in en iyi korunmuş arkeolojik alanı. Gezi rehberi ve tarihî analiz.",
  },
];

async function main() {
  for (const { slug, meta_description } of updates) {
    const { data, error } = await supabase
      .from("articles")
      .update({ meta_description })
      .eq("slug", slug)
      .select("slug, meta_description")
      .single();

    if (error) {
      console.error(`❌ ${slug}:`, error.message);
    } else {
      console.log(`✅ ${data.slug} → "${data.meta_description.slice(0, 60)}…"`);
    }
  }
}

main().catch(console.error);
