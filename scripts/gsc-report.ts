import { google } from "googleapis";

const KEY_FILE = "/Volumes/PortableSSD/klemensart/gsc-key.json";
const SITE_URL = "sc-domain:klemensart.com";

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const searchconsole = google.searchconsole({ version: "v1", auth });

  const today = new Date();
  const endDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000); // GSC 2 gun gecikme
  const startDate28 = new Date(endDate.getTime() - 28 * 24 * 60 * 60 * 1000);
  const startDate7 = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prevStart28 = new Date(startDate28.getTime() - 28 * 24 * 60 * 60 * 1000);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  // 1. Son 28 gun genel performans
  const [current28, prev28] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: fmt(startDate28),
        endDate: fmt(endDate),
        dimensions: [],
      },
    }),
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: fmt(prevStart28),
        endDate: fmt(startDate28),
        dimensions: [],
      },
    }),
  ]);

  const cur = current28.data.rows?.[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const prv = prev28.data.rows?.[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  console.log("=== SON 28 GUN GENEL PERFORMANS ===");
  console.log(`Tiklamalar: ${cur.clicks} (onceki: ${prv.clicks}, ${pctChange(cur.clicks!, prv.clicks!)})`);
  console.log(`Gosterimler: ${cur.impressions} (onceki: ${prv.impressions}, ${pctChange(cur.impressions!, prv.impressions!)})`);
  console.log(`CTR: ${(cur.ctr! * 100).toFixed(1)}% (onceki: ${(prv.ctr! * 100).toFixed(1)}%)`);
  console.log(`Ort. Pozisyon: ${cur.position!.toFixed(1)} (onceki: ${prv.position!.toFixed(1)})`);

  // 2. En cok tiklanan sayfalar (son 28 gun)
  const topPages = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: fmt(startDate28),
      endDate: fmt(endDate),
      dimensions: ["page"],
      rowLimit: 20,
    },
  });

  console.log("\n=== EN COK TIKLANAN 20 SAYFA (28 gun) ===");
  console.log("Tikl | Gost | CTR    | Poz  | Sayfa");
  console.log("-----|------|--------|------|------");
  for (const row of topPages.data.rows ?? []) {
    const page = row.keys![0].replace("https://klemensart.com", "");
    console.log(
      `${String(row.clicks).padStart(4)} | ${String(row.impressions).padStart(4)} | ${(row.ctr! * 100).toFixed(1).padStart(5)}% | ${row.position!.toFixed(1).padStart(4)} | ${page || "/"}`
    );
  }

  // 3. En cok aranan sorgular (son 28 gun)
  const topQueries = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: fmt(startDate28),
      endDate: fmt(endDate),
      dimensions: ["query"],
      rowLimit: 25,
    },
  });

  console.log("\n=== EN COK ARANAN 25 SORGU (28 gun) ===");
  console.log("Tikl | Gost | CTR    | Poz  | Sorgu");
  console.log("-----|------|--------|------|------");
  for (const row of topQueries.data.rows ?? []) {
    console.log(
      `${String(row.clicks).padStart(4)} | ${String(row.impressions).padStart(4)} | ${(row.ctr! * 100).toFixed(1).padStart(5)}% | ${row.position!.toFixed(1).padStart(4)} | ${row.keys![0]}`
    );
  }

  // 4. Son 7 gun gunluk trend
  const daily = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: fmt(startDate7),
      endDate: fmt(endDate),
      dimensions: ["date"],
    },
  });

  console.log("\n=== GUNLUK TREND (son 7 gun) ===");
  console.log("Tarih      | Tikl | Gost | CTR    | Poz");
  console.log("-----------|------|------|--------|----");
  for (const row of daily.data.rows ?? []) {
    console.log(
      `${row.keys![0]} | ${String(row.clicks).padStart(4)} | ${String(row.impressions).padStart(4)} | ${(row.ctr! * 100).toFixed(1).padStart(5)}% | ${row.position!.toFixed(1).padStart(4)}`
    );
  }

  // 5. Cihaz dagilimi
  const devices = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: fmt(startDate28),
      endDate: fmt(endDate),
      dimensions: ["device"],
    },
  });

  console.log("\n=== CIHAZ DAGILIMI (28 gun) ===");
  for (const row of devices.data.rows ?? []) {
    console.log(`${row.keys![0]}: ${row.clicks} tiklama, ${row.impressions} gosterim, CTR ${(row.ctr! * 100).toFixed(1)}%`);
  }
}

function pctChange(current: number, previous: number): string {
  if (previous === 0) return "+∞";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(0)}%`;
}

main().catch(console.error);
