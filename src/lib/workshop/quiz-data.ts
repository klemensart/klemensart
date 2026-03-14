import type { WorkshopQuizItem } from "./types";

/* ──────────────────────────────────────────────────────────────────────────────
   4 Blok Quiz Soruları  (12 + 12 + 12 + 15 = 51 soru)
   ────────────────────────────────────────────────────────────────────────────── */

/* ── Blok 1 — Hafta 1-3: Empresyonizm + Kübizm + Dadaizm (12 soru) ── */

export const BLOCK_1_QUESTIONS: WorkshopQuizItem[] = [
  {
    id: 101, week: 1, difficulty: "easy",
    question: "Empresyonizm akımına adını veren 'İzlenim, Gündoğumu' tablosunun ressamı kimdir?",
    options: [
      { text: "Claude Monet", isCorrect: true },
      { text: "Pierre-Auguste Renoir", isCorrect: false },
      { text: "Edgar Degas", isCorrect: false },
      { text: "Édouard Manet", isCorrect: false },
    ],
    explanation: "Monet'nin 1872 tarihli 'Impression, soleil levant' tablosu, eleştirmen Louis Leroy tarafından alay amaçlı 'Empresyonist' diye adlandırıldı ve isim kalıcı oldu.",
  },
  {
    id: 102, week: 1, difficulty: "medium",
    question: "'En plein air' terimi ne anlama gelir?",
    options: [
      { text: "Açık havada resim yapma", isCorrect: true },
      { text: "Soyut boyama tekniği", isCorrect: false },
      { text: "Fırça kullanmadan boya dökme", isCorrect: false },
      { text: "Işığı prizma ile kırma", isCorrect: false },
    ],
    explanation: "Empresyonistler, atölye yerine doğal ışığı yakalamak için 'en plein air' (açık havada) çalışmayı tercih etti.",
  },
  {
    id: 103, week: 1, difficulty: "hard",
    question: "Tüm 8 Empresyonist sergiye katılan tek sanatçı hangisidir?",
    options: [
      { text: "Camille Pissarro", isCorrect: true },
      { text: "Claude Monet", isCorrect: false },
      { text: "Pierre-Auguste Renoir", isCorrect: false },
      { text: "Edgar Degas", isCorrect: false },
    ],
    explanation: "Pissarro, 1874-1886 arasındaki tüm 8 Empresyonist sergiye katılan tek sanatçıdır. Monet ve Renoir bazılarını atladı.",
  },
  {
    id: 104, week: 1, difficulty: "medium",
    question: "Georges Seurat'nın Grande Jatte tablosunda kullandığı teknik hangisidir?",
    options: [
      { text: "Puantilizm (Noktacılık)", isCorrect: true },
      { text: "İmpasto", isCorrect: false },
      { text: "Sfumato", isCorrect: false },
      { text: "Chiaroscuro", isCorrect: false },
    ],
    explanation: "Seurat, renkleri palette karıştırmak yerine küçük noktalar halinde yan yana koyarak gözde optik karışım yarattı.",
  },
  {
    id: 105, week: 2, difficulty: "easy",
    question: "Kübizm akımının öncüsü olarak kabul edilen iki sanatçı kimlerdir?",
    options: [
      { text: "Picasso ve Braque", isCorrect: true },
      { text: "Monet ve Renoir", isCorrect: false },
      { text: "Dalí ve Magritte", isCorrect: false },
      { text: "Mondrian ve Kandinsky", isCorrect: false },
    ],
    explanation: "Pablo Picasso ve Georges Braque, 1907-1914 arasında birlikte çalışarak Kübizmi geliştirdi.",
  },
  {
    id: 106, week: 2, difficulty: "medium",
    question: "Sanat tarihindeki ilk kolaj olarak kabul edilen eser hangisidir?",
    options: [
      { text: "Hasır Örgülü Sandalye ile Natürmort (Picasso)", isCorrect: true },
      { text: "Guernica (Picasso)", isCorrect: false },
      { text: "Üç Müzisyen (Picasso)", isCorrect: false },
      { text: "Avignonlu Kızlar (Picasso)", isCorrect: false },
    ],
    explanation: "1912 tarihli bu eser, tuvale gerçek muşamba yapıştırarak sanat tarihinin ilk kolajı oldu.",
  },
  {
    id: 107, week: 2, difficulty: "hard",
    question: "Analitik Kübizm ile Sentetik Kübizm arasındaki temel fark nedir?",
    options: [
      { text: "Analitik parçalar, sentetik tekrar birleştirir", isCorrect: true },
      { text: "Analitik renkli, sentetik siyah-beyazdır", isCorrect: false },
      { text: "Analitik heykel, sentetik resimdir", isCorrect: false },
      { text: "Analitik soyut, sentetik gerçekçidir", isCorrect: false },
    ],
    explanation: "Analitik Kübizm (1909-12) nesneyi giderek daha çok parçalarken, Sentetik Kübizm (1912-14) kolaj ve renk ile nesneleri yeniden inşa etti.",
  },
  {
    id: 108, week: 2, difficulty: "medium",
    question: "Guernica, hangi tarihi olaya tepki olarak yapılmıştır?",
    options: [
      { text: "Guernica kasabasının bombalanması", isCorrect: true },
      { text: "I. Dünya Savaşı'nın başlaması", isCorrect: false },
      { text: "Paris'in Nazi işgali", isCorrect: false },
      { text: "Atom bombasının atılması", isCorrect: false },
    ],
    explanation: "1937'de İspanya İç Savaşı sırasında Alman ve İtalyan uçakları Bask kasabası Guernica'yı bombaladı.",
  },
  {
    id: 109, week: 3, difficulty: "easy",
    question: "Marcel Duchamp'ın 1917'de sergilediği 'Çeşme' eseri aslında nedir?",
    options: [
      { text: "Ters çevrilmiş pisuar", isCorrect: true },
      { text: "Kırık bir vazo", isCorrect: false },
      { text: "Boyalı su kabı", isCorrect: false },
      { text: "Bronz heykel", isCorrect: false },
    ],
    explanation: "Duchamp, standart bir porselenpişuar'ı 'R. Mutt' diye imzalayıp sergi gönderdi — readymade kavramını başlattı.",
  },
  {
    id: 110, week: 3, difficulty: "medium",
    question: "Dadaizm hareketi hangi şehirde, hangi mekânda doğdu?",
    options: [
      { text: "Zürih, Cabaret Voltaire", isCorrect: true },
      { text: "Paris, Café de Flore", isCorrect: false },
      { text: "Berlin, Bauhaus", isCorrect: false },
      { text: "New York, 291 Gallery", isCorrect: false },
    ],
    explanation: "1916'da Hugo Ball ve arkadaşları Zürih'teki Cabaret Voltaire'de Dada hareketini başlattı.",
  },
  {
    id: 111, week: 3, difficulty: "hard",
    question: "Hannah Höch'ün 'Mutfak Bıçağıyla Kesilmiş' eserinde kullandığı teknik hangisidir?",
    options: [
      { text: "Fotomontaj", isCorrect: true },
      { text: "Pointilizm", isCorrect: false },
      { text: "Frotaj", isCorrect: false },
      { text: "Drip painting", isCorrect: false },
    ],
    explanation: "Höch, gazete ve dergilerden kestiği fotoğrafları birleştirerek fotomontaj tekniğini geliştiren öncü sanatçılardan biriydi.",
  },
  {
    id: 112, week: 3, difficulty: "medium",
    question: "'Readymade' kavramı neyi ifade eder?",
    options: [
      { text: "Hazır, günlük nesnenin sanat olarak sunulması", isCorrect: true },
      { text: "Fabrikada üretilmiş heykel", isCorrect: false },
      { text: "Kopyalanmış bir tablonun orijinal sayılması", isCorrect: false },
      { text: "Önceden çizilmiş bir eskizin tamamlanması", isCorrect: false },
    ],
    explanation: "Duchamp'ın ortaya koyduğu readymade kavramı, sanatçının seçimini yapım sürecinin önüne koydu.",
  },
];

