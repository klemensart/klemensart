-- Sanat Raundu: Seed Data
-- 3 Kategori + ~45 Soru

-- Önce mevcut verileri temizle (idempotent)
DELETE FROM trivia_questions;
DELETE FROM trivia_categories;

-- ═══════════════════════════════════════════════════════════════
-- KATEGORİLER
-- ═══════════════════════════════════════════════════════════════

INSERT INTO trivia_categories (slug, title, description, icon_emoji, color) VALUES
  ('ronesans-dehasi', 'Rönesans Dehası', 'Leonardo, Michelangelo, Raffaello ve Botticelli… Rönesans''ın büyük ustalarını ne kadar tanıyorsunuz?', '🏛️', '#C9A84C'),
  ('modern-sanat-akimlari', 'Modern Sanat Akımları', 'Empresyonizm''den Soyut Ekspresyonizm''e uzanan yolculukta bilginizi test edin.', '🎨', '#FF6D60'),
  ('turk-sanati', 'Türk Sanatı', 'Osman Hamdi Bey''den Fahrelnissa Zeid''e, Türk sanatının büyük isimlerini keşfedin.', '🇹🇷', '#E74C3C');

-- ═══════════════════════════════════════════════════════════════
-- RÖNESANS DEHASI (~15 soru)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty) VALUES

-- KOLAY (5)
('ronesans-dehasi',
 'Mona Lisa tablosunu kim yapmıştır?',
 '["Leonardo da Vinci","Raffaello Sanzio","Michelangelo","Sandro Botticelli"]',
 'Leonardo da Vinci',
 'Mona Lisa, Louvre Müzesi''nde kurşun geçirmez camın ardında sergilenir ve yılda yaklaşık 10 milyon kişi tarafından ziyaret edilir.',
 'kolay'),

('ronesans-dehasi',
 'Sistine Şapeli''nin tavanını hangi sanatçı boyamıştır?',
 '["Michelangelo","Leonardo da Vinci","Raffaello Sanzio","Tiziano"]',
 'Michelangelo',
 'Michelangelo, tavandaki freskleri tamamlamak için 4 yıl boyunca (1508-1512) çoğunlukla ayakta, başını yukarı kaldırarak çalışmıştır.',
 'kolay'),

('ronesans-dehasi',
 'Venüs''ün Doğuşu tablosu hangi müzede sergilenmektedir?',
 '["Uffizi Galerisi, Floransa","Louvre Müzesi, Paris","Prado Müzesi, Madrid","National Gallery, Londra"]',
 'Uffizi Galerisi, Floransa',
 'Botticelli''nin bu başyapıtı, aşk tanrıçası Venüs''ün deniz köpüklerinden doğuşunu tasvir eder ve yaklaşık 1.72 × 2.78 metre boyutlarındadır.',
 'kolay'),

('ronesans-dehasi',
 'Davut heykeli kaç metre yüksekliğindedir?',
 '["5.17 metre","3.50 metre","7.20 metre","2.80 metre"]',
 '5.17 metre',
 'Michelangelo bu dev heykeli tek bir mermer bloktan yontmuştur. Mermer bloğu daha önce başka iki heykeltıraş denemiş ama başarısız olmuştu.',
 'kolay'),

('ronesans-dehasi',
 'Son Akşam Yemeği tablosu hangi şehirde bulunur?',
 '["Milano","Floransa","Roma","Venedik"]',
 'Milano',
 'Leonardo bu duvar resmini Santa Maria delle Grazie kilisesinin yemekhanesine yapmıştır. Fresk tekniği yerine deneysel bir yöntem kullandığı için eser hızla bozulmaya başlamıştır.',
 'kolay'),

-- ORTA (5)
('ronesans-dehasi',
 'Raffaello''nun "Atina Okulu" freskinde merkezde hangi iki filozof yer alır?',
 '["Platon ve Aristoteles","Sokrates ve Platon","Aristoteles ve İskender","Pisagor ve Öklid"]',
 'Platon ve Aristoteles',
 'Platon''un yüz hatları Leonardo da Vinci''den, Herakleitos figürü ise Michelangelo''dan esinlenilerek çizilmiştir.',
 'orta'),

