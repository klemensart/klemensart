-- =============================================================================
-- Trivia Batch 2: 45 Yeni Soru
-- Kategoriler: ronesans-dehasi (15), barok-cagi (15), modern-sanat-akimlari (15)
-- Yeni kategori: barok-cagi
-- Oluşturulma: 2026-03-21
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Yeni Kategori: Barok Çağı
-- -----------------------------------------------------------------------------
INSERT INTO trivia_categories (slug, title, description, icon_emoji, color, is_active)
VALUES (
  'barok-cagi',
  'Barok Çağı',
  '17. yüzyılın dramatik ve görkemli sanat anlayışı: Caravaggio''nun ışık-gölge devriminden Bernini''nin dinamik heykellerine, Versay Sarayı''nın ihtişamından Rembrandt''ın psikolojik derinliğine uzanan Barok dünyasını keşfet.',
  '🎭',
  '#8B5CF6',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Rönesans Soruları (category: ronesans-dehasi)
-- -----------------------------------------------------------------------------

-- KOLAY

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  'Rönesans dönemi 14. yüzyılda hangi coğrafyada başlamış ve daha sonra tüm Batı Avrupa''ya yayılmıştır?',
  '["Fransa (Paris)", "İngiltere (Londra)", "İtalya (Floransa)", "İspanya (Madrid)"]',
  'İtalya (Floransa)',
  'Rönesans''ın tartışmasız beşiği İtalya, özellikle de zengin kültürel ve ticari altyapısıyla Floransa''dır. Roma İmparatorluğu''nun kalıntılarının bu coğrafyada bulunması, klasik antik çağ felsefesine geri dönüşü kolaylaştırmıştır.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  '"Rönesans Adamı" teriminin en yetkin örneği sayılan, "Mona Lisa" ve "Son Akşam Yemeği" gibi başyapıtları üreten sanatçı kimdir?',
  '["Michelangelo Buonarroti", "Raffaello Sanzio", "Leonardo da Vinci", "Donatello"]',
  'Leonardo da Vinci',
  'Leonardo da Vinci, kadavraları inceleyerek kas sistemini araştırmış ve sanata bilimsel bir metodoloji getirmiştir. Bilimsel gözlem ile sanatsal yaratıcılığı kusursuz bir şekilde birleştiren dehasıyla Yüksek Rönesans''ın zirvesini temsil eder.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  'Rönesans sanatının dünyevi konulara yönelmesini sağlayan temel felsefi akım hangisidir?',
  '["Skolastik Düşünce", "Romantizm", "Sürrealizm", "Hümanizm"]',
  'Hümanizm',
  'Hümanizm, insanın evrendeki yerini yeniden tanımlamış; Dante ve Petrarch gibi yazarların antik metinleri yeniden keşfetmesiyle alevlenmiştir. Sanatta dini figürlerin bile daha insani ve duygusal derinliğe sahip biçimde resmedilmesine yol açmıştır.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  'Rönesans sanatçılarının figürleri matematiksel doğrulukla derinliği olan mekânlara yerleştirmesi hangi yeniliği gösterir?',
  '["Noktacılık (Pointillism)", "Lineer perspektif ve gerçekçi manzara (Realizm)", "Damlatma tekniği (Action Painting)", "Soyutlama (Abstraction)"]',
  'Lineer perspektif ve gerçekçi manzara (Realizm)',
  'Orta Çağ sanatında figürler düz, derinliksiz altın arka planlarda resmedilirken, Rönesans ile birlikte matematiksel perspektif sayesinde figürler gerçekçi, üç boyutlu doğal manzaralara yerleştirilmiştir.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  'Rönesans''ın başlamasını tetikleyen, nüfusun yarısının ölmesine rağmen hayatta kalanlar için büyük servet birikimi yaratan tarihi olay hangisidir?',
  '["Fransız İhtilali", "Sanayi Devrimi", "I. Dünya Savaşı", "Veba Salgını (Kara Ölüm - Black Death)"]',
  'Veba Salgını (Kara Ölüm - Black Death)',
  'Bubonik Veba''dan sağ kurtulanlar yüksek ücretler talep edebilmiş ve ciddi servet biriktirmiştir. Bu durum, Medici ailesi gibi güçlü sanat patronlarının ortaya çıkmasına olanak sağlamıştır.',
  'kolay'
);

