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
 * Başarısız batch'leri 1 kez tekrar dener, hâlâ başarısızsa
 * tek tek (individual) göndermeye düşer — hiçbir mail kaybolmaz.
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
      // Batch retry da başarısız — tek tek gönder (fallback)
      console.warn(
        `[Resend Batch] Batch ${batchIndex} retry da başarısız, tek tek gönderiliyor (${batch.length} mail)...`,
      );

      for (const email of batch) {
        try {
          await new Promise((r) => setTimeout(r, 200)); // rate limit koruması
          const single = await resend.emails.send(email);
          if (single.error) {
            totalFailed++;
            errors.push(`${email.to}: ${single.error.message}`);
          } else {
            totalSent++;
            await admin.from("email_logs").insert({
              resend_email_id: single.data?.id || null,
              subscriber_email: email.to,
              subject: emailSubject,
            });
          }
        } catch (err) {
          totalFailed++;
          errors.push(`${email.to}: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`);
        }
      }
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
