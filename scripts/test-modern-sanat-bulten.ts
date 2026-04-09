import { render } from "@react-email/render";
import { Resend } from "resend";
import DuyuruBulteni from "../src/emails/DuyuruBulteni";

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
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

  const { data, error } = await resend.emails.send({
    from: "Klemens Art <info@klemensart.com>",
    to: "hunkerem@gmail.com",
    subject: "Yarın Başlıyoruz: Modern Sanatı Okumak",
    html,
  });

  if (error) {
    console.error("HATA:", error);
    process.exit(1);
  }

  console.log("Test maili gönderildi!", data);
}

main();
