/**
 * Tuz Bülteni #2 — A/B Test Sonuç Analizi
 *
 * ab-test-map.json dosyasındaki grup haritasını kullanarak
 * email_logs tablosundan açılma/tıklanma oranlarını karşılaştırır.
 *
 * Kullanım: npx tsx scripts/check-ab-results.ts
 */
import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

async function main() {
  const mapPath = path.join(process.cwd(), "scripts/ab-test-map.json");
  let abMap: any;
  try {
    abMap = JSON.parse(await readFile(mapPath, "utf-8"));
  } catch {
    console.error("ab-test-map.json bulunamadı. Önce send-tuz-bulten-ab.ts çalıştırın.");
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const groupAEmails: string[] = abMap.groupA.emails;
  const groupBEmails: string[] = abMap.groupB.emails;
  const subject = abMap.subject;

  console.log(`\n═══ A/B TEST SONUÇLARI ═══`);
  console.log(`Konu: ${subject}`);
  console.log(`Oluşturulma: ${abMap.scheduledAt}`);
  console.log(`Grup A (12:00): ${groupAEmails.length} kişi`);
  console.log(`Grup B (15:00): ${groupBEmails.length} kişi\n`);

  // Tüm logları çek (subject eşleşmesiyle)
  const allLogs: any[] = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from("email_logs")
      .select("subscriber_email, opened_at, clicked_at, bounced_at, status")
      .eq("subject", subject)
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) { console.error("Sorgu hatası:", error.message); break; }
    if (!data || data.length === 0) break;
    allLogs.push(...data);
    if (data.length < 1000) break;
    page++;
  }

  console.log(`Toplam log kaydı: ${allLogs.length}\n`);

  const groupASet = new Set(groupAEmails);
  const groupBSet = new Set(groupBEmails);

  const logsA = allLogs.filter((l) => groupASet.has(l.subscriber_email));
  const logsB = allLogs.filter((l) => groupBSet.has(l.subscriber_email));

  const statsA = computeStats(logsA, "A — 12:00 TR");
  const statsB = computeStats(logsB, "B — 15:00 TR");

  printStats(statsA);
  printStats(statsB);

  // Karşılaştırma
  console.log(`\n─── KARŞILAŞTIRMA ───`);
  const diffOpen = statsA.openRate - statsB.openRate;
  const winner = diffOpen > 0 ? "Grup A (12:00)" : diffOpen < 0 ? "Grup B (15:00)" : "Berabere";
  console.log(`Açılma oranı farkı: ${diffOpen > 0 ? "+" : ""}${diffOpen.toFixed(1)}%`);
  console.log(`Kazanan: ${winner}`);

  if (statsA.clickRate !== statsB.clickRate) {
    const diffClick = statsA.clickRate - statsB.clickRate;
    const clickWinner = diffClick > 0 ? "Grup A (12:00)" : "Grup B (15:00)";
    console.log(`Tıklama oranı farkı: ${diffClick > 0 ? "+" : ""}${diffClick.toFixed(1)}%`);
    console.log(`Tıklama kazananı: ${clickWinner}`);
  }
}

function computeStats(logs: any[], label: string) {
  const total = logs.length;
  const opened = logs.filter((l) => l.opened_at != null).length;
  const clicked = logs.filter((l) => l.clicked_at != null).length;
  const bounced = logs.filter((l) => l.bounced_at != null).length;
  const openRate = total > 0 ? (opened / total) * 100 : 0;
  const clickRate = total > 0 ? (clicked / total) * 100 : 0;
  const bounceRate = total > 0 ? (bounced / total) * 100 : 0;
  return { label, total, opened, clicked, bounced, openRate, clickRate, bounceRate };
}

function printStats(s: ReturnType<typeof computeStats>) {
  console.log(`─── GRUP ${s.label} ───`);
  console.log(`  Gönderilen:  ${s.total}`);
  console.log(`  Açılan:      ${s.opened} (${s.openRate.toFixed(1)}%)`);
  console.log(`  Tıklanan:    ${s.clicked} (${s.clickRate.toFixed(1)}%)`);
  console.log(`  Bounce:      ${s.bounced} (${s.bounceRate.toFixed(1)}%)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
