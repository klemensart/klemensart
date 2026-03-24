/**
 * Modern Sanat Tarihi Atölyesi — Erteleme Bilgilendirme Maili
 * Satın alan tüm katılımcılara gönderir.
 *
 * Kullanım:
 *   npx tsx scripts/send-erteleme-bulk.ts          # Gerçek gönderim
 *   npx tsx scripts/send-erteleme-bulk.ts --dry-run # Sadece listeyi göster
 */
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { render } from "@react-email/render";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const WORKSHOP_ID = "c3d4e5f6-a7b8-9012-cdef-123456789012";
const SUBJECT = "Modern Sanat Tarihi Atölyesi — Tarih Değişikliği";
const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(supabaseUrl, serviceKey);
  const resend = new Resend(process.env.RESEND_API_KEY);

  // 1. Satın alan kullanıcıları bul
  const { data: purchases, error: purchaseError } = await admin
    .from("purchases")
    .select("user_id")
    .eq("workshop_id", WORKSHOP_ID);

  if (purchaseError) {
    console.error("Purchases sorgu hatası:", purchaseError.message);
    return;
  }

  if (!purchases || purchases.length === 0) {
    console.log("Bu atölyeyi satın almış kimse bulunamadı.");
    return;
  }

  const userIds = [...new Set(purchases.map((p) => p.user_id))];
  console.log(`${userIds.length} benzersiz satın alan bulundu.`);

  // 2. E-posta adreslerini çöz
  const {
    data: { users },
    error: usersError,
  } = await admin.auth.admin.listUsers({ perPage: 1000 });

  if (usersError) {
    console.error("Kullanıcı listesi hatası:", usersError.message);
    return;
  }

  const userIdSet = new Set(userIds);
  const recipients = users
    .filter((u) => userIdSet.has(u.id) && u.email)
    .map((u) => ({
      email: u.email!,
      name: u.user_metadata?.full_name || u.user_metadata?.name || "",
    }));

  console.log(`${recipients.length} e-posta adresi çözüldü:\n`);
  recipients.forEach((r, i) =>
    console.log(`  ${i + 1}. ${r.email}${r.name ? ` (${r.name})` : ""}`)
  );

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Gönderim yapılmadı.");
    return;
  }

  // 3. E-posta template'ini render et
  const mod = await import("../src/emails/AtolyeErteleme");
  const AtolyeErteleme = mod.default;

  console.log("\nE-postalar gönderiliyor...\n");

  let sent = 0;
  const errors: string[] = [];

  // Her alıcıya kişiselleştirilmiş mail gönder
  for (const recipient of recipients) {
    const html = await render(
      AtolyeErteleme({
        name: recipient.name || undefined,
        workshopTitle: "Modern Sanat Tarihi Atölyesi",
        oldDate: "25 Mart 2026, Çarşamba",
        newDate: "8 Nisan 2026, Çarşamba",
      })
    );

    const { data, error } = await resend.emails.send({
      from: "Klemens Art <info@klemensart.com>",
      to: recipient.email,
      subject: SUBJECT,
      html,
    });

    if (error) {
      errors.push(`${recipient.email}: ${error.message}`);
      console.log(`  ✗ ${recipient.email} — ${error.message}`);
    } else {
      sent++;
      console.log(`  ✓ ${recipient.email} (${data?.id})`);

      // email_logs'a kaydet
      await admin.from("email_logs").insert({
        resend_email_id: data?.id || null,
        subscriber_email: recipient.email,
        subject: SUBJECT,
      });
    }
  }

  // 4. Kampanya kaydı
  if (sent > 0) {
    const summaryHtml = await render(
      AtolyeErteleme({
        workshopTitle: "Modern Sanat Tarihi Atölyesi",
        oldDate: "25 Mart 2026, Çarşamba",
        newDate: "8 Nisan 2026, Çarşamba",
      })
    );

    await admin.from("campaigns").insert({
      subject: SUBJECT,
      html_content: summaryHtml,
      template_name: "AtolyeErteleme",
      mode: "workshop",
      sent_count: sent,
    });
  }

  console.log(`\n════════════════════════════════`);
  console.log(`  Gönderilen: ${sent}/${recipients.length}`);
  if (errors.length > 0) {
    console.log(`  Hata: ${errors.length}`);
    errors.forEach((e) => console.log(`    - ${e}`));
  }
  console.log(`════════════════════════════════`);
}

main().catch(console.error);