('ronesans-dehasi',
 'Jan van Eyck''in "Arnolfini''nin Evliliği" tablosundaki aynada ne görülür?',
 '["Ressamın yansıması","Bir melek","Boş bir oda","Bir manzara"]',
 'Ressamın yansıması',
 'Dışbükey aynada iki figür ve muhtemelen ressamın kendisi de dahil olmak üzere iki kişi daha görülür. Aynanın üstünde "Johannes de Eyck fuit hic" (Jan van Eyck buradaydı) yazılıdır.',
 'orta'),

('ronesans-dehasi',
 'Leonardo da Vinci''nin sfumato tekniği ne anlama gelir?',
 '["Yumuşak geçişli, dumansı boyama","Kalın boya katmanları","Keskin kontur çizgileri","Altın varak uygulama"]',
 'Yumuşak geçişli, dumansı boyama',
 'Sfumato İtalyanca "duman" anlamına gelir. Leonardo, ince boya katmanlarını üst üste uygulayarak görünür fırça izi bırakmadan yumuşak geçişler elde etmiştir.',
 'orta'),

('ronesans-dehasi',
 'Michelangelo''nun Pietà heykeli hangi özelliğiyle benzersizdir?',
 '["İmzasını taşıyan tek eseridir","En büyük eseridir","Bronzdan yapılmıştır","Tamamlanmamış bırakılmıştır"]',
 'İmzasını taşıyan tek eseridir',
 'Rivayete göre Michelangelo, eserin başka bir sanatçıya atfedildiğini duyunca bir gece gizlice kiliseye girip Meryem''in göğüs bandına adını kazımıştır.',
 'orta'),

('ronesans-dehasi',
 'Tiziano Vecellio hangi resim okulunun en önemli temsilcisidir?',
 '["Venedik Okulu","Floransa Okulu","Roma Okulu","Siena Okulu"]',
 'Venedik Okulu',
 'Tiziano, renk kullanımındaki ustalığıyla bilinir. Avrupa''nın en güçlü hükümdarları — V. Karl, II. Felipe — portrelerini ona yaptırmıştır.',
 'orta'),

-- ZOR (5)
('ronesans-dehasi',
 'Piero della Francesca''nın "İsa''nın Kırbaçlanması" tablosundaki perspektif kaçış noktası nerededir?',
 '["Tam merkezde, İsa''nın arkasında","Sol alt köşede","Sağ üst köşede","Tablonun dışında"]',
 'Tam merkezde, İsa''nın arkasında',
 'Piero della Francesca aynı zamanda bir matematikçiydi ve "De Prospectiva Pingendi" adlı perspektif üzerine bir matematik kitabı yazmıştır.',
 'zor'),

('ronesans-dehasi',
 'Masaccio''nun "Kutsal Üçlü" freski hangi teknik açıdan devrim niteliğindedir?',
 '["Doğrusal perspektifin ilk büyük uygulaması","İlk yağlıboya tablo","İlk peyzaj resmi","İlk oto-portre"]',
 'Doğrusal perspektifin ilk büyük uygulaması',
 'Masaccio sadece 27 yaşında ölmesine rağmen, Rönesans resminin temellerini atmıştır. Brunelleschi''nin perspektif keşiflerini resme uygulayan ilk sanatçıdır.',
 'zor'),

('ronesans-dehasi',
 'Lorenzo Ghiberti''nin Floransa Vaftizhanesi kapılarını tamamlaması kaç yıl sürmüştür?',
 '["27 yıl","10 yıl","5 yıl","40 yıl"]',
 '27 yıl',
 'Bu kapılara "Cennetin Kapıları" adını bizzat Michelangelo vermiştir. Ghiberti, kapılar için düzenlenen yarışmayı Brunelleschi''yi yenerek kazanmıştı.',
 'zor'),

('ronesans-dehasi',
 'Andrea Mantegna''nın "Ölü İsa''ya Ağıt" tablosu hangi teknikle ünlüdür?',
 '["Kısaltılmış perspektif (foreshortening)","Sfumato","Chiaroscuro","Trompe-l''oeil"]',
 'Kısaltılmış perspektif (foreshortening)',
 'Mantegna, İsa''nın bedenini izleyiciye doğru yatan bir açıdan göstererek cesur bir perspektif kullanmıştır. Bu teknik dönemin en radikal deneylerinden biriydi.',
 'zor'),

