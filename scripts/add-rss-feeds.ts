import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const feeds = [
  // Tier 1 — Sanat platformları
  { name: "Sanat Okur", url: "https://sanatokur.com/feed/", category: "sanat-platformu" },
  { name: "Art Unlimited", url: "https://www.unlimitedrag.com/blog-feed.xml", category: "sanat-platformu" },
  { name: "Sanattan Yansımalar", url: "https://www.sanattanyansimalar.com/rss", category: "sanat-platformu" },
  { name: "e-skop", url: "https://www.e-skop.com/rssbulten", category: "sanat-platformu" },
  { name: "7/24 Kültür Sanat", url: "https://724kultursanat.com/feed/", category: "sanat-platformu" },
  { name: "Bağımsız Sinema", url: "https://www.bagimsizsinema.com/feed", category: "sanat-platformu" },

  // Tier 1 — Dergi
  { name: "Manifold (düzgün)", url: "https://manifold.press/rss", category: "dergi" },

  // Tier 1 — Ajans (yeni URL)
  { name: "Anadolu Ajansı — Kültür (yeni)", url: "https://www.aa.com.tr/tr/rss/default?cat=kultur", category: "ajans" },
  { name: "TRT Haber — Kültür Sanat", url: "https://www.trthaber.com/kultur_sanat_articles.rss", category: "ajans" },

  // Tier 2 — Sinema
  { name: "Beyazperde", url: "https://www.beyazperde.com/rss/haberler.xml", category: "sanat-platformu" },
  { name: "Öteki Sinema", url: "https://www.otekisinema.com/feed/", category: "sanat-platformu" },
  { name: "Marjinal Sinema", url: "https://marjinalsinema.com/feed/", category: "sanat-platformu" },
  { name: "Sinetopya", url: "https://sinetopya.com/rss/", category: "sanat-platformu" },

  // Tier 2 — Gazete
  { name: "Cumhuriyet — Kültür Sanat (ek)", url: "https://www.cumhuriyet.com.tr/rss/6", category: "gazete" },

  // Tier 2 — Edebiyat & Kültür
  { name: "Futuristika!", url: "https://futuristika.org/feed/", category: "dergi" },
  { name: "Edebiyat Burada", url: "https://edebiyatburada.com/feed/", category: "diger" },
  { name: "Edebi Bülten", url: "https://edebibulten.com/feed/", category: "diger" },
  { name: "KitapHaber", url: "https://www.kitaphaber.com.tr/feed", category: "diger" },

  // Tier 3 — Haber
  { name: "Medyascope", url: "https://medyascope.tv/feed/", category: "diger" },
  { name: "Serbestiyet", url: "https://serbestiyet.com/feed/", category: "diger" },
];

async function main() {
  console.log(`Toplam ${feeds.length} kaynak ekleniyor...`);

  const { error } = await sb.from("news_feeds").upsert(
    feeds.map((f) => ({ ...f, is_active: true })),
    { onConflict: "url", ignoreDuplicates: true }
  );

  if (error) {
    console.error("Upsert hatası:", error);
    return;
  }

  console.log("Kaynaklar eklendi!");

  // Verify
  const { data: all, error: e2 } = await sb
    .from("news_feeds")
    .select("name,url,is_active,category")
    .eq("is_active", true)
    .order("category");

  if (e2) {
    console.error(e2);
    return;
  }

  console.log(`\nToplam aktif feed sayısı: ${all?.length}`);
  for (const f of all || []) {
    console.log(`  [${f.category}] ${f.name}`);
  }
}

main();
