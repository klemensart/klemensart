import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function main() {
  // 1. Disable known broken feeds
  const brokenUrls = [
    "https://www.aa.com.tr/tr/rss/default.aspx?cat=kultur-sanat",
    "https://www.iha.com.tr/rss/kultur-sanat/",
    "https://www.dha.com.tr/rss/kultur-sanat.xml",
    "https://www.ntv.com.tr/sanat.rss",
    "https://www.gazeteduvar.com.tr/rss/sanat",
    "https://www.gazeteduvar.com.tr/rss/muzik",
    "https://bianet.org/rss/kultur",
    "https://www.artkolik.com/feed/",
    "https://manifold.press/feed",
  ];
  const { error: e1 } = await sb
    .from("news_feeds")
    .update({ is_active: false })
    .in("url", brokenUrls);
  if (e1) console.error("Disable hatası:", e1);
  else console.log("Kırık feedler devre dışı bırakıldı:", brokenUrls.length);

  // 2. Add missing gazete feeds
  const missing = [
    { name: "Hürriyet Kelebek", url: "https://www.hurriyet.com.tr/rss/kelebek", category: "gazete", is_active: true },
    { name: "Milliyet — Sanat", url: "https://www.milliyet.com.tr/rss/rssNew/SanatRss.xml", category: "gazete", is_active: true },
    { name: "Habertürk — Kültür Sanat", url: "https://www.haberturk.com/rss/kultur-sanat.xml", category: "gazete", is_active: true },
    { name: "Sözcü — Kültür Sanat", url: "https://www.sozcu.com.tr/feeds-rss-category-kultur-sanat", category: "gazete", is_active: true },
    { name: "Sanat Karavani", url: "https://www.sanatkaravani.com/feed/", category: "sanat-platformu", is_active: false },
  ];
  const { error: e2 } = await sb
    .from("news_feeds")
    .upsert(missing, { onConflict: "url", ignoreDuplicates: true });
  if (e2) console.error("Gazete ekleme hatası:", e2);
  else console.log("Eksik gazete kaynakları eklendi");

  // 3. Fix Gazete Duvar Kültür URL if old version exists
  await sb
    .from("news_feeds")
    .update({ url: "https://www.gazeteduvar.com.tr/rss/kultur-sanat", name: "Gazete Duvar — Kültür Sanat" })
    .eq("url", "https://www.gazeteduvar.com.tr/rss/kultur");
  console.log("Gazete Duvar URL kontrol edildi");

  // Final summary
  const { data: active } = await sb
    .from("news_feeds")
    .select("name,category,is_active")
    .eq("is_active", true)
    .order("category");
  const { data: inactive } = await sb
    .from("news_feeds")
    .select("name,category")
    .eq("is_active", false);

  console.log(`\n=== AKTİF KAYNAKLAR (${active?.length || 0}) ===`);
  for (const f of active || []) console.log(`  [${f.category}] ${f.name}`);
  console.log(`\n=== DEVRE DIŞI (${inactive?.length || 0}) ===`);
  for (const f of inactive || []) console.log(`  [${f.category}] ${f.name}`);
}

main();
