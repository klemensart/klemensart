import type { WeekConfig, BlockQuizConfig } from "./types";

/* ── 10 Haftalık Müfredat ── */

export const WEEKS: WeekConfig[] = [
  {
    weekNumber: 1,
    title: "Empresyonizm",
    subtitle: "Işığın Peşinde",
    movement: "Empresyonizm",
    dateRange: "1860–1886",
    keyArtists: ["Claude Monet", "Pierre-Auguste Renoir", "Edgar Degas", "Berthe Morisot", "Camille Pissarro"],
    keyTerms: ["en plein air", "ışık-gölge", "anlık izlenim", "tuvalde fırça darbesi", "renk parçalanması"],
    description:
      "Akademik resmin katı kurallarına başkaldıran Empresyonistler, doğal ışığı ve anlık izlenimi tuvale taşıdı. Paris salonlarından reddedilen bu sanatçılar, kendi sergilerini açarak sanat tarihinin akışını değiştirdi.",
    discussionQuestions: [
      "Empresyonistler neden geleneksel atölye yerine açık havada çalışmayı tercih etti?",
      "Işığın anlık etkisini yakalamak için hangi teknikler geliştirildi?",
      "Empresyonizm, fotoğrafın icadından nasıl etkilendi?",
    ],
    nextWeekPreview: "Kübizm — Picasso ve Braque ile gerçekliği parçalıyoruz.",
  },
  {
    weekNumber: 2,
    title: "Kübizm",
    subtitle: "Gerçekliği Parçalamak",
    movement: "Kübizm",
    dateRange: "1907–1922",
    keyArtists: ["Pablo Picasso", "Georges Braque", "Juan Gris", "Fernand Léger", "Robert Delaunay"],
    keyTerms: ["analitik kübizm", "sentetik kübizm", "çoklu bakış açısı", "kolaj", "geometrik biçimler"],
    description:
      "Tek bir bakış açısını reddeden Kübizm, nesneleri aynı anda birden fazla açıdan gösterdi. Picasso ve Braque'ın öncülüğünde gelişen bu akım, modern sanatın temellerini attı.",
    discussionQuestions: [
      "Kübizm neden tek bakış açısını yetersiz buldu?",
      "Analitik ve sentetik kübizm arasındaki farklar nelerdir?",
      "Kübizm, mimari ve tasarımı nasıl etkiledi?",
    ],
    nextWeekPreview: "Dadaizm — Sanatın kendisini sorguluyoruz.",
  },
  {
    weekNumber: 3,
    title: "Dadaizm",
    subtitle: "Sanatın Sınırlarını Yıkmak",
    movement: "Dadaizm",
    dateRange: "1916–1924",
    keyArtists: ["Marcel Duchamp", "Hannah Höch", "Man Ray", "Tristan Tzara", "Kurt Schwitters"],
    keyTerms: ["hazır nesne (readymade)", "kolaj", "fotomontaj", "anti-sanat", "rastlantısallık"],
    description:
      "I. Dünya Savaşı'nın yıkımına karşı doğan Dadaizm, geleneksel sanat anlayışını ve toplumsal normları sorguladı. Duchamp'ın pisuarı sanat galerisine sokmasıyla 'sanat nedir?' sorusu sonsuza dek değişti.",
    discussionQuestions: [
      "Duchamp'ın Çeşme (Fountain) eseri neden sanat tarihinin en etkili eserlerinden biri sayılır?",
      "Dada, savaş karşıtlığını sanata nasıl yansıttı?",
      "Dadaizm'in günümüz sanatına (kavramsal sanat, performans) mirası nedir?",
    ],
    nextWeekPreview: "Sürrealizm — Bilinçaltının dünyasına dalıyoruz.",
  },
  {
    weekNumber: 4,
    title: "Sürrealizm",
    subtitle: "Rüyaların Dili",
    movement: "Sürrealizm",
    dateRange: "1924–1966",
    keyArtists: ["Salvador Dalí", "René Magritte", "Frida Kahlo", "Max Ernst", "Leonora Carrington"],
    keyTerms: ["otomatizm", "bilinçaltı", "rüya imgesi", "juxtaposition", "tuhaf gerçeklik"],
    description:
      "Freud'un bilinçaltı kuramından ilham alan Sürrealizm, rüyalar, arzular ve mantık dışı olanı sanata taşıdı. Dalí'nin eriyen saatleri ve Magritte'in paradoksları, izleyicinin algısını sorguladı.",
    discussionQuestions: [
      "Sürrealizm, Freud'un kuramlarını sanata nasıl uyarladı?",
      "Dalí ve Magritte'in yaklaşımları nasıl farklılaşır?",
      "Frida Kahlo'nun otoportreleri neden sürrealist sayılır?",
    ],
    nextWeekPreview: "De Stijl & Bauhaus — Sanat ve tasarımın birleştiği nokta.",
  },
  {
    weekNumber: 5,
    title: "De Stijl & Bauhaus",
    subtitle: "Form ve Fonksiyonun Birliği",
    movement: "De Stijl / Bauhaus",
    dateRange: "1917–1933",
    keyArtists: ["Piet Mondrian", "Theo van Doesburg", "Wassily Kandinsky", "Paul Klee", "László Moholy-Nagy"],
    keyTerms: ["neoplastisizm", "ana renkler", "geometrik soyutlama", "toplam sanat eseri", "endüstriyel tasarım"],
    description:
      "De Stijl'in saflaştırılmış geometrisi ve Bauhaus'un 'form işlevi izler' felsefesi, sanat ile günlük yaşamı birleştirdi. Mondrian'ın ızgara kompozisyonları bugün hâlâ modadan mimariye her yerde.",
    discussionQuestions: [
      "Mondrian neden sadece ana renkler ve dik açılar kullandı?",
      "Bauhaus okulunun kapatılması sanat dünyasını nasıl etkiledi?",
      "De Stijl ve Bauhaus'un günümüz grafik tasarımına etkisi nedir?",
    ],
    nextWeekPreview: "Soyut Ekspresyonizm — New York sahnesi ve jestüel resim.",
  },
  {
    weekNumber: 6,
    title: "Soyut Ekspresyonizm",
    subtitle: "Tuval Bir Arena",
    movement: "Soyut Ekspresyonizm",
    dateRange: "1943–1965",
    keyArtists: ["Jackson Pollock", "Mark Rothko", "Willem de Kooning", "Lee Krasner", "Franz Kline"],
    keyTerms: ["aksiyon resmi", "renk alanı", "drip tekniği", "jestüel ifade", "büyük format"],
    description:
      "II. Dünya Savaşı sonrası sanat merkezi Paris'ten New York'a kayarken, Soyut Ekspresyonistler devasa tuvallerde ham duyguyu ifade etti. Pollock yere serili tuvale boya dökerken, Rothko büyük renk bloklarıyla izleyiciyi hipnotize etti.",
    discussionQuestions: [
      "Pollock'un drip tekniği neden 'aksiyon resmi' olarak adlandırılır?",
      "Rothko'nun renk alanları izleyicide nasıl bir deneyim yaratır?",
      "Soyut Ekspresyonizm, Soğuk Savaş politikasıyla nasıl ilişkilendirildi?",
    ],
    nextWeekPreview: "Pop Art — Tüketim kültürü galeri duvarlarında.",
  },
  {
    weekNumber: 7,
    title: "Pop Art",
    subtitle: "Gündeliğin Yükselişi",
    movement: "Pop Art",
    dateRange: "1956–1970",
    keyArtists: ["Andy Warhol", "Roy Lichtenstein", "Claes Oldenburg", "Yayoi Kusama", "Richard Hamilton"],
    keyTerms: ["seri üretim estetiği", "popüler kültür", "ironi", "serigrafi", "tüketim eleştirisi"],
    description:
      "Campbell's çorba kutuları, Marilyn Monroe portreleri, çizgi roman kareleri — Pop Art, yüksek sanat ile popüler kültür arasındaki duvarı yıktı. Warhol'un 'fabrikası' sanatçı imajını sonsuza dek değiştirdi.",
    discussionQuestions: [
      "Warhol'un Campbell's çorba kutuları neden sanat sayılır?",
      "Pop Art, tüketim kültürünü eleştiriyor mu yoksa kutsallaştırıyor mu?",
      "Lichtenstein'ın çizgi roman tarzı, 'orijinallik' kavramını nasıl sorguluyor?",
    ],
    nextWeekPreview: "Kavramsal Sanat — Fikir, nesneden önemli.",
  },
  {
    weekNumber: 8,
    title: "Kavramsal Sanat",
    subtitle: "Fikir Her Şeydir",
    movement: "Kavramsal Sanat",
    dateRange: "1966–1980",
    keyArtists: ["Joseph Kosuth", "Sol LeWitt", "Yoko Ono", "Marina Abramović", "On Kawara"],
    keyTerms: ["dematerializasyon", "dil olarak sanat", "performans", "talimat temelli sanat", "belgeleme"],
    description:
      "Sanat eseri artık bir nesne değil, bir fikirdir. Kavramsal sanatçılar geleneksel malzemeleri bir kenara bırakıp dil, talimat ve kavramla çalıştı. LeWitt'in duvar çizimleri, Ono'nun talim parçaları bu düşüncenin simgesi.",
    discussionQuestions: [
      "Bir fikir, fiziksel bir nesne olmadan sanat eseri olabilir mi?",
      "Kavramsal sanatta 'zanaat' (craftsmanship) nereye gitti?",
      "Marina Abramović'in performansları neden sanat tarihi için önemli?",
    ],
    nextWeekPreview: "Performans & Arazi Sanatı — Beden ve doğa malzeme olarak.",
  },
  {
    weekNumber: 9,
    title: "Performans & Arazi Sanatı",
    subtitle: "Galeri Dışına Çıkmak",
    movement: "Performans / Land Art",
    dateRange: "1960–günümüz",
    keyArtists: ["Robert Smithson", "Christo & Jeanne-Claude", "Ana Mendieta", "Joseph Beuys", "James Turrell"],
    keyTerms: ["site-specific", "efemeral sanat", "beden sanatı", "çevresel sanat", "deneyim"],
    description:
      "Galeri duvarları yetmedi — sanatçılar çöllere, dağlara, kendi bedenlerine döndü. Smithson'ın Spiral Jetty'si bir gölün içinde, Christo tüm binaları sardı, Turrell ışıkla mekân yarattı.",
    discussionQuestions: [
      "Arazi sanatı eserleri kalıcı mı olmalı yoksa doğayla birlikte kaybolmalı mı?",
      "Performans sanatında izleyicinin rolü nedir?",
      "Bu akımlar, sanat piyasasına nasıl bir meydan okuma getirir?",
    ],
    nextWeekPreview: "Çağdaş Sanat — Tüm bu akımların bugünkü yansımaları.",
  },
  {
    weekNumber: 10,
    title: "Çağdaş Sanat Panoraması",
    subtitle: "Bugün ve Yarın",
    movement: "Çağdaş Sanat",
    dateRange: "1980–günümüz",
    keyArtists: ["Jean-Michel Basquiat", "Ai Weiwei", "Banksy", "Kara Walker", "Olafur Eliasson"],
    keyTerms: ["küreselleşme", "dijital sanat", "sokak sanatı", "politik sanat", "enstalasyon"],
    description:
      "Modernizmin tüm akımlarını sindiren çağdaş sanat, sınır tanımıyor. Basquiat sokaktan galeriye, Ai Weiwei siyasetten sanata, Banksy galeriden sokağa. Bu hafta 10 haftayı birleştirip bugüne bağlıyoruz.",
    discussionQuestions: [
      "Modern sanat akımlarından hangisi günümüz sanatını en çok etkiliyor?",
      "Dijital araçlar sanat üretimini nasıl dönüştürdü?",
      "Sanatın 'bir sonraki büyük akımı' ne olabilir?",
    ],
    nextWeekPreview: "",
  },
];