-- ORTA

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  '"Kuzey Rönesansı"nın en belirgin konu seçimi farkı nedir?',
  '["Sıradan insanların, günlük yaşamın ve ev içi samimi sahnelerin incelikli detaylarla resmedilmesi", "Sadece soyut geometrik desenlerin kullanılması", "Antik Yunan tanrılarının kaslı portrelerinin yapılması", "Sanayi makinelerinin ve hızın yüceltilmesi"]',
  'Sıradan insanların, günlük yaşamın ve ev içi samimi sahnelerin incelikli detaylarla resmedilmesi',
  'Kuzey Rönesansı, Protestan Reformu''nun etkisiyle günlük hayata ve sıradan insanlara yönelmiştir. İncil''den alınan dini sahneler bile görkemli tapınaklarda değil, dönemin sıradan ev ortamlarında tasvir edilmiştir.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  'Leonardo da Vinci''nin ince sır katmanlarıyla keskin sınırları yumuşatarak üç boyutlu derinlik yaratan tekniğinin adı nedir?',
  '["Fresk", "Tenebrizm", "Sfumato", "Impasto"]',
  'Sfumato',
  'İtalyanca "duman gibi dağılmak" anlamına gelen sfumato, "Mona Lisa"da kusursuzlaştırılmıştır. Keskin sınırları ince sır katmanlarıyla yumuşatarak üç boyutlu derinlik illüzyonu yaratır.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  'Floransa Katedrali''nin devasa kubbesini inşa eden mimar kimdir?',
  '["Gian Lorenzo Bernini", "Filippo Brunelleschi", "Sandro Botticelli", "Titian (Tiziano)"]',
  'Filippo Brunelleschi',
  'Brunelleschi''nin kubesi, o döneme kadar çözülememiş bir mühendislik problemiydi ve Rönesans''ın akıl, matematik ve tasarım entegrasyonunun sembolü olmuştur.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  'Rönesans''ta "Klasik Antik Çağ" estetiği hangi elemanlarla kendini gösterir?',
  '["Gotik sivri kemerler ve uçan payandalar", "Figürlerin birden fazla açıdan resmedilmesi", "Modern çelik konstrüksiyonlar", "Sütunlar, kubbeler, simetrik düzenlemeler ve Yunan/Roma mitolojisinden ilham alan kompozisyonlar"]',
  'Sütunlar, kubbeler, simetrik düzenlemeler ve Yunan/Roma mitolojisinden ilham alan kompozisyonlar',
  'Rönesans''ın özü, antik Yunan ve Roma klasisizminin yeniden keşfidir. Gotik sivri kemerler ise Rönesans''ın "barbarca" bularak reddettiği Orta Çağ dönemine aittir.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  'Venedik ekolünün en önemli temsilcisi ve renk kullanımıyla sonraki yüzyılları etkileyen ressam kimdir?',
  '["Jan van Eyck", "Titian (Tiziano Vecellio)", "Georges Seurat", "Jackson Pollock"]',
  'Titian (Tiziano Vecellio)',
  'Floransa ekolü desen ve çizgiye önem verirken, Venedik ekolü Titian önderliğinde renk ve doku kullanımına odaklanmıştır. Titian''ın renk devrimi, Mannerizm ve Barok dönemlerini derinden etkilemiştir.',
  'orta'
);

