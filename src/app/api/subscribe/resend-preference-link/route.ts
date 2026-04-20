import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendThankYouEmail } from "@/lib/send-thank-you";
import { buildPreferenceUrl } from "@/lib/newsletter-preferences";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory rate limit: 1 request per email per 10 minutes
const lastSent = new Map<string, number>();

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi girin." },
      { status: 400 },
    );
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Rate limit check
  const lastTime = lastSent.get(trimmedEmail);
  if (lastTime && Date.now() - lastTime < 10 * 60 * 1000) {
    return NextResponse.json(
      { error: "Az önce bir link gönderildi, e-postanı kontrol et." },
      { status: 429 },
    );
  }

  const admin = createAdminClient();
  const { data: subscriber } = await admin
    .from("subscribers")
    .select("id, is_active, preference_token")
    .eq("email", trimmedEmail)
    .maybeSingle();

  if (!subscriber || !subscriber.is_active) {
    return NextResponse.json(
      { error: "Bu e-posta kayıtlı değil. Abone olmak ister misin?" },
      { status: 404 },
    );
  }

  const preferenceLink = buildPreferenceUrl(subscriber.preference_token);

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e8e0d8;overflow:hidden;">
    <div style="padding:28px 32px 20px;border-bottom:1px solid #f0ebe6;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#FF6D60;font-weight:700;">Klemens Bülten</p>
      <h1 style="margin:0;font-size:20px;font-weight:800;color:#2D2926;">Tercihlerini Güncelle</h1>
    </div>
    <div style="padding:24px 32px;font-size:14px;line-height:1.8;color:#3d3833;">
      <p style="margin:0 0 16px;">Merhaba,</p>
      <p style="margin:0 0 16px;">Klemens bültenine abone olduğun için teşekkür ederiz. Haftalık ve tematik bülten tercihlerini yönetmek için aşağıdaki butona tıkla:</p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${preferenceLink}" style="display:inline-block;background:#C74B3A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">Tercihlerimi Yönet</a>
      </p>
      <p style="margin:0 0 16px;color:#8C857E;font-size:13px;">Bu link sadece senin için oluşturuldu ve kalıcıdır. Dilersen bu emaili saklayıp gerektiğinde tercih sayfasına ulaşabilirsin.</p>
      <p style="margin:0;color:#8C857E;font-size:13px;">Sorun olursa <a href="mailto:info@klemensart.com" style="color:#FF6D60;text-decoration:none;">info@klemensart.com</a> adresinden bize yaz.</p>
      <p style="margin:24px 0 0;color:#8C857E;">— Klemens</p>
    </div>
  </div>
</body>
</html>`.trim();

  try {
    await sendThankYouEmail({
      to: trimmedEmail,
      subject: "Bülten Tercihlerin — Klemens",
      html,
    });

    lastSent.set(trimmedEmail, Date.now());

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[resend-preference-link] Email gönderilemedi:", err);
    return NextResponse.json(
      { error: "Email gönderilemedi, tekrar deneyin." },
      { status: 500 },
    );
  }
}