/* ── Blok 2 — Hafta 4-6: Sürrealizm + De Stijl/Bauhaus + Soyut Ekspresyonizm (12 soru) ── */

export const BLOCK_2_QUESTIONS: WorkshopQuizItem[] = [
  {
    id: 201, week: 4, difficulty: "easy",
    question: "Salvador Dalí'nin eriyen saatleriyle ünlü eseri hangisidir?",
    options: [
      { text: "Belleğin Azmi", isCorrect: true },
      { text: "Yanan Zürafa", isCorrect: false },
      { text: "Filleri Yansıtan Kuğular", isCorrect: false },
      { text: "Büyük Mastürbatör", isCorrect: false },
    ],
    explanation: "1931 tarihli 'The Persistence of Memory' — sadece 24×33 cm boyutunda ama sanat tarihinin en tanınmış imgelerinden biri.",
  },
  {
    id: 202, week: 4, difficulty: "medium",
    question: "Sürrealizm hangi düşünürün kuramlarından ilham almıştır?",
    options: [
      { text: "Sigmund Freud", isCorrect: true },
      { text: "Karl Marx", isCorrect: false },
      { text: "Friedrich Nietzsche", isCorrect: false },
      { text: "Jean-Paul Sartre", isCorrect: false },
    ],
    explanation: "André Breton'un 1924 Sürrealist Manifestosu, Freud'un bilinçaltı, rüya yorumu ve serbest çağrışım kuramlarını temel aldı.",
  },
  {
    id: 203, week: 4, difficulty: "hard",
    question: "Magritte'in 'Ceci n'est pas une pipe' yazılı eseri hangi felsefi soruyu tartışır?",
    options: [
      { text: "Temsil ile gerçeklik arasındaki fark", isCorrect: true },
      { text: "Sanatçının toplumsal rolü", isCorrect: false },
      { text: "Zamanın göreliliği", isCorrect: false },
      { text: "Doğa-kültür ikiliği", isCorrect: false },
    ],
    explanation: "'İmgelerin İhaneti' (1929) — bir piponun resmi bir pipo değildir. Magritte, imge ile nesne arasındaki uçurumu gösterir.",
  },
  {
    id: 204, week: 4, difficulty: "medium",
    question: "Frida Kahlo, 'İki Frida' tablosunu hangi kişisel deneyim sonrası yapmıştır?",
    options: [
      { text: "Diego Rivera ile boşanması", isCorrect: true },
      { text: "Trafik kazası sonrası", isCorrect: false },
      { text: "Meksika devriminden kaçış", isCorrect: false },
      { text: "Avrupa gezisi dönüşü", isCorrect: false },
    ],
    explanation: "1939'da Rivera ile boşandıktan sonra yapılan çift otoportrede açık kalpler birbirine bağlı — ayrılma acısının sembolü.",
  },
  {
    id: 205, week: 5, difficulty: "easy",
    question: "Mondrian'ın kompozisyonlarında kullandığı renkler hangileridir?",
    options: [
      { text: "Kırmızı, mavi, sarı + siyah, beyaz", isCorrect: true },
      { text: "Tüm gökkuşağı renkleri", isCorrect: false },
      { text: "Sadece siyah ve beyaz", isCorrect: false },
      { text: "Pastel tonlar", isCorrect: false },
    ],
    explanation: "Neoplastisizm ilkesi gereği Mondrian sadece üç ana renk (kırmızı, mavi, sarı) ile siyah çizgiler ve beyaz zemin kullandı.",
  },
  {
    id: 206, week: 5, difficulty: "medium",
    question: "Bauhaus okulu hangi yılda ve neden kapatıldı?",
    options: [
      { text: "1933, Nazi baskısı nedeniyle", isCorrect: true },
      { text: "1945, savaş yıkımı nedeniyle", isCorrect: false },
      { text: "1929, ekonomik kriz nedeniyle", isCorrect: false },
      { text: "1939, öğretmenlerin istifası nedeniyle", isCorrect: false },
    ],
    explanation: "Naziler Bauhaus'u 'dejenereasyon' olarak nitelendirip 1933'te kapattı. Gropius, Mies van der Rohe ve Kandinsky ABD'ye göç etti.",
  },
  {
    id: 207, week: 5, difficulty: "hard",
    question: "Theo van Doesburg, Mondrian ile neden yollarını ayırdı?",
    options: [
      { text: "Çapraz çizgiler kullanmak istedi", isCorrect: true },
      { text: "Figüratif resme dönmek istedi", isCorrect: false },
      { text: "Renk kullanmayı reddetti", isCorrect: false },
      { text: "Bauhaus'a katılmak istedi", isCorrect: false },
    ],
    explanation: "Van Doesburg 'Karşı-Kompozisyon' serisinde 45° açılı çizgiler kullandı. Mondrian bunu neoplastisizm ilkelerine aykırı buldu.",
  },
  {
    id: 208, week: 5, difficulty: "medium",
    question: "Kandinsky'nin 'Noktadan Çizgiye Düzleme' kitabı hangi okulda yazılmıştır?",
    options: [
      { text: "Bauhaus", isCorrect: true },
      { text: "Sorbonne", isCorrect: false },
      { text: "Black Mountain College", isCorrect: false },
      { text: "Royal Academy", isCorrect: false },
    ],
    explanation: "Kandinsky, 1922-1933 arası Bauhaus'ta ders verdi ve bu dönemde temel sanat kuramı kitaplarını yazdı.",
  },
  {
    id: 209, week: 6, difficulty: "easy",
    question: "Jackson Pollock'un boya tuvale dökerek yaptığı teknik hangisidir?",
    options: [
      { text: "Drip painting (damlatma resmi)", isCorrect: true },
      { text: "Puantilizm", isCorrect: false },
      { text: "Kolaj", isCorrect: false },
      { text: "Frotaj", isCorrect: false },
    ],
    explanation: "Pollock, tuvali yere serip üzerine boya damlatarak, sıçratarak ve dökerek 'aksiyon resmi' yaptı.",
  },
  {
    id: 210, week: 6, difficulty: "medium",
    question: "Mark Rothko'nun tablolarında görülen büyük renk blokları hangi alt-akımın parçasıdır?",
    options: [
      { text: "Color Field (Renk Alanı) resmi", isCorrect: true },
      { text: "Aksiyon resmi", isCorrect: false },
      { text: "Geometrik soyutlama", isCorrect: false },
      { text: "Hard-edge resmi", isCorrect: false },
    ],
    explanation: "Rothko'nun yumuşak kenarlı büyük renk blokları, Color Field resminin en tanınmış örnekleridir.",
  },
  {
    id: 211, week: 6, difficulty: "hard",
    question: "Soyut Ekspresyonizm'in yükselişi hangi küresel olayla bağlantılıdır?",
    options: [
      { text: "II. Dünya Savaşı sonrası sanat merkezinin Paris'ten New York'a kayması", isCorrect: true },
      { text: "Sovyetler Birliği'nin sanatı yasaklaması", isCorrect: false },
      { text: "Fotoğrafın icadı", isCorrect: false },
      { text: "İlk uluslararası sanat fuarı", isCorrect: false },
    ],
    explanation: "Savaş sırasında Avrupa'dan kaçan sanatçılar (Mondrian, Ernst vb.) New York'a göçtü, ve Amerikan sanatçılar küresel sahneye çıktı.",
  },
  {
    id: 212, week: 6, difficulty: "medium",
    question: "Helen Frankenthaler'ın geliştirdiği, boyanın ham tuvale emdirildiği teknik hangisidir?",
    options: [
      { text: "Soak-stain (emme/leke tekniği)", isCorrect: true },
      { text: "Impasto", isCorrect: false },
      { text: "Grattage", isCorrect: false },
      { text: "Glazing", isCorrect: false },
    ],
    explanation: "Frankenthaler'ın 1952 tarihli 'Mountains and Sea' eseri, seyreltilmiş boyanın ham tuvale emdirilmesiyle Color Field resmine ilham verdi.",
  },
];