-- ZOR

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  'İzleyiciye doğru uzatılan bir elin kol kısmının kasten kısa çizildiği, derinlik illüzyonu yaratan ileri düzey perspektif tekniğinin adı nedir?',
  '["Kısaltım (Foreshortening)", "Quadratura", "Trompe l''oeil", "Chiaroscuro"]',
  'Kısaltım (Foreshortening)',
  'İlk olarak Giotto ile başlayan bu teknik, Yüksek Rönesans sanatçıları tarafından anatomi ile birleştirilerek mükemmelleştirilmiştir. İzleyiciye doğru uzatılan bir elin kol kısmının kasten kısa çizilmesiyle derinlik illüzyonu yaratılır.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  'Albrecht Dürer''in çoğaltılabilir bir "yüksek sanat" formuna dönüştürdüğü mecra hangisidir?',
  '["Tempera boya ile ahşap panel resmi", "Mermerden anıtsal heykeller", "Ağaç baskı (woodcut) ve gravür teknikleri", "Islak sıva üzerine tavan freskleri"]',
  'Ağaç baskı (woodcut) ve gravür teknikleri',
  'Matbaanın icadıyla birlikte Dürer, baskıresmi çoğaltılabilir bir yüksek sanat formuna dönüştürmüştür. Bu sayede sanat, okuma yazma bilmeyen kitlelere ve Avrupa''nın uzak köşelerine kadar yayılmıştır.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  '"Proto-Rönesans"ın en büyük ustası kabul edilen, figürlere üç boyutluluk ve insani duygu kazandıran sanatçı kimdir?',
  '["Duccio", "Simone Martini", "Giotto di Bondone", "Cimabue"]',
  'Giotto di Bondone',
  'Giotto''nun Arena Şapeli''ndeki freskleri, İtalyan sanatını Bizans''ın donuk tarzından kurtararak figürlere üç boyutluluk ve gerçek insani duygu eklemiştir. "Bir resmi uzayda bir pencere gibi ele alma" yaklaşımının ilk büyük uygulayıcısıdır.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  '"Yüksek Rönesans" döneminin tarihsel kronolojisi hakkında hangisi doğrudur?',
  '["200 yıl sürmüş durağan bir dönemdir", "Sadece İspanya''da gerçekleşmiştir", "1490''lardan 1527''ye kadar süren, kısa fakat sanatın zirveye ulaştığı bir altın çağdır", "Sanayi Devrimi''ne kadar devam etmiştir"]',
  '1490''lardan 1527''ye kadar süren, kısa fakat sanatın zirveye ulaştığı bir altın çağdır',
  'Yüksek Rönesans sadece 30-35 yıllık bir süreyi kapsar — da Vinci''nin "Son Akşam Yemeği"nden 1527 Roma''nın Yağmalanması''na kadar. Bu kısacık dönemde insanlık tarihinin en ikonik eserleri üretilmiştir.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'ronesans-dehasi',
  'Klasik Rönesans''a tepki olarak ortaya çıkan, bilinçli olarak deforme edilmiş ve uzatılmış figürlerle karakterize edilen geçiş akımı hangisidir?',
  '["Neoklasisizm", "Romantizm", "Mannerizm (Üslupçuluk)", "Dadaizm"]',
  'Mannerizm (Üslupçuluk)',
  'Yüksek Rönesans ustalarının mükemmelliğini tekrarlamak yerine onu bozarak duyguyu ön plana çıkaran Mannerizm yaratılmıştır. Formlar bilinçli olarak deforme edilerek uzatılmış, "serpentine" figürler kullanılmıştır.',
  'zor'
);

-- -----------------------------------------------------------------------------
-- 3. Barok Soruları (category: barok-cagi)
-- -----------------------------------------------------------------------------