('ronesans-dehasi',
 'Giorgione''nin "Fırtına" tablosunun konusu neden özeldir?',
 '["Konusu hâlâ tartışmalıdır ve kesin olarak bilinmemektedir","İlk savaş sahnesidir","İlk çıplak figür içerir","En pahalı tablodur"]',
 'Konusu hâlâ tartışmalıdır ve kesin olarak bilinmemektedir',
 'Giorgione genç yaşta vebadan ölmüştür ve çok az eseri günümüze ulaşmıştır. "Fırtına", Batı sanatında ilk saf manzara resimlerinden biri kabul edilir.',
 'zor');


-- ═══════════════════════════════════════════════════════════════
-- MODERN SANAT AKIMLARI (~15 soru)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty) VALUES

-- KOLAY (5)
('modern-sanat-akimlari',
 'Claude Monet hangi sanat akımının öncüsüdür?',
 '["Empresyonizm","Kübizm","Fovizm","Sürrealizm"]',
 'Empresyonizm',
 'Akımın adı Monet''nin "İzlenim: Gün Doğumu" (1872) tablosundan gelir. Bir eleştirmen bu tabloyu küçümsemek için "empresyonist" terimini kullanmıştı.',
 'kolay'),

('modern-sanat-akimlari',
 'Pablo Picasso hangi sanat akımının kurucularından biridir?',
 '["Kübizm","Empresyonizm","Fovizm","Art Nouveau"]',
 'Kübizm',
 'Picasso, Georges Braque ile birlikte Kübizm''i geliştirmiştir. Nesneleri birden fazla açıdan aynı anda göstermeyi amaçlayan bu akım, 20. yüzyıl sanatını kökünden değiştirmiştir.',
 'kolay'),

('modern-sanat-akimlari',
 'Salvador Dalí hangi sanat akımıyla özdeşleşmiştir?',
 '["Sürrealizm","Dadaizm","Pop Art","Minimalizm"]',
 'Sürrealizm',
 'Dalí''nin "Belleğin Azmi" (1931) tablosundaki eriyen saatler, Sürrealizm''in en ikonik imgelerinden biridir.',
 'kolay'),

('modern-sanat-akimlari',
 'Andy Warhol''un Campbell''s Çorba Kutuları hangi akıma aittir?',
 '["Pop Art","Minimalizm","Soyut Ekspresyonizm","Kavramsal Sanat"]',
 'Pop Art',
 'Warhol, 1962''de 32 farklı Campbell''s çorba kutusunu resimlemiştir — her biri farklı bir çeşit. Bu seri, Pop Art''ın manifestosu sayılır.',
 'kolay'),

('modern-sanat-akimlari',
 'Vincent van Gogh''un "Yıldızlı Gece" tablosu hangi akımla ilişkilendirilir?',
 '["Post-Empresyonizm","Empresyonizm","Ekspresyonizm","Fovizm"]',
 'Post-Empresyonizm',
 'Van Gogh bu tabloyu Saint-Rémy-de-Provence''deki akıl hastanesinde, odasının penceresinden gördüğü manzaradan esinlenerek yapmıştır.',
 'kolay'),

-- ORTA (5)
('modern-sanat-akimlari',
 'Marcel Duchamp''ın 1917''de sergilediği "Çeşme" (Fountain) adlı eser nedir?',
 '["Ters çevrilmiş bir pisuar","Bir çeşme heykeli","Bir cam kap","Bir musluk"]',
 'Ters çevrilmiş bir pisuar',
 'Duchamp, seri üretim bir pisuarı imzalayıp sanat eseri olarak sergileyerek "hazır nesne" (readymade) kavramını ortaya atmış ve sanatın tanımını sorgulamıştır.',
 'orta'),

('modern-sanat-akimlari',
 'Piet Mondrian''ın geometrik soyut tabloları hangi akıma aittir?',
 '["De Stijl (Neoplastisizm)","Bauhaus","Konstrüktivizm","Suprematizm"]',
 'De Stijl (Neoplastisizm)',
 'Mondrian sadece birincil renkler (kırmızı, mavi, sarı) ve nötr tonlar (siyah, beyaz, gri) kullanarak evrensel uyumu ifade etmeyi amaçlamıştır.',
 'orta'),

