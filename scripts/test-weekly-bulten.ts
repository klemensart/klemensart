/**
 * Haftalık bülteni test olarak tek bir adrese gönder
 * Kullanım: npx tsx scripts/test-weekly-bulten.ts hunkerem@gmail.com
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { templateRegistry } from "../src/lib/email-templates";
import { campaignWeekSlug } from "../src/lib/bulten-helpers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sgabkrzzzszfqrtgkord.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

const resend = new Resend(process.env.RESEND_API_KEY);

function getWeekLabel(): string {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const fmt = (d: Date) =>
    `${d.getDate()} ${d.toLocaleDateString("tr-TR", { month: "long" })}`;
  return `${fmt(weekStart)}–${fmt(weekEnd)} ${now.getFullYear()}`;
}

async function main() {
  const testEmail = process.argv[2];
  if (!testEmail) {
    console.log("Kullanım: npx tsx scripts/test-weekly-bulten.ts <email>");
    process.exit(1);
  }

  // Haberleri çek
  const { data: newsItems } = await supabase
    .from("news_items")
    .select("id, title, summary, url, image_url, source_name")
    .eq("status", "published")
    .eq("sent_in_newsletter", false)
    .order("newsletter_order", { ascending: true });

  if (!newsItems || newsItems.length === 0) {
    console.log("Gönderilecek yeni haber yok. Son arşivlenen haberleri kullanalım...");

    // Son arşivlenen haberleri getir (demo amaçlı)
    const { data: archived } = await supabase
      .from("news_items")
      .select("id, title, summary, url, image_url, source_name")
      .eq("sent_in_newsletter", true)
      .order("created_at", { ascending: false })
      .limit(8);

    if (!archived || archived.length === 0) {
      console.log("Hiç haber bulunamadı.");
      process.exit(1);
    }

    console.log(`${archived.length} arşiv haber kullanılacak (test amaçlı)\n`);
    await sendNewsletter(testEmail, archived);
    return;
  }

  console.log(`${newsItems.length} yeni haber bulundu\n`);
  await sendNewsletter(testEmail, newsItems);
}

async function sendNewsletter(
  testEmail: string,
  newsItems: Array<{ title: string; summary: string; url: string; image_url: string; source_name: string }>,
) {
  const weekLabel = getWeekLabel();
  const weekSlug = campaignWeekSlug(new Date());
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
    weekSlug,
  };

  const emailHtml = await render(entry.component(templateProps));
  const emailSubject = `[TEST] Haftalık Kültür Sanat Bülteni — ${weekLabel}`;

  console.log(`Gönderiliyor: ${testEmail}`);
  console.log(`Konu: ${emailSubject}`);
  console.log(`Hafta slug: ${weekSlug}`);
  console.log(`Haber sayısı: ${newsItems.length}\n`);

  newsItems.forEach((n, i) => console.log(`  ${i + 1}. ${n.title}`));
  console.log("");

  const { data, error } = await resend.emails.send({
    from: "Klemens Art <info@klemensart.com>",
    to: testEmail,
    subject: emailSubject,
    html: emailHtml,
  });

  if (error) {
    console.error("Gönderim hatası:", error.message);
    process.exit(1);
  }

  console.log(`✓ Gönderildi! Resend ID: ${data?.id}`);
  console.log(`\nBülten sayfası: https://klemensart.com/bulten/${weekSlug}`);
}

main().catch(console.error);