-- KOLAY

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'Barok sanatını tanımlayan en ayırt edici görsel özellikler hangisidir?',
  '["Saf renklerin bilimsel kullanımı", "İki boyutlu çizimler", "Hareket, asimetri, yoğun duygu, aşırılık ve teatral drama", "Soyut dışavurumcu çalışmalar"]',
  'Hareket, asimetri, yoğun duygu, aşırılık ve teatral drama',
  'Barok sanat, izleyicinin doğrudan duyularına ve duygularına hitap etmeyi amaçlar. Aşırılık, hareket, bedenlerin kıvrılması ve yüksek tiyatral dram ön plandadır.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'Karanlık arka planlardan fırlayan figürleri sert ışık hüzmeleriyle aydınlatan Tenebrizm akımının öncüsü olan Barok dönem İtalyan ressam kimdir?',
  '["Claude Monet", "Pablo Picasso", "Sandro Botticelli", "Caravaggio"]',
  'Caravaggio',
  'Caravaggio, ışık ve gölgeyi tiyatral bir gerilim yaratacak şekilde kullanan Tenebrizm akımının en büyük öncüsüdür. Sokağın gerçek, terli ve kirli yüzünü aziz tasvirlerinde kullanmasıyla da devrim yaratmıştır.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'Barok dönemde popüler olan ışık-karanlık zıtlığı tekniğinin adı nedir?',
  '["Sfumato", "Chiaroscuro / Tenebrizm", "Fresk", "Kolaj"]',
  'Chiaroscuro / Tenebrizm',
  'Figürlerin derin karanlık içinden yoğun ışıkla aydınlatılması tekniği olan Tenebrizm, Caravaggio tarafından popülerleştirilmiştir. Sahnedeki gerilimi, hacmi ve duygusal etkiyi maksimize eder.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'Fransa''da Barok mimarinin en anıtsal örneği hangisidir?',
  '["Versay Sarayı", "Kolezyum", "Floransa Katedrali", "Partenon"]',
  'Versay Sarayı',
  'XIV. Louis (Güneş Kral) tarafından inşa ettirilen Versay Sarayı, süslü dekorasyonu ve doğaya bile hükmettiğini gösteren geometrik bahçeleriyle devlet otoritesini simgeleyen Barok mimarinin zirve noktasıdır.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  '"Barok" kelimesinin en yaygın kabul gören etimolojik kökeni nedir?',
  '["Yunanca \"ağırlık\" demektir", "Latince \"yeniden doğuş\" anlamına gelir", "Portekizce \"barroco\" — \"kusurlu, düzensiz şekilli inci\"", "Fransızca \"ışık oyunları\" anlamına gelir"]',
  'Portekizce "barroco" — "kusurlu, düzensiz şekilli inci"',
  '19. yüzyılın sonlarına kadar "Barok" kelimesi, sanattaki grotesk ve aşırı süslü durumu tanımlamak için aşağılayıcı bir terim olarak kullanılmıştır. Portekizce düzensiz incileri tanımlayan "barroco" kelimesinden gelir.',
  'kolay'
);