('modern-sanat-akimlari',
 'Jackson Pollock''un "drip painting" tekniğinde tuval nereye yerleştirilir?',
 '["Yere","Duvara","Şövaleye","Tavana"]',
 'Yere',
 'Pollock tuvali yere serip üzerinde yürüyerek, boyayı damlatarak ve sıçratarak çalışırdı. Bu yönteme "aksiyon resmi" (action painting) denir.',
 'orta'),

('modern-sanat-akimlari',
 'Fovizm akımının öncüsü kimdir?',
 '["Henri Matisse","Pablo Picasso","Georges Braque","Paul Cézanne"]',
 'Henri Matisse',
 '"Fov" Fransızca''da "vahşi hayvan" anlamına gelir. 1905''teki Salon d''Automne sergisinde bir eleştirmen, parlak renkleri nedeniyle bu sanatçıları "les fauves" (vahşi hayvanlar) olarak adlandırmıştır.',
 'orta'),

('modern-sanat-akimlari',
 'Dadaizm hangi tarihsel olayın etkisiyle doğmuştur?',
 '["I. Dünya Savaşı","II. Dünya Savaşı","Fransız Devrimi","Sanayi Devrimi"]',
 'I. Dünya Savaşı',
 'Dada, 1916''da Zürih''teki Cabaret Voltaire''de başlamıştır. Savaşın yarattığı yıkıma tepki olarak mantığı, estetiği ve burjuva değerlerini reddeden bir anti-sanat hareketi olarak doğmuştur.',
 'orta'),

-- ZOR (5)
('modern-sanat-akimlari',
 'Kazimir Maleviç''in 1915''te sergilediği "Siyah Kare" hangi akımın manifestosudur?',
 '["Suprematizm","Konstrüktivizm","De Stijl","Minimalizm"]',
 'Suprematizm',
 'Maleviç, beyaz bir tuval üzerine siyah bir kare çizerek nesnelerin temsilinden tamamen kopmuş ve "saf hissin üstünlüğü"nü (suprematia) ilan etmiştir.',
 'zor'),

('modern-sanat-akimlari',
 'Clement Greenberg hangi sanat akımının en etkili savunucusu olmuştur?',
 '["Soyut Ekspresyonizm","Pop Art","Minimalizm","Kavramsal Sanat"]',
 'Soyut Ekspresyonizm',
 'Greenberg, sanatın özünün "düzlük" (flatness) olduğunu savunarak Pollock, de Kooning ve Rothko gibi sanatçıları desteklemiştir. New York''u sanat dünyasının merkezi haline getirmiştir.',
 'zor'),

('modern-sanat-akimlari',
 'Robert Rauschenberg''in Willem de Kooning''in bir çizimini silmesiyle ortaya çıkan eser ne olarak adlandırılır?',
 '["Erased de Kooning Drawing","Untitled","White Paintings","Blank Canvas"]',
 'Erased de Kooning Drawing',
 'Rauschenberg, 1953''te genç bir sanatçıyken de Kooning''den bir çizim istemiş ve onu silmenin yaratıcı bir eylem olup olamayacağını sorgulamıştır. Silme işlemi yaklaşık bir ay sürmüştür.',
 'zor'),

('modern-sanat-akimlari',
 'Yves Klein''in patentli mavisi hangi adla bilinir?',
 '["International Klein Blue (IKB)","Cobalt Blue","Klein Ultramarine","Bleu Royal"]',
 'International Klein Blue (IKB)',
 'Klein, 1960''ta Paris''te bir galeriyi tamamen boş bırakarak "Le Vide" (Boşluk) sergisini açmış, 3.000''den fazla kişi katılmıştır.',
 'zor'),

('modern-sanat-akimlari',
 'Joseph Beuys''un "7000 Meşe" projesi hangi akıma örnek gösterilir?',
 '["Fluxus / Sosyal Heykel","Land Art","Arte Povera","Minimalizm"]',
 'Fluxus / Sosyal Heykel',
 'Beuys, 1982''de Kassel''deki documenta 7''de 7.000 meşe ağacı dikmeyi önermiş ve her ağacın yanına bir bazalt taş koymuştur. Projenin tamamlanması 5 yıl sürmüştür.',
 'zor');


