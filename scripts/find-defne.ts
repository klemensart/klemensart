import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
function rt(c: string | null){ if(!c) return 0; const t=c.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim(); return Math.max(1, Math.round((t?t.split(" ").length:0)/200)); }
(async () => {
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, author, category, status, date, image, description, tags, content")
    .ilike("author", "%Defne Ege%")
    .order("date", { ascending: false });
  if (error) { console.error(error.message); return; }
  console.log(`Defne Ege yazıları (${data?.length}):\n`);
  for (const a of data || []) {
    console.log(`── ${a.title}  [${a.status}]  ${a.date}`);
    console.log(`   slug:  ${a.slug}`);
    console.log(`   yazar: ${a.author}`);
    console.log(`   kat:   ${a.category}`);
    console.log(`   süre:  ${rt(a.content)} DK`);
    console.log(`   görsel:${a.image}`);
    console.log(`   etiket:${(a.tags||[]).join(", ")}`);
    console.log(`   özet:  ${(a.description||"").trim()}`);
    console.log("");
  }
})();