-- ORTA

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'Michelangelo''nun Rönesans "Davut"u ile Bernini''nin Barok "Davut"u arasındaki temel fark nedir?',
  '["Bernini''ninki ahşaptan, Michelangelo''nunki mermerden", "Michelangelo''nunki Golyat''ın başını tutuyor", "İkisi arasında fark yoktur", "Michelangelo''nunki sakin potansiyel anını, Bernini''ninki en dramatik eylem anını gösterir"]',
  'Michelangelo''nunki sakin potansiyel anını, Bernini''ninki en dramatik eylem anını gösterir',
  'Rönesans sanatçısı eylem öncesi akılcı dinginliği seçerken, Barok sanatçısı eylemin tam ortasındaki gerilimi, sarmal hareket eden kasları ve coşkulu dramayı tercih ederek izleyiciyi o anın bir parçası haline getirir.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'Hollanda Altın Çağı''nda Barok sanatın farklılaşmasının sosyolojik nedeni nedir?',
  '["Mermer ocaklarının bulunmaması", "Teknik yetersizlik", "Protestantlık ve sanatı finanse eden zengin tüccar (burjuva) sınıfının ev içi gerçekçi eserler istemesi", "İtalyan tekniklerinden habersiz izolasyon"]',
  'Protestantlık ve sanatı finanse eden zengin tüccar (burjuva) sınıfının ev içi gerçekçi eserler istemesi',
  'Protestan Hollanda''da kilise duvarlarında dini resimlere sıcak bakılmazdı. Sanatın yeni patronları, kendi mütevazı ama lüks hayatlarını yansıtan portreler, natürmortlar ve günlük yaşam sahneleri isteyen Hollandalı burjuvalardı.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  '"İlk gerçek Barok cephe" hangi yapıya aittir?',
  '["Notre Dame Katedrali", "Roma''daki Il Gesu Kilisesi", "St. Paul Katedrali", "Floransa Katedrali Vaftizhanesi"]',
  'Roma''daki Il Gesu Kilisesi',
  '1584''te tamamlanan Il Gesu Kilisesi''nin cephesi, sütunların duvar içine gömülmesi ve hacimsel dalgalanmalarıyla Rönesans''ın düzlemsel oranlarından kopmuştur. Karşı-Reformasyon mimarisinin prototipi olarak dünya çapındaki Cizvit kiliselerine ilham vermiştir.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'Barok dönem kentsel planlama felsefesi nasıl karakterize edilir?',
  '["Merkeze anıtsal yapı, dairesel meydanlar ve geniş aksiyel bulvarlar", "Rastgele labirent sokaklar", "Açık meydan bırakmamak", "Sadece yaya yolları"]',
  'Merkeze anıtsal yapı, dairesel meydanlar ve geniş aksiyel bulvarlar',
  'Barok dönem, mimari değerlerin tek bir bina ölçeğinden çıkıp tüm şehre uygulandığı ilk dönemdir. Otoritenin vizyonunu yansıtmak amacıyla şehirler, merkezdeki anıtsal yapılar etrafında geniş bulvarlarla tasarlanmıştır.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'Trento Konsili''nin Barok sanatı üzerindeki etkisi ne olmuştur?',
  '["Her türlü tasvirin yasaklanması", "Sanatın ihtişamlı bir propaganda aracı olarak kullanılmasına hükmedilmesi", "Pagan mitolojilerin resmedilmesinin zorunlu tutulması", "Gotik mimariye geri dönülmesi"]',
  'Sanatın ihtişamlı bir propaganda aracı olarak kullanılmasına hükmedilmesi',
  'Katolik Kilisesi''nin Protestanlığa karşı başlattığı Karşı-Reformasyon''un sonucu olarak Trento Konsili, sanatın halkın duyularına hitap edecek kadar ihtişamlı olmasını talep etmiştir. Bu kararlar, tavanların gökyüzüne açılıyormuş gibi illüzyonist fresklerle donatılmasına yol açmıştır.',
  'orta'
);