-- ═══════════════════════════════════════════════════════════════
-- TÜRK SANATI (~15 soru)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO trivia_questions (category_slug, question, options, correct_answer, fun_fact, difficulty) VALUES

-- KOLAY (5)
('turk-sanati',
 '"Kaplumbağa Terbiyecisi" tablosunu kim yapmıştır?',
 '["Osman Hamdi Bey","Şeker Ahmet Paşa","Hoca Ali Rıza","İbrahim Çallı"]',
 'Osman Hamdi Bey',
 'Bu tablo, 2004 yılında 5 milyon TL''ye (dönemin en yüksek rakamı) satılarak Türk resim tarihinin en pahalı tablosu olmuştur. Osmanlı''da Batılılaşma sürecini alegorik olarak eleştirir.',
 'kolay'),

('turk-sanati',
 'Fahrelnissa Zeid hangi sanat türüyle uluslararası üne kavuşmuştur?',
 '["Soyut resim","Minyatür","Kaligrafi","Heykel"]',
 'Soyut resim',
 'Fahrelnissa Zeid, Osmanlı hanedanına mensup bir prensesti. Dev boyutlu soyut tabloları 1950''lerde Paris ve Londra''da büyük ilgi görmüştür.',
 'kolay'),

('turk-sanati',
 'Türkiye''nin ilk resim okulu "Sanayi-i Nefise Mektebi" hangi yıl kurulmuştur?',
 '["1882","1923","1850","1900"]',
 '1882',
 'Bugünkü Mimar Sinan Güzel Sanatlar Üniversitesi''nin temeli olan bu okul, Osman Hamdi Bey tarafından kurulmuştur.',
 'kolay'),

('turk-sanati',
 'Devrim Erbil hangi konularıyla tanınır?',
 '["İstanbul manzaraları","Portreler","Natürmort","Savaş sahneleri"]',
 'İstanbul manzaraları',
 'Devrim Erbil, İstanbul''u kuş bakışı perspektiften renkli ve ritmik bir üslupla resmetmesiyle tanınır. Eserleri birçok uluslararası koleksiyonda yer alır.',
 'kolay'),

('turk-sanati',
 'Hoca Ali Rıza hangi resim türüyle ünlüdür?',
 '["Peyzaj (manzara)","Portre","Natürmort","Soyut"]',
 'Peyzaj (manzara)',
 'Hoca Ali Rıza, İstanbul ve Üsküdar''ın doğal güzelliklerini suluboya ve yağlıboyayla resmeden Türk resminin en önemli peyzaj ustalarından biridir.',
 'kolay'),

-- ORTA (5)
('turk-sanati',
 'Osman Hamdi Bey aynı zamanda hangi alanda önemli çalışmalar yapmıştır?',
 '["Arkeoloji","Mimarlık","Müzik","Edebiyat"]',
 'Arkeoloji',
 'Osman Hamdi Bey, Sayda (Sidon) Kral Mezarlığı''ndaki kazıları yönetmiş ve İskender Lahdi''ni keşfetmiştir. Ayrıca İstanbul Arkeoloji Müzesi''ni kurmuştur.',
 'orta'),

('turk-sanati',
 'Bedri Rahmi Eyüboğlu''nun sanatında hangi motifler öne çıkar?',
 '["Anadolu halk motifleri ve kilim desenleri","Osmanlı minyatürleri","Japon baskı sanatı","Gotik mimari"]',
 'Anadolu halk motifleri ve kilim desenleri',
 'Bedri Rahmi, Batılı modern teknikleri Anadolu halk sanatı motifleriyle birleştiren özgün bir üslup geliştirmiştir. NATO karargahındaki mozaik panosu en bilinen kamusal eseridir.',
 'orta'),

