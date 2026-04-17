import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { render } from "@react-email/render";
import BultenTesekkur from "@/emails/BultenTesekkur";
import Muzede1SaatTesekkur from "@/emails/Muzede1SaatTesekkur";
import BodrumMuzeTesekkur from "@/emails/BodrumMuzeTesekkur";
import { sendThankYouEmail } from "@/lib/send-thank-you";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PDF_URL =
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/rehberler/muzede-1-saat-istanbul-arkeoloji.pdf";

const BODRUM_PDF_URL =
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/email-assets/bulten-hediye/muzede-1-saat-bodrum-sualti-arkeoloji-muzesi.pdf";

const TUZ_BULTEN_CAMPAIGN_ID = "09a4a679-6086-46c2-871f-70350442b02d";

export async function POST(req: NextRequest) {
  const { email, name, source } = await req.json();

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi girin." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const trimmedEmail = email.trim().toLowerCase();
  const isMuzede1Saat = source === "muzede1saat";
  const isBodrumRehber = source === "bodrum-muze-rehberi";
  const isTuzBulten = source === "tuz-bulten";

  // Check if already subscribed
  const { data: existing } = await admin
    .from("subscribers")
    .select("id, is_active")
    .eq("email", trimmedEmail)
    .maybeSingle();

  if (existing) {
    if (!existing.is_active) {
      // Reactivate
      await admin
        .from("subscribers")
        .update({
          is_active: true,
          ...(isMuzede1Saat && { source: "muzede1saat" }),
          ...(isBodrumRehber && { source: "bodrum-muze-rehberi" }),
        })
        .eq("id", existing.id);
    }

    // Send appropriate email (even for existing subscribers when source is muzede1saat)
    if (isMuzede1Saat) {
      sendMuzede1SaatEmail(trimmedEmail, name?.trim());
      return NextResponse.json({
        message: existing.is_active
          ? "PDF rehberiniz e-postanıza gönderildi!"
          : "Tekrar hoş geldiniz! PDF rehberiniz e-postanıza gönderildi.",
        pdfUrl: PDF_URL,
      });
    }

    if (isBodrumRehber) {
      sendBodrumMuzeEmail(trimmedEmail, name?.trim());
      return NextResponse.json({
        message: existing.is_active
          ? "PDF rehberiniz e-postanıza gönderildi!"
          : "Tekrar hoş geldiniz! PDF rehberiniz e-postanıza gönderildi.",
        pdfUrl: BODRUM_PDF_URL,
      });
    }

    if (isTuzBulten) {
      sendTuzBultenEmail(admin, trimmedEmail);
      return NextResponse.json({
        message: existing.is_active
          ? "Tuz Bülteni e-postanıza gönderildi!"
          : "Tekrar hoş geldiniz! Tuz Bülteni e-postanıza gönderildi.",
      });
    }

    if (!existing.is_active) {
      sendBultenTesekkurEmail(trimmedEmail, name?.trim());
      return NextResponse.json({ message: "Tekrar hoş geldiniz! Aboneliğiniz yeniden aktif." });
    }

    return NextResponse.json({ message: "Zaten abonesiniz!" });
  }

  const { error } = await admin
    .from("subscribers")
    .insert({
      email: trimmedEmail,
      name: name?.trim() || null,
      ...(isMuzede1Saat && { source: "muzede1saat" }),
      ...(isBodrumRehber && { source: "bodrum-muze-rehberi" }),
    });

  if (error) {
    return NextResponse.json(
      { error: `Bir hata oluştu: ${error.message}` },
      { status: 500 }
    );
  }

  if (isMuzede1Saat) {
    sendMuzede1SaatEmail(trimmedEmail, name?.trim());
    return NextResponse.json({ message: "Abone oldunuz!", pdfUrl: PDF_URL });
  }

  if (isBodrumRehber) {
    sendBodrumMuzeEmail(trimmedEmail, name?.trim());
    return NextResponse.json({ message: "Abone oldunuz!", pdfUrl: BODRUM_PDF_URL });
  }

  if (isTuzBulten) {
    sendTuzBultenEmail(admin, trimmedEmail);
    return NextResponse.json({ message: "Abone oldunuz! Tuz Bülteni e-postanıza gönderildi." });
  }

  sendBultenTesekkurEmail(trimmedEmail, name?.trim());
  return NextResponse.json({ message: "Abone oldunuz!" });
}

function sendBultenTesekkurEmail(email: string, name?: string | null) {
  (async () => {
    try {
      const html = await render(BultenTesekkur({ name: name || undefined }));
      await sendThankYouEmail({
        to: email,
        subject: "E-Bültenimize Hoş Geldiniz — Klemens Art",
        html,
      });
    } catch (err) {
      console.error("[Subscribe] Tesekkur maili gonderilemedi:", err);
    }
  })();
}

function sendTuzBultenEmail(admin: ReturnType<typeof createAdminClient>, email: string) {
  (async () => {
    try {
      const { data } = await admin
        .from("campaigns")
        .select("html_content, subject")
        .eq("id", TUZ_BULTEN_CAMPAIGN_ID)
        .single();

      if (!data?.html_content) {
        console.error("[Subscribe] Tuz Bulteni kampanya HTML bulunamadi");
        return;
      }

      await sendThankYouEmail({
        to: email,
        subject: data.subject,
        html: data.html_content,
      });
    } catch (err) {
      console.error("[Subscribe] Tuz Bulteni gonderilemedi:", err);
    }
  })();
}

function sendMuzede1SaatEmail(email: string, name?: string | null) {
  (async () => {
    try {
      const html = await render(Muzede1SaatTesekkur({ name: name || undefined }));
      await sendThankYouEmail({
        to: email,
        subject: "Müzede 1 Saat Rehberiniz Hazır! — Klemens Art",
        html,
      });
    } catch (err) {
      console.error("[Subscribe] Muzede1Saat maili gonderilemedi:", err);
    }
  })();
}

function sendBodrumMuzeEmail(email: string, name?: string | null) {
  (async () => {
    try {
      const html = await render(BodrumMuzeTesekkur({ name: name || undefined }));
      await sendThankYouEmail({
        to: email,
        subject: "Bodrum Müze Rehberiniz Hazır! — Klemens Art",
        html,
      });
    } catch (err) {
      console.error("[Subscribe] Bodrum muze maili gonderilemedi:", err);
    }
  })();
}
