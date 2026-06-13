import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const slugs = [
  "gonulden-gonule","perspektiften-arayuze-bir-gorme-rejimi-olarak-pencere","kor-olmadan-bakmak","nuh-nebiden-kalma-bir-anlati",
  "hitchcockun-arka-penceresindeki-tanik","cagin-otesine-acilan-pencere-louvre-piramidi","vilhelm-hammershinin-pencereleri",
  "bir-evin-icinden-dunyaya-bakmak-tennessee-williams-karakterlerinde-pencere","kutsal-koza-hane-ici-kapan","pencerenin-ardinda",
  "basim-kopuk-kopuk-bulut-icim-disim-deniz-ama-yer-yok","hoca-gok-yuz-ve-pencerem","maviye-bir-davet",
];

(async () => {
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, author, author_email, author_id, status")
    .in("slug", slugs);
  if (error) { console.error(error.message); return; }

  // author_email boşsa people tablosundan dene
  const rows = data || [];
  const missingIds = rows.filter(r => !r.author_email && r.author_id).map(r => r.author_id);
  let peopleMap: Record<string,string> = {};
  if (missingIds.length) {
    const { data: people } = await supabase.from("people").select("id, email, name").in("id", missingIds);
    for (const p of people || []) if (p.email) peopleMap[p.id] = p.email;
  }

  console.log(`${rows.length} yazı için yazar mailleri:\n`);
  const emailSet = new Set<string>();
  const noEmail: string[] = [];
  for (const r of rows) {
    const email = r.author_email || (r.author_id ? peopleMap[r.author_id] : "") || "";
    if (email) emailSet.add(email.trim().toLowerCase());
    else noEmail.push(`${r.author} (${r.title.slice(0,30)})`);
    console.log(`  ${email||"— MAIL YOK —"}  | ${r.author}  | [${r.status}]`);
  }
  console.log(`\n📧 Benzersiz mail (${emailSet.size}):`);
  console.log([...emailSet].join(", "));
  if (noEmail.length) {
    console.log(`\n⚠️ Maili olmayan yazarlar (${noEmail.length}):`);
    noEmail.forEach(n => console.log("  -", n));
  }
})();
