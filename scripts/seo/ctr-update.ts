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
const updates: { slug: string; description: string }[] = [
  {
    slug: "turk-sanatinda-islamiyet-sonrasi-buyuk-degisim-bilinmeyenler",
    description:
      "İslamiyet sonrası Türk sanatı nasıl dönüştü? Selçuklu'dan Osmanlı'ya, saraydan halka inen estetik yolculuğu — hat, minyatür, çini ve mimari.",
  },
  {
    slug: "sanatlarin-tanrisi-apollonun-evi-delphi-tapinagi",
    description:
      "Apollon'un kutsal mabedi Delphi: antik tapınaklar, kehanet geleneği ve Yunan uygarlığının merkezi. Tarihî analiz ve gezi rehberi.",
  },
];

async function main() {
  // Önce slug'ları doğrula
  for (const { slug, description } of updates) {
    const { data: found } = await supabase
      .from("articles")
      .select("slug, description")
      .like("slug", `%${slug.slice(0, 30)}%`);

    if (!found || found.length === 0) {
      console.error(`❌ ${slug}: Slug bulunamadı`);
      continue;
    }

    const exact = found.find((r) => r.slug === slug);
    if (!exact) {
      console.log(`⚠️  Yakın eşleşmeler: ${found.map((r) => r.slug).join(", ")}`);
      continue;
    }

    console.log(`📝 Mevcut: "${exact.description?.slice(0, 50)}…"`);

    const { data, error } = await supabase
      .from("articles")
      .update({ description })
      .eq("slug", slug)
      .select("slug, description")
      .maybeSingle();

    if (error) {
      console.error(`❌ ${slug}:`, error.message);
    } else if (data) {
      console.log(`✅ ${data.slug} → "${data.description.slice(0, 60)}…"`);
    }
  }
}

main().catch(console.error);
