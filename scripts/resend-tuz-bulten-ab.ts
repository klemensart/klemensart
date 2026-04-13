/**
 * Tuz Bülteni #2 — Planlanmış mailleri iptal edip yeni preview ile tekrar gönder
 * ab-test-map.json'daki grup atamaları korunur.
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
const NEW_PREVIEW = "İkinci sayımızda tuzun peşindeyiz: sanatta, tarihte, kültürde ve yaşamda.";

const GROUP_A_TIME = "2026-04-14T09:00:00Z";
const GROUP_B_TIME = "2026-04-14T12:00:00Z";
const SEND_DELAY_MS = 100;

async function main() {
  const mapPath = path.join(process.cwd(), "scripts/ab-test-map.json");
  const abMap = JSON.parse(await readFile(mapPath, "utf-8"));
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const allResendIds = [
    ...abMap.groupA.resendIds,
    ...abMap.groupB.resendIds,
  ];
  console.log(`Toplam iptal edilecek: ${allResendIds.length} mail`);

  // ── 1. Eski mailleri iptal et ──
  let cancelled = 0;
  let cancelFail = 0;
  for (let i = 0; i < allResendIds.length; i++) {
    try {
      await resend.emails.cancel(allResendIds[i]);
      cancelled++;
    } catch (e: any) {
      cancelFail++;
      if (cancelFail <= 3) console.error(`  İptal hatası [${allResendIds[i]}]: ${e.message}`);
    }
    if ((i + 1) % 100 === 0) {
      process.stdout.write(`\r  İptal: ${i + 1}/${allResendIds.length}`);
    }
    if (i < allResendIds.length - 1) await new Promise(r => setTimeout(r, 50));
  }
  console.log(`\nİptal tamamlandı: ${cancelled} OK, ${cancelFail} hata`);

  // ── 2. Eski email_logs kayıtlarını sil ──
  await supabase.from("email_logs").delete().eq("subject", SUBJECT);
  // Eski campaign kaydını da sil
  await supabase.from("campaigns").delete().eq("subject", SUBJECT);
  console.log("Eski log ve campaign kayıtları silindi.");

  // ── 3. Yeni HTML render ──
  const filePath = path.join(process.cwd(), "src/emails/bulten-tuz-content.html");
  const htmlContent = await readFile(filePath, "utf-8");
  const html = await render(
    KlemensNewsletter({ subject: SUBJECT, htmlContent, previewText: NEW_PREVIEW }),
  );
  console.log(`Yeni preview: "${NEW_PREVIEW}"`);

  // ── 4. Grup A tekrar gönder ──
  const groupA: string[] = abMap.groupA.emails;
  const groupB: string[] = abMap.groupB.emails;

  console.log(`\n═══ GRUP A — ${groupA.length} kişi — ${GROUP_A_TIME} ═══`);
  const resultA = await sendScheduled(resend, supabase, groupA, html, GROUP_A_TIME, "A");

  console.log(`\n═══ GRUP B — ${groupB.length} kişi — ${GROUP_B_TIME} ═══`);
  const resultB = await sendScheduled(resend, supabase, groupB, html, GROUP_B_TIME, "B");

  // ── 5. Campaign kaydı ──
  await supabase.from("campaigns").insert({
    subject: SUBJECT,
    html_content: html,
    template_name: "TuzBulteni",
    mode: "all",
    sent_count: resultA.sent + resultB.sent,
  });

  // ── 6. ab-test-map güncelle ──
  abMap.groupA.resendIds = resultA.resendIds;
  abMap.groupA.sent = resultA.sent;
  abMap.groupA.failed = resultA.failed;
  abMap.groupB.resendIds = resultB.resendIds;
  abMap.groupB.sent = resultB.sent;
  abMap.groupB.failed = resultB.failed;
  abMap.scheduledAt = new Date().toISOString();
  abMap.preview = NEW_PREVIEW;
  await writeFile(mapPath, JSON.stringify(abMap, null, 2));

  console.log(`\n═══════════════════════════`);
  console.log(`SONUÇ`);
  console.log(`═══════════════════════════`);
  console.log(`Grup A (12:00): ${resultA.sent} gönderildi, ${resultA.failed} hata`);
  console.log(`Grup B (15:00): ${resultB.sent} gönderildi, ${resultB.failed} hata`);
  console.log(`Toplam: ${resultA.sent + resultB.sent} / ${groupA.length + groupB.length}`);
}

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
        logBuffer.push({ resend_email_id: resendId, subscriber_email: email, subject: SUBJECT });
      }
    } catch (e: any) {
      failed++;
      if (failed <= 5) console.error(`  EXCEPTION [${email}]: ${e.message}`);
    }

    if ((i + 1) % 50 === 0 || i === emails.length - 1) {
      process.stdout.write(`\r  Grup ${group}: ${i + 1}/${emails.length} (${sent} OK, ${failed} hata)`);
    }
    if (logBuffer.length >= 50) {
      await supabase.from("email_logs").insert(logBuffer.splice(0));
    }
    if (i < emails.length - 1) await new Promise(r => setTimeout(r, SEND_DELAY_MS));
  }

  if (logBuffer.length > 0) {
    await supabase.from("email_logs").insert(logBuffer.splice(0));
  }
  console.log("");
  return { sent, failed, resendIds };
}

main().catch((e) => { console.error(e); process.exit(1); });