('turk-sanati',
 'Şeker Ahmet Paşa''nın resim eğitimi aldığı şehir hangisidir?',
 '["Paris","Londra","Berlin","Viyana"]',
 'Paris',
 'Şeker Ahmet Paşa, Osmanlı''dan Paris''e resim eğitimi için gönderilen ilk öğrencilerdendir. Natürmort ve orman manzaralarıyla tanınır. "Şeker" lakabı tatlı kişiliğinden gelir.',
 'orta'),

('turk-sanati',
 'Burhan Doğançay''ın "Duvarlar" serisi neyi konu alır?',
 '["Dünyanın dört bir yanındaki duvar yazıları ve afişleri","Tarihi surları","Grafiti sanatını","Mimari duvar süslemelerini"]',
 'Dünyanın dört bir yanındaki duvar yazıları ve afişleri',
 'Doğançay, 50 yılı aşkın süre boyunca dünyanın her yerindeki duvarları fotoğraflayarak sanat tarihinin en kapsamlı görsel arşivlerinden birini oluşturmuştur.',
 'orta'),

('turk-sanati',
 'Nejad Devrim hangi ülkede yaşayıp çalışmıştır?',
 '["Fransa","ABD","İngiltere","Almanya"]',
 'Fransa',
 'Nejad Devrim, 1946''da Paris''e yerleşmiş ve Soyut Ekspresyonizm''in Avrupa''daki temsilcilerinden biri olmuştur. Babası şair Nazım Hikmet''in yakın arkadaşıydı.',
 'orta'),

-- ZOR (5)
('turk-sanati',
 '1914 Kuşağı (Çallı Kuşağı) olarak bilinen grup hangi tarihsel dönemde öne çıkmıştır?',
 '["I. Dünya Savaşı ve Milli Mücadele dönemi","Tanzimat dönemi","Cumhuriyet''in 10. yılı","II. Dünya Savaşı"]',
 'I. Dünya Savaşı ve Milli Mücadele dönemi',
 'İbrahim Çallı liderliğindeki bu grup, Türk resminde Empresyonist etkileri yaygınlaştırmıştır. Savaş yıllarında bile sanat üretmeye devam etmişlerdir.',
 'zor'),

('turk-sanati',
 'Müfide Kadri hangi açıdan Türk sanat tarihinde öncüdür?',
 '["İlk kadın ressamlardan biri","İlk heykeltraş","İlk fotoğrafçı","İlk karikatürist"]',
 'İlk kadın ressamlardan biri',
 'Müfide Kadri, Osmanlı döneminde resim eğitimi alan ve eser veren ilk Türk kadın ressamlardandır. Portre ve peyzajlarıyla tanınır.',
 'zor'),

('turk-sanati',
 'D Grubu hangi yıl kurulmuştur ve neyi savunmuştur?',
 '["1933 — Batılı modern sanat anlayışını","1923 — Milliyetçi sanatı","1945 — Soyut sanatı","1950 — Pop Art''ı"]',
 '1933 — Batılı modern sanat anlayışını',
 'Nurullah Berk, Cemal Tollu, Abidin Dino gibi isimlerin kurduğu D Grubu, Türk resminde Kübist ve Konstrüktivist eğilimleri savunmuştur. Adını önceki üç sanat grubunun ardından (A, B, C) almıştır.',
 'zor'),

('turk-sanati',
 'Erol Akyavaş''ın sanatında hangi kültürel tema merkezdedir?',
 '["Sufi felsefesi ve İslam estetiği","Antik Yunan mitolojisi","Avrupa aristokrasisi","Uzak Doğu felsefesi"]',
 'Sufi felsefesi ve İslam estetiği',
 'Akyavaş, Batılı soyut ekspresyonist tekniklerle İslami kaligrafi ve tasavvuf felsefesini birleştiren özgün bir dil geliştirmiştir.',
 'zor'),

('turk-sanati',
 'Adnan Çoker''in minimalist soyut tabloları hangi motiften esinlenir?',
 '["Osmanlı sivri kemer formu","Anadolu kilim desenleri","Hristiyanlık haç sembolü","Japon zen çemberi"]',
 'Osmanlı sivri kemer formu',
 'Çoker, Osmanlı mimarisindeki sivri kemer formunu soyut bir dile çevirerek Doğu-Batı sentezinin en özgün örneklerinden birini yaratmıştır.',
 'zor');
