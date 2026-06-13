/**
 * Pencere Bülteni #3 — "PencereBulten" etiketli yazıları çeker + okuma süresi hesaplar.
 * Kullanım: npx tsx scripts/pencere-bulten-yazilar.ts
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function readingMinutes(content: string | null): number {
  if (!content) return 0;
  const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200)); // ~200 kelime/dk
}

async function main() {
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, author, author_ig, category, status, date, image, description, content")
    .contains("tags", ["PencereBulten"])
    .order("category", { ascending: true });

  if (error) {
    console.error("HATA:", error.message);
    return;
  }

  // Kategoriye göre grupla
  const byCat: Record<string, typeof data> = {};
  for (const a of data || []) {
    (byCat[a.category || "—"] ||= []).push(a);
  }

  for (const [cat, items] of Object.entries(byCat)) {
    console.log(`\n████ ${cat} (${items!.length}) ████\n`);
    for (const a of items!) {
      console.log(`── ${a.title}  [${a.status}]`);
      console.log(`   slug:  ${a.slug}`);
      console.log(`   yazar: ${a.author}`);
      console.log(`   süre:  ${readingMinutes(a.content)} DK`);
      console.log(`   görsel:${a.image}`);
      console.log(`   özet:  ${(a.description || "").trim()}`);
      console.log("");
    }
  }
}

main().catch(console.error);
