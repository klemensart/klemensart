import type { Metadata } from "next";
import { getAllArticlesMetadata } from "@/lib/markdown";
import HakkimizdaClient from "@/components/HakkimizdaClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Klemens ekibini tanıyın. Sanat, kültür ve düşünce dünyasına birbirine bağlı zihinlerle yaklaşan bir kolektif.",
  keywords: [
    "Klemens ekibi",
    "kültür sanat kolektifi",
    "sanat platformu hakkında",
    "klemens art",
  ],
  alternates: { canonical: "/hakkimizda" },
  openGraph: {
    title: "Hakkımızda — Klemens",
    description:
      "Sanat, kültür ve düşünce dünyasına birbirine bağlı zihinlerle yaklaşan bir kolektif.",
    url: "https://klemensart.com/hakkimizda",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hakkımızda — Klemens",
    description:
      "Sanat, kültür ve düşünce dünyasına birbirine bağlı zihinlerle yaklaşan bir kolektif.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default async function HakkimizdaPage() {
  const articles = await getAllArticlesMetadata();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "Hakkımızda", item: "https://klemensart.com/hakkimizda" },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Klemens Art nedir?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Klemens Art, Ankara merkezli bağımsız bir kültür ve sanat platformudur. Sanat tarihi makaleleri, interaktif kültür haritası, atölye çalışmaları ve dijital sergiler aracılığıyla sanatı herkes için erişilebilir kılmayı amaçlıyoruz.",
        },
      },
      {
        "@type": "Question",
        name: "Klemens Art'ın içerikleri ücretsiz mi?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Evet. Tüm makaleler, interaktif kültür haritası, etkinlik takvimi ve dijital sergiler tamamen ücretsizdir. Atölye çalışmaları ücretli olabilir; detaylar atölye sayfalarında belirtilir.",
        },
      },
      {
        "@type": "Question",
        name: "Kültür haritası nasıl çalışır?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ankara'nın müze, galeri, tiyatro, konser mekanı ve tarihi alanlarını gösteren interaktif bir haritadır. Mekanları ziyaret ederek check-in yapabilir, yıldız toplayabilir, rozet kazanabilir ve kültürel rotaları takip edebilirsiniz.",
        },
      },
      {
        "@type": "Question",
        name: "Atölyelere nasıl kayıt olunur?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Atölyeler sayfasından ilgilendiğiniz atölyeyi seçip online ödeme yaparak kayıt olabilirsiniz. Kayıt sonrası detaylı bilgi ve hazırlık kiti e-posta ile gönderilir.",
        },
      },
      {
        "@type": "Question",
        name: "Loca Club nedir?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Loca Club, Klemens Art'ın üyelik programıdır. Üyeler atölyelere erken erişim, özel içerikler ve kültür haritasında gelişmiş gamification özellikleri gibi avantajlardan yararlanır.",
        },
      },
      {
        "@type": "Question",
        name: "Klemens Art'a nasıl katkıda bulunabilirim?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yazar, fotoğrafçı veya içerik üreticisi olarak ekibimize katılabilirsiniz. Hakkımızda sayfasından ekip üyelerimizi inceleyebilir, sosyal medya hesaplarımız üzerinden bizimle iletişime geçebilirsiniz.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HakkimizdaClient articles={articles} />
    </>
  );
}
