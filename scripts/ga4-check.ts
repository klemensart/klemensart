/**
 * GA4 Veri Kontrolü — Property erişimini ve veri akışını doğrular
 */
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "/Volumes/PortableSSD/klemensart/gsc-key.json",
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

const GA4_PROPERTY = "properties/528677811";

async function main() {
  const data = google.analyticsdata({ version: "v1beta", auth });

  // 1) Metadata — property erişilebilir mi?
  try {
    const meta = await data.properties.getMetadata({ name: `${GA4_PROPERTY}/metadata` });
    console.log("✅ GA4 property erişilebilir");
    console.log("   Dimensions:", meta.data.dimensions?.length ?? 0);
    console.log("   Metrics:", meta.data.metrics?.length ?? 0);
  } catch (err: any) {
    console.log("❌ Property metadata hatası:", err.message);
    return;
  }

  // 2) Son 30 gün toplam
  try {
    const report = await data.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "eventCount" },
        ],
      },
    });

    const rows = report.data.rows ?? [];
    if (rows.length === 0) {
      console.log("\n⚠️  Son 30 gün VERİ YOK (property doğru ama akış durmuş olabilir)");
    } else {
      const m = rows[0]?.metricValues ?? [];
      console.log("\n=== SON 30 GÜN ===");
      console.log(`Aktif Kullanıcı: ${m[0]?.value}`);
      console.log(`Oturum: ${m[1]?.value}`);
      console.log(`Sayfa Görüntüleme: ${m[2]?.value}`);
      console.log(`Event Sayısı: ${m[3]?.value}`);
    }
  } catch (err: any) {
    console.log("❌ 30 gün raporu hatası:", err.message);
  }

  // 3) Son 7 gün + trafik kaynağı
  try {
    const report = await data.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      },
    });

    const rows = report.data.rows ?? [];
    console.log("\n=== SON 7 GÜN — TRAFİK KAYNAKLARI ===");
    if (rows.length === 0) {
      console.log("(veri yok)");
    } else {
      for (const r of rows) {
        console.log(`  ${r.dimensionValues?.[0]?.value}: ${r.metricValues?.[0]?.value} oturum, ${r.metricValues?.[1]?.value} kullanıcı`);
      }
    }
  } catch (err: any) {
    console.log("❌ 7 gün kaynak hatası:", err.message);
  }

  // 4) Realtime — son 30 dk aktif kullanıcı
  try {
    const realtime = await data.properties.runRealtimeReport({
      property: GA4_PROPERTY,
      requestBody: {
        metrics: [{ name: "activeUsers" }],
      },
    });

    const users = realtime.data.rows?.[0]?.metricValues?.[0]?.value ?? "0";
    console.log(`\n=== REALTIME (son 30 dk) ===`);
    console.log(`Aktif kullanıcı: ${users}`);
  } catch (err: any) {
    console.log("❌ Realtime hatası:", err.message);
  }
}

main().catch((e) => console.error("FATAL:", e.message));
