import { google } from "googleapis";

const KEY_FILE = "/Volumes/PortableSSD/klemensart/gsc-key.json";
const SITE_URL = "sc-domain:klemensart.com";

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/webmasters"],
  });

  const searchconsole = google.searchconsole({ version: "v1", auth });
  const webmasters = google.webmasters({ version: "v3", auth });

  // 1. Mevcut sitemap'leri listele
  console.log("=== MEVCUT SITEMAP'LER ===");
  try {
    const sitemaps = await webmasters.sitemaps.list({ siteUrl: SITE_URL });
    for (const sm of sitemaps.data.sitemap ?? []) {
      console.log(`${sm.path} — ${sm.type} — ${sm.lastSubmitted} — ${sm.errors} hata, ${sm.warnings} uyari`);
    }
    if (!sitemaps.data.sitemap?.length) console.log("Henuz sitemap yok.");
  } catch (e: any) {
    console.log("Sitemap listesi alinamadi:", e.message);
  }

  // 2. Sitemap'leri submit et
  console.log("\n=== SITEMAP SUBMIT ===");
  const sitemapsToSubmit = [
    "https://klemensart.com/sitemap.xml",
  ];

  for (const url of sitemapsToSubmit) {
    try {
      await webmasters.sitemaps.submit({ siteUrl: SITE_URL, feedpath: url });
      console.log(`OK: ${url} submit edildi`);
    } catch (e: any) {
      console.log(`HATA: ${url} — ${e.message}`);
    }
  }

  // 3. Onemli sayfalarin indexleme durumunu kontrol et
  console.log("\n=== URL INCELEME (indexleme durumu) ===");
  const urlsToInspect = [
    "https://klemensart.com/",
    "https://klemensart.com/haberler",
    "https://klemensart.com/icerikler",
    "https://klemensart.com/atolyeler",
    "https://klemensart.com/etkinlikler",
    "https://klemensart.com/bulten",
    "https://klemensart.com/bulten/arsiv",
    "https://klemensart.com/sss",
    "https://klemensart.com/harita",
    "https://klemensart.com/testler",
  ];

  for (const url of urlsToInspect) {
    try {
      const result = await searchconsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: url,
          siteUrl: SITE_URL,
        },
      });
      const r = result.data.inspectionResult;
      const verdict = r?.indexStatusResult?.verdict ?? "?";
      const coverage = r?.indexStatusResult?.coverageState ?? "?";
      const crawled = r?.indexStatusResult?.lastCrawlTime ?? "?";
      const mobile = r?.mobileUsabilityResult?.verdict ?? "?";
      const richResults = r?.richResultsResult?.verdict ?? "?";
      console.log(`${url}`);
      console.log(`  Index: ${verdict} | Durum: ${coverage} | Son tarama: ${crawled}`);
      console.log(`  Mobil: ${mobile} | Rich Results: ${richResults}`);
    } catch (e: any) {
      console.log(`${url} — HATA: ${e.message?.slice(0, 100)}`);
    }
  }
}

main().catch(console.error);
