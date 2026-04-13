/**
 * Tuz Bülteni #2 — A/B Test Gönderim Scripti
 * Grup A: 14 Nisan 2026, 12:00 TR (09:00 UTC)
 * Grup B: 14 Nisan 2026, 15:00 TR (12:00 UTC)
 *
 * scheduledAt batch API'de desteklenmediği için emails.send() ile tek tek gönderim yapılır.
 *
 * Kullanım: npx tsx scripts/send-tuz-bulten-ab.ts
 * Sonuçlar: npx tsx scripts/check-ab-results.ts
 */
import { config } from "dotenv";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import KlemensNewsletter from "../src/emails/KlemensNewsletter";

config({ path: ".env.local" });

const SUBJECT = "Tuz Bülteni — Sayı 02";
const FROM = "Klemens Art <info@klemensart.com>";
const PREVIEW = "Tuz, Ateş ve Sanat — yeni sayı, yeni tasarım.";

// A/B test zamanları (UTC)
const GROUP_A_TIME = "2026-04-14T09:00:00Z"; // 12:00 TR
const GROUP_B_TIME = "2026-04-14T12:00:00Z"; // 15:00 TR

// Rate limiting: 100ms aralık ≈ 10 email/saniye (Resend güvenli limit)
const SEND_DELAY_MS = 100;

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // ── 1. Aktif aboneleri çek (sayfalama ile) ──
  const subscriberEmails: string[] = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from("subscribers")
      .select("email")
      .eq("is_active", true)
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) {
      console.error("Subscriber hatası:", error.message);
      break;
    }
    if (!data || data.length === 0) break;
    subscriberEmails.push(...data.map((s) => s.email));
    if (data.length < 1000) break;
    page++;
  }
  console.log(`Subscribers: ${subscriberEmails.length}`);

  // ── 2. Auth kullanıcılarını çek ──
  const authEmails: string[] = [];
  let authPage = 1;
  while (true) {
    const { data } = await supabase.auth.admin.listUsers({
      page: authPage,
      perPage: 1000,
    });
    if (!data?.users || data.users.length === 0) break;
    authEmails.push(
      ...data.users.filter((u) => u.email).map((u) => u.email!),
    );
    if (data.users.length < 1000) break;
    authPage++;
  }
  console.log(`Auth users: ${authEmails.length}`);

  // ── 3. Birleştir & tekilleştir ──
  const allEmails = [...new Set([...subscriberEmails, ...authEmails])];
  console.log(`Toplam benzersiz: ${allEmails.length}`);

  // ── 4. Karıştır & ikiye böl ──
  const shuffled = [...allEmails];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const mid = Math.ceil(shuffled.length / 2);
  const groupA = shuffled.slice(0, mid);
  const groupB = shuffled.slice(mid);

  console.log(`\nGrup A (12:00 TR): ${groupA.length} kişi`);
  console.log(`Grup B (15:00 TR): ${groupB.length} kişi`);

  // ── 5. Newsletter HTML oluştur ──
  const filePath = path.join(
    process.cwd(),
    "src/emails/bulten-tuz-content.html",
  );
  const htmlContent = await readFile(filePath, "utf-8");
  const html = await render(
    KlemensNewsletter({ subject: SUBJECT, htmlContent, previewText: PREVIEW }),
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  // ── 6. Grup A gönder ──
  console.log(`\n═══ GRUP A — scheduledAt: ${GROUP_A_TIME} ═══`);
  const resultA = await sendScheduled(
    resend, supabase, groupA, html, GROUP_A_TIME, "A",
  );

  // ── 7. Grup B gönder ──
  console.log(`\n═══ GRUP B — scheduledAt: ${GROUP_B_TIME} ═══`);
  const resultB = await sendScheduled(
    resend, supabase, groupB, html, GROUP_B_TIME, "B",
  );

  // ── 8. Campaign kaydı ──
  await supabase.from("campaigns").insert({
    subject: SUBJECT,
    html_content: html,
    template_name: "TuzBulteni",
    mode: "all",
    sent_count: resultA.sent + resultB.sent,
  });

  // ── 9. Grup haritasını kaydet (A/B sonuç analizi için) ──
  const abMap = {
    scheduledAt: new Date().toISOString(),
    subject: SUBJECT,
    groupA: {
      time: GROUP_A_TIME,
      timeLocal: "14 Nisan 2026, 12:00 TR",
      count: groupA.length,
      sent: resultA.sent,
      failed: resultA.failed,
      emails: groupA,
      resendIds: resultA.resendIds,
    },
    groupB: {
      time: GROUP_B_TIME,
      timeLocal: "14 Nisan 2026, 15:00 TR",
      count: groupB.length,
      sent: resultB.sent,
      failed: resultB.failed,
      emails: groupB,
      resendIds: resultB.resendIds,
    },
  };
  const mapPath = path.join(process.cwd(), "scripts/ab-test-map.json");
  await writeFile(mapPath, JSON.stringify(abMap, null, 2));
  console.log(`\nA/B grup haritası kaydedildi: ${mapPath}`);

  // ── Sonuç ──
  console.log(`\n═══════════════════════════`);
  console.log(`SONUÇ`);
  console.log(`═══════════════════════════`);
  console.log(`Grup A (12:00): ${resultA.sent} gönderildi, ${resultA.failed} hata`);
  console.log(`Grup B (15:00): ${resultB.sent} gönderildi, ${resultB.failed} hata`);
  console.log(`Toplam: ${resultA.sent + resultB.sent} / ${allEmails.length}`);
  console.log(`\nSonuçları kontrol etmek için:`);
  console.log(`  npx tsx scripts/check-ab-results.ts`);
}

// ── Tek tek zamanlanmış gönderim (scheduledAt batch'te desteklenmiyor) ──
async function sendScheduled(
  resend: Resend,
  supabase: ReturnType<typeof createClient>,
  emails: string[],
  html: string,
  scheduledAt: string,
  group: string,
) {
  let sent = 0;
  let failed = 0;
  const resendIds: string[] = [];
  const logBuffer: { resend_email_id: string | null; subscriber_email: string; subject: string }[] = [];

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];

    try {
      const { data, error } = await resend.emails.send({
        from: FROM,
        to: email,
        subject: SUBJECT,
        html,
        scheduledAt,
      });

      if (error) {
        failed++;
        if (failed <= 5) console.error(`  HATA [${email}]: ${error.message}`);
      } else {
        sent++;
        const resendId = data?.id || null;
        if (resendId) resendIds.push(resendId);
        logBuffer.push({
          resend_email_id: resendId,
          subscriber_email: email,
          subject: SUBJECT,
        });
      }
    } catch (e: any) {
      failed++;
      if (failed <= 5) console.error(`  EXCEPTION [${email}]: ${e.message}`);
    }

    // İlerleme göstergesi (her 50 mailde bir)
    if ((i + 1) % 50 === 0 || i === emails.length - 1) {
      process.stdout.write(
        `\r  Grup ${group}: ${i + 1}/${emails.length} (${sent} OK, ${failed} hata)`,
      );
    }

    // Batch olarak email_logs'a yaz (her 50'de bir)
    if (logBuffer.length >= 50) {
      await supabase.from("email_logs").insert(logBuffer.splice(0));
    }

    // Rate limiting
    if (i < emails.length - 1) {
      await new Promise((r) => setTimeout(r, SEND_DELAY_MS));
    }
  }

  // Kalan logları yaz
  if (logBuffer.length > 0) {
    await supabase.from("email_logs").insert(logBuffer.splice(0));
  }

  console.log(""); // yeni satır

  return { sent, failed, resendIds };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