-- ZOR

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  '17. yüzyıl Barok manzara resminde insanların küçücük figürler olarak resmedilmesinin nedeni nedir?',
  '["Anatomi çizmeyi unutmuş olmaları", "Kopernik devrimi sonucunda insanın evren karşısındaki önemsizliği hissi", "Kilisenin vergi uygulaması", "Matbaanın teknik kısıtları"]',
  'Kopernik devrimi sonucunda insanın evren karşısındaki önemsizliği hissi',
  'Kopernik''in Güneş merkezli modelinin kabul görmesi, insanın evrenin merkezindeki ayrıcalıklı tahtını yıkmıştır. Bu radikal küçülüş sanata doğrudan yansımış; manzara resimlerindeki insan figürleri doğanın görkemi karşısında ezilen minik lekelere dönüşmüştür.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'Caravaggio''nun "Aziz Matta''ya Çağrı" tablosunda dramayı en üst düzeye çıkaran görsel unsur nedir?',
  '["Tavanda uçuşan altın kanatlı melekler", "Pencerenin yönünden sahneye çaprazlama giren keskin ışık hüzmesi", "Altın yaldızlı gerçeküstü arka plan", "Matta''nın diğer figürlerden çok daha büyük çizilmesi"]',
  'Pencerenin yönünden sahneye çaprazlama giren keskin ışık hüzmesi',
  'Caravaggio''nun eserinde geleneksel göksel melekler yerine, olay karanlık bir Roma meyhanesinde geçer. Mucize, dışarıdan odayı çaprazlama kesen tek bir ilahi ışık hüzmesi ile sağlanır — bu anlık, gerçekçi drama Barok resmin kusursuz bir örneğidir.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'İspanyol Barok''undaki hiper-dekoratif, aşırı süslü mimari alt üslubun adı nedir?',
  '["Brutalizm", "Rokoko", "Palladyan", "Churrigueresque (Çurrigueresk)"]',
  'Churrigueresque (Çurrigueresk)',
  'Churrigueresque üslubu, Barok''un süsleme eğilimini ekstrem noktalara taşımış; bolca yaldız, karmaşık bitkisel oymalar ve aşırı yoğun yüzey dokularıyla mimari formun önüne geçen bir dekoratif patlama yaratmıştır.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'Barok sanatın tarihteki "ilk küresel görsel stil" olmasını sağlayan mekanizma nedir?',
  '["Sömürgeci girişimler, ticaret ağları ve misyonerlik faaliyetleri aracılığıyla dünyaya taşınması", "Fotoğraf makinesiyle kopyalanması", "Budist rahiplerin gönüllü olarak taşıması", "Napolyon''un zorla götürmesi"]',
  'Sömürgeci girişimler, ticaret ağları ve misyonerlik faaliyetleri aracılığıyla dünyaya taşınması',
  'Barok stil, İspanyol ve Portekiz imparatorluklarının sömürgeci girişimleri ve Cizvit misyonerleri sayesinde Latin Amerika''ya ve Asya''ya kadar ulaşmıştır. Meksika''daki yerel ustalar tarafından yerel malzeme ve zevklerle harmanlanarak adapte edilmiştir.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'barok-cagi',
  'Rembrandt''ın "Gece Devriyesi" tablosu geleneksel grup portrelerinden nasıl ayrılır?',
  '["Hepsinin yan yana dizilmesi", "Siyah-beyaz kullanımı", "Dramatik ışık altında eyleme geçtikleri dinamik bir anın resmedilmesi", "Sadece gece manzarası"]',
  'Dramatik ışık altında eyleme geçtikleri dinamik bir anın resmedilmesi',
  'Rembrandt, donuk lonca portreleri geleneğini yıkmıştır. Birliği devriyeye çıkmak üzere harekete geçtikleri kaotik bir anda, güçlü ışık-gölge ve çapraz kompozisyonla resmederek eşi görülmemiş bir anlatı yaratmıştır.',
  'zor'
);

-- -----------------------------------------------------------------------------
-- 4. Modern Sanat Soruları (category: modern-sanat-akimlari)
-- -----------------------------------------------------------------------------

-- KOLAY

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  '1870''lerde Fransa''da ortaya çıkan, açık havada ışığın anlık değişimini yakalamayı hedefleyen akım hangisidir?',
  '["İzlenimcilik (Empresyonizm)", "Romantizm", "Neoklasisizm", "Sürrealizm"]',
  'İzlenimcilik (Empresyonizm)',
  'İzlenimciler, akademinin dayattığı kusursuz çizgi ve tarihi temaları reddetmiştir. Siyah kullanmadan, renkleri palette karıştırmak yerine tuval üzerine yan yana koyarak doğanın "izlenimini" resmetmişlerdir.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  'Nesnelerin aynı anda birden fazla açıdan geometrik formlara bölünerek resmedildiği akım hangisidir?',
  '["Pop Sanat", "Noktacılık", "Kübizm", "Minimalizm"]',
  'Kübizm',
  'Kübizm, Batı sanatındaki en radikal biçimsel kopuşlardan biridir. Bir gitarı veya bir yüzü aynı anda profilden, üstten ve alttan parçalanmış fasetler halinde göstererek üç boyutlu nesneyi iki boyutlu tuvale yaymıştır.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  'Campbell çorba kutuları ve Marilyn Monroe portrelerini galeriye taşıyan akım nedir?',
  '["Dadaizm", "Pop Sanat (Pop Art)", "Soyut Dışavurumculuk", "Fütürizm"]',
  'Pop Sanat (Pop Art)',
  'Pop Art, elitist yüksek sanat ile sıradan sokak kültürü arasındaki hiyerarşik duvarları yıkmıştır. Kitle iletişim araçlarını ve seri üretim materyallerini kendine konu edinerek Amerikan tüketim kültürünü ironik bir dille yansıtmıştır.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  'Jackson Pollock''un "Aksiyon Resmi" tekniği hangi akımın parçasıdır?',
  '["Soyut Dışavurumculuk", "Art Deco", "De Stijl", "Sosyal Gerçekçilik"]',
  'Soyut Dışavurumculuk',
  'II. Dünya Savaşı sonrası Amerika''da doğan Soyut Dışavurumculuk, sanatçının bilinçaltı duygularını fiziksel hareketle tuvale aktarmasını hedefler. Pollock''un damlatma tekniği, resmi yapılış anındaki "eylemin" kendisini sanat haline getirmiştir.',
  'kolay'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  '19. yüzyılda sanatçıları "birebir kopyalama" zorunluluğundan kurtaran teknolojik icat nedir?',
  '["Buharlı Tren", "Matbaa", "Fotoğraf Makinesi", "Telefon"]',
  'Fotoğraf Makinesi',
  'Fotoğraf makinesinin yaygınlaşması, ressamları portre ve manzara belgeleme işinden kurtarmıştır. Ressamlar gördüklerini birebir çizmek yerine, fotoğrafın yapamadığı renk, doku ve "izlenim" üzerine yoğunlaşmıştır.',
  'kolay'
);

