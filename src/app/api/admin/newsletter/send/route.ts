import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { Resend } from "resend";
import { render } from "@react-email/render";
import KlemensNewsletter from "@/emails/KlemensNewsletter";
import { templateRegistry, TemplateName } from "@/lib/email-templates";

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

  const { subject, htmlContent, mode, testEmail, excludeInactive, template, templateProps, workshopId, segmentId } = await req.json();

  // Determine email HTML and subject based on mode
  let emailHtml: string;
  let emailSubject: string;

  if (template && template in templateRegistry) {
    // Template mode
    const entry = templateRegistry[template as TemplateName];
    emailHtml = await render(entry.component(templateProps || {}));
    emailSubject = subject || entry.defaultSubject;
  } else if (htmlContent) {
    // Free-text mode (existing behavior)
    if (!subject) {
      return NextResponse.json(
        { error: "Konu ve içerik gerekli." },
        { status: 400 }
      );
    }
    emailHtml = await render(
      KlemensNewsletter({ subject, htmlContent })
    );
    emailSubject = subject;
  } else {
    return NextResponse.json(
      { error: "Konu ve içerik gerekli." },
      { status: 400 }
    );
  }

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
      subject: emailSubject,
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
      subject: emailSubject,
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

    // Skip subscribers who already received this exact subject
    const { data: alreadySentLogs } = await admin
      .from("email_logs")
      .select("subscriber_email")
      .eq("subject", emailSubject);
    const alreadySentSet = new Set((alreadySentLogs ?? []).map((l) => l.subscriber_email));

    const skippedCount = alreadySentSet.size;
    let filteredSubs = subs.filter((s) => !alreadySentSet.has(s.email));

    if (filteredSubs.length === 0) {
      return NextResponse.json(
        { error: `Bu konu ile tüm abonelere (${skippedCount} kişi) zaten gönderilmiş.` },
        { status: 400 }
      );
    }

    // Filter out subscribers who haven't opened in 60 days
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

      filteredSubs = filteredSubs.filter((s) =>
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
      subject: emailSubject,
      html: emailHtml,
    }));

    let totalSent = 0;
    const batchSize = 100;
    const errors: string[] = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const { data, error } = await resend.batch.send(batch);
      if (error) {
        errors.push(error.message);
      } else {
        totalSent += batch.length;
        const ids = data?.data ?? [];
        const batchLogs = batch.map((email, j) => ({
          resend_email_id: ids[j]?.id || null,
          subscriber_email: email.to as string,
          subject: emailSubject,
        }));
        await admin.from("email_logs").insert(batchLogs);
      }
    }

    if (errors.length > 0 && totalSent === 0) {
      return NextResponse.json(
        { error: `Gönderim hatası: ${errors[0]}` },
        { status: 500 }
      );
    }

    const skippedMsg = skippedCount > 0 ? ` (${skippedCount} kişi daha önce almıştı, atlandı)` : "";
    return NextResponse.json({
      message: `${totalSent} aboneye e-bülten gönderildi.${skippedMsg}`,
      sent: totalSent,
      total: subs.length,
    });
  }

  // ── Workshop mode ──
  if (mode === "workshop") {
    if (!workshopId) {
      return NextResponse.json(
        { error: "Atölye seçilmedi." },
        { status: 400 }
      );
    }

    // Get user_ids who purchased this workshop
    const { data: purchases, error: purchaseError } = await admin
      .from("purchases")
      .select("user_id")
      .eq("workshop_id", workshopId);

    if (purchaseError) {
      return NextResponse.json(
        { error: `Veritabanı hatası: ${purchaseError.message}` },
        { status: 500 }
      );
    }

    if (!purchases || purchases.length === 0) {
      return NextResponse.json(
        { error: "Bu atölyeyi satın almış kimse bulunamadı." },
        { status: 400 }
      );
    }

    // Get unique user_ids
    const userIds = [...new Set(purchases.map((p) => p.user_id))];

    // Resolve emails via Supabase Auth admin
    const { data: { users }, error: usersError } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (usersError) {
      return NextResponse.json(
        { error: `Kullanıcı listesi hatası: ${usersError.message}` },
        { status: 500 }
      );
    }

    const userIdSet = new Set(userIds);
    const participantEmails = users
      .filter((u) => userIdSet.has(u.id) && u.email)
      .map((u) => u.email!);

    if (participantEmails.length === 0) {
      return NextResponse.json(
        { error: "Katılımcıların e-posta adresi bulunamadı." },
        { status: 400 }
      );
    }

    const emails = participantEmails.map((email) => ({
      from: FROM,
      to: email,
      subject: emailSubject,
      html: emailHtml,
    }));

    let totalSent = 0;
    const batchSize = 100;
    const errors: string[] = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const { data, error } = await resend.batch.send(batch);
      if (error) {
        errors.push(error.message);
      } else {
        totalSent += batch.length;
        const ids = data?.data ?? [];
        const batchLogs = batch.map((email, j) => ({
          resend_email_id: ids[j]?.id || null,
          subscriber_email: email.to as string,
          subject: emailSubject,
        }));
        await admin.from("email_logs").insert(batchLogs);
      }
    }

    if (errors.length > 0 && totalSent === 0) {
      return NextResponse.json(
        { error: `Gönderim hatası: ${errors[0]}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${totalSent} atölye katılımcısına e-posta gönderildi.`,
      sent: totalSent,
      total: participantEmails.length,
    });
  }

  // ── Abandoned mode ──
  if (mode === "abandoned") {
    if (!workshopId) {
      return NextResponse.json(
        { error: "Atölye seçilmedi." },
        { status: 400 }
      );
    }

    // Get payment_intents for this workshop
    const { data: intents, error: intentError } = await admin
      .from("payment_intents")
      .select("user_id")
      .eq("workshop_id", workshopId);

    if (intentError) {
      return NextResponse.json(
        { error: `Veritabanı hatası: ${intentError.message}` },
        { status: 500 }
      );
    }

    if (!intents || intents.length === 0) {
      return NextResponse.json(
        { error: "Bu atölye için yarım kalan kayıt bulunamadı." },
        { status: 400 }
      );
    }

    // Exclude users who already completed purchase
    const { data: completedPurchases } = await admin
      .from("purchases")
      .select("user_id")
      .eq("workshop_id", workshopId);

    const completedSet = new Set((completedPurchases ?? []).map((p) => p.user_id));
    const abandonedUserIds = [
      ...new Set(
        intents
          .filter((i) => !completedSet.has(i.user_id))
          .map((i) => i.user_id)
      ),
    ];

    if (abandonedUserIds.length === 0) {
      return NextResponse.json(
        { error: "Yarım kalan kayıt bulunamadı (tümü satın almayı tamamlamış)." },
        { status: 400 }
      );
    }

    // Resolve emails
    const { data: { users }, error: usersError } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (usersError) {
      return NextResponse.json(
        { error: `Kullanıcı listesi hatası: ${usersError.message}` },
        { status: 500 }
      );
    }

    const abandonedSet = new Set(abandonedUserIds);
    const abandonedEmails = users
      .filter((u) => abandonedSet.has(u.id) && u.email)
      .map((u) => u.email!);

    if (abandonedEmails.length === 0) {
      return NextResponse.json(
        { error: "Yarım kalan kayıtların e-posta adresi bulunamadı." },
        { status: 400 }
      );
    }

    const emails = abandonedEmails.map((email) => ({
      from: FROM,
      to: email,
      subject: emailSubject,
      html: emailHtml,
    }));

    let totalSent = 0;
    const batchSize = 100;
    const errors: string[] = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const { data, error } = await resend.batch.send(batch);
      if (error) {
        errors.push(error.message);
      } else {
        totalSent += batch.length;
        const ids = data?.data ?? [];
        const batchLogs = batch.map((email, j) => ({
          resend_email_id: ids[j]?.id || null,
          subscriber_email: email.to as string,
          subject: emailSubject,
        }));
        await admin.from("email_logs").insert(batchLogs);
      }
    }

    if (errors.length > 0 && totalSent === 0) {
      return NextResponse.json(
        { error: `Gönderim hatası: ${errors[0]}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${totalSent} kişiye yarım kalan kayıt hatırlatması gönderildi.`,
      sent: totalSent,
      total: abandonedEmails.length,
    });
  }

  // ── Segment mode ──
  if (mode === "segment") {
    if (!segmentId) {
      return NextResponse.json(
        { error: "Hedef kitle seçilmedi." },
        { status: 400 }
      );
    }

    // Dynamically import segment resolver to avoid duplication
    const segRes = await fetch(
      new URL(`/api/admin/newsletter/segments?segmentId=${segmentId}`, req.url),
      { headers: req.headers }
    );
    const segData = await segRes.json();

    if (!segRes.ok || !segData.emails || segData.emails.length === 0) {
      return NextResponse.json(
        { error: segData.error || "Bu hedef kitlede kimse bulunamadı." },
        { status: 400 }
      );
    }

    const segmentEmails: string[] = segData.emails;

    const emails = segmentEmails.map((email: string) => ({
      from: FROM,
      to: email,
      subject: emailSubject,
      html: emailHtml,
    }));

    let totalSent = 0;
    const batchSize = 100;
    const errors: string[] = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const { data, error } = await resend.batch.send(batch);
      if (error) {
        errors.push(error.message);
      } else {
        totalSent += batch.length;
        const ids = data?.data ?? [];
        const batchLogs = batch.map((email, j) => ({
          resend_email_id: ids[j]?.id || null,
          subscriber_email: email.to as string,
          subject: emailSubject,
        }));
        await admin.from("email_logs").insert(batchLogs);
      }
    }

    if (errors.length > 0 && totalSent === 0) {
      return NextResponse.json(
        { error: `Gönderim hatası: ${errors[0]}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${totalSent} kişiye e-posta gönderildi.`,
      sent: totalSent,
      total: segmentEmails.length,
    });
  }

  return NextResponse.json(
    { error: "Geçersiz mod." },
    { status: 400 }
  );
}
