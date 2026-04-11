import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { Resend } from "resend";
import { render } from "@react-email/render";
import KlemensNewsletter from "@/emails/KlemensNewsletter";
import { templateRegistry, TemplateName } from "@/lib/email-templates";
import { sendBatchWithRetry } from "@/lib/resend-batch";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Klemens Art <info@klemensart.com>";

// Paginated auth users fetch (avoids Supabase 1000-row default limit)
async function fetchAllAuthUsers(admin: ReturnType<typeof createAdminClient>) {
  const all: any[] = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage });
    if (!data?.users || data.users.length === 0) break;
    all.push(...data.users);
    if (data.users.length < perPage) break;
    page++;
  }
  return all;
}

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, htmlContent, mode, testEmail, excludeInactive, skipAlreadySent, template, templateProps, workshopId, segmentId } = await req.json();

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
    // Supabase max_rows=1000 limiti — sayfalama ile tüm aboneleri çek
    const subs: { email: string }[] = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data: batch, error: dbError } = await admin
        .from("subscribers")
        .select("email")
        .eq("is_active", true)
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (dbError) {
        return NextResponse.json(
          { error: `Veritabanı hatası: ${dbError.message}` },
          { status: 500 }
        );
      }
      if (!batch || batch.length === 0) break;
      subs.push(...batch);
      if (batch.length < pageSize) break;
      page++;
    }

    if (subs.length === 0) {
      return NextResponse.json(
        { error: "Aktif abone bulunamadı." },
        { status: 400 }
      );
    }

    // Optionally skip subscribers who already received this exact subject
    let filteredSubs = subs;
    let skippedCount = 0;

    if (skipAlreadySent) {
      const { data: alreadySentLogs } = await admin
        .from("email_logs")
        .select("subscriber_email")
        .eq("subject", emailSubject);
      const alreadySentSet = new Set((alreadySentLogs ?? []).map((l) => l.subscriber_email));

      skippedCount = alreadySentSet.size;
      filteredSubs = subs.filter((s) => !alreadySentSet.has(s.email));

      if (filteredSubs.length === 0) {
        return NextResponse.json(
          { error: `Bu konu ile tüm abonelere (${skippedCount} kişi) zaten gönderilmiş.` },
          { status: 400 }
        );
      }
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

    const { totalSent, totalFailed, errors } = await sendBatchWithRetry(resend, emails, emailSubject);

    if (errors.length > 0 && totalSent === 0) {
      return NextResponse.json(
        { error: `Gönderim hatası: ${errors[0]}` },
        { status: 500 }
      );
    }

    // Save campaign record
    if (totalSent > 0) {
      await admin.from("campaigns").insert({
        subject: emailSubject,
        html_content: emailHtml,
        template_name: template && template in templateRegistry ? template : "SerbestMetin",
        mode: "all",
        sent_count: totalSent,
      });

      // HaberlerBulteni gönderildiğinde haberleri arşivle
      if (template === "HaberlerBulteni") {
        await admin
          .from("news_items")
          .update({ sent_in_newsletter: true, status: "archived" })
          .eq("status", "published")
          .eq("sent_in_newsletter", false);
      }
    }

    const skippedMsg = skippedCount > 0 ? ` (${skippedCount} kişi daha önce almıştı, atlandı)` : "";
    const failedMsg = totalFailed > 0 ? ` ${totalFailed} kişiye gönderilemedi.` : "";
    return NextResponse.json({
      message: `${totalSent} aboneye e-bülten gönderildi.${skippedMsg}${failedMsg}`,
      sent: totalSent,
      failed: totalFailed,
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

    // Resolve emails via Supabase Auth admin (paginated)
    const users = await fetchAllAuthUsers(admin);

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

    const { totalSent, totalFailed, errors } = await sendBatchWithRetry(resend, emails, emailSubject);

    if (errors.length > 0 && totalSent === 0) {
      return NextResponse.json(
        { error: `Gönderim hatası: ${errors[0]}` },
        { status: 500 }
      );
    }

    // Save campaign record
    if (totalSent > 0) {
      await admin.from("campaigns").insert({
        subject: emailSubject,
        html_content: emailHtml,
        template_name: template && template in templateRegistry ? template : "SerbestMetin",
        mode: "workshop",
        sent_count: totalSent,
      });
    }

    const failedMsg = totalFailed > 0 ? ` ${totalFailed} kişiye gönderilemedi.` : "";
    return NextResponse.json({
      message: `${totalSent} atölye katılımcısına e-posta gönderildi.${failedMsg}`,
      sent: totalSent,
      failed: totalFailed,
      total: participantEmails.length,
    });
  }

  // ── Cinema-club mode ──
  if (mode === "cinema-club") {
    const SINEMA_KLUBU_IDS = [
      "a1e2f3d4-5b6c-4d7e-8f9a-0b1c2d3e4f5a", // tekli
      "b2f3a4e5-6c7d-4e8f-9a0b-1c2d3e4f5a6b", // tekli-ogrenci
      "c3a4b5f6-7d8e-4f9a-0b1c-2d3e4f5a6b7c", // yillik
      "d4b5c6a7-8e9f-4a0b-1c2d-3e4f5a6b7c8d", // yillik-ogrenci
    ];

    // Get active purchases (not expired) for all cinema club workshops
    const { data: purchases, error: purchaseError } = await admin
      .from("purchases")
      .select("user_id")
      .in("workshop_id", SINEMA_KLUBU_IDS)
      .gt("expires_at", new Date().toISOString());

    if (purchaseError) {
      return NextResponse.json(
        { error: `Veritabanı hatası: ${purchaseError.message}` },
        { status: 500 }
      );
    }

    if (!purchases || purchases.length === 0) {
      return NextResponse.json(
        { error: "Aktif sinema kulübü üyesi bulunamadı." },
        { status: 400 }
      );
    }

    // Deduplicate by user_id
    const userIds = [...new Set(purchases.map((p) => p.user_id))];

    // Resolve emails via Supabase Auth admin (paginated)
    const users = await fetchAllAuthUsers(admin);

    const userIdSet = new Set(userIds);
    const memberEmails = users
      .filter((u) => userIdSet.has(u.id) && u.email)
      .map((u) => u.email!);

    if (memberEmails.length === 0) {
      return NextResponse.json(
        { error: "Üyelerin e-posta adresi bulunamadı." },
        { status: 400 }
      );
    }

    const emails = memberEmails.map((email) => ({
      from: FROM,
      to: email,
      subject: emailSubject,
      html: emailHtml,
    }));

    const { totalSent, totalFailed, errors } = await sendBatchWithRetry(resend, emails, emailSubject);

    if (errors.length > 0 && totalSent === 0) {
      return NextResponse.json(
        { error: `Gönderim hatası: ${errors[0]}` },
        { status: 500 }
      );
    }

    if (totalSent > 0) {
      await admin.from("campaigns").insert({
        subject: emailSubject,
        html_content: emailHtml,
        template_name: template && template in templateRegistry ? template : "SeminerHatirlatici",
        mode: "cinema-club",
        sent_count: totalSent,
      });
    }

    const failedMsg = totalFailed > 0 ? ` ${totalFailed} kişiye gönderilemedi.` : "";
    return NextResponse.json({
      message: `${totalSent} sinema kulübü üyesine e-posta gönderildi.${failedMsg}`,
      sent: totalSent,
      failed: totalFailed,
      total: memberEmails.length,
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

    // Resolve emails via Supabase Auth admin (paginated)
    const users = await fetchAllAuthUsers(admin);

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

    const { totalSent, totalFailed, errors } = await sendBatchWithRetry(resend, emails, emailSubject);

    if (errors.length > 0 && totalSent === 0) {
      return NextResponse.json(
        { error: `Gönderim hatası: ${errors[0]}` },
        { status: 500 }
      );
    }

    // Save campaign record
    if (totalSent > 0) {
      await admin.from("campaigns").insert({
        subject: emailSubject,
        html_content: emailHtml,
        template_name: template && template in templateRegistry ? template : "SerbestMetin",
        mode: "abandoned",
        sent_count: totalSent,
      });
    }

    const failedMsg = totalFailed > 0 ? ` ${totalFailed} kişiye gönderilemedi.` : "";
    return NextResponse.json({
      message: `${totalSent} kişiye yarım kalan kayıt hatırlatması gönderildi.${failedMsg}`,
      sent: totalSent,
      failed: totalFailed,
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

    const { totalSent, totalFailed, errors } = await sendBatchWithRetry(resend, emails, emailSubject);

    if (errors.length > 0 && totalSent === 0) {
      return NextResponse.json(
        { error: `Gönderim hatası: ${errors[0]}` },
        { status: 500 }
      );
    }

    // Save campaign record
    if (totalSent > 0) {
      await admin.from("campaigns").insert({
        subject: emailSubject,
        html_content: emailHtml,
        template_name: template && template in templateRegistry ? template : "SerbestMetin",
        mode: "segment",
        sent_count: totalSent,
      });
    }

    const failedMsg = totalFailed > 0 ? ` ${totalFailed} kişiye gönderilemedi.` : "";
    return NextResponse.json({
      message: `${totalSent} kişiye e-posta gönderildi.${failedMsg}`,
      sent: totalSent,
      failed: totalFailed,
      total: segmentEmails.length,
    });
  }

  return NextResponse.json(
    { error: "Geçersiz mod." },
    { status: 400 }
  );
}
