import { render } from "@react-email/render";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import DuyuruBulteni from "../src/emails/DuyuruBulteni";

const resend = new Resend(process.env.RESEND_API_KEY);
const sb = createClient(
  "https://sgabkrzzzszfqrtgkord.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // 1. Render email
  const html = await render(
    DuyuruBulteni({
      headline: "Yarın Başlıyoruz",
      imageUrl: "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/email-assets/modern-sanat-hero.png",
      body1: "\"Bunu ben de çizerdim!\" dediğimiz eserler aslında bize ne anlatıyor? 10 hafta boyunca modern sanatın en önemli akımlarını birlikte keşfedeceğiz.",
      body2: "Her Çarşamba 20:30 — Canlı ders, tartışma ve soru-cevap.",
      curriculum: [
        { week: 1, title: "Empresyonizm" },
        { week: 2, title: "Kübizm" },
        { week: 3, title: "Dadaizm" },
        { week: 4, title: "Sürrealizm" },
        { week: 5, title: "De Stijl & Bauhaus" },
        { week: 6, title: "Soyut Ekspresyonizm" },
        { week: 7, title: "Pop Art" },
        { week: 8, title: "Kavramsal Sanat" },
        { week: 9, title: "Performans Sanatı" },
        { week: 10, title: "Çağdaş Sanat" },
      ],
      features: [
        { icon: "🎥", label: "Canlı Ders\n+ Kayıt" },
        { icon: "📄", label: "PDF\nMateryal" },
      ],
      buttonText: "Detayları Gör",
      buttonUrl: "https://klemensart.com/atolyeler/modern-sanat-atolyesi",
    })
  );

  const subject = "Yarın Başlıyoruz: Modern Sanatı Okumak";

  // 2. Fetch all active subscribers (paginated)
  const subs: { email: string }[] = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data: batch } = await sb
      .from("subscribers")
      .select("email")
      .eq("is_active", true)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (!batch || batch.length === 0) break;
    subs.push(...batch);
    if (batch.length < pageSize) break;
    page++;
  }

  console.log(`${subs.length} aktif abone bulundu. Gönderim başlıyor...`);

  // 3. Send in batches of 100
  let totalSent = 0;
  let totalFailed = 0;
  const BATCH = 100;

  for (let i = 0; i < subs.length; i += BATCH) {
    const chunk = subs.slice(i, i + BATCH);
    const emails = chunk.map((s) => ({
      from: "Klemens Art <info@klemensart.com>",
      to: s.email,
      subject,
      html,
    }));

    try {
      const { data, error } = await resend.batch.send(emails);
      if (error) {
        console.error(`Batch ${i / BATCH + 1} hata:`, error.message);
        totalFailed += chunk.length;
      } else {
        totalSent += (data?.data?.length ?? chunk.length);
        console.log(`Batch ${i / BATCH + 1}: ${chunk.length} mail gönderildi (toplam: ${totalSent})`);
      }
    } catch (err: unknown) {
      console.error(`Batch ${i / BATCH + 1} exception:`, err instanceof Error ? err.message : err);
      totalFailed += chunk.length;
    }
  }

  // 4. Save campaign record
  await sb.from("campaigns").insert({
    subject,
    html_content: html,
    template_name: "DuyuruBulteni",
    mode: "all",
    sent_count: totalSent,
    is_public: true,
  });

  console.log(`\nTamamlandı! ${totalSent} gönderildi, ${totalFailed} başarısız.`);
}

main();
