-- Leonardo'nun Atölyesi — Kategori + 25 Soru
-- Çalıştır: Supabase SQL Editor

-- Kategori
INSERT INTO trivia_categories (slug, title, description, icon_emoji, color, is_active)
VALUES (
  'leonardo-atolyesi',
  'Leonardo''nun Atölyesi',
  'Leonardo da Vinci''nin atölyesinde 5 oda, 25 soru. Rönesans dehasının dünyasını keşfedin!',
  '🎨',
  '#8B6914',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon_emoji = EXCLUDED.icon_emoji,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active;

-- Mevcut soruları temizle (idempotent)
DELETE FROM trivia_questions WHERE category_slug = 'leonardo-atolyesi';

-- ═══ ODA 1: Ana Salon — Ünlü Eserler (3 kolay + 2 orta) ═══

INSERT INTO trivia_questions (category_slug, question, image_url, options, correct_answer, fun_fact, difficulty) VALUES

('leonardo-atolyesi',
 'Bu tablonun adı nedir?',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
 '["Mona Lisa","Venüs''ün Doğuşu","İnci Küpeli Kız","Yıldızlı Gece"]',
 'Mona Lisa',
 'Mona Lisa''nın kaşları yoktur — Rönesans modasına uygun olarak alınmıştır. Tablo sadece 77×53 cm boyutundadır.',
 'kolay'),

('leonardo-atolyesi',
 'Leonardo''nun Milano''daki Santa Maria delle Grazie kilisesine yaptığı bu dev duvar resmi hangisidir?',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg/1280px-The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg',
 '["Son Akşam Yemeği","Atina Okulu","Sistine Şapeli Tavanı","Gece Devriyesi"]',
 'Son Akşam Yemeği',
 'Son Akşam Yemeği 4.6 × 8.8 metre boyutundadır. Leonardo bazen günlerce tablonun önünde durur, tek bir fırça darbesi vurmadan düşünürdü.',
 'kolay'),

('leonardo-atolyesi',
 'Elinde bir gelincik tutan bu kadın portresinin adı nedir?',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Lady_with_an_Ermine_-_Leonardo_da_Vinci_%28adjusted%29.jpg/800px-Lady_with_an_Ermine_-_Leonardo_da_Vinci_%28adjusted%29.jpg',
 '["Gelincikli Kadın","Flora","La Bella Principessa","Ginevra de'' Benci"]',
 'Gelincikli Kadın',
 'Gelincik, Yunanca ''galee'' kelimesinden gelir ve modelin soyadı Gallerani ile bir kelime oyunudur. Tablo şu an Krakow''daki Czartoryski Müzesi''ndedir.',
 'kolay'),

('leonardo-atolyesi',
 'Leonardo''nun bir daire ve kare içinde ideal insan oranlarını gösterdiği ünlü çizimin adı nedir?',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Da_Vinci_Vitruve_Luc_Viatour.jpg/800px-Da_Vinci_Vitruve_Luc_Viatour.jpg',
 '["Vitruvius Adamı","Altın Oran Çizimi","Anatomik İnsan","Proporsyon Etüdü"]',
 'Vitruvius Adamı',
 'Vitruvius Adamı İtalyan Euro madeni parasının üzerindedir. Çizim, Venedik Gallerie dell''Accademia''de saklanır ve ışığa hassas olduğu için nadiren sergilenir.',
 'orta'),

('leonardo-atolyesi',
 'İki versiyonu bulunan, kayalık bir mağarada Meryem, bebek İsa ve melekleri gösteren tablonun adı nedir?',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Leonardo_da_Vinci_-_Vergine_delle_Rocce_%28Louvre%29.jpg/800px-Leonardo_da_Vinci_-_Vergine_delle_Rocce_%28Louvre%29.jpg',
 '["Kayalıklar Bakiresi","Mağaradaki Madonna","Kutsal Aile","Kayalık Peyzaj"]',
 'Kayalıklar Bakiresi',
 'İlk versiyon (1483-86) Louvre''da, ikinci versiyon (1495-1508) Londra Ulusal Galeri''dedir. İki tablo arasındaki farklar sanat tarihçileri arasında hâlâ tartışılır.',
 'orta'),

-- ═══ ODA 2: Resim Odası — Teknikler (2 kolay + 2 orta + 1 zor) ═══

('leonardo-atolyesi',
 'Leonardo''nun geliştirdiği, renk geçişlerini dumanımsı bir şekilde yumuşatan tekniğin adı nedir?',
 NULL,
 '["Sfumato","Impasto","Trompe-l''œil","Grisaille"]',
 'Sfumato',
 'Sfumato İtalyanca ''sfumare'' (buharlaşmak/dumanlanmak) kelimesinden gelir. Leonardo, Mona Lisa''da 30''dan fazla şeffaf boya katmanı sürerek bu etkiyi yarattı.',
 'kolay'),

('leonardo-atolyesi',
 'Işık ve gölgenin dramatik kontrastını kullanan, figürleri karanlıktan çıkaran resim tekniğinin adı nedir?',
 NULL,
 '["Chiaroscuro","Sfumato","Pointilizm","Fresko"]',
 'Chiaroscuro',
 'Chiaroscuro İtalyanca ''chiaro'' (açık) ve ''scuro'' (koyu) kelimelerinin birleşimidir. Caravaggio bu tekniği en uç noktaya taşımıştır.',
 'kolay'),

('leonardo-atolyesi',
 'Uzaktaki nesnelerin mavimsi ve bulanık görünmesi ilkesine dayanan, Leonardo''nun ustaca kullandığı perspektif türü hangisidir?',
 NULL,
 '["Atmosferik perspektif","Lineer perspektif","İzometrik perspektif","Kuşbakışı perspektif"]',
 'Atmosferik perspektif',
 'Leonardo, Mona Lisa''nın arka planında atmosferik perspektifi mükemmel biçimde uygulamıştır — uzaktaki dağlar mavimsi ve bulanıkken, yakın objeler net ve sıcak tonludur.',
 'orta'),

('leonardo-atolyesi',
 'Tek kaçış noktalı perspektif sistemini matematiksel olarak ilk formüle eden Floransalı mimar kimdir?',
 NULL,
 '["Filippo Brunelleschi","Leon Battista Alberti","Andrea Palladio","Donato Bramante"]',
 'Filippo Brunelleschi',
 'Brunelleschi, 1415 civarında Floransa Vaftizhanesi önünde ayna ve delikli panel kullanarak perspektif deneyini gerçekleştirdi. Bu, Rönesans sanatının dönüm noktasıdır.',
 'orta'),

('leonardo-atolyesi',
 'Leonardo, Son Akşam Yemeği''ni yaparken geleneksel fresko tekniği yerine hangi deneysel yöntemi kullandı?',
 NULL,
 '["Kuru sıva üzerine tempera ve yağlıboya karışımı","Islak sıva üzerine yumurta tempera","Ahşap panel üzerine yağlıboya","Tuval üzerine akrilik boya"]',
 'Kuru sıva üzerine tempera ve yağlıboya karışımı',
 'Bu deneysel teknik Leonardo''ya yavaş çalışma imkanı verdi ama tablonun ömrünü kısalttı. Tamamlanmasından sadece 20 yıl sonra bozulmaya başladı.',
 'zor'),

-- ═══ ODA 3: Heykel Atölyesi — Anatomi & Heykel (1 kolay + 3 orta + 1 zor) ═══

('leonardo-atolyesi',
 'Leonardo''nun onlarca kadavra üzerinde yaptığı anatomi çalışmalarının temel amacı neydi?',
 NULL,
 '["Hem sanatsal hem bilimsel araştırma","Sadece tıbbi araştırma","Heykel için kalıp almak","Simya deneyleri"]',
 'Hem sanatsal hem bilimsel araştırma',
 'Leonardo 30''dan fazla kadavra inceledi ve 240''tan fazla detaylı anatomi çizimi yaptı. Bu çalışmalar hem sanatını hem de bilimsel anlayışını besledi.',
 'kolay'),

('leonardo-atolyesi',
 'Leonardo''nun Milano Dükü için planladığı ama hiç tamamlayamadığı devasa atlı heykel projesinin adı nedir?',
 NULL,
 '["Gran Cavallo","Il Cavallino","Equus Magnus","Sforza Atlısı"]',
 'Gran Cavallo',
 'Gran Cavallo 7 metre yüksekliğinde olacaktı — o dönemin en büyük bronz heykeli. 70 ton bronz ayrıldı ama Fransız istilası sırasında top dökümüne gönderildi.',
 'orta'),

('leonardo-atolyesi',
 'Leonardo''nun insan vücudunu katman katman çizerek gösterdiği yöntemin tıptaki karşılığı nedir?',
 NULL,
 '["Sistematik anatomik diseksiyon","Radyolojik tarama","Biyopsi","Patolojik analiz"]',
 'Sistematik anatomik diseksiyon',
 'Leonardo''nun diseksiyon çizimleri o kadar doğruydu ki, bazıları 20. yüzyılın başlarına kadar tıp eğitiminde referans olarak kullanıldı.',
 'orta'),

('leonardo-atolyesi',
 'Klasik sanatta ideal insan boyu kaç "baş" uzunluğunda kabul edilir?',
 NULL,
 '["8 baş","6 baş","7 baş","10 baş"]',
 '8 baş',
 'Antik Yunan heykeltıraş Polykleitos''un "Kanon" adlı eseri bu oranı belirledi. Leonardo''nun Vitruvius Adamı da benzer oranları kullanır.',
 'orta'),

('leonardo-atolyesi',
 'Leonardo ve Michelangelo''nun Floransa''daki Palazzo Vecchio için yarıştığı duvar resmi konusu neydi?',
 NULL,
 '["Savaş sahneleri (Anghiari ve Cascina)","Mitolojik tanrılar","Floransa''nın kuruluşu","Medici ailesi portreleri"]',
 'Savaş sahneleri (Anghiari ve Cascina)',
 'Leonardo Anghiari Savaşı''nı, Michelangelo Cascina Savaşı''nı yapacaktı. Her ikisi de tamamlanamadı — Leonardo''nunki deneysel boya tekniği yüzünden eridi.',
 'zor'),

-- ═══ ODA 4: İcat Odası — Mühendislik & Bilim (1 kolay + 2 orta + 2 zor) ═══

('leonardo-atolyesi',
 'Leonardo''nun kuş kanatlarından ilham alarak tasarladığı uçma makinesinin adı nedir?',
 NULL,
 '["Ornitopter","Helikopter","Planör","Balon"]',
 'Ornitopter',
 'Ornitopter Yunanca ''ornithos'' (kuş) ve ''pteron'' (kanat) kelimelerinden gelir. Leonardo kuşları yıllarca gözlemleyerek aerodinamik ilkelerini keşfetti.',
 'kolay'),

('leonardo-atolyesi',
 'Leonardo''nun etrafında dönen bıçakları olan zırhlı savaş aracı tasarımı, hangi modern askeri aracın öncüsü sayılır?',
 NULL,
 '["Tank","Denizaltı","Savaş uçağı","Zırhlı tren"]',
 'Tank',
 'Leonardo''nun zırhlı aracında ilginç bir "hata" vardır: dişliler ters yöne döner. Bazı tarihçiler bunu kasıtlı bir sabotaj olarak yorumlar — tasarımın kötüye kullanılmasını önlemek için.',
 'orta'),

('leonardo-atolyesi',
 'Leonardo defterlerini neden ayna yazısıyla (sağdan sola) yazdı?',
 NULL,
 '["Solak olduğu için mürekkep bulaşmasını önlemek","Şifreleme amacıyla","Arapça''dan ilham aldığı için","Disleksi hastası olduğu için"]',
 'Solak olduğu için mürekkep bulaşmasını önlemek',
 'Ayna yazısı solaklar için doğal bir harekettir. Leonardo''nun notlarını okumak için bir ayna tutmanız yeterlidir. Gizlilik amacı da tartışmalıdır.',
 'orta'),

('leonardo-atolyesi',
 'Leonardo''nun Milano''daki Navigli kanalları için tasarladığı mühendislik yapısı nedir?',
 NULL,
 '["Kanal kapak (lock) sistemi","Su değirmeni","Baraj","Aqueduct"]',
 'Kanal kapak (lock) sistemi',
 'Leonardo''nun tasarladığı kapak sistemi, farklı seviyelerdeki su kanalları arasında teknelerin geçişini sağlıyordu. Bu prensip Panama Kanalı dahil dünya genelinde hâlâ kullanılır.',
 'zor'),

('leonardo-atolyesi',
 'Leonardo''nun piramit şeklindeki kumaş tasarımı, hangi modern icadın öncüsüdür?',
 NULL,
 '["Paraşüt","Sıcak hava balonu","Kanat takımı","Yelken"]',
 'Paraşüt',
 '2000 yılında İngiliz Adrian Nicholas, Leonardo''nun orijinal tasarımını birebir yaparak 3.000 metreden başarılı bir atlayış gerçekleştirdi!',
 'zor'),

-- ═══ ODA 5: Kütüphane — Miras & Final (2 orta + 3 zor) ═══

('leonardo-atolyesi',
 'Leonardo''nun defterlerinden günümüze yaklaşık kaç sayfa ulaşmıştır?',
 NULL,
 '["7.000","1.000","15.000","500"]',
 '7.000',
 'Orijinal defterlerin 13.000 sayfayı aştığı tahmin ediliyor. Kayıp sayfalar yüzyıllar içinde dağıldı — bazıları hâlâ keşfedilmeyi bekliyor olabilir.',
 'orta'),

('leonardo-atolyesi',
 'Leonardo hayatının son yıllarını hangi ülkede, hangi kralın konuğu olarak geçirdi?',
 NULL,
 '["Fransa — I. François","İngiltere — VIII. Henry","İspanya — V. Carlos","Almanya — I. Maximilian"]',
 'Fransa — I. François',
 'Leonardo 1516''da Fransa''ya gitti ve Amboise yakınlarındaki Clos Lucé şatosunda yaşadı. I. François ona yılda 10.000 scudi maaş bağladı — sadece yanında olması için.',
 'orta'),

('leonardo-atolyesi',
 'Birden fazla alanda (sanat, bilim, mühendislik) uzmanlaşmış kişilere ne ad verilir?',
 NULL,
 '["Polymath","Virtuoso","Maestro","Prodigy"]',
 'Polymath',
 'Polymath Yunanca ''polymathes'' (çok bilen) kelimesinden gelir. Leonardo, tarihte ''Rönesans insanı'' kavramının en ikonik örneğidir.',
 'zor'),

('leonardo-atolyesi',
 'Leonardo''nun Codex Leicester adlı defterini 1994''te satın alan kişi kimdir?',
 NULL,
 '["Bill Gates","Elon Musk","Jeff Bezos","Steve Jobs"]',
 'Bill Gates',
 'Bill Gates, Codex Leicester''ı açık artırmada 30.8 milyon dolara aldı (bugünkü değeriyle ~60 milyon). Sayfaların dijital taramalarını halka açtı.',
 'zor'),

('leonardo-atolyesi',
 'Leonardo vasiyetinde en değerli eserlerini ve defterlerini kime bıraktı?',
 NULL,
 '["Francesco Melzi","Gian Giacomo Caprotti (Salaì)","I. François","Michelangelo"]',
 'Francesco Melzi',
 'Francesco Melzi, Leonardo''nun en sadık öğrencisiydi. Defterlerini özenle korudu, ama ölümünden sonra mirasçıları sayfaları dağıttı. Bu yüzden bugün dünya genelinde farklı koleksiyonlarda bulunuyor.',
 'zor');
