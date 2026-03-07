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

  const { subject, htmlContent, mode, testEmail, excludeInactive } = await req.json();

  if (!subject || !htmlContent) {
    return NextResponse.json(
      { error: "Konu ve içerik gerekli." },
      { status: 400 }
    );
  }

  const emailHtml = await render(
    KlemensNewsletter({ subject, htmlContent })
  );

  const admin = createAdminClient();

  // ── Test mode ──
  if (mode === "test") {
    if (!testEmail) {
      return NextResponse.json(
        { error: "Test e-posta adresi gerekli." },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
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

    // Log test email
    await admin.from("email_logs").insert({
      resend_email_id: data?.id || null,
      subscriber_email: testEmail,
      subject,
    });

    return NextResponse.json({
      message: `Test e-postası ${testEmail} adresine gönderildi.`,
      sent: 1,
    });
  }

  // ── All mode ──
  if (mode === "all") {
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

    // Filter out subscribers who haven't opened in 60 days
    let filteredSubs = subs;
    if (excludeInactive) {
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentLogs } = await admin
        .from("email_logs")
        .select("subscriber_email")
        .gte("sent_at", sixtyDaysAgo)
        .not("opened_at", "is", null);

      const recentOpeners = new Set((recentLogs ?? []).map((l) => l.subscriber_email));

      // Also include subscribers who have never received an email (new subscribers)
      const { data: allLogs } = await admin
        .from("email_logs")
        .select("subscriber_email");
      const everReceived = new Set((allLogs ?? []).map((l) => l.subscriber_email));

      filteredSubs = subs.filter((s) =>
        recentOpeners.has(s.email) || !everReceived.has(s.email)
      );

      if (filteredSubs.length === 0) {
        return NextResponse.json(
          { error: "Filtreye uyan aktif abone bulunamadı." },
          { status: 400 }
        );
      }
    }

    const emails = filteredSubs.map((s) => ({
      from: FROM,
      to: s.email,
      subject,
      html: emailHtml,
    }));

    let totalSent = 0;
    const batchSize = 100;
    const errors: string[] = [];
    const logRows: { resend_email_id: string | null; subscriber_email: string; subject: string }[] = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const { data, error } = await resend.batch.send(batch);
      if (error) {
        errors.push(error.message);
      } else {
        totalSent += batch.length;
        // Resend batch returns array of { id } for each email
        const ids = data?.data ?? [];
        batch.forEach((email, j) => {
          logRows.push({
            resend_email_id: ids[j]?.id || null,
            subscriber_email: email.to as string,
            subject,
          });
        });
      }
    }

    // Bulk insert email logs
    if (logRows.length > 0) {
      await admin.from("email_logs").insert(logRows);
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