-- ORTA

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  '"İzlenimcilik" adını veren tablo ve ressamı hangisidir?',
  '["Edgar Degas - L''Absinthe", "Van Gogh - Yıldızlı Gece", "Manet - Kırda Öğle Yemeği", "Claude Monet - İzlenim, Gün Doğumu"]',
  'Claude Monet - İzlenim, Gün Doğumu',
  '1874''teki sergide eleştirmen Leroy''un "bu sadece bir taslak" diyerek aşağıladığı Monet''nin eseri, akımın isim babası olmuştur. Aşağılama amacıyla kullanılan "empresyonist" terimi, sanatçılar tarafından onur nişanı olarak benimsenmiştir.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  'İzlenimci ressamların açık havada çalışmasını mümkün kılan teknolojik gelişme nedir?',
  '["Metal boya tüpleri", "Fotoğraf makineleri", "Sentetik naylon fırçalar", "Akrilik boya"]',
  'Metal boya tüpleri',
  'Renoir''ın ifadesiyle: "Tüp boyalar olmasaydı, ne Cézanne ne Monet ne Sisley ne de Pissarro olurdu." Metal tüpler, boyaların stüdyo dışında saatlerce kullanılabilmesine olanak tanımıştır.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  '1924 tarihli Sürrealist Manifesto''yu kim kaleme almıştır?',
  '["Salvador Dali", "Rene Magritte", "André Breton", "Tristan Tzara"]',
  'André Breton',
  'Tıbbi eğitim almış ve I. Dünya Savaşı''nda nörolojik koğuşlarda çalışmış olan André Breton, savaşın anlamsızlığının rasyonel aklın ürünü olduğuna inanmış ve kurtuluşu Freudyen psikanalizde aramıştır.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  '1909 Fütürizm Manifestosu''nda yeni çağın güzelliği olarak ne yüceltilmiştir?',
  '["Dingin kır manzaraları", "Otomobillerin hızı, makineler, sanayileşme ve hatta şiddet", "Gotik katedrallerin ruhsallığı", "Antik Roma kalıntıları"]',
  'Otomobillerin hızı, makineler, sanayileşme ve hatta şiddet',
  'Manifestoda, "kükreyen bir yarış otomobilinin Samothrake''nin Kanatlı Zaferi heykelinden daha güzel olduğu" iddia edilmiştir. Dinamizm, sanayi, teknoloji ve eylem Fütürizmin temel estetik değerleridir.',
  'orta'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  'İlk İzlenimci Sergi 1874''te nerede düzenlenmiştir?',
  '["Fotoğrafçı Nadar''ın stüdyosunda", "Versay Sarayı bahçelerinde", "Güzel Sanatlar Akademisi''nde", "Paris Borsası''nda"]',
  'Fotoğrafçı Nadar''ın stüdyosunda',
  'Akademinin katı jürisinden reddedilen Monet, Renoir, Pissarro ve Degas, ironik bir biçimde resim sanatını tehdit eden teknolojinin — fotoğrafçı Nadar''ın stüdyosunda — ilk bağımsız sergilerini açmışlardır.',
  'orta'
);

