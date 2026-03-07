import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { Resend } from "resend";
import { render } from "@react-email/render";
import KlemensNewsletter from "@/emails/KlemensNewsletter";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Klemens Art <info@klemensart.com>";

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, htmlContent, mode, testEmail } = await req.json();

  if (!subject || !htmlContent) {
    return NextResponse.json(
      { error: "Konu ve içerik gerekli." },
      { status: 400 }
    );
  }

  // Render the React email template to HTML string
  const emailHtml = await render(
    KlemensNewsletter({ subject, htmlContent })
  );

  // ── Test mode: send to single address ──
  if (mode === "test") {
    if (!testEmail) {
      return NextResponse.json(
        { error: "Test e-posta adresi gerekli." },
        { status: 400 }
      );
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: testEmail,
      subject,
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json(
        { error: `Gönderim hatası: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Test e-postası ${testEmail} adresine gönderildi.`,
      sent: 1,
    });
  }

  // ── All mode: send to all active subscribers ──
  if (mode === "all") {
    const admin = createAdminClient();
    const { data: subs, error: dbError } = await admin
      .from("subscribers")
      .select("email")
      .eq("is_active", true);

    if (dbError) {
      return NextResponse.json(
        { error: `Veritabanı hatası: ${dbError.message}` },
        { status: 500 }
      );
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json(
        { error: "Aktif abone bulunamadı." },
        { status: 400 }
      );
    }

    // Use Resend Batch API — each subscriber gets their own email
    const emails = subs.map((s) => ({
      from: FROM,
      to: s.email,
      subject,
      html: emailHtml,
    }));

    // Resend batch supports up to 100 emails per call
    let totalSent = 0;
    const batchSize = 100;
    const errors: string[] = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const { error } = await resend.batch.send(batch);
      if (error) {
        errors.push(error.message);
      } else {
        totalSent += batch.length;
      }
    }

    if (errors.length > 0 && totalSent === 0) {
      return NextResponse.json(
        { error: `Gönderim hatası: ${errors[0]}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${totalSent} aboneye e-bülten gönderildi.`,
      sent: totalSent,
      total: subs.length,
    });
  }

  return NextResponse.json(
    { error: "Geçersiz mod. 'test' veya 'all' kullanın." },
    { status: 400 }
  );
}
