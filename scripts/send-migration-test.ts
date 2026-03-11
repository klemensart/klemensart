/**
 * Göç bildirimi test maili — hunkerem@gmail.com'a gönderir.
 *
 * Kullanım:
 *   RESEND_API_KEY=re_xxxxx npx tsx scripts/send-migration-test.ts
 */

import { render } from "@react-email/render";
import { Resend } from "resend";
import KlemensNewsletter from "../src/emails/KlemensNewsletter";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY gerekli. Örnek:");
  console.error("  RESEND_API_KEY=re_xxxxx npx tsx scripts/send-migration-test.ts");
  process.exit(1);
}

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
  const resend = new Resend(RESEND_API_KEY);

  const emailHtml = await render(
    KlemensNewsletter({ subject, htmlContent })
  );

  console.log("Gönderiliyor: hunkerem@gmail.com ...");

  const { data, error } = await resend.emails.send({
    from: "Klemens Art <info@klemensart.com>",
    to: "hunkerem@gmail.com",
    subject,
    html: emailHtml,
  });

  if (error) {
    console.error("Hata:", error);
    process.exit(1);
  }

  console.log("Başarıyla gönderildi! Resend ID:", data?.id);
}

main();
