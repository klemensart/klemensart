import type { WeekConfig } from "./types";

/* ── Kapsamlı Sanat Tarihi — 10 Haftalık Müfredat ── */

export const KAPSAMLI_WEEKS: WeekConfig[] = [
  /* ─── BLOK 1: Antik Dünyadan Rönesans'a ─── */
  {
    weekNumber: 1,
    title: "Antik Yunan ve Roma Sanatı",
    subtitle: "Güzelliğin Kaynağı",
    movement: "Antik Sanat",
    dateRange: "MÖ 800 – MS 476",
    keyArtists: ["Fidias", "Praksiteles", "Polikletos", "Myron", "Lysippos"],
    keyTerms: ["ideal oran", "kontrapost", "mimari düzen", "fresk", "mozaik"],
    description:
      "Batı sanatının temelleri Antik Yunan'da atıldı. Tanrıları insan formunda idealize eden heykeller, matematiksel oranlarla yükselen tapınaklar ve Roma'nın mühendislik harikası yapıları — bu hafta sanatın 'gramerinin' ilk kurallarını keşfediyoruz.",
    discussionQuestions: [
      "Yunan heykellerindeki 'ideal güzellik' kavramı bugün hâlâ geçerli mi?",
      "Roma sanatı Yunan sanatının kopyası mı yoksa bağımsız bir gelenek mi?",
      "Antik dünyanın sanat anlayışı günümüz estetiğini nasıl şekillendiriyor?",
    ],
    nextWeekPreview: "Ortaçağ — Bizans ikonalarından Gotik katedrallere.",
  },
  {
    weekNumber: 2,
    title: "Ortaçağ: Bizans, Roman ve Gotik",
    subtitle: "Tanrı'nın Işığı",
    movement: "Ortaçağ Sanatı",
    dateRange: "476 – 1400",
    keyArtists: ["Giotto di Bondone", "Cimabue", "Duccio", "Nicola Pisano", "Simone Martini"],
    keyTerms: ["ikon", "mozaik", "vitray", "el yazması", "Gotik kemer"],
    description:
      "Bin yıl boyunca sanat, inancın hizmetinde oldu. Bizans'ın altın yaldızlı mozaikleri, Romanın ağır taş kiliseleri ve Gotik katedrallerin göğe uzanan sivri kemerleri — Ortaçağ, sanatı 'karanlık' bir dönem değil, ışığın peşinde koşulan bir çağdı.",
    discussionQuestions: [
      "Ortaçağ sanatı neden 'karanlık çağ' olarak yanlış anlaşılıyor?",
      "Gotik katedrallerin vitrayları hangi işlevi görüyordu?",
      "Giotto, Rönesans'ın habercisi olarak neden bu kadar önemli?",
    ],
    nextWeekPreview: "Rönesans — İnsanın yeniden merkeze alınışı.",
  },
  {
    weekNumber: 3,
    title: "Rönesans: Yeniden Doğuş",
    subtitle: "İnsanın Zamanı",
    movement: "Rönesans",
    dateRange: "1400 – 1600",
    keyArtists: ["Leonardo da Vinci", "Michelangelo", "Raphael", "Botticelli", "Titian"],
    keyTerms: ["perspektif", "sfumato", "hümanizm", "chiaroscuro", "fresk"],
    description:
      "İnsanı merkeze alan hümanist felsefe, Floransa'dan tüm Avrupa'ya yayıldı. Perspektifin keşfi, anatominin incelenmesi ve bireysel dehanın yükselişi — Rönesans, sanatın 'altın çağı' olarak tüm sonraki akımların referans noktası oldu.",
    discussionQuestions: [
      "Rönesans neden İtalya'da başladı?",
      "Leonardo, Michelangelo ve Raphael'in yaklaşımları nasıl farklılaşır?",
      "Perspektifin keşfi sanat tarihini nasıl değiştirdi?",
    ],
    nextWeekPreview: "Barok ve Rokoko — Drama, ışık ve aşırılık.",
  },

  /* ─── BLOK 2: Barok'tan Devrime ─── */
  {
    weekNumber: 4,
    title: "Barok ve Rokoko",
    subtitle: "Drama ve Zarafet",
    movement: "Barok / Rokoko",
    dateRange: "1600 – 1780",
    keyArtists: ["Caravaggio", "Rembrandt", "Vermeer", "Bernini", "Fragonard"],
    keyTerms: ["tenebrismo", "chiaroscuro", "dinamik kompozisyon", "pastel palet", "teatrallik"],
    description:
      "Karşı-Reform'un tutkulu draması Barok'u, aristokrasinin zarafet arayışı Rokoko'yu doğurdu. Caravaggio'nun karanlık sahneleri, Rembrandt'ın ışık oyunları ve Vermeer'in sessiz odaları — bu hafta sanatın en dramatik yüzyıllarını keşfediyoruz.",
    discussionQuestions: [
      "Caravaggio'nun tenebrismo tekniği izleyicide nasıl bir etki yaratır?",
      "Barok ile Rokoko arasındaki temel farklar nelerdir?",
      "Vermeer'in gündelik sahneleri neden başyapıt sayılır?",
    ],
    nextWeekPreview: "Neoklasizm ve Romantizm — Akıl ile duygunun çatışması.",
  },
  {
    weekNumber: 5,
    title: "Neoklasizm ve Romantizm",
    subtitle: "Akıl mı, Duygu mu?",
    movement: "Neoklasizm / Romantizm",
    dateRange: "1780 – 1850",
    keyArtists: ["Jacques-Louis David", "Eugène Delacroix", "Caspar David Friedrich", "J.M.W. Turner", "Francisco Goya"],
    keyTerms: ["yüce (sublime)", "tarihsel resim", "doğa tapınması", "devrim estetiği", "bireysel ifade"],
    description:
      "Aydınlanma'nın akılcılığı Neoklasik idealleri, Fransız Devrimi'nin tutkusu ise Romantizmi besledi. David'in kahramanlık sahneleri ile Friedrich'in sonsuz manzaraları, iki karşıt dünya görüşünün tuvaldeki savaşıdır.",
    discussionQuestions: [
      "Neoklasizm neden Antik Yunan ve Roma'ya geri döndü?",
      "Romantizm'de 'yüce' (sublime) kavramı ne anlama geliyor?",
      "Goya, her iki akımın da dışında mı kalıyor?",
    ],
    nextWeekPreview: "Realizm ve Empresyonizm — Sıradan hayatın tuvale girişi.",
  },
  {
    weekNumber: 6,
    title: "Realizm ve Empresyonizm",
    subtitle: "Işığın ve Gerçeğin Peşinde",
    movement: "Realizm / Empresyonizm",
    dateRange: "1848 – 1886",
    keyArtists: ["Gustave Courbet", "Claude Monet", "Edgar Degas", "Berthe Morisot", "Édouard Manet"],
    keyTerms: ["en plein air", "anlık izlenim", "sıradan konu", "ışık parçalanması", "fırça darbesi"],
    description:
      "Courbet 'Bana bir melek gösterin, onu da çizerim' diyerek sanatı idealizmin pençesinden kurtardı. Empresyonistler ise atölyeyi terk edip ışığın peşine düştü. Sanatın konusu artık kahramanlar değil, sıradan hayatın kendisiydi.",
    discussionQuestions: [
      "Realizm neden akademik sanat camiasında skandal yarattı?",
      "Empresyonistler ışığı yakalamak için hangi devrimci teknikleri geliştirdi?",
      "Manet, Realist mi yoksa Empresyonist mi?",
    ],
    nextWeekPreview: "Post-Empresyonizm ve Art Nouveau — Bireysel vizyonlar.",
  },

  /* ─── BLOK 3: Modern Çağ ─── */
  {
    weekNumber: 7,
    title: "Post-Empresyonizm ve Art Nouveau",
    subtitle: "Bireysel Vizyonlar",
    movement: "Post-Empresyonizm / Art Nouveau",
    dateRange: "1886 – 1910",
    keyArtists: ["Vincent van Gogh", "Paul Cézanne", "Paul Gauguin", "Gustav Klimt", "Henri de Toulouse-Lautrec"],
    keyTerms: ["ekspresif renk", "geometrik yapı", "dekoratif çizgi", "sembolizm", "organik form"],
    description:
      "Empresyonizm'in ışık obsesyonunu aşan sanatçılar, her biri kendi yolunu çizdi. Van Gogh'un çılgın fırça darbeleri, Cézanne'ın geometrik doğası ve Klimt'in altın yaldızlı dünyası — 20. yüzyıl devrimlerinin habercileri.",
    discussionQuestions: [
      "Cézanne neden 'modern sanatın babası' olarak anılır?",
      "Van Gogh'un eserleri hayattayken neden anlaşılmadı?",
      "Art Nouveau, güzel sanatlar mı yoksa uygulamalı sanat mı?",
    ],
    nextWeekPreview: "Avangard Patlamalar — Kübizm, Ekspresyonizm, Dadaizm.",
  },
  {
    weekNumber: 8,
    title: "Avangard Patlamalar: Kübizm, Ekspresyonizm, Dadaizm",
    subtitle: "Kuralları Yıkanlar",
    movement: "Kübizm / Ekspresyonizm / Dadaizm",
    dateRange: "1905 – 1925",
    keyArtists: ["Pablo Picasso", "Wassily Kandinsky", "Edvard Munch", "Marcel Duchamp", "Egon Schiele"],
    keyTerms: ["çoklu bakış açısı", "soyutlama", "anti-sanat", "hazır nesne", "iç dünya"],
    description:
      "20. yüzyılın başında sanat dünyası patladı. Picasso gerçekliği parçaladı, Kandinsky soyutun kapısını açtı, Duchamp pisuarı galeriye soktu. Savaşlar, devrimler ve endüstrileşme — sanatın tüm kuralları yeniden yazıldı.",
    discussionQuestions: [
      "Kübizm neden tek bakış açısını yeterli bulmadı?",
      "Duchamp'ın Çeşme'si (Fountain) sanat mıdır?",
      "Ekspresyonizm ile Empresyonizm arasındaki temel fark nedir?",
    ],
    nextWeekPreview: "Sürrealizm'den Soyut Ekspresyonizm'e — Bilinçaltı ve jest.",
  },
  {
    weekNumber: 9,
    title: "Sürrealizm'den Soyut Ekspresyonizm'e",
    subtitle: "Bilinçaltı ve Jestin Gücü",
    movement: "Sürrealizm / Soyut Ekspresyonizm",
    dateRange: "1924 – 1965",
    keyArtists: ["Salvador Dalí", "René Magritte", "Jackson Pollock", "Mark Rothko", "Frida Kahlo"],
    keyTerms: ["otomatizm", "rüya imgesi", "aksiyon resmi", "renk alanı", "bilinçaltı"],
    description:
      "Freud'un bilinçaltı kuramı Sürrealizm'i, II. Dünya Savaşı'nın travması ise Soyut Ekspresyonizm'i doğurdu. Dalí'nin eriyen saatleri, Pollock'un sıçrayan boyaları ve Rothko'nun hipnotize eden renk blokları — sanat artık anlatmak değil, hissettirmek istiyor.",
    discussionQuestions: [
      "Sürrealizm ile Soyut Ekspresyonizm'in ortak noktaları nelerdir?",
      "Pollock'un drip tekniği neden 'aksiyon resmi' olarak adlandırılır?",
      "Sanat merkezinin Paris'ten New York'a kayması neyi değiştirdi?",
    ],
    nextWeekPreview: "Çağdaş Sanat Panoraması — Tüm yolculuğu birleştiriyoruz.",
  },

  /* ─── BÜYÜK FİNAL ─── */
  {
    weekNumber: 10,
    title: "Çağdaş Sanat Panoraması",
    subtitle: "Dünden Bugüne, Bugünden Yarına",
    movement: "Çağdaş Sanat",
    dateRange: "1965 – Günümüz",
    keyArtists: ["Andy Warhol", "Jean-Michel Basquiat", "Ai Weiwei", "Marina Abramović", "Banksy"],
    keyTerms: ["pop art", "kavramsal sanat", "performans", "enstalasyon", "dijital sanat"],
    description:
      "Pop Art'ın ironisinden kavramsal sanatın radikalliğine, sokak sanatından dijital devrime — çağdaş sanat sınır tanımıyor. Bu büyük finalde 10 haftanın tüm ipliklerini birleştirip Antik Yunan'dan günümüze sanat tarihinin panoramik fotoğrafını çekiyoruz.",
    discussionQuestions: [
      "10 haftada gördüğümüz akımlardan hangisi günümüz sanatını en çok etkiliyor?",
      "Dijital araçlar ve yapay zeka sanatın tanımını değiştiriyor mu?",
      "Sanatın 'bir sonraki büyük kırılması' ne olabilir?",
    ],
    nextWeekPreview: "",
  },
];

export function getKapsamliWeek(weekNumber: number): WeekConfig | undefined {
  return KAPSAMLI_WEEKS.find((w) => w.weekNumber === weekNumber);
}