/* ── Blok 3 — Hafta 7-9: Pop Art + Kavramsal + Performans/Arazi (12 soru) ── */

export const BLOCK_3_QUESTIONS: WorkshopQuizItem[] = [
  {
    id: 301, week: 7, difficulty: "easy",
    question: "Andy Warhol'un en ünlü serigrafilerinden biri olan yiyecek konulu serisi hangisidir?",
    options: [
      { text: "Campbell's Çorba Kutuları", isCorrect: true },
      { text: "Heinz Ketçap Şişeleri", isCorrect: false },
      { text: "Coca-Cola Kutuları", isCorrect: false },
      { text: "Pepsi Reklam Panoları", isCorrect: false },
    ],
    explanation: "32 farklı çorba çeşidini gösteren 'Campbell's Soup Cans' (1962), seri üretim estetiğini sanat galerisine taşıdı.",
  },
  {
    id: 302, week: 7, difficulty: "medium",
    question: "Roy Lichtenstein'ın Pop Art eserlerinde kullandığı baskı tekniği noktaları neye denir?",
    options: [
      { text: "Ben-Day noktaları", isCorrect: true },
      { text: "Halftone noktaları", isCorrect: false },
      { text: "Serigrafi lekeleri", isCorrect: false },
      { text: "Pointilizm daireleri", isCorrect: false },
    ],
    explanation: "Lichtenstein, ucuz çizgi roman baskılarındaki Ben-Day nokta kalıbını devasa tuvallere taşıyarak Pop Art'ın ikonuna dönüştürdü.",
  },
  {
    id: 303, week: 7, difficulty: "hard",
    question: "Pop Art tarihinde 'Pop' kelimesinin ilk göründüğü eser hangisidir?",
    options: [
      { text: "I Was a Rich Man's Plaything (Paolozzi, 1947)", isCorrect: true },
      { text: "Campbell's Soup Cans (Warhol, 1962)", isCorrect: false },
      { text: "Flag (Johns, 1955)", isCorrect: false },
      { text: "Whaam! (Lichtenstein, 1963)", isCorrect: false },
    ],
    explanation: "Eduardo Paolozzi'nin 1947 kolajında bir tabancanın ucundan çıkan 'POP!' kelimesi, terimin ilk kullanımı sayılır.",
  },
  {
    id: 304, week: 7, difficulty: "medium",
    question: "Warhol'un Marilyn serisini Monroe'nun ölümünden ne kadar sonra yaptığı bilinir?",
    options: [
      { text: "Haftalar sonra", isCorrect: true },
      { text: "10 yıl sonra", isCorrect: false },
      { text: "Monroe hayattayken", isCorrect: false },
      { text: "Ölümünden 1 gün önce", isCorrect: false },
    ],
    explanation: "Marilyn Monroe Ağustos 1962'de öldü; Warhol hemen ardından serigrafları yapmaya başladı — şöhret ve ölüm teması.",
  },
  {
    id: 305, week: 8, difficulty: "easy",
    question: "Joseph Kosuth'un 'Bir ve Üç Sandalye' enstalasyonunda kaç öğe yer alır?",
    options: [
      { text: "Üç: gerçek sandalye, fotoğrafı, sözlük tanımı", isCorrect: true },
      { text: "Bir: sadece sandalye", isCorrect: false },
      { text: "İki: sandalye ve gölgesi", isCorrect: false },
      { text: "Dört: sandalye, çizim, model, tanım", isCorrect: false },
    ],
    explanation: "Kosuth, 'sandalye' kavramını üç halde sunarak dil, temsil ve gerçeklik ilişkisini sorguladı.",
  },
  {
    id: 306, week: 8, difficulty: "medium",
    question: "Sol LeWitt'in duvar çizimleri neden 'kavramsal' sayılır?",
    options: [
      { text: "Sanatçı talimat yazar, başkaları uygular", isCorrect: true },
      { text: "Sadece beyaz duvarlar kullanılır", isCorrect: false },
      { text: "Çizimler bilgisayarla yapılır", isCorrect: false },
      { text: "Her çizim 24 saat içinde silinir", isCorrect: false },
    ],
    explanation: "LeWitt talimatları yazardı, asistanlar uygulardı — fikir sanatçının, uygulama farklı ellerde olabilir.",
  },
  {
    id: 307, week: 8, difficulty: "hard",
    question: "Marina Abramović'in 'Rhythm 0' performansında kaç nesne kullanıldı?",
    options: [
      { text: "72", isCorrect: true },
      { text: "10", isCorrect: false },
      { text: "36", isCorrect: false },
      { text: "100", isCorrect: false },
    ],
    explanation: "72 nesne (gül, parfüm, bıçak, tabanca dahil) masaya kondu; 6 saat boyunca izleyiciler ne isterse yapabildi.",
  },
  {
    id: 308, week: 8, difficulty: "medium",
    question: "Rauschenberg'in de Kooning çizimini silmesi hangi kavramı sorguluyor?",
    options: [
      { text: "Yaratma eylemi olarak yok etme", isCorrect: true },
      { text: "Kopya hakkı", isCorrect: false },
      { text: "Renk teorisi", isCorrect: false },
      { text: "Heykel-resim sınırı", isCorrect: false },
    ],
    explanation: "1953'te Rauschenberg, de Kooning'den aldığı çizimi silerek 'silme' eylemini yaratıcı bir jest olarak sundu.",
  },
  {
    id: 309, week: 9, difficulty: "easy",
    question: "Robert Smithson'ın Utah'taki tuz gölünde yaptığı dev arazi sanatı eseri hangisidir?",
    options: [
      { text: "Spiral Jetty", isCorrect: true },
      { text: "Double Negative", isCorrect: false },
      { text: "Lightning Field", isCorrect: false },
      { text: "Sun Tunnels", isCorrect: false },
    ],
    explanation: "457 metre uzunluğundaki taş spiral, 1970'ten beri Great Salt Lake'te duruyor — su seviyesine göre görünüp kaybolur.",
  },
  {
    id: 310, week: 9, difficulty: "medium",
    question: "Christo & Jeanne-Claude'un projelerinin maliyetini kim karşılıyordu?",
    options: [
      { text: "Sanatçılar, kendi eser satışlarından", isCorrect: true },
      { text: "Devlet sponsorluğu", isCorrect: false },
      { text: "Müze bütçeleri", isCorrect: false },
      { text: "Hayırsever vakıflar", isCorrect: false },
    ],
    explanation: "Christo & Jeanne-Claude hiçbir zaman sponsorluk veya hibe almadı; tüm projeleri kendi eser satışlarından finanse etti.",
  },
  {
    id: 311, week: 9, difficulty: "hard",
    question: "Joseph Beuys'un '7000 Meşe' projesi hangi sanat kavramının örneğidir?",
    options: [
      { text: "Sosyal heykel", isCorrect: true },
      { text: "Minimalizm", isCorrect: false },
      { text: "Neo-ekspresyonizm", isCorrect: false },
      { text: "Fluxus müziği", isCorrect: false },
    ],
    explanation: "Beuys, 'her insan bir sanatçıdır' diyerek toplumsal değişimi sanat eseri (sosyal heykel) olarak tanımladı.",
  },
  {
    id: 312, week: 9, difficulty: "medium",
    question: "James Turrell'in Roden Crater projesi asıl olarak neyi kullanır?",
    options: [
      { text: "Doğal ışığı ve gökyüzünü", isCorrect: true },
      { text: "Lazer ve yapay ışığı", isCorrect: false },
      { text: "Ses dalgalarını", isCorrect: false },
      { text: "Su ve buz heykelleri", isCorrect: false },
    ],
    explanation: "Turrell, sönmüş volkanik kratere odalar oyarak gündüz ve gece gökyüzünü çerçeveliyor — saf ışık algı deneyimi.",
  },
];

