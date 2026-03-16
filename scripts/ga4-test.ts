import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "/Volumes/PortableSSD/klemensart/gsc-key.json",
  scopes: [
    "https://www.googleapis.com/auth/analytics.readonly",
  ],
});

async function main() {
  // 1. List accessible GA4 accounts & properties
  const admin = google.analyticsadmin({ version: "v1beta", auth });

  console.log("=== GA4 HESAPLARI ===\n");
  const accounts = await admin.accounts.list();
  for (const acc of accounts.data.accounts ?? []) {
    console.log(`Hesap: ${acc.displayName} (${acc.name})`);

    const props = await admin.properties.list({
      filter: `parent:${acc.name}`,
    });
    for (const prop of props.data.properties ?? []) {
      console.log(`  Mülk: ${prop.displayName} (${prop.name}) — ${prop.propertyType}`);
      console.log(`    Oluşturma: ${prop.createTime}`);
      console.log(`    Sektör: ${prop.industryCategory}`);

      // 2. Try pulling data from this property
      const propertyId = prop.name?.replace("properties/", "");
      if (propertyId) {
        try {
          const data = google.analyticsdata({ version: "v1beta", auth });
          const report = await data.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
              dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
              metrics: [
                { name: "activeUsers" },
                { name: "sessions" },
                { name: "screenPageViews" },
              ],
            },
          });

          const row = report.data.rows?.[0];
          if (row) {
            console.log(`    Son 7 gün: ${row.metricValues?.[0]?.value} kullanıcı, ${row.metricValues?.[1]?.value} oturum, ${row.metricValues?.[2]?.value} sayfa görüntüleme`);
          } else {
            console.log("    Son 7 gün: Henüz veri yok (yeni kurulum, 48 saat bekleyin)");
          }
        } catch (err: any) {
          console.log(`    Veri çekme hatası: ${err.message?.slice(0, 120)}`);
        }
      }
    }
  }
}

main().catch(console.error);
