"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ── SSS Verileri ── */

type FaqCategory = {
  title: string;
  icon: string;
  items: { q: string; a: string }[];
};

const FAQ_DATA: FaqCategory[] = [
  {
    title: "Genel",
    icon: "?",
    items: [
      {
        q: "Klemens Art nedir?",
        a: "Klemens Art, Ankara merkezli bağımsız bir kültür ve sanat platformudur. Sanat tarihi makaleleri, interaktif kültür haritası, atölye çalışmaları, dijital sergiler ve etkinlik takvimi aracılığıyla sanatı herkes için erişilebilir kılmayı amaçlıyoruz.",
      },
      {
        q: "Klemens Art'ı kullanmak ücretsiz mi?",
        a: "Evet. Tüm makaleler, interaktif kültür haritası, etkinlik takvimi, dijital sergiler ve testler tamamen ücretsizdir. Yalnızca atölye çalışmaları ücretli olabilir; fiyat bilgisi ilgili atölye sayfasında belirtilir.",
      },
      {
        q: "Hesap oluşturmam gerekiyor mu?",
        a: "İçerikleri okumak, haritayı incelemek veya sergiyi gezmek için hesap gerekmez. Ancak kültür haritasında check-in yapmak, yıldız toplamak, rozet kazanmak ve atölyelere kayıt olmak için ücretsiz bir hesap oluşturmanız gerekir.",
      },
      {
        q: "Klemens Art'a nasıl katkıda bulunabilirim?",
        a: "Yazar, fotoğrafçı veya içerik üreticisi olarak ekibimize katılabilirsiniz. info@klemensart.com adresine portfolyonuzla birlikte başvurabilir veya sosyal medya hesaplarımız üzerinden bize ulaşabilirsiniz.",
      },
    ],
  },
  {
    title: "İçerikler & Makaleler",
    icon: "M",
    items: [
      {
        q: "Makaleler hangi konuları kapsıyor?",
        a: "Makalelerimiz dört ana kategoride yayımlanıyor: Odak (derinlemesine incelemeler), Kültür & Sanat (sergi eleştirileri, sanat tarihi), İlham Verenler (yaratıcı röportajlar) ve Kent & Yaşam (şehir kültürü, mekanlar).",
      },
      {
        q: "Ne sıklıkla yeni içerik yayımlanıyor?",
        a: "Haftada ortalama 2-3 yeni makale yayımlanıyor. Ayrıca güncel sanat haberlerini otomatik küratörlük sistemiyle takip edip Türkçeye uyarlıyoruz. Yeni içeriklerden haberdar olmak için e-bültenimize abone olabilirsiniz.",
      },
      {
        q: "Makalelere yorum yapabilir miyim?",
        a: "Şu an için makale altı yorum sistemi bulunmuyor. Ancak kültür haritasındaki mekanlar için değerlendirme yazabilirsiniz. Yorum sistemi ileride eklenebilir.",
      },
    ],
  },
  {
    title: "Kültür Haritası",
    icon: "H",
    items: [
      {
        q: "Kültür haritası nasıl çalışır?",
        a: "Ankara'nın müze, galeri, tiyatro, konser mekanı, tarihi alan ve edebiyat mekanlarını gösteren interaktif bir haritadır. Mekanları harita üzerinde keşfedebilir, detaylı bilgilere ulaşabilir ve kültürel rotaları takip edebilirsiniz.",
      },
      {
        q: "Check-in nasıl yapılır?",
        a: "Bir mekana fiziksel olarak 200 metre mesafe içinde olmanız gerekir. Telefonunuzda konum servisleri açıkken haritada mekanı seçip 'Check-in' butonuna tıklayın. Her check-in'de yıldız kazanırsınız.",
      },
      {
        q: "Yıldızlar ve rozetler ne işe yarar?",
        a: "Her check-in 1 yıldız kazandırır. Belirli rotalardaki tüm mekanları ziyaret etmek, kategori rozetleri toplamak ve milestone'lara ulaşmak ekstra yıldız verir. Yıldız sayınıza göre ünvanınız yükselir (Meraklı → Kaşif → Uzman gibi).",
      },
      {
        q: "Rotalar nedir?",
        a: "Rotalar, belirli bir tema etrafında gruplandırılmış mekan dizileridir. Örneğin 'Ankara'nın Roma Mirası' rotası tarihi Roma kalıntılarını, 'Müze Yolu' ise şehrin önemli müzelerini kapsar. Bir rotadaki tüm mekanları ziyaret ettiğinizde özel bir rozet kazanırsınız.",
      },
      {
        q: "Aynı mekana birden fazla check-in yapabilir miyim?",
        a: "Aynı mekana günde bir kez check-in yapabilirsiniz. Farklı günlerde tekrar ziyaret edebilirsiniz ancak yıldız yalnızca ilk ziyarette verilir.",
      },
    ],
  },
  {
    title: "Atölyeler",
    icon: "A",
    items: [
      {
        q: "Atölyelere nasıl kayıt olunur?",
        a: "Atölyeler sayfasından ilgilendiğiniz atölyeyi seçip detay sayfasındaki 'Kayıt Ol' butonuyla online ödeme yaparak kayıt olabilirsiniz. Kayıt sonrası detaylı bilgi ve hazırlık kiti e-posta ile gönderilir.",
      },
      {
        q: "Atölyeler online mı, yüz yüze mi?",
        a: "Atölyelerimiz şu an canlı Zoom üzerinden online olarak gerçekleştiriliyor. Her oturum interaktif — sorular sorabilir, tartışmalara katılabilirsiniz. Oturumların kayıtları da paylaşılmaktadır.",
      },
      {
        q: "İade ve iptal politikası nedir?",
        a: "Atölye başlangıcından 48 saat öncesine kadar tam iade yapılabilir. Detaylı bilgi için iade ve iptal sayfamızı inceleyebilirsiniz.",
      },
      {
        q: "Atölye ücretleri ne kadar?",
        a: "Fiyatlar atölyeye göre değişir ve her atölyenin detay sayfasında güncel fiyat belirtilir. Ödeme PayTR altyapısıyla güvenli şekilde alınır.",
      },
    ],
  },
  {
    title: "Dijital Sergi",
    icon: "S",
    items: [
      {
        q: "'En Sessiz Zaman' sergisi nedir?",
        a: "Klemens Art'ın ilk dijital sergisidir. Tarayıcınızda açılan 3D bir galeri koridorunda 21 fotoğraf eserini birinci şahıs perspektifinden gezebilirsiniz. Klavye (WASD) veya dokunmatik ekranla hareket edebilirsiniz.",
      },
      {
        q: "Sergiyi görmek için özel bir yazılım gerekli mi?",
        a: "Hayır. Sergi tarayıcınızda (Chrome, Safari, Firefox) doğrudan çalışır. Ek kurulum gerekmez. Masaüstü ve mobil cihazlarda çalışır.",
      },
    ],
  },
  {
    title: "Etkinlikler",
    icon: "E",
    items: [
      {
        q: "Etkinlik takvimi nasıl çalışır?",
        a: "Ankara'daki güncel kültür-sanat etkinliklerini (sergiler, konserler, tiyatrolar, atölyeler) toplayan bir takvimdir. Etkinlikleri tarihe, türe ve mekana göre filtreleyebilirsiniz.",
      },
      {
        q: "Kendi etkinliğimi ekleyebilir miyim?",
        a: "Şu an için etkinlikler editöryal ekibimiz tarafından ekleniyor. Etkinlik öneriniz varsa info@klemensart.com adresine bilgi gönderebilirsiniz.",
      },
    ],
  },
  {
    title: "E-bülten & İletişim",
    icon: "B",
    items: [
      {
        q: "E-bülteninize nasıl abone olabilirim?",
        a: "Ana sayfanın alt kısmındaki e-bülten formuna e-posta adresinizi girerek abone olabilirsiniz. İstediğiniz zaman abonelikten çıkabilirsiniz.",
      },
      {
        q: "Kişisel verilerim güvende mi?",
        a: "Evet. KVKK kapsamında kişisel verileriniz korunmaktadır. E-posta adresiniz yalnızca bülten gönderimi için kullanılır ve üçüncü taraflarla paylaşılmaz. Detaylar için KVKK sayfamızı inceleyebilirsiniz.",
      },
      {
        q: "Sizinle nasıl iletişime geçebilirim?",
        a: "info@klemensart.com adresine e-posta gönderebilir veya Instagram, X (Twitter), LinkedIn ve YouTube hesaplarımız üzerinden bize ulaşabilirsiniz.",
      },
    ],
  },
];

