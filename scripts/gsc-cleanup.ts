import { google } from "googleapis";

const KEY_FILE = "/Volumes/PortableSSD/klemensart/gsc-key.json";
const SITE_URL = "sc-domain:klemensart.com";

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/webmasters"],
  });

  const webmasters = google.webmasters({ version: "v3", auth });

  // Eski WordPress sitemap'lerini sil
  const oldSitemaps = [
    "https://www.klemensart.com/sitemap.rss",
    "https://www.klemensart.com/sitemap.xml",
  ];

  console.log("=== ESKİ SITEMAP SİLME ===");
  for (const url of oldSitemaps) {
    try {
      await webmasters.sitemaps.delete({ siteUrl: SITE_URL, feedpath: url });
      console.log(`OK: ${url} silindi`);
    } catch (e: any) {
      console.log(`HATA: ${url} — ${e.message?.slice(0, 100)}`);
    }
  }

  // Sonucu dogrula
  console.log("\n=== GUNCEL SITEMAP LİSTESİ ===");
  const sitemaps = await webmasters.sitemaps.list({ siteUrl: SITE_URL });
  for (const sm of sitemaps.data.sitemap ?? []) {
    console.log(`${sm.path} — ${sm.type} — son: ${sm.lastSubmitted}`);
  }
}

main().catch(console.error);
