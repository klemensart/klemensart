/**
 * Marketplace events tablosunu doğrula:
 * 1. is_klemens ve detail_slug sütunları var mı?
 * 2. is_klemens = true olan satırları listele
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createAdminClient } from "../src/lib/supabase-admin";

async function main() {
  const supabase = createAdminClient();

  console.log("=== 1) is_klemens & detail_slug sütun kontrolü ===\n");

  const { data: colCheck, error: colErr } = await supabase
    .from("marketplace_events")
    .select("is_klemens, detail_slug")
    .limit(1);

  if (colErr) {
    console.error("HATA — sütunlar mevcut değil veya sorgu başarısız:");
    console.error(colErr.message);
  } else {
    console.log("BASARILI — is_klemens ve detail_slug sütunları mevcut.");
    console.log("Örnek satır:", colCheck?.[0] ?? "(tablo boş)");
  }

  console.log("\n=== 2) is_klemens = true olan satırlar ===\n");

  const { data: klemensRows, error: klemensErr } = await supabase
    .from("marketplace_events")
    .select("id, slug, title, category, city, price, is_klemens, detail_slug, status")
    .eq("is_klemens", true)
    .order("title");

  if (klemensErr) {
    console.error("HATA:", klemensErr.message);
    return;
  }

  if (!klemensRows || klemensRows.length === 0) {
    console.log("(!) Klemens workshop bulunamadı — seed çalıştırılmamış olabilir.");
    return;
  }

  console.log(`Toplam ${klemensRows.length} Klemens atölyesi bulundu:\n`);
  for (const row of klemensRows) {
    console.log(`  - [${row.status}] ${row.title}`);
    console.log(`    slug: ${row.slug}`);
    console.log(`    detail_slug: ${row.detail_slug ?? "(yok)"}`);
    console.log(`    category: ${row.category} | city: ${row.city} | price: ${row.price} TRY`);
    console.log();
  }

  // Toplam satır sayısı
  const { count } = await supabase
    .from("marketplace_events")
    .select("id", { count: "exact", head: true });

  console.log(`=== Toplam marketplace_events satır sayısı: ${count} ===`);
}

main().catch(console.error);
