import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { templateRegistry } from "@/lib/email-templates";

// ── Auth ─────────────────────────────────────────────────────────────────────
function isAuthorized(req: NextRequest) {
  if (req.headers.get("x-vercel-cron")) return true;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Klemens Art <info@klemensart.com>";

// ── Hafta etiketi hesapla (Pazartesi–Pazar) ──────────────────────────────────
function getWeekLabel(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Pazar
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const fmt = (d: Date) =>
    `${d.getDate()} ${d.toLocaleDateString("tr-TR", { month: "long" })}`;
  return `${fmt(weekStart)}–${fmt(weekEnd)} ${now.getFullYear()}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // 1. Kullanıcının "Yayınla" dediği ve henüz bültene dahil edilmemiş haberleri çek
  const { data: newsItems } = await admin
    .from("news_items")
    .select("id, title, summary, url, image_url, source_name")
    .eq("status", "published")
    .eq("sent_in_newsletter", false)
    .order("newsletter_order", { ascending: true });

  if (!newsItems || newsItems.length === 0) {
    return NextResponse.json({
      success: false,
      message: "Bültene dahil edilecek yeni haber yok, gönderilmedi.",
    });
  }

  // 3. Template'i render et
  const weekLabel = getWeekLabel();
  const entry = templateRegistry.HaberlerBulteni;

  const templateProps = {
    weekLabel,
    editorialIntro:
      "Bu hafta kültür-sanat dünyasından öne çıkan gelişmeleri sizin için derledik.",
    newsItems: newsItems.map((item) => ({
      title: item.title || "",
      summary: item.summary || "",
      url: item.url || "",
      image_url: item.image_url || "",
      source_name: item.source_name || "",
    })),
  };

  const emailHtml = await render(entry.component(templateProps));
  const emailSubject = `Haftalık Kültür Sanat Bülteni`;

  // 4. Tüm aktif abonelere gönder
  const { data: subs } = await admin
    .from("subscribers")
    .select("email")
    .eq("is_active", true);

  if (!subs || subs.length === 0) {
    return NextResponse.json({
      success: false,
      message: "Aktif abone bulunamadı.",
    });
  }

  const emails = subs.map((s) => ({
    from: FROM,
    to: s.email,
    subject: emailSubject,
    html: emailHtml,
  }));

  let totalSent = 0;
  const batchSize = 100;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const { data, error } = await resend.batch.send(batch);
    if (!error) {
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

  // 5. Kampanya kaydı (otomatik herkese açık)
  if (totalSent > 0) {
    await admin.from("campaigns").insert({
      subject: emailSubject,
      html_content: emailHtml,
      template_name: "HaberlerBulteni",
      mode: "all",
      sent_count: totalSent,
      is_public: true,
    });

    // 6. Bültene dahil edilen haberleri işaretle
    const sentIds = newsItems.map((n) => n.id);
    await admin
      .from("news_items")
      .update({ sent_in_newsletter: true, status: "archived" })
      .in("id", sentIds);
  }

  return NextResponse.json({
    success: true,
    message: `Haftalık bülten ${totalSent} aboneye gönderildi (${newsItems.length} haber).`,
    totalSent,
    newsCount: newsItems.length,
    weekLabel,
  });
}
