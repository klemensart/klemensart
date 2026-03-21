import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim() || "";
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() || "";
const supabase = createClient(url, key);

type Q = {
  category_slug: string;
  question: string;
  options: string[];
  correct_answer: string;
  fun_fact: string;
  difficulty: "kolay" | "orta" | "zor";
};

const questions: Q[] = [
  // ═══════════════════════════════════════════════════════════════
  // RÖNESANS — KOLAY (5)
  // ═══════════════════════════════════════════════════════════════
  {
    category_slug: "ronesans-dehasi",
    question: "Rönesans dönemi 14. yüzyılda hangi coğrafyada başlamış ve daha sonra tüm Batı Avrupa'ya yayılmıştır?",
    options: ["Fransa (Paris)", "İngiltere (Londra)", "İtalya (Floransa)", "İspanya (Madrid)"],
    correct_answer: "İtalya (Floransa)",
    fun_fact: "Rönesans'ın tartışmasız beşiği İtalya, özellikle de zengin kültürel ve ticari altyapısıyla Floransa'dır. Roma İmparatorluğu'nun kalıntılarının bu coğrafyada bulunması, antik çağ felsefesine geri dönüşü kolaylaştırmıştır.",
    difficulty: "kolay",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "\"Rönesans Adamı\" teriminin en yetkin örneği sayılan, \"Mona Lisa\" ve \"Son Akşam Yemeği\" gibi başyapıtları üreten sanatçı kimdir?",
    options: ["Michelangelo Buonarroti", "Raffaello Sanzio", "Leonardo da Vinci", "Donatello"],
    correct_answer: "Leonardo da Vinci",
    fun_fact: "Leonardo da Vinci, kadavraları inceleyerek kas sistemini araştırmış ve sanata bilimsel bir metodoloji getirmiştir. Bilimsel gözlem ile yaratıcılığı birleştiren dehasıyla Yüksek Rönesans'ın zirvesini temsil eder.",
    difficulty: "kolay",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "Rönesans sanatının dünyevi konulara yönelmesini sağlayan temel felsefi akım hangisidir?",
    options: ["Skolastik Düşünce", "Romantizm", "Sürrealizm", "Hümanizm"],
    correct_answer: "Hümanizm",
    fun_fact: "Hümanizm, insanın evrendeki yerini yeniden tanımlamış; Dante ve Petrarch gibi yazarların antik metinleri keşfetmesiyle alevlenmiştir. Dini figürlerin bile daha insani ve duygusal derinlikle resmedilmesine yol açmıştır.",
    difficulty: "kolay",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "Rönesans sanatçılarının figürleri matematiksel doğrulukla derinliği olan mekânlara yerleştirmesi hangi yeniliğin göstergesidir?",
    options: ["Noktacılık (Pointillism)", "Lineer perspektif ve gerçekçi manzara", "Damlatma tekniği (Action Painting)", "Soyutlama (Abstraction)"],
    correct_answer: "Lineer perspektif ve gerçekçi manzara",
    fun_fact: "Orta Çağ'da figürler düz altın arka planlarda resmedilirken, Rönesans ile matematiksel perspektif sayesinde figürler gerçekçi, üç boyutlu manzaralara yerleştirilmiştir.",
    difficulty: "kolay",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "Rönesans'ın başlamasını tetikleyen, nüfusun yarısının ölmesine rağmen hayatta kalanlar için büyük servet birikimi yaratan tarihi olay hangisidir?",
    options: ["Fransız İhtilali", "Sanayi Devrimi", "I. Dünya Savaşı", "Veba Salgını (Kara Ölüm)"],
    correct_answer: "Veba Salgını (Kara Ölüm)",
    fun_fact: "Bubonik Veba'dan sağ kurtulanlar yüksek ücretler talep edebilmiş ve ciddi servet biriktirmiştir. Bu durum, Medici ailesi gibi güçlü sanat patronlarının ortaya çıkmasına olanak sağlamıştır.",
    difficulty: "kolay",
  },
  // RÖNESANS — ORTA (5)
  {
    category_slug: "ronesans-dehasi",
    question: "İtalyan Rönesansı'ndan farklı olarak, Almanya ve Hollanda'daki \"Kuzey Rönesansı\"nın en belirgin konu seçimi farkı nedir?",
    options: ["Sıradan insanların ve günlük yaşamın incelikli detaylarla resmedilmesi", "Sadece soyut geometrik desenlerin kullanılması", "Antik Yunan tanrılarının kaslı portrelerinin yapılması", "Sanayi makinelerinin ve hızın yüceltilmesi"],
    correct_answer: "Sıradan insanların ve günlük yaşamın incelikli detaylarla resmedilmesi",
    fun_fact: "Kuzey Rönesansı, Protestan Reformu'nun etkisiyle günlük hayata yönelmiştir. İncil sahneleri bile görkemli tapınaklarda değil, dönemin sıradan ev ortamlarında tasvir edilmiştir.",
    difficulty: "orta",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "Leonardo da Vinci'nin keskin dış hatlardan kaçınarak renkleri duman gibi kaynaştırdığı tekniğin adı nedir?",
    options: ["Fresk", "Tenebrizm", "Sfumato", "Impasto"],
    correct_answer: "Sfumato",
    fun_fact: "İtalyanca \"duman gibi dağılmak\" anlamına gelen sfumato, Mona Lisa'da kusursuzlaştırılmıştır. Keskin sınırları ince sır katmanlarıyla yumuşatarak üç boyutlu derinlik illüzyonu yaratır.",
    difficulty: "orta",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "Floransa Katedrali'nin o döneme kadar çözülememiş devasa kubbesini (Il Duomo) inşa eden mimar-mühendis kimdir?",
    options: ["Gian Lorenzo Bernini", "Filippo Brunelleschi", "Sandro Botticelli", "Titian (Tiziano)"],
    correct_answer: "Filippo Brunelleschi",
    fun_fact: "Brunelleschi'nin kubesi, Rönesans'ın akıl, matematik ve tasarım entegrasyonunun sembolüdür. Daha önce çözülememiş bu mühendislik problemini dahiyane bir yapıyla aşmıştır.",
    difficulty: "orta",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "Rönesans'ta \"Klasik Antik Çağ\" estetiği hangi mimari ve görsel elemanlarla kendini gösterir?",
    options: ["Gotik sivri kemerler ve uçan payandalar", "Figürlerin birden fazla açıdan resmedilmesi", "Modern çelik konstrüksiyonlar ve cam cepheler", "Sütunlar, kubbeler ve Yunan/Roma mitolojisinden ilham alan dengeli kompozisyonlar"],
    correct_answer: "Sütunlar, kubbeler ve Yunan/Roma mitolojisinden ilham alan dengeli kompozisyonlar",
    fun_fact: "Rönesans'ın özü, antik Yunan ve Roma klasisizminin yeniden keşfidir. Gotik sivri kemerler ise Rönesans'ın \"barbarca\" bularak reddettiği Orta Çağ mimarisine aittir.",
    difficulty: "orta",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "Venedik ekolünün en önemli temsilcisi ve renk kullanımıyla sonraki yüzyılları derinden etkileyen Yüksek Rönesans ressamı kimdir?",
    options: ["Jan van Eyck", "Titian (Tiziano Vecellio)", "Georges Seurat", "Jackson Pollock"],
    correct_answer: "Titian (Tiziano Vecellio)",
    fun_fact: "Floransa ekolü desen ve çizgiye önem verirken, Venedik ekolü Titian önderliğinde renk ve doku kullanımına odaklanmıştır. Titian'ın renk devrimi Mannerizm ve Barok dönemlerini derinden etkilemiştir.",
    difficulty: "orta",
  },
  // RÖNESANS — ZOR (5)
  {
    category_slug: "ronesans-dehasi",
    question: "Bir objenin izleyiciye doğru uzanıyormuş gibi optik yanılsama yaratmak için çizim çizgilerinin kasten kısaltıldığı ileri perspektif tekniğinin adı nedir?",
    options: ["Kısaltım (Foreshortening)", "Quadratura", "Trompe l'oeil", "Chiaroscuro"],
    correct_answer: "Kısaltım (Foreshortening)",
    fun_fact: "İlk olarak Giotto ile başlayan bu teknik, Yüksek Rönesans sanatçıları tarafından anatomi ile birleştirilerek mükemmelleştirilmiştir. İzleyiciye uzanan bir elin kolunun kasten kısa çizilmesiyle derinlik yaratılır.",
    difficulty: "zor",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "Kuzey Rönesans sanatçısı Albrecht Dürer'in matbaanın icadıyla eşzamanlı olarak \"yüksek sanat\" formuna dönüştürdüğü mecra hangisidir?",
    options: ["Tempera boya ile ahşap panel resmi", "Mermerden anıtsal heykeller", "Ağaç baskı (woodcut) ve gravür teknikleri", "Islak sıva üzerine tavan freskleri"],
    correct_answer: "Ağaç baskı (woodcut) ve gravür teknikleri",
    fun_fact: "Dürer, baskıresmi çoğaltılabilir bir yüksek sanat formuna dönüştürmüştür. Bu sayede sanat, okuma yazma bilmeyen kitlelere ve Avrupa'nın uzak köşelerine kadar yayılmıştır.",
    difficulty: "zor",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "Bizans sanatının düz ve hiyerarşik kompozisyonlarını yıkarak figürlerine hacim ve psikolojik gerçekçilik kazandıran \"Proto-Rönesans\"ın en büyük ustası kimdir?",
    options: ["Duccio", "Simone Martini", "Giotto di Bondone", "Cimabue"],
    correct_answer: "Giotto di Bondone",
    fun_fact: "Giotto'nun Arena Şapeli'ndeki freskleri, İtalyan sanatını Bizans'ın donuk tarzından kurtararak figürlere üç boyutluluk ve gerçek insani duygu eklemiştir. \"Bir resmi uzayda bir pencere gibi ele alma\" yaklaşımının ilk uygulayıcısıdır.",
    difficulty: "zor",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "Leonardo, Michelangelo ve Raphael'in eser verdiği \"Yüksek Rönesans\" döneminin tarihsel kronolojisi hakkında hangisi doğrudur?",
    options: ["200 yıl sürmüş durağan bir dönemdir", "Sadece İspanya'da gerçekleşmiştir", "1490'lardan 1527'ye kadar süren kısa fakat sanatın zirveye ulaştığı bir altın çağdır", "Sanayi Devrimi'ne kadar devam etmiştir"],
    correct_answer: "1490'lardan 1527'ye kadar süren kısa fakat sanatın zirveye ulaştığı bir altın çağdır",
    fun_fact: "Yüksek Rönesans sadece 30-35 yıllık bir süreyi kapsar — da Vinci'nin \"Son Akşam Yemeği\"nden 1527 Roma'nın Yağmalanması'na kadar. Bu kısacık dönemde insanlık tarihinin en ikonik eserleri üretilmiştir.",
    difficulty: "zor",
  },
  {
    category_slug: "ronesans-dehasi",
    question: "Klasik Rönesans'ın kusursuzluk arayışına tepki olarak 16. yüzyılda doğan, deforme ve uzatılmış figürlerle karakterize edilen geçiş akımı hangisidir?",
    options: ["Neoklasisizm", "Romantizm", "Mannerizm (Üslupçuluk)", "Dadaizm"],
    correct_answer: "Mannerizm (Üslupçuluk)",
    fun_fact: "Yüksek Rönesans'ın mükemmelliğini tekrarlamak yerine onu bozarak duyguyu ön plana çıkaran Mannerizm yaratılmıştır. Formlar bilinçli olarak deforme edilerek uzatılmış, yılan gibi \"serpentine\" figürler kullanılmıştır.",
    difficulty: "zor",
  },

  // ═══════════════════════════════════════════════════════════════
  // BAROK — KOLAY (5)
  // ═══════════════════════════════════════════════════════════════
  {
    category_slug: "barok-cagi",
    question: "Rönesans'ın sakin ve dengeli uyumuna kıyasla, Barok sanatını tanımlayan en ayırt edici görsel özellikler hangisidir?",
    options: ["Saf renklerin bilimsel optik kullanımı", "Sadece iki boyutlu çizimler", "Hareket, asimetri, yoğun duygu ve teatral drama", "Sadece soyut dışavurumcu çalışmalar"],
    correct_answer: "Hareket, asimetri, yoğun duygu ve teatral drama",
    fun_fact: "Barok sanat, izleyicinin doğrudan duyularına ve duygularına hitap etmeyi amaçlar. Aşırılık, dinamizm, bedenlerin kıvrılması, çapraz kompozisyonlar ve yüksek tiyatral dram ön plandadır.",
    difficulty: "kolay",
  },
  {
    category_slug: "barok-cagi",
    question: "Karanlık arka planlar içinden fırlayan figürleri sert ve dramatik ışık hüzmeleriyle aydınlatan Barok dönemin en belirleyici İtalyan ressamı kimdir?",
    options: ["Claude Monet", "Pablo Picasso", "Sandro Botticelli", "Caravaggio"],
    correct_answer: "Caravaggio",
    fun_fact: "Caravaggio, ışık ve gölgeyi tiyatral gerilim yaratacak şekilde kullanan Tenebrizm'in en büyük öncüsüdür. Sokağın gerçek, terli ve kirli yüzünü aziz tasvirlerinde kullanmasıyla da devrim yaratmıştır.",
    difficulty: "kolay",
  },
  {
    category_slug: "barok-cagi",
    question: "Barok dönemde popüler olan, ışık ve karanlığın sert bir şekilde zıt kullanıldığı dramatik tekniğin adı nedir?",
    options: ["Sfumato", "Chiaroscuro / Tenebrizm", "Fresk", "Kolaj"],
    correct_answer: "Chiaroscuro / Tenebrizm",
    fun_fact: "Figürlerin derin karanlık içinden yoğun bir ışık kaynağı ile çarpıcı biçimde aydınlatılması olan Tenebrizm, Caravaggio tarafından popülerleştirilmiştir. Sahnedeki gerilimi ve duygusal etkiyi maksimize eder.",
    difficulty: "kolay",
  },
  {
    category_slug: "barok-cagi",
    question: "Fransa'da Barok mimarinin, monarşinin mutlak gücünü sergilemek üzere inşa edilmiş en anıtsal ve ünlü örneği hangisidir?",
    options: ["Versay Sarayı", "Kolezyum", "Floransa Katedrali", "Partenon"],
    correct_answer: "Versay Sarayı",
    fun_fact: "XIV. Louis (Güneş Kral) tarafından inşa ettirilen Versay Sarayı, süslü dekorasyonu ve doğaya bile hükmettiğini gösteren geometrik bahçeleriyle devlet otoritesini simgeleyen Barok mimarinin zirve noktasıdır.",
    difficulty: "kolay",
  },
  {
    category_slug: "barok-cagi",
    question: "\"Barok\" kelimesinin sanat tarihçileri arasında en yaygın kabul gören etimolojik kökeni hangisidir?",
    options: ["Yunanca \"ağırlık\" anlamına gelir", "Latince \"yeniden doğuş\" anlamına gelir", "Portekizce \"barroco\" — kusurlu, düzensiz şekilli inci", "Fransızca \"ışık oyunları\" anlamına gelir"],
    correct_answer: "Portekizce \"barroco\" — kusurlu, düzensiz şekilli inci",
    fun_fact: "19. yüzyılın sonlarına kadar \"Barok\" kelimesi, sanattaki grotesk ve aşırı süslü durumu aşağılamak için kullanılmıştır. Portekizce düzensiz incileri tanımlayan \"barroco\" kelimesinden gelir.",
    difficulty: "kolay",
  },
  // BAROK — ORTA (5)
  {
    category_slug: "barok-cagi",
    question: "Michelangelo'nun Rönesans \"Davut\"u ile Bernini'nin Barok \"Davut\"u karşılaştırıldığında, Barok felsefesini yansıtan temel fark nedir?",
    options: ["Bernini'ninki ahşaptan, Michelangelo'nunki mermerden", "Michelangelo'nunki Golyat'ın başını tutuyor", "İkisi arasında biçimsel hiçbir fark yok", "Michelangelo'nunki sakin potansiyel anını, Bernini'ninki en dramatik eylem anını gösterir"],
    correct_answer: "Michelangelo'nunki sakin potansiyel anını, Bernini'ninki en dramatik eylem anını gösterir",
    fun_fact: "Rönesans sanatçısı eylem öncesi akılcı dinginliği seçerken, Barok sanatçısı eylemin ortasındaki gerilimi, sarmal kasları ve coşkulu dramayı tercih ederek izleyiciyi o şiddetli anın bir parçası yapar.",
    difficulty: "orta",
  },
  {
    category_slug: "barok-cagi",
    question: "Hollanda Altın Çağı'nda Rembrandt ve Vermeer gibi ustaların Barok sanatının İtalya veya İspanya'dan farklılaşmasının sosyolojik nedeni nedir?",
    options: ["Mermer ocaklarının bulunmaması", "Teknik yetersizlik", "Protestanlık ve sanatı finanse eden zengin tüccar sınıfının ev içi gerçekçi eserler istemesi", "İtalyan tekniklerinden habersiz izolasyon"],
    correct_answer: "Protestanlık ve sanatı finanse eden zengin tüccar sınıfının ev içi gerçekçi eserler istemesi",
    fun_fact: "Protestan Hollanda'da kilise duvarlarında dini resimlere sıcak bakılmazdı. Sanatın yeni patronları, kendi mütevazı ama lüks hayatlarını yansıtan portreler, natürmortlar ve günlük yaşam sahneleri isteyen zengin tüccarlardı.",
    difficulty: "orta",
  },
  {
    category_slug: "barok-cagi",
    question: "Cephesinde içbükey ve dışbükey dalgalanmalar barındırarak Rönesans'ın düz hatlarından kopan, \"ilk gerçek Barok cephe\" hangi yapıya aittir?",
    options: ["Paris'teki Notre Dame Katedrali", "Roma'daki Il Gesu Kilisesi", "Londra'daki St. Paul Katedrali", "Floransa Katedrali Vaftizhanesi"],
    correct_answer: "Roma'daki Il Gesu Kilisesi",
    fun_fact: "1584'te tamamlanan Il Gesu Kilisesi'nin cephesi, sütunların duvar içine gömülmesi ve hacimsel dalgalanmalarıyla Rönesans'ın düzlemsel oranlarından kopmuştur. Karşı-Reformasyon mimarisinin prototipi olarak Cizvit kiliselerine ilham vermiştir.",
    difficulty: "orta",
  },
  {
    category_slug: "barok-cagi",
    question: "Barok dönem kentsel planlama (şehircilik) felsefesi nasıl karakterize edilir?",
    options: ["Merkeze anıtsal yapı, dairesel meydanlar ve geniş aksiyel bulvarlar", "Tamamen rastgele labirent sokaklar", "Her alanın konutlarla doldurulması", "Sadece yaya yollarının yapılması"],
    correct_answer: "Merkeze anıtsal yapı, dairesel meydanlar ve geniş aksiyel bulvarlar",
    fun_fact: "Barok dönem, mimari değerlerin tek bir bina ölçeğinden çıkıp tüm şehre uygulandığı ilk dönemdir. Otoritenin vizyonunu yansıtmak amacıyla şehirler, merkezdeki anıtsal yapılar etrafında geniş bulvarlarla tasarlanmıştır.",
    difficulty: "orta",
  },
  {
    category_slug: "barok-cagi",
    question: "1545-1563 yıllarında toplanan Trento Konsili'nin kararlarının Barok sanatı üzerindeki doğrudan etkisi ne olmuştur?",
    options: ["Her türlü tasvirin ve heykelin yasaklanması", "Sanatın ihtişamlı bir Katolik propaganda aracı olarak kullanılmasına hükmedilmesi", "Sanatçıların pagan mitolojileri resmetmeye zorlanması", "Gotik mimariye geri dönülmesinin emredilmesi"],
    correct_answer: "Sanatın ihtişamlı bir Katolik propaganda aracı olarak kullanılmasına hükmedilmesi",
    fun_fact: "Katolik Kilisesi'nin Protestanlığa karşı başlattığı Karşı-Reformasyon'un sonucu olarak, Trento Konsili sanatın halkın duyularına hitap edecek kadar ihtişamlı olmasını talep etmiştir. Tavanlar gökyüzüne açılıyormuş gibi illüzyonist fresklerle donatılmıştır.",
    difficulty: "orta",
  },
  // BAROK — ZOR (5)
  {
    category_slug: "barok-cagi",
    question: "17. yüzyıl Barok manzara resminde insanların uçsuz bucaksız doğa sahneleri içinde küçücük figürler olarak resmedilmesinin ardındaki bilimsel neden nedir?",
    options: ["Sanatçıların anatomi çizmeyi unutması", "Kopernik devrimi sonucunda insanın evren karşısındaki önemsizliği hissi", "Kilisenin manzara resmine uyguladığı vergiler", "Matbaanın teknik kısıtları"],
    correct_answer: "Kopernik devrimi sonucunda insanın evren karşısındaki önemsizliği hissi",
    fun_fact: "Kopernik'in Güneş merkezli modelinin kabul görmesi, insanın evrenin merkezindeki ayrıcalıklı tahtını yıkmıştır. Bu küçülüş sanata doğrudan yansımış; manzara resimlerindeki insan figürleri doğanın görkemi karşısında minik lekelere dönüşmüştür.",
    difficulty: "zor",
  },
  {
    category_slug: "barok-cagi",
    question: "Caravaggio'nun \"Aziz Matta'ya Çağrı\" tablosunda ruhani dramayı en üst düzeye çıkaran ana görsel unsur nedir?",
    options: ["Tavanda uçuşan altın kanatlı melekler", "Gerçek bir pencerenin yönünden sahneye çaprazlama giren keskin ışık hüzmesi", "Tablonun altın yaldızla kaplanmış gerçeküstü arka planı", "Matta'nın diğer figürlerden çok daha büyük çizilmesi"],
    correct_answer: "Gerçek bir pencerenin yönünden sahneye çaprazlama giren keskin ışık hüzmesi",
    fun_fact: "Caravaggio'nun eserinde geleneksel melekler yerine, olay karanlık bir Roma meyhanesinde geçer. Mucize, dışarıdan odayı çaprazlama kesen tek bir ilahi ışık hüzmesi ile sağlanır — Barok resmin kusursuz bir örneğidir.",
    difficulty: "zor",
  },
  {
    category_slug: "barok-cagi",
    question: "İspanyol Barok'unda Churriguera ailesinin başlattığı, aşırı süslü hiper-dekoratif mimari alt üslubun adı nedir?",
    options: ["Brutalizm", "Rokoko", "Palladyan", "Churrigueresque (Çurrigueresk)"],
    correct_answer: "Churrigueresque (Çurrigueresk)",
    fun_fact: "Churrigueresque üslubu, Barok'un süsleme eğilimini ekstrem noktalara taşımıştır. Bolca yaldız, karmaşık bitkisel oymalar ve aşırı yoğun yüzey dokularıyla mimari formun önüne geçen bir dekoratif patlama yaratmıştır.",
    difficulty: "zor",
  },
  {
    category_slug: "barok-cagi",
    question: "Barok sanatının tarihteki \"ilk küresel görsel stil\" olmasını sağlayan temel mekanizma hangisidir?",
    options: ["Sömürgeci girişimler, ticaret ağları ve misyonerlik ile dünyaya taşınması", "Fotoğraf makinesiyle kopyalanması", "Budist rahiplerin İtalya'dan gönüllü olarak taşıması", "Napolyon'un zorla her ülkeye götürmesi"],
    correct_answer: "Sömürgeci girişimler, ticaret ağları ve misyonerlik ile dünyaya taşınması",
    fun_fact: "Barok stil, İspanyol ve Portekiz imparatorluklarının sömürgeci girişimleri ve Cizvit misyonerleri sayesinde Latin Amerika'dan Asya'ya kadar ulaşmıştır. Meksika'daki yerel ustalar tarafından yerel malzeme ve zevklerle harmanlanmıştır.",
    difficulty: "zor",
  },
  {
    category_slug: "barok-cagi",
    question: "Rembrandt'ın 1642 tarihli \"Gece Devriyesi\" tablosu, geleneksel grup portrelerinden hangi radikal Barok tercihle ayrılır?",
    options: ["Figürlerin hepsinin düz bir şekilde yan yana dizilmesi", "Sadece siyah ve beyaz renklerin kullanılması", "Grup üyelerinin dramatik ışık altında eyleme geçtikleri dinamik bir anın resmedilmesi", "Resimde insan figürü yerine sadece gece manzarasının tasvir edilmesi"],
    correct_answer: "Grup üyelerinin dramatik ışık altında eyleme geçtikleri dinamik bir anın resmedilmesi",
    fun_fact: "Rembrandt, donuk lonca portreleri geleneğini yıkmıştır. Birliği devriyeye çıkmak üzere harekete geçtikleri kaotik bir anda, güçlü ışık-gölge ve çapraz kompozisyonla resmederek eşi görülmemiş bir anlatı yaratmıştır.",
    difficulty: "zor",
  },

  // ═══════════════════════════════════════════════════════════════
  // MODERN SANAT — KOLAY (5)
  // ═══════════════════════════════════════════════════════════════
  {
    category_slug: "modern-sanat-akimlari",
    question: "1870'lerde Fransa'da ortaya çıkan, açık havada ışığın anlık değişimini kısa fırça darbeleriyle yakalamayı hedefleyen devrim niteliğindeki akım hangisidir?",
    options: ["İzlenimcilik (Empresyonizm)", "Romantizm", "Neoklasisizm", "Sürrealizm"],
    correct_answer: "İzlenimcilik (Empresyonizm)",
    fun_fact: "İzlenimciler, akademinin dayattığı kusursuz çizgi ve tarihi temaları tamamen reddetmiştir. Siyah kullanmadan, renkleri palette karıştırmak yerine tuvale yan yana koyarak doğanın \"izlenimini\" resmetmişlerdir.",
    difficulty: "kolay",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "Nesnelerin tek bir perspektiften değil, aynı anda birden fazla açıdan geometrik formlara bölünerek resmedildiği akım hangisidir?",
    options: ["Pop Sanat", "Noktacılık", "Kübizm", "Minimalizm"],
    correct_answer: "Kübizm",
    fun_fact: "Kübizm, Batı sanatındaki en radikal biçimsel kopuşlardan biridir. Bir gitarı veya yüzü aynı anda profilden, üstten ve alttan parçalanmış fasetler halinde göstererek üç boyutlu nesneyi iki boyutlu tuvale yaymıştır.",
    difficulty: "kolay",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "Hollywood filmleri, reklamlar, Campbell çorba kutuları ve Marilyn Monroe portreleri gibi ticari tüketim nesnelerini galeriye taşıyan 1950-60'ların akımı nedir?",
    options: ["Dadaizm", "Pop Sanat (Pop Art)", "Soyut Dışavurumculuk", "Fütürizm"],
    correct_answer: "Pop Sanat (Pop Art)",
    fun_fact: "Pop Art, elitist yüksek sanat ile sıradan sokak kültürü arasındaki hiyerarşik duvarları yıkmıştır. Kitle iletişim araçlarını ve seri üretim materyallerini kendine konu edinerek Amerikan tüketim kültürünü ironik bir dille yansıtmıştır.",
    difficulty: "kolay",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "Jackson Pollock'un boyayı tuvale damlatarak ve sıçratarak uyguladığı \"Aksiyon Resmi\" tekniği hangi akıma aittir?",
    options: ["Soyut Dışavurumculuk", "Art Deco", "De Stijl", "Sosyal Gerçekçilik"],
    correct_answer: "Soyut Dışavurumculuk",
    fun_fact: "II. Dünya Savaşı sonrası Amerika'da doğan Soyut Dışavurumculuk, sanatçının bilinçaltını fiziksel hareketle tuvale aktarmasını hedefler. Pollock'un damlatma tekniği, resmi yapılış anındaki \"eylemin\" kendisini sanat yapmıştır.",
    difficulty: "kolay",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "19. yüzyılda sanatçıları dünyayı \"birebir, gerçekçi kopyalama\" zorunluluğundan kurtaran ve özellikle İzlenimcileri etkileyen teknolojik icat nedir?",
    options: ["Buharlı Tren", "Matbaa", "Fotoğraf Makinesi", "Telefon"],
    correct_answer: "Fotoğraf Makinesi",
    fun_fact: "Fotoğraf makinesinin yaygınlaşması, ressamları portre ve manzara belgeleme işinden kurtarmıştır. Ressamlar gördüklerini birebir çizmek yerine, fotoğrafın yapamadığı renk, doku ve \"izlenim\" üzerine yoğunlaşmıştır.",
    difficulty: "kolay",
  },
  // MODERN SANAT — ORTA (5)
  {
    category_slug: "modern-sanat-akimlari",
    question: "\"İzlenimcilik\" adını veren ünlü tablonun ressamı ve adı aşağıdakilerden hangisidir?",
    options: ["Edgar Degas – L'Absinthe", "Vincent van Gogh – Yıldızlı Gece", "Édouard Manet – Kırda Öğle Yemeği", "Claude Monet – İzlenim, Gün Doğumu"],
    correct_answer: "Claude Monet – İzlenim, Gün Doğumu",
    fun_fact: "1874'teki sergide eleştirmen Leroy'un \"bu sadece bir taslak\" diyerek aşağıladığı Monet'nin eseri, akımın isim babası olmuştur. Aşağılama amacıyla kullanılan \"empresyonist\" terimi, sanatçılar tarafından onur nişanı olarak benimsenmiştir.",
    difficulty: "orta",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "İzlenimci ressamların domuz mesaneleri yerine açık havada rahatça çalışmasını sağlayan basit teknolojik gelişme nedir?",
    options: ["Metal boya tüpleri", "Şövalye tipi fotoğraf makineleri", "Sentetik naylon fırçalar", "Akrilik boya"],
    correct_answer: "Metal boya tüpleri",
    fun_fact: "Renoir'ın ifadesiyle: \"Tüp boyalar olmasaydı, ne Cézanne ne Monet ne Sisley ne de Pissarro olurdu.\" Metal tüpler, boyaların stüdyo dışında saatlerce kullanılabilmesine olanak tanımıştır.",
    difficulty: "orta",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "Rüyaları, bilinçaltını ve irrasyonaliteyi sanat aracılığıyla keşfetmeyi amaçlayan 1924 tarihli Sürrealist Manifesto'yu kim kaleme almıştır?",
    options: ["Salvador Dali", "Rene Magritte", "André Breton", "Tristan Tzara"],
    correct_answer: "André Breton",
    fun_fact: "Tıbbi eğitim almış ve I. Dünya Savaşı'nda nörolojik koğuşlarda çalışmış olan André Breton, savaşın anlamsızlığının rasyonel aklın ürünü olduğuna inanmış ve kurtuluşu Freudyen psikanalizde aramıştır.",
    difficulty: "orta",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "1909 yılında yayınlanan Fütürizm Manifestosu'nda yeni çağın \"güzelliği\" olarak ne yüceltilmiştir?",
    options: ["Dingin kır manzaraları", "Otomobillerin hızı, makineler, sanayileşme ve hatta şiddet", "Gotik katedrallerin ruhsallığı", "Antik Roma kalıntılarının yeniden inşası"],
    correct_answer: "Otomobillerin hızı, makineler, sanayileşme ve hatta şiddet",
    fun_fact: "Manifestoda, \"kükreyen bir yarış otomobilinin Samothrake'nin Kanatlı Zaferi heykelinden daha güzel olduğu\" iddia edilmiştir. Dinamizm, sanayi ve eylem Fütürizmin temel estetik değerleridir.",
    difficulty: "orta",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "Akademinin reddine uğrayan İzlenimci ressamların 1874'teki ilk bağımsız sergisini düzenledikleri ironik mekan neresidir?",
    options: ["Fotoğrafçı Nadar'ın stüdyosu", "Versay Sarayı bahçeleri", "Güzel Sanatlar Akademisi'nin ana salonu", "Paris Borsası'nın giriş kapısı"],
    correct_answer: "Fotoğrafçı Nadar'ın stüdyosu",
    fun_fact: "Akademiden reddedilen Monet, Renoir, Pissarro ve Degas, ironik bir biçimde resim sanatını tehdit eden teknolojinin — fotoğrafçı Nadar'ın stüdyosunda — ilk bağımsız sergilerini açmışlardır.",
    difficulty: "orta",
  },
  // MODERN SANAT — ZOR (5)
  {
    category_slug: "modern-sanat-akimlari",
    question: "Picasso'nun Kübizm'in habercisi \"Avignonlu Kızlar\" tablosundaki sağ figürlerin maske benzeri vahşi yüzleri hangi kültürlerden doğrudan etkilenmiştir?",
    options: ["Japon Ukiyo-e tahta baskıları", "Rönesans fresklerindeki melek tasvirleri", "İslami hat sanatındaki arabesk motifler", "Antik İberya heykelleri ve Afrika kabile maskeleri"],
    correct_answer: "Antik İberya heykelleri ve Afrika kabile maskeleri",
    fun_fact: "Sol figürlerin yüzleri Antik İberya heykellerinden, sağdaki ürkütücü yüzler ise Paris'e getirilen Afrika (Kongo Teke) kabile maskelerinden doğrudan ilham almıştır. Bu eser Batı sanatındaki en radikal biçimsel kırılma anıdır.",
    difficulty: "zor",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "Richard Hamilton'un Pop Art'ı tanımlayan ünlü mektubunda, akımın özellikleri arasında sayılmayan hangisidir?",
    options: ["Harcanabilir ve kısa vadeli olması", "Kitleler için seri üretim olması", "Ruhsal derinlik ve ilahi aura taşıması", "Gençliğe yönelik, seksi ve büyük ticari iş olması"],
    correct_answer: "Ruhsal derinlik ve ilahi aura taşıması",
    fun_fact: "Pop Art, elitist sanatın aradığı ebedilik ve ruhanilik kavramlarını ironik biçimde reddeder. Tüketim toplumunun geçici, harcanabilir ve seri üretim doğasını yansıtır — \"ilahi aura\" tam olarak Pop Art'ın zıddıdır.",
    difficulty: "zor",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "Georges Seurat'ın öncülüğündeki Yeni İzlenimcilik akımının tanımlayıcı tekniği hangisidir?",
    options: ["Kalın dokulu impasto boya uygulama", "Saf renklerin minik noktalar halinde işlenerek gözde optik karışım sağlanması (Noktacılık)", "Bilinçaltını açığa çıkaran rastgele fırlatma", "Fotoğrafların kesilerek yapıştırılması (Kolaj)"],
    correct_answer: "Saf renklerin minik noktalar halinde işlenerek gözde optik karışım sağlanması (Noktacılık)",
    fun_fact: "Seurat'ın \"La Grande Jatte\" eserinde mavi ve sarı noktalar yan yana konur — uzaktan bakıldığında göz bu iki rengi optik olarak karıştırıp yeşil olarak algılar. İzlenimcilerin hızlı darbelerinin aksine çok yavaş ve hesaplı bir tekniktir.",
    difficulty: "zor",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "Kazimir Maleviç'in \"Siyah Kare\" ve \"Beyaz Üstüne Beyaz Kare\" gibi eserlerle salt hissin üstünlüğünü savunduğu akım hangisidir?",
    options: ["Sosyal Gerçekçilik", "Art Nouveau", "Vortisizm", "Süprematizm"],
    correct_answer: "Süprematizm",
    fun_fact: "Süprematizm, resim sanatını nesnel temsilden tamamen arındıran ilk tam soyutlama hareketlerinden biridir. Maleviç, sanatın amacının gerçekliğe hizmet etmek değil, saf rengin ve formun hissini vermek olduğunu savunmuştur.",
    difficulty: "zor",
  },
  {
    category_slug: "modern-sanat-akimlari",
    question: "Piet Mondrian ve Theo van Doesburg'un öncülüğünde sanatı düz çizgiler, dik açılar ve üç ana renkle sınırlayan \"evrensel görsel dil\" akımının adı nedir?",
    options: ["Arte Povera", "De Stijl (Neoplastisizm)", "Romantizm", "Feminist Sanat"],
    correct_answer: "De Stijl (Neoplastisizm)",
    fun_fact: "I. Dünya Savaşı sonrasında kaos ve yıkıma karşı evrensel bir düzen arayışı olan De Stijl, Mondrian'ın ikonik ızgara planlı tablolarıyla grafik tasarımdan Bauhaus mimarisine kadar her alanı etkilemiştir.",
    difficulty: "zor",
  },
];

async function run() {
  const { count: before } = await supabase
    .from("trivia_questions")
    .select("*", { count: "exact", head: true });
  console.log(`Mevcut soru sayısı: ${before}`);

  const { data, error } = await supabase
    .from("trivia_questions")
    .insert(
      questions.map((q) => ({
        category_slug: q.category_slug,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        fun_fact: q.fun_fact,
        difficulty: q.difficulty,
      }))
    )
    .select("id");

  if (error) {
    console.error("INSERT hatası:", error);
    process.exit(1);
  }

  console.log(`${data.length} yeni soru eklendi!`);

  // Verify per-category counts
  const { data: cats } = await supabase
    .from("trivia_categories")
    .select("slug, title")
    .eq("is_active", true);

  for (const cat of cats || []) {
    const { count } = await supabase
      .from("trivia_questions")
      .select("*", { count: "exact", head: true })
      .eq("category_slug", cat.slug);
    console.log(`  ${cat.title} (${cat.slug}): ${count} soru`);
  }
}

run();
