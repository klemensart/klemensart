export type Category = {
  slug: string;
  title: string;
  description: string;
};

export type Article = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  date: string;
  categorySlug: string;
  readTime: string;
};

export const categories: Category[] = [
  {
    slug: "odak",
    title: "Odak",
    description:
      "Bir eseri, bir dönemi ya da bir fikri derinlemesine inceliyoruz. Yavaş okuma için.",
  },
  {
    slug: "kultur-sanat",
    title: "Kültür & Sanat",
    description:
      "Sanat tarihi, eleştiri ve güncel sergi incelemeleri. Göz açan perspektifler.",
  },
  {
    slug: "ilham-verenler",
    title: "İlham Verenler",
    description:
      "Yaratıcı insanlarla kısa ama derin sohbetler. İçten, samimi röportajlar.",
  },
  {
    slug: "kent-yasam",
    title: "Kent & Yaşam",
    description:
      "Şehrin kültürel nabzını tutuyoruz. Mekânlar, ritimler ve toplumsal doku.",
  },
];

export const articles: Article[] = [
  {
    id: 1,
    slug: "tarkovsky-zaman-anlayisi",
    title: "Tarkovsky'nin Zaman Anlayışı: Mühürlenmiş Zamanın Şiiri",
    summary:
      "Andrei Tarkovsky, sinemayı 'mühürlenmiş zaman' olarak tanımlar. Bu tanım, onun tüm sinema anlayışının ve varoluşsal kaygılarının özüdür.",
    date: "28 Şub 2026",
    categorySlug: "odak",
    readTime: "8 dk",
  },
  {
    id: 2,
    slug: "soyut-ekspresyonizm-sonu",
    title: "Soyut Ekspresyonizmin Sonu mu Geldi?",
    summary:
      "1950'lerin New York sahnesini domine eden hareket bugün müzayede rekoru kırmaya devam ediyor. Bu bir canlanış mı, yoksa derin bir nostalji mi?",
    date: "21 Şub 2026",
    categorySlug: "kultur-sanat",
    readTime: "6 dk",
  },
  {
    id: 3,
    slug: "sanat-yonetmeniyle-roportaj",
    title: "'Her şey bir gözlem meselesi': Bir Sanat Yönetmeniyle",
    summary:
      "20 yıldır reklamcılık yapan ama her gün galerileri gezen Kerem Öztürk ile sanat ve görme üzerine konuştuk.",
    date: "14 Şub 2026",
    categorySlug: "ilham-verenler",
    readTime: "5 dk",
  },
  {
    id: 4,
    slug: "istanbul-kayip-sanat-mekanlari",
    title: "İstanbul'un Kayıp Sanat Mekânları",
    summary:
      "Beyoğlu'nun dar sokaklarından Boğaz kıyılarına: şehrin kültürel hafızasından silinip giden yerler üzerine nostaljik bir keşif.",
    date: "7 Şub 2026",
    categorySlug: "kent-yasam",
    readTime: "7 dk",
  },
  {
    id: 5,
    slug: "kafka-yabancilasma",
    title: "Kafka'yı Yeniden Okumak: Yabancılaşma ve Modern Birey",
    summary:
      "Gregor Samsa'nın dönüşümünden K.'nın labirenti: Kafka'nın metinleri yüz yıl sonra neden hâlâ bu kadar güncel?",
    date: "31 Oca 2026",
    categorySlug: "odak",
    readTime: "10 dk",
  },
  {
    id: 6,
    slug: "frida-kahlo-oz-portreler",
    title: "Frida Kahlo'nun Öz Portreleri: Bir Kimlik İnşası",
    summary:
      "55 öz portresiyle Frida, acıyı ve arzuyu, kimliği ve bedensel varoluşu tuval üzerine taşıdı. Bu tuvaller bugün ne anlama geliyor?",
    date: "24 Oca 2026",
    categorySlug: "kultur-sanat",
    readTime: "9 dk",
  },
  {
    id: 7,
    slug: "fotografci-elif-sahin",
    title: "Fotoğrafçı Elif Şahin: 'Anı durdurmak bir tür yas tutmak'",
    summary:
      "Çalışmaları 12 ülkede sergilenen Elif Şahin, fotoğrafı bir belgeleme aracı değil, bir duygu dili olarak görüyor.",
    date: "17 Oca 2026",
    categorySlug: "ilham-verenler",
    readTime: "6 dk",
  },
  {
    id: 8,
    slug: "galata-bogaz-kultur-rotasi",
    title: "Galata'dan Boğaz'a: Bir Kültür Rotası",
    summary:
      "Hafta sonunuzu dolduracak, İstanbul'un gizli kalmış kültür ve sanat mekânlarını keşfeden bir yürüyüş rotası.",
    date: "10 Oca 2026",
    categorySlug: "kent-yasam",
    readTime: "4 dk",
  },
  {
    id: 9,
    slug: "varoluşculuk-sanat",
    title: "Varoluşçuluk ve Sanat: Sartre, Camus ve Tuval Üzerine",
    summary:
      "Hiçlik ve özgürlük üzerine felsefi bir diyalog: varoluşçu düşüncenin modern sanata bıraktığı derin izler.",
    date: "3 Oca 2026",
    categorySlug: "odak",
    readTime: "11 dk",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getArticlesByCategory(slug: string): Article[] {
  return articles.filter((a) => a.categorySlug === slug);
}
