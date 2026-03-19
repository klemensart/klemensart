/**
 * Google Indexing API — Yeni/güncellenen URL'leri Google'a anında bildir
 *
 * Kullanım:
 *   npx tsx scripts/indexing-notify.ts <url>              # Tek URL bildir
 *   npx tsx scripts/indexing-notify.ts --new-news         # Son 24 saatteki haberleri bildir
 *   npx tsx scripts/indexing-notify.ts --new-articles     # Son 24 saatteki yazıları bildir
 *   npx tsx scripts/indexing-notify.ts --all-news         # Tüm haber URL'lerini bildir
 */

import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const auth = new google.auth.GoogleAuth({
  keyFile: "/Volumes/PortableSSD/klemensart/gsc-key.json",
  scopes: ["https://www.googleapis.com/auth/indexing"],
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sgabkrzzzszfqrtgkord.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

const BASE = "https://klemensart.com";

async function notifyUrl(authClient: any, url: string, type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED") {
  const indexing = google.indexing({ version: "v3", auth: authClient });
  try {
    const res = await indexing.urlNotifications.publish({
      requestBody: { url, type },
    });
    console.log(`✓ ${url} → ${res.data.urlNotificationMetadata?.latestUpdate?.type}`);
    return true;
  } catch (err: any) {
    const msg = err.errors?.[0]?.message || err.message || "Bilinmeyen hata";
    console.log(`✗ ${url} → ${msg.slice(0, 120)}`);
    return false;
  }
}

async function getRecentNews(hours = 24): Promise<string[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("news_items")
    .select("slug")
    .gte("created_at", since)
    .in("status", ["published", "archived"])
    .order("created_at", { ascending: false });

  return (data ?? []).map((n: any) => `${BASE}/haberler/${n.slug}`);
}

async function getRecentArticles(hours = 24): Promise<string[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("articles")
    .select("slug, type")
    .gte("updated_at", since)
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  return (data ?? []).map((a: any) => {
    const typeMap: Record<string, string> = { yazi: "yazi", video: "video", galeri: "galeri" };
    return `${BASE}/icerikler/${typeMap[a.type] || "yazi"}/${a.slug}`;
  });
}

async function getAllNews(): Promise<string[]> {
  const { data } = await supabase
    .from("news_items")
    .select("slug")
    .in("status", ["published", "archived"])
    .order("published_at", { ascending: false });

  return (data ?? []).map((n: any) => `${BASE}/haberler/${n.slug}`);
}

async function main() {
  const authClient = await auth.getClient();
  const arg = process.argv[2];

  if (!arg) {
    console.log("Kullanım:");
    console.log("  npx tsx scripts/indexing-notify.ts <url>");
    console.log("  npx tsx scripts/indexing-notify.ts --new-news");
    console.log("  npx tsx scripts/indexing-notify.ts --new-articles");
    console.log("  npx tsx scripts/indexing-notify.ts --all-news");
    process.exit(1);
  }

  let urls: string[] = [];

  if (arg === "--new-news") {
    urls = await getRecentNews();
    console.log(`Son 24 saatte ${urls.length} yeni haber:\n`);
  } else if (arg === "--new-articles") {
    urls = await getRecentArticles();
    console.log(`Son 24 saatte ${urls.length} güncellenen yazı:\n`);
  } else if (arg === "--all-news") {
    urls = await getAllNews();
    console.log(`Toplam ${urls.length} haber URL'si:\n`);
  } else if (arg === "--harita") {
    const { PLACES, ROUTES } = await import("../src/lib/harita-data");
    const { placeSlug, routeSlug } = await import("../src/lib/harita-gamification");
    const seen = new Set<string>();
    // Mekan sayfaları
    for (const p of PLACES) {
      const s = placeSlug(p.name);
      if (!seen.has(s)) { seen.add(s); urls.push(`${BASE}/harita/${s}`); }
    }
    // Rota sayfaları
    for (const r of ROUTES) {
      const s = routeSlug(r.title);
      urls.push(`${BASE}/harita/rotalar/${s}`);
    }
    // Ana harita sayfası
    urls.unshift(`${BASE}/harita`);
    console.log(`Toplam ${urls.length} harita URL'si (${seen.size} mekan + ${ROUTES.length} rota + 1 ana):\n`);
  } else {
    urls = [arg.startsWith("http") ? arg : `${BASE}${arg}`];
  }

  if (urls.length === 0) {
    console.log("Bildirilecek URL yok.");
    return;
  }

  let ok = 0;
  let fail = 0;
  // Indexing API rate limit: 200/day, batch of ~2/sec
  for (const url of urls) {
    const success = await notifyUrl(authClient, url);
    success ? ok++ : fail++;
    if (urls.length > 1) await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n--- Sonuç: ${ok} başarılı, ${fail} hata ---`);
}

main().catch(console.error);
