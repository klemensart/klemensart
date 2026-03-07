/**
 * Göç bildirimi — önceden atölye satın alan herkese gönderir.
 * 8 Mart 2026 saat 11:00 (Türkiye, UTC+3) zamanlanmış.
 *
 * Kullanım:
 *   npx tsx scripts/send-migration-scheduled.ts
 *
 * .env.local'dan otomatik okur.
 */

import { createClient } from "@supabase/supabase-js";
import { render } from "@react-email/render";
import { Resend } from "resend";
import * as dotenv from "dotenv";
import * as path from "path";
import KlemensNewsletter from "../src/emails/KlemensNewsletter";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Eksik env değişkenleri. .env.local dosyasını kontrol edin.");
  process.exit(1);
}

// 8 Mart 2026, 11:00 Türkiye (UTC+3) = 08:00 UTC
const SCHEDULED_AT = "2026-03-08T08:00:00Z";

const subject = "Yeni Platformumuz Hazır — Tüm Haklarınız Aktarıldı";

const htmlContent = `
<h2 style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #2D2926; text-align: center; margin: 0 0 28px 0; line-height: 1.4;">
  Yeni Platformumuz Hazır
</h2>

<p style="font-size: 16px; line-height: 1.8; color: #3d3833; margin: 0 0 18px 0;">
  Değerli Klemens Art üyesi,
</p>

<p style="font-size: 16px; line-height: 1.8; color: #3d3833; margin: 0 0 18px 0;">
  Sizlere daha iyi bir deneyim sunabilmek için platformumuzu yeniledik.
  Yeni sitemiz <strong style="color: #2D2926;">klemensart.com</strong> üzerinde
  artık tüm içeriklerinize tek bir yerden ulaşabilirsiniz.
</p>

<p style="font-size: 16px; line-height: 1.8; color: #3d3833; margin: 0 0 24px 0;">
  <strong style="color: #2D2926;">Önceden satın aldığınız tüm atölye hakları yeni sisteme eksiksiz olarak aktarıldı.</strong>
  Hiçbir kaydınız kaybolmadı — tüm kayıtlar, videolar ve materyaller panelinizdeki
  <em>Loca</em> sekmesinde sizin için hazır.
</p>

<div style="background: #FFFBF7; border-radius: 12px; padding: 28px 32px; margin: 0 0 28px 0; border-left: 3px solid #FF6D60;">
  <p style="font-size: 14px; font-weight: 700; letter-spacing: 2px; color: #FF6D60; text-transform: uppercase; margin: 0 0 16px 0;">
    Giriş Yapmanız Yeterli
  </p>

  <p style="font-size: 15px; line-height: 1.8; color: #3d3833; margin: 0 0 14px 0;">
    <strong style="color: #2D2926;">Google hesabıyla kayıt olduysanız:</strong><br/>
    &ldquo;Google ile Giriş Yap&rdquo; butonuna tıklamanız yeterli. Aynı Google hesabınızla otomatik olarak tanımlanacaksınız.
  </p>

  <p style="font-size: 15px; line-height: 1.8; color: #3d3833; margin: 0;">
    <strong style="color: #2D2926;">Farklı bir e-posta adresiyle katıldıysanız:</strong><br/>
    Giriş sayfasında e-posta adresinizi girin ve size gönderilecek <em>magic link</em> ile
    şifresiz, güvenli bir şekilde giriş yapın. Ek bir kayıt işlemi gerekmez.
  </p>
</div>

<p style="font-size: 16px; line-height: 1.8; color: #3d3833; margin: 0 0 18px 0;">
  Giriş yaptıktan sonra profil sayfanızdaki <strong style="color: #2D2926;">Loca</strong> sekmesinden
  satın aldığınız tüm atölyelere, kayıtlara ve materyallere doğrudan erişebilirsiniz.
</p>

<p style="font-size: 16px; line-height: 1.8; color: #3d3833; margin: 0 0 28px 0;">
  Herhangi bir sorunuz veya erişim probleminiz olursa
  <a href="mailto:info@klemensart.com" style="color: #FF6D60; text-decoration: none; font-weight: 600;">info@klemensart.com</a>
  adresinden bize ulaşabilirsiniz. Yardımcı olmaktan memnuniyet duyarız.
</p>

<div style="text-align: center; padding: 8px 0 24px 0;">
  <a href="https://klemensart.com/club/giris" style="display: inline-block; background-color: #2D2926; color: #ffffff; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; padding: 16px 40px; text-align: center;">
    Giriş Yapın
  </a>
</div>

<p style="font-size: 16px; line-height: 1.8; color: #3d3833; margin: 0 0 6px 0;">
  Kültürel yolculuğumuzda birlikte olmaya devam ettiğiniz için teşekkür ederiz.
</p>

<p style="font-size: 16px; line-height: 1.8; color: #3d3833; margin: 0 0 0 0;">
  Sevgiyle,<br/>
  <strong style="color: #2D2926;">Klemens Art Ekibi</strong>
</p>
`;

async function main() {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Purchases tablosundan benzersiz user_id'leri al
  const { data: purchases, error: dbErr } = await supabase
    .from("purchases")
    .select("user_id");

  if (dbErr) {
    console.error("Purchases sorgu hatası:", dbErr.message);
    process.exit(1);
  }

  const uniqueUserIds = [...new Set(purchases?.map((p) => p.user_id))];
  console.log(`${uniqueUserIds.length} benzersiz satın alan kullanıcı bulundu.`);

  if (uniqueUserIds.length === 0) {
    console.log("Gönderilecek kimse yok.");
    process.exit(0);
  }

  // 2. Her user_id için e-posta adresini al
  const emails: string[] = [];
  for (const uid of uniqueUserIds) {
    const { data, error } = await supabase.auth.admin.getUserById(uid);
    if (error) {
      console.warn(`  Kullanıcı ${uid} bulunamadı, atlanıyor.`);
      continue;
    }
    if (data.user?.email) {
      emails.push(data.user.email);
    }
  }

  console.log(`${emails.length} e-posta adresi bulundu:`);
  emails.forEach((e) => console.log(`  → ${e}`));

  // 3. E-postayı render et
  const emailHtml = await render(
    KlemensNewsletter({ subject, htmlContent })
  );

  // 4. Resend ile zamanlanmış gönderim
  const resend = new Resend(RESEND_API_KEY);

  console.log(`\nZamanlanmış gönderim: ${SCHEDULED_AT} (8 Mart 11:00 TR)`);

  let sent = 0;
  const errors: string[] = [];

  // Resend batch max 100 — tek tek gönderiyoruz (scheduledAt batch'te desteklenmez)
  for (const to of emails) {
    const { data, error } = await resend.emails.send({
      from: "Klemens Art <info@klemensart.com>",
      to,
      subject,
      html: emailHtml,
      scheduledAt: SCHEDULED_AT,
    });

    if (error) {
      console.error(`  ✗ ${to}: ${error.message}`);
      errors.push(`${to}: ${error.message}`);
    } else {
      console.log(`  ✓ ${to} (ID: ${data?.id})`);
      sent++;
    }
  }

  console.log(`\n═══ Sonuç ═══`);
  console.log(`Zamanlandı: ${sent}/${emails.length}`);
  if (errors.length > 0) {
    console.log(`Hatalar: ${errors.length}`);
    errors.forEach((e) => console.log(`  ${e}`));
  }
  console.log(`Gönderim zamanı: 8 Mart 2026, 11:00 (Türkiye)`);
}

main();