/* ── Accordion Bileşeni ── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[#2D2926] font-medium text-[15px] pr-6 group-hover:text-[#FF6D60] transition-colors">
          {q}
        </span>
        <span
          className={`text-[#8C857E] text-lg shrink-0 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200 group-hover:border-[#FF6D60] group-hover:text-[#FF6D60] ${
            open ? "bg-[#FF6D60] text-white border-[#FF6D60] rotate-45 group-hover:text-white" : ""
          }`}
        >
          +
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[#8C857E] text-sm leading-relaxed pr-12">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sayfa ── */

export default function SSSPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // FAQPage JSON-LD — tüm soruları düzleştir
  const allItems = FAQ_DATA.flatMap((c) => c.items);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "Sık Sorulan Sorular", item: "https://klemensart.com/sss" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="min-h-screen bg-[#FFFBF7]">
        {/* Hero */}
        <section className="pt-32 pb-16 px-6 text-center">
          <Link
            href="/"
            className="inline-block text-sm text-[#8C857E] hover:text-[#FF6D60] transition-colors mb-8"
          >
            &larr; Ana Sayfa
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2D2926] mb-4">
            Sık Sorulan Sorular
          </h1>
          <p className="text-[#8C857E] text-lg max-w-lg mx-auto leading-relaxed">
            Klemens Art hakkında merak ettiğiniz her şey.
            Aradığınızı bulamadıysanız{" "}
            <a
              href="mailto:info@klemensart.com"
              className="text-[#FF6D60] underline underline-offset-2"
            >
              bize yazın
            </a>
            .
          </p>
        </section>

        {/* Kategori filtreleri */}
        <section className="px-6 pb-6">
          <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                activeCategory === null
                  ? "bg-[#2D2926] text-white border-[#2D2926]"
                  : "bg-white text-[#8C857E] border-gray-200 hover:border-[#2D2926]"
              }`}
            >
              Tümü ({allItems.length})
            </button>
            {FAQ_DATA.map((cat) => (
              <button
                key={cat.title}
                onClick={() =>
                  setActiveCategory(activeCategory === cat.title ? null : cat.title)
                }
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  activeCategory === cat.title
                    ? "bg-[#2D2926] text-white border-[#2D2926]"
                    : "bg-white text-[#8C857E] border-gray-200 hover:border-[#2D2926]"
                }`}
              >
                {cat.title} ({cat.items.length})
              </button>
            ))}
          </div>
        </section>

        {/* SSS Listesi */}
        <section className="px-6 pb-24">
          <div className="max-w-3xl mx-auto">
            {FAQ_DATA.filter(
              (cat) => !activeCategory || cat.title === activeCategory
            ).map((cat) => (
              <div key={cat.title} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-[#2D2926] text-white text-xs font-bold flex items-center justify-center">
                    {cat.icon}
                  </span>
                  <h2 className="text-lg font-semibold text-[#2D2926]">
                    {cat.title}
                  </h2>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-6">
                  {cat.items.map((item, i) => (
                    <FaqItem key={i} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-20">
          <div className="max-w-3xl mx-auto bg-[#2D2926] rounded-2xl p-10 text-center">
            <p className="text-white text-xl font-semibold mb-3">
              Sorunuz hala cevaplanmadı mı?
            </p>
            <p className="text-white/50 text-sm mb-6">
              Bize doğrudan yazın, en kısa sürede dönüş yapalım.
            </p>
            <a
              href="mailto:info@klemensart.com"
              className="inline-block px-8 py-3 bg-[#FF6D60] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              info@klemensart.com
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
