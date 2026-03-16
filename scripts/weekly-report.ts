/**
 * Haftalık SEO & Trafik Raporu — GSC + GA4
 *
 * Kullanım:
 *   npx tsx scripts/weekly-report.ts
 */

import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "/Volumes/PortableSSD/klemensart/gsc-key.json",
  scopes: [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
  ],
});

const SITE_URL = "sc-domain:klemensart.com";
const GA4_PROPERTY = "properties/528677811";

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function gscReport() {
  const wm = google.searchconsole({ version: "v1", auth });

  // This week vs last week
  const thisWeek = await wm.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: dateStr(7),
      endDate: dateStr(1),
      dimensions: [],
    },
  });

  const lastWeek = await wm.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: dateStr(14),
      endDate: dateStr(8),
      dimensions: [],
    },
  });

  const tw = thisWeek.data.rows?.[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const lw = lastWeek.data.rows?.[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  const pct = (a: number, b: number) => b === 0 ? "N/A" : `${a >= b ? "+" : ""}${(((a - b) / b) * 100).toFixed(0)}%`;

  console.log("=== GSC HAFTALIK RAPOR ===\n");
  console.log(`Dönem: ${dateStr(7)} — ${dateStr(1)}\n`);
  console.log(`Tıklama:   ${tw.clicks}  (${pct(tw.clicks as number, lw.clicks as number)} önceki haftaya göre)`);
  console.log(`Gösterim:  ${tw.impressions}  (${pct(tw.impressions as number, lw.impressions as number)})`);
  console.log(`CTR:       ${((tw.ctr as number) * 100).toFixed(1)}%  (önceki: ${((lw.ctr as number) * 100).toFixed(1)}%)`);
  console.log(`Ort. Sıra: ${(tw.position as number).toFixed(1)}  (önceki: ${(lw.position as number).toFixed(1)})`);

  // Top pages
  const topPages = await wm.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: dateStr(7),
      endDate: dateStr(1),
      dimensions: ["page"],
      rowLimit: 10,
    },
  });

  console.log("\n--- En Çok Tıklanan Sayfalar ---");
  for (const row of topPages.data.rows ?? []) {
    const path = (row.keys?.[0] ?? "").replace("https://klemensart.com", "");
    console.log(`  ${row.clicks} tık | ${row.impressions} gös | ${((row.ctr ?? 0) * 100).toFixed(1)}% CTR | ${path}`);
  }

  // Top queries
  const topQueries = await wm.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: dateStr(7),
      endDate: dateStr(1),
      dimensions: ["query"],
      rowLimit: 15,
    },
  });

  console.log("\n--- En Çok Aranan Sorgular ---");
  for (const row of topQueries.data.rows ?? []) {
    console.log(`  ${row.clicks} tık | ${row.impressions} gös | sıra ${(row.position ?? 0).toFixed(0)} | "${row.keys?.[0]}"`);
  }

  // New pages this week
  const newPages = await wm.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: dateStr(7),
      endDate: dateStr(1),
      dimensions: ["page"],
      rowLimit: 100,
    },
  });

  const lastWeekPages = await wm.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: dateStr(14),
      endDate: dateStr(8),
      dimensions: ["page"],
      rowLimit: 100,
    },
  });

  const lastWeekUrls = new Set((lastWeekPages.data.rows ?? []).map((r) => r.keys?.[0]));
  const newlyAppearing = (newPages.data.rows ?? []).filter((r) => !lastWeekUrls.has(r.keys?.[0]));

  if (newlyAppearing.length > 0) {
    console.log("\n--- Bu Hafta Yeni Görünen Sayfalar ---");
    for (const row of newlyAppearing.slice(0, 10)) {
      const path = (row.keys?.[0] ?? "").replace("https://klemensart.com", "");
      console.log(`  ${row.impressions} gös | ${row.clicks} tık | ${path}`);
    }
  }

  // Device breakdown
  const devices = await wm.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: dateStr(7),
      endDate: dateStr(1),
      dimensions: ["device"],
    },
  });

  console.log("\n--- Cihaz Dağılımı ---");
  for (const row of devices.data.rows ?? []) {
    console.log(`  ${row.keys?.[0]}: ${row.clicks} tık, ${row.impressions} gös`);
  }
}

async function ga4Report() {
  const data = google.analyticsdata({ version: "v1beta", auth });

  console.log("\n\n=== GA4 HAFTALIK RAPOR ===\n");
  console.log(`Dönem: ${dateStr(7)} — ${dateStr(1)}\n`);

  // Overall metrics
  try {
    const overall = await data.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges: [
          { startDate: dateStr(7), endDate: dateStr(1), name: "thisWeek" },
          { startDate: dateStr(14), endDate: dateStr(8), name: "lastWeek" },
        ],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
        ],
      },
    });

    const rows = overall.data.rows ?? [];
    if (rows.length === 0) {
      console.log("Henüz GA4 verisi yok (yeni kurulum — 48 saat bekleyin).\n");
      return;
    }

    const tw = rows[0]?.metricValues ?? [];
    const lw = rows[1]?.metricValues ?? [];

    const val = (arr: any[], i: number) => Number(arr[i]?.value ?? 0);
    const pct = (a: number, b: number) => b === 0 ? "yeni" : `${a >= b ? "+" : ""}${(((a - b) / b) * 100).toFixed(0)}%`;

    console.log(`Aktif Kullanıcı: ${val(tw, 0)}  (${pct(val(tw, 0), val(lw, 0))})`);
    console.log(`Oturum:          ${val(tw, 1)}  (${pct(val(tw, 1), val(lw, 1))})`);
    console.log(`Sayfa Gör.:      ${val(tw, 2)}  (${pct(val(tw, 2), val(lw, 2))})`);
    console.log(`Ort. Oturum:     ${(val(tw, 3) / 60).toFixed(1)} dk`);
    console.log(`Bounce Rate:     ${(val(tw, 4) * 100).toFixed(1)}%`);

    // Top pages
    const topPages = await data.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges: [{ startDate: dateStr(7), endDate: dateStr(1) }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "activeUsers" },
        ],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      },
    });

    console.log("\n--- En Çok Ziyaret Edilen Sayfalar ---");
    for (const row of topPages.data.rows ?? []) {
      const path = row.dimensionValues?.[0]?.value ?? "";
      const views = row.metricValues?.[0]?.value ?? "0";
      const users = row.metricValues?.[1]?.value ?? "0";
      console.log(`  ${views} görüntüleme | ${users} kullanıcı | ${path}`);
    }

    // Traffic sources
    const sources = await data.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges: [{ startDate: dateStr(7), endDate: dateStr(1) }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 8,
      },
    });

    console.log("\n--- Trafik Kaynakları ---");
    for (const row of sources.data.rows ?? []) {
      const channel = row.dimensionValues?.[0]?.value ?? "";
      const sessions = row.metricValues?.[0]?.value ?? "0";
      const users = row.metricValues?.[1]?.value ?? "0";
      console.log(`  ${channel}: ${sessions} oturum, ${users} kullanıcı`);
    }
  } catch (err: any) {
    console.log(`GA4 veri hatası: ${err.message?.slice(0, 120)}`);
  }
}

async function main() {
  console.log(`════════════════════════════════════════`);
  console.log(`  KLEMENS ART — HAFTALIK SEO RAPORU`);
  console.log(`  ${new Date().toISOString().slice(0, 10)}`);
  console.log(`════════════════════════════════════════\n`);

  await gscReport();
  await ga4Report();

  console.log("\n════════════════════════════════════════");
  console.log("  Rapor sonu");
  console.log("════════════════════════════════════════");
}

main().catch(console.error);
