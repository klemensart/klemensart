import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
function rt(c: string | null){ if(!c) return 0; const t=c.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim(); return Math.max(1, Math.round((t?t.split(" ").length:0)/200)); }
const slugs = [
  "perspektiften-arayuze-gorme-rejimi-olarak-pencere",
  "kutsal-koza-hane-ici-kapan",
  "bir-evin-icinden-dunyaya-bakmak-tennessee-williams-karakterlerinde-pencere",
  "maviye-bir-davet",
  "basim-kopuk-kopuk-bulut-icim-disim-deniz-ama-yer-yok",
];
(async () => {
  // slug tam bilinmiyorsa başlıktan da arayalım
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, author, author_ig, category, status, date, image, description, tags, content")
    .gte("date", "2026-05-15");
  if (error) { console.error(error.message); return; }
  const want = (data||[]).filter(a =>
    /perspektiften aray|kutsal koza|tennessee williams|maviye bir davet|başım köpük|basim kopuk/i.test(a.title)
  );
  for (const a of want) {
    console.log(`── ${a.title}  [${a.status}]`);
    console.log(`   slug:  ${a.slug}`);
    console.log(`   yazar: ${a.author}${a.author_ig?` (${a.author_ig})`:""}`);
    console.log(`   kat:   ${a.category}`);
    console.log(`   süre:  ${rt(a.content)} DK`);
    console.log(`   görsel:${a.image}`);
    console.log(`   etiket:${(a.tags||[]).join(", ")}`);
    console.log(`   özet:  ${(a.description||"").trim()}`);
    console.log("");
  }
})();