-- ZOR

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  'Picasso''nun "Avignonlu Kızlar"daki sağ figürlerin maske benzeri yüzleri hangi kültürlerden etkilenmiştir?',
  '["Japon Ukiyo-e baskılarından", "Rönesans fresklerinden", "İslami hat sanatından", "Antik İberya heykelleri ve Afrika kabile maskelerinden"]',
  'Antik İberya heykelleri ve Afrika kabile maskelerinden',
  'Sol kısımdaki figürlerin yüzleri Antik İberya heykellerinden, sağdaki ürkütücü yüzler ise Paris''e getirilen Afrika (Kongo Teke) kabile maskelerinden doğrudan ilham almıştır.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  'Richard Hamilton''ın Pop Art tanımında sayılmayan özellik hangisidir?',
  '["Harcanabilir ve kısa vadeli olması", "Kitleler için seri üretim olması", "Ruhsal derinlik ve ilahi aura taşıması", "Gençliğe yönelik, seksi ve büyük ticari iş olması"]',
  'Ruhsal derinlik ve ilahi aura taşıması',
  'Pop Art, elitist sanatın aradığı ebedilik ve ruhanilik kavramlarını ironik bir şekilde reddeder. Tüketim toplumunun geçici, harcanabilir ve seri üretim doğasını yansıtır.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  'Georges Seurat''ın öncülüğündeki Yeni İzlenimcilik tekniği hangisidir?',
  '["Kalın dokulu impasto", "Saf renklerin minik noktalar halinde yan yana işlenerek gözde optik karışım sağlanması (Noktacılık)", "Bilinçaltını açığa çıkaran rastgele fırlatma", "Kesilen fotoğrafların yapıştırılması (Kolaj)"]',
  'Saf renklerin minik noktalar halinde yan yana işlenerek gözde optik karışım sağlanması (Noktacılık)',
  'Seurat''ın "La Grande Jatte" eserinde mavi ve sarı noktalar yan yana konur — uzaktan bakıldığında göz bu iki rengi optik olarak karıştırıp yeşil olarak algılar. İzlenimcilerin hızlı darbelerinin aksine son derece yavaş ve hesaplı bir tekniktir.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  'Kazimir Maleviç''in "Siyah Kare" ile savunduğu, resmi nesnel temsilden tamamen arındıran akım hangisidir?',
  '["Sosyal Gerçekçilik", "Art Nouveau", "Vortisizm", "Süprematizm"]',
  'Süprematizm',
  'Süprematizm, resim sanatını nesnel temsilden tamamen arındıran ilk tam soyutlama hareketlerinden biridir. Maleviç, sanatın amacının gerçekliğe hizmet etmek değil, saf rengin ve formun hissini vermek olduğunu savunmuştur.',
  'zor'
);

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty)
VALUES (
  'modern-sanat-akimlari',
  'Piet Mondrian ve Theo van Doesburg''un öncülük ettiği, sanatı düz çizgiler ve üç ana renkle sınırlayan akım hangisidir?',
  '["Arte Povera", "De Stijl (Neoplastisizm)", "Romantizm", "Feminist Sanat"]',
  'De Stijl (Neoplastisizm)',
  'I. Dünya Savaşı sonrasında kaos ve yıkıma karşı evrensel bir düzen arayışı olan De Stijl, Mondrian''ın ikonik ızgara planlı tablolarıyla grafik tasarımdan Bauhaus mimarisine kadar her alanı etkilemiştir.',
  'zor'
);
