import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase-admin";

type EmailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

type BatchResult = {
  totalSent: number;
  totalFailed: number;
  errors: string[];
};

const BATCH_SIZE = 100;
const RETRY_DELAY_MS = 2000;

/**
 * Resend batch gönderimini retry + hata loglama ile yapar.
 * Başarısız batch'leri 1 kez tekrar dener, hâlâ başarısızsa loglar.
 */
export async function sendBatchWithRetry(
  resend: Resend,
  emails: EmailPayload[],
  emailSubject: string,
): Promise<BatchResult> {
  const admin = createAdminClient();
  let totalSent = 0;
  let totalFailed = 0;
  const errors: string[] = [];

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;

    // İlk deneme
    let result = await resend.batch.send(batch);

    // Hata varsa 2 saniye bekleyip tekrar dene
    if (result.error) {
      console.warn(
        `[Resend Batch] Batch ${batchIndex} başarısız, yeniden deneniyor...`,
        result.error.message,
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      result = await resend.batch.send(batch);
    }

    if (result.error) {
      // Retry sonrası da başarısız — logla
      totalFailed += batch.length;
      errors.push(`Batch ${batchIndex}: ${result.error.message}`);
      console.error(
        `[Resend Batch] Batch ${batchIndex} retry sonrası da başarısız (${batch.length} mail):`,
        result.error.message,
      );
    } else {
      totalSent += batch.length;
      const ids = result.data?.data ?? [];
      const batchLogs = batch.map((email, j) => ({
        resend_email_id: ids[j]?.id || null,
        subscriber_email: email.to,
        subject: emailSubject,
      }));
      await admin.from("email_logs").insert(batchLogs);
    }
  }

  return { totalSent, totalFailed, errors };
}