/* ── Blok Quiz Yapılandırması ── */

export const BLOCK_QUIZZES: BlockQuizConfig[] = [
  {
    slug: "modern-sanat-blok-1-quiz",
    title: "Blok 1: Empresyonizm, Kübizm, Dadaizm",
    description: "Hafta 1-3 konularını kapsayan pekiştirme testi",
    weeks: [1, 2, 3],
    questionCount: 12,
  },
  {
    slug: "modern-sanat-blok-2-quiz",
    title: "Blok 2: Sürrealizm, De Stijl & Bauhaus, Soyut Ekspresyonizm",
    description: "Hafta 4-6 konularını kapsayan pekiştirme testi",
    weeks: [4, 5, 6],
    questionCount: 12,
  },
  {
    slug: "modern-sanat-blok-3-quiz",
    title: "Blok 3: Pop Art, Kavramsal Sanat, Performans & Arazi Sanatı",
    description: "Hafta 7-9 konularını kapsayan pekiştirme testi",
    weeks: [7, 8, 9],
    questionCount: 12,
  },
  {
    slug: "modern-sanat-final-quiz",
    title: "Final: Genel Tekrar",
    description: "Tüm 10 haftayı kapsayan kapsamlı final testi",
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    questionCount: 15,
  },
];

export function getWeek(weekNumber: number): WeekConfig | undefined {
  return WEEKS.find((w) => w.weekNumber === weekNumber);
}

export function getBlockQuiz(slug: string): BlockQuizConfig | undefined {
  return BLOCK_QUIZZES.find((q) => q.slug === slug);
}
