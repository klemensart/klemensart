/**
 * Sinema Kulübü erteleme maili
 *
 * Test:    npx tsx scripts/send-sinema-erteleme.ts --test
 * Gerçek:  npx tsx scripts/send-sinema-erteleme.ts --send
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { templateRegistry } from "../src/lib/email-templates";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sgabkrzzzszfqrtgkord.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Klemens Art <info@klemensart.com>";

const SINEMA_KLUBU_IDS = [
  "a1e2f3d4-5b6c-4d7e-8f9a-0b1c2d3e4f5a", // tekli
  "b2f3a4e5-6c7d-4e8f-9a0b-1c2d3e4f5a6b", // tekli-ogrenci
  "c3a4b5f6-7d8e-4f9a-0b1c-2d3e4f5a6b7c", // yillik
  "d4b5c6a7-8e9f-4a0b-1c2d-3e4f5a6b7c8d", // yillik-ogrenci
];

const EMAIL_SUBJECT = "Tarih Değişikliği: Sinema Kulübü — 17 Mayıs Pazar'a Ertelendi";

const TEMPLATE_PROPS = {
  headline: "Tarih Değişikliği",
  body1:
    "Bu akşam gerçekleşmesi planlanan Sinema Kulübü buluşmamız (Pan's Labyrinth — Guillermo del Toro), takvim değişikliği nedeniyle 17 Mayıs 2026, Pazar gününe ertelenmiştir.",
  body2:
    "Yeni tarih: 17 Mayıs 2026, Pazar — 20:30 (TSI)\n\nBuluşmamızın içeriği ve detayları aynı kalacaktır. Anlayışınız için teşekkür eder, 17 Mayıs'ta görüşmeyi dört gözle bekleriz.",
  buttonText: "Sinema Kulübü Sayfası",
  buttonUrl: "https://klemensart.com/atolyeler/sinema-klubu",
};

async function renderEmail(): Promise<string> {
  const entry = templateRegistry.DuyuruBulteni;
  return render(entry.component(TEMPLATE_PROPS));
}

async function sendTest() {
  const testEmail = "hunkerem@gmail.com";
  const emailHtml = await renderEmail();

  console.log(`Test maili gönderiliyor: ${testEmail}`);
  console.log(`Konu: ${EMAIL_SUBJECT}\n`);

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: testEmail,
    subject: `[TEST] ${EMAIL_SUBJECT}`,
    html: emailHtml,
  });

  if (error) {
    console.error("Gönderim hatası:", error.message);
    process.exit(1);
  }

  console.log(`Gönderildi! Resend ID: ${data?.id}`);
}

async function sendToMembers() {
  // Aktif sinema kulübü üyelerini çek
  const { data: purchases, error: purchaseError } = await supabase
    .from("purchases")
    .select("user_id")
    .in("workshop_id", SINEMA_KLUBU_IDS)
    .gt("expires_at", new Date().toISOString());

  if (purchaseError) {
    console.error("Veritabanı hatası:", purchaseError.message);
    process.exit(1);
  }

  if (!purchases || purchases.length === 0) {
    console.log("Aktif sinema kulübü üyesi bulunamadı.");
    process.exit(0);
  }

  const userIds = [...new Set(purchases.map((p) => p.user_id))];
  console.log(`${userIds.length} benzersiz üye bulundu`);

  // Auth kullanıcılarından e-posta çek
  const all: any[] = [];
  let page = 1;
  while (true) {
    const { data } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (!data?.users || data.users.length === 0) break;
    all.push(...data.users);
    if (data.users.length < 1000) break;
    page++;
  }

  const userIdSet = new Set(userIds);
  const memberEmails = all
    .filter((u) => userIdSet.has(u.id) && u.email)
    .map((u) => u.email!);

  if (memberEmails.length === 0) {
    console.log("E-posta adresi bulunamadı.");
    process.exit(0);
  }

  console.log(`${memberEmails.length} üyeye mail gönderilecek:`);
  memberEmails.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  console.log("");

  const emailHtml = await renderEmail();

  // Tek tek gönder (az kişi olduğu için batch gerekmez)
  let sent = 0;
  let failed = 0;

  for (const email of memberEmails) {
    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: EMAIL_SUBJECT,
      html: emailHtml,
    });

    if (error) {
      console.error(`  HATA [${email}]: ${error.message}`);
      failed++;
    } else {
      console.log(`  Gönderildi: ${email}`);
      sent++;
    }
  }

  console.log(`\nSonuç: ${sent} başarılı, ${failed} başarısız`);

  // Campaign kaydı
  if (sent > 0) {
    await supabase.from("campaigns").insert({
      subject: EMAIL_SUBJECT,
      html_content: emailHtml,
      template_name: "DuyuruBulteni",
      mode: "cinema-club",
      sent_count: sent,
    });
    console.log("Campaign kaydı oluşturuldu.");
  }
}

async function main() {
  const flag = process.argv[2];

  if (flag === "--test") {
    await sendTest();
  } else if (flag === "--send") {
    await sendToMembers();
  } else {
    console.log("Kullanım:");
    console.log("  npx tsx scripts/send-sinema-erteleme.ts --test   (hunkerem@gmail.com'a test)");
    console.log("  npx tsx scripts/send-sinema-erteleme.ts --send   (tüm üyelere gönder)");
  }
}

main().catch(console.error);
