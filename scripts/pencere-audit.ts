import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

(async () => {
  // Bu döneme ait olabilecek yazılar: tarih >= 15 Mayıs 2026
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, author, category, status, date, tags")
    .gte("date", "2026-05-15")
    .order("category", { ascending: true });
  if (error) { console.error(error.message); return; }

  console.log(`15 May 2026 sonrası ${data?.length} yazı:\n`);
  const byCat: Record<string, any[]> = {};
  for (const a of data || []) (byCat[a.category||"—"] ||= []).push(a);
  for (const [cat, items] of Object.entries(byCat)) {
    console.log(`\n████ ${cat} (${items.length})`);
    for (const a of items) {
      const hasTag = (a.tags||[]).some((t:string)=>/pencere/i.test(t));
      console.log(`  ${hasTag?"🏷️ ":"   "}[${a.status.padEnd(9)}] ${a.date}  ${a.title}  —${a.author}`);
    }
  }
})();