/* ── Final — Hafta 1-10: Genel Tekrar (15 soru) ── */

export const FINAL_QUESTIONS: WorkshopQuizItem[] = [
  {
    id: 401, week: 1, difficulty: "medium",
    question: "Monet'nin Giverny bahçesini konu alan en ünlü serisi hangisidir?",
    options: [
      { text: "Nilüferler (Water Lilies)", isCorrect: true },
      { text: "Saman Balyaları", isCorrect: false },
      { text: "Rouen Katedrali", isCorrect: false },
      { text: "Londra Parlamento Binası", isCorrect: false },
    ],
    explanation: "Monet, hayatının son 30 yılında bahçesindeki nilüferleri 250'den fazla tabloda resmetdi.",
  },
  {
    id: 402, week: 2, difficulty: "medium",
    question: "Picasso'nun Guernica tablosu hangi renk paletinde yapılmıştır?",
    options: [
      { text: "Grisaille (siyah, beyaz, gri tonlar)", isCorrect: true },
      { text: "Ana renkler (kırmızı, mavi, sarı)", isCorrect: false },
      { text: "Toprak tonları", isCorrect: false },
      { text: "Pastel renkler", isCorrect: false },
    ],
    explanation: "Picasso, savaşın dehşetini vurgulamak için renksiz bir palet kullandı — siyah-beyaz gazete fotoğraflarını çağrıştırır.",
  },
  {
    id: 403, week: 3, difficulty: "easy",
    question: "Duchamp'ın 'L.H.O.O.Q.' eserinde hangi ünlü tabloya müdahale edilmiştir?",
    options: [
      { text: "Mona Lisa", isCorrect: true },
      { text: "Yıldızlı Gece", isCorrect: false },
      { text: "Guernica", isCorrect: false },
      { text: "Çığlık", isCorrect: false },
    ],
    explanation: "Duchamp, Mona Lisa'nın ucuz bir reprodüksiyonuna bıyık ve sakal çizerek yüksek sanat kavramıyla dalga geçti.",
  },
  {
    id: 404, week: 4, difficulty: "medium",
    question: "Sürrealistlerin bilinçaltına ulaşmak için kullandığı teknik hangisidir?",
    options: [
      { text: "Otomatizm (otomatik yazma/çizme)", isCorrect: true },
      { text: "Perspektif çizim", isCorrect: false },
      { text: "Fotogerçekçilik", isCorrect: false },
      { text: "Serigrafi", isCorrect: false },
    ],
    explanation: "Otomatizm — bilinçli kontrol olmadan yazma veya çizme — Sürrealistlerin bilinçaltına erişme yöntemiydi.",
  },
  {
    id: 405, week: 5, difficulty: "medium",
    question: "Bauhaus'un temel felsefesi hangisidir?",
    options: [
      { text: "Form işlevi izler (sanat + zanaat birleşimi)", isCorrect: true },
      { text: "Sanat toplumdan bağımsız olmalıdır", isCorrect: false },
      { text: "Sadece soyut sanat değerlidir", isCorrect: false },
      { text: "Geleneksel teknikler korunmalıdır", isCorrect: false },
    ],
    explanation: "Gropius'un manifestosu: sanat, zanaat ve endüstri bir arada — günlük yaşam nesneleri de güzel olabilir.",
  },
  {
    id: 406, week: 6, difficulty: "easy",
    question: "Pollock'un resim yaparken tuvali nereye koyduğu bilinir?",
    options: [
      { text: "Yere serdi", isCorrect: true },
      { text: "Şövaleye dikti", isCorrect: false },
      { text: "Tavana astı", isCorrect: false },
      { text: "Duvara yapıştırdı", isCorrect: false },
    ],
    explanation: "Pollock tuvali yere serip etrafında dolaşarak, boya damlatarak ve sıçratarak çalıştı — 'arena' olarak tuval.",
  },
  {
    id: 407, week: 7, difficulty: "medium",
    question: "Pop Art'ın temel eleştiri konusu nedir?",
    options: [
      { text: "Tüketim kültürü ve kitle iletişim araçları", isCorrect: true },
      { text: "Doğa tahribatı", isCorrect: false },
      { text: "Savaş ve şiddet", isCorrect: false },
      { text: "Dini kurumlar", isCorrect: false },
    ],
    explanation: "Pop Art, reklam, medya ve tüketim nesnelerini sanat malzemesi yaparak yüksek/düşük kültür ayrımını sorguladı.",
  },
  {
    id: 408, week: 8, difficulty: "medium",
    question: "Kavramsal sanatta 'dematerializasyon' ne demektir?",
    options: [
      { text: "Sanat eserinin fiziksel nesneden arınması, fikre dönüşmesi", isCorrect: true },
      { text: "Heykelin eritilmesi", isCorrect: false },
      { text: "Dijital ortama geçiş", isCorrect: false },
      { text: "Tabloların küçültülmesi", isCorrect: false },
    ],
    explanation: "Lucy Lippard'ın tanımladığı kavram: 1960'lardan itibaren sanat eseri bir nesne değil, bir fikir olarak var olabilir.",
  },
  {
    id: 409, week: 9, difficulty: "medium",
    question: "Arazi sanatının galeri sistemine getirdiği en büyük meydan okuma nedir?",
    options: [
      { text: "Eserlerin satılamaz ve taşınamaz olması", isCorrect: true },
      { text: "Çok pahalı olması", isCorrect: false },
      { text: "Sanatçının anonim kalması", isCorrect: false },
      { text: "Sadece fotoğraf olarak var olması", isCorrect: false },
    ],
    explanation: "Çöle kazılmış veya göle inşa edilmiş eserler satılamaz, koleksiyon edilemez — sanat piyasasına doğrudan meydan okuma.",
  },
  {
    id: 410, week: 10, difficulty: "easy",
    question: "Banksy'nin 2018'de Sotheby's müzayedesinde kendi kendini parçalayan eseri hangisidir?",
    options: [
      { text: "Balonlu Kız", isCorrect: true },
      { text: "Çiçek Atan", isCorrect: false },
      { text: "Kissing Coppers", isCorrect: false },
      { text: "Laugh Now", isCorrect: false },
    ],
    explanation: "1.4 milyon dolara satıldığı an çerçevedeki gizli kâğıt öğütücü devreye girdi — parçalanmış hali 'Love is in the Bin' adını aldı.",
  },
  {
    id: 411, week: 10, difficulty: "hard",
    question: "Jean-Michel Basquiat hangi sanat ortamından galeriye geçiş yapmıştır?",
    options: [
      { text: "Sokak sanatı / grafiti (SAMO© takma adıyla)", isCorrect: true },
      { text: "Akademik resim eğitimi", isCorrect: false },
      { text: "Reklam sektörü", isCorrect: false },
      { text: "Film yapımcılığı", isCorrect: false },
    ],
    explanation: "Basquiat, New York sokaklarında SAMO© imzasıyla grafiti yaparak ünlendi ve 1980'de galeri sahnesine geçti.",
  },
  {
    id: 412, week: 3, difficulty: "hard",
    question: "Duchamp'ın 'Büyük Cam' eserinin kırılması sonrası sanatçı ne yaptı?",
    options: [
      { text: "Kırıkları eserin bir parçası olarak kabul etti", isCorrect: true },
      { text: "Eseri tamir ettirdi", isCorrect: false },
      { text: "Yeni bir versiyon yaptı", isCorrect: false },
      { text: "Eseri imha etti", isCorrect: false },
    ],
    explanation: "Nakliye sırasında cam kırıldığında Duchamp 'Artık tamamlandı' dedi ve kırıkları rastlantının katkısı olarak benimsedi.",
  },
  {
    id: 413, week: 7, difficulty: "hard",
    question: "Arthur Danto, Warhol'un Brillo Kutuları'nı gördüğünde hangi felsefi sonuca vardı?",
    options: [
      { text: "Sanat ile sıradan nesne arasındaki görsel fark ortadan kalktı", isCorrect: true },
      { text: "Sanat sadece güzellik içindir", isCorrect: false },
      { text: "Heykel resimden üstündür", isCorrect: false },
      { text: "Pop Art gerçek sanat değildir", isCorrect: false },
    ],
    explanation: "Danto, iki görsel olarak aynı nesnenin (süpermarket kutusu vs. sanat eseri) farklı statüde olmasının 'sanat dünyası' kavramına bağlı olduğunu savundu.",
  },
  {
    id: 414, week: 6, difficulty: "hard",
    question: "Barnett Newman'ın eserlerindeki ince dikey şeritler ne olarak adlandırılır?",
    options: [
      { text: "Zip", isCorrect: true },
      { text: "Line", isCorrect: false },
      { text: "Stripe", isCorrect: false },
      { text: "Cut", isCorrect: false },
    ],
    explanation: "Newman, büyük renk alanlarını bölen ince dikey şeritlere 'zip' adını verdi — yaratılışın anını simgeler.",
  },
  {
    id: 415, week: 10, difficulty: "medium",
    question: "Ai Weiwei'nin 2.000 yıllık Han Hanedanı vazosunu kırması hangi kavramı sorgular?",
    options: [
      { text: "Geleneğe ve otoriteye meydan okuma", isCorrect: true },
      { text: "Malzeme bilimi", isCorrect: false },
      { text: "Arkeolojik koruma", isCorrect: false },
      { text: "Seramik tekniği", isCorrect: false },
    ],
    explanation: "Ai Weiwei, antik vazoyu kasıtlı kırarak kültürel miras, otorite ve değer kavramlarını sorguladı.",
  },
];

/* ── Tüm sorular birleşik ── */

export const ALL_QUIZ_QUESTIONS: WorkshopQuizItem[] = [
  ...BLOCK_1_QUESTIONS,
  ...BLOCK_2_QUESTIONS,
  ...BLOCK_3_QUESTIONS,
  ...FINAL_QUESTIONS,
];

export function getQuestionsForBlock(slug: string): WorkshopQuizItem[] {
  switch (slug) {
    case "modern-sanat-blok-1-quiz": return BLOCK_1_QUESTIONS;
    case "modern-sanat-blok-2-quiz": return BLOCK_2_QUESTIONS;
    case "modern-sanat-blok-3-quiz": return BLOCK_3_QUESTIONS;
    case "modern-sanat-final-quiz": return FINAL_QUESTIONS;
    default: return [];
  }
}
