import type { LeonardoDialogue } from "./types";

/**
 * 25 soru için Leonardo'nun diyalogları.
 * pre: soru öncesi, post.correct: doğru cevap tepkisi, post.wrong: yanlış cevap tepkisi
 */
export const DIALOGUES: LeonardoDialogue[] = [
  // ═══ ODA 1: Ana Salon (0-4) ═══
  {
    questionIndex: 0,
    pre: "Hoş geldiniz, genç dostum! Şu duvardaki tabloya bakın... Onu yaparken yıllarımı harcadım. Gülümsemesinin sırrını çözebilir misiniz?",
    post: {
      correct: "Bravo! Mona Lisa'yı tanımak kolay gibi görünür ama onu gerçekten anlamak bir ömür sürer.",
      wrong: "Hayır, hayır... O gülümseme benim en büyük eserim Mona Lisa'ya ait. Tekrar bakın, unutmayacaksınız.",
    },
  },
  {
    questionIndex: 1,
    pre: "Şimdi bu dev tabloya gelin. Milano'daki bir manastır duvarına yaptığım bu eserde, İsa ve havarileri son kez bir arada...",
    post: {
      correct: "Mükemmel! Son Akşam Yemeği, belki de en dramatik sahnemi barındırır.",
      wrong: "Bu tablo Son Akşam Yemeği'dir. İhanet anını resmetmek... kolay değildi.",
    },
  },
  {
    questionIndex: 2,
    pre: "Bu küçük ama zarif portre, Krakow'da bir müzede saklı. Elinde bir gelincik tutan genç kadın kimdir dersiniz?",
    post: {
      correct: "Harika! Gelincikli Kadın, Milano'daki günlerimin en güzel hatıralarından.",
      wrong: "Cecilia Gallerani... Onu resmederken gelinciğin huzursuzluğuyla çok uğraştım!",
    },
  },
  {
    questionIndex: 3,
    pre: "Doğanın mükemmelliğini anlamak için insan bedenini inceledim. Bu ünlü çizimde, bir daire ve kare içinde ideal insan oranlarını gösterdim.",
    post: {
      correct: "Evet! Vitruvius Adamı, evrenin matematiksel düzenini insan bedeninde arayan çizimimdir.",
      wrong: "Bu Vitruvius Adamı'dır. Romalı mimar Vitruvius'un oranlarını çizdim ama biraz da kendi yorumumu kattım.",
    },
  },
  {
    questionIndex: 4,
    pre: "Atölyemin duvarında asılı bu tablo, kayalıklar arasında gizemli bir sahneyi anlatır. İki versiyonunu yaptım — biri Louvre'da, diğeri Londra'da.",
    post: {
      correct: "Çok doğru! Kayalıklar Bakiresi, en gizemli eserlerimden biridir.",
      wrong: "Bu Kayalıklar Bakiresi! İki versiyonunun farklarını bulmak başlı başına bir macera.",
    },
  },

  // ═══ ODA 2: Resim Odası (5-9) ═══
  {
    questionIndex: 5,
    pre: "Bu odada tekniklerimi öğreneceksiniz. İlk dersimiz: renk geçişlerini yumuşatma sanatı. Dumanımsı bir etki yaratan bu tekniğin adı nedir?",
    post: {
      correct: "Harika! Sfumato, İtalyanca 'duman' demektir. Mona Lisa'nın gülümsemesinin sırrı bu tekniktedir.",
      wrong: "Sfumato! 'Duman gibi' anlamına gelir. Keskin hatlar yerine yumuşak geçişler... Doğanın kendisi gibi.",
    },
  },
  {
    questionIndex: 6,
    pre: "Işık ve gölge oyunu... Bir figürü karanlıktan çıkarıp aydınlığa taşımak. Bu dramatik aydınlatma tekniğinin adını biliyor musunuz?",
    post: {
      correct: "Evet! Chiaroscuro, resimdeki derinliğin ve dramatizmin anahtarıdır.",
      wrong: "Chiaroscuro — 'açık-koyu' demektir. Caravaggio bunu benden ilham alarak zirveye taşıdı.",
    },
  },
  {
    questionIndex: 7,
    pre: "Uzaktaki nesneler neden mavimsi görünür? Havadaki partiküller ışığı saçar. Bu gözlemi resme uyguladığımda ortaya çıkan tekniğe ne denir?",
    post: {
      correct: "Bravo! Atmosferik perspektif, uzaklığı renk ve netlik değişimleriyle anlatır.",
      wrong: "Atmosferik (hava) perspektif! Uzaktaki dağları mavimsi ve bulanık yapmak, derinlik hissi yaratır.",
    },
  },
  {
    questionIndex: 8,
    pre: "Ressamlar yüzyıllarca düz yüzeyde derinlik yanılsaması yaratmaya çalıştı. Tek kaçış noktalı bu sistemi ilk formüle eden Floransalı mimar kimdir?",
    post: {
      correct: "Doğru! Brunelleschi'nin perspektif deneyleri, Rönesans'ın kapısını açtı.",
      wrong: "Filippo Brunelleschi! Floransa Vaftizhanesi önündeki deneyi ile perspektifi matematiksel olarak kanıtladı.",
    },
  },
  {
    questionIndex: 9,
    pre: "Tempera, yağlıboya, fresko... Her teknik farklı bir malzeme gerektirir. 'Son Akşam Yemeği' için hangi alışılmadık tekniği kullandım?",
    post: {
      correct: "Evet! Kuru sıva üzerine tempera ve yağlıboya karışımı — geleneksel fresko yerine. Ne yazık ki bu yüzden tablo çabuk bozulmaya başladı.",
      wrong: "Kuru sıva üzerine deneysel bir teknik kullandım. Geleneksel fresko yapmadım çünkü yavaş çalışmayı seviyordum. Ama bu tercih tablonun ömrünü kısalttı.",
    },
  },

  // ═══ ODA 3: Heykel Atölyesi (10-14) ═══
  {
    questionIndex: 10,
    pre: "Anatomi çalışmalarım için onlarca kadavra inceledim. Bu el çizimlerimi hangi amaçla yaptığımı düşünüyorsunuz?",
    post: {
      correct: "Kesinlikle! Hem sanat hem bilim için. İnsan bedenini anlamadan onu resmedemezsiniz.",
      wrong: "Anatomi çizimlerim hem sanatsal hem bilimsel amaçlıydı. Tıp tarihine de önemli katkılar sağladılar.",
    },
  },
  {
    questionIndex: 11,
    pre: "Milano Dükü Ludovico Sforza için devasa bir atlı heykel planladım. Bu projeye ne ad verilir?",
    post: {
      correct: "Doğru! Gran Cavallo, 7 metre yüksekliğinde olacaktı. Ne yazık ki bronzlar top dökümüne gitti.",
      wrong: "Gran Cavallo — 'Büyük At'. Yıllarca üzerinde çalıştım ama savaş nedeniyle bronzu top yapmak için erittilar.",
    },
  },
  {
    questionIndex: 12,
    pre: "İnsan vücudundaki kas katmanlarını tek tek çizerek gösterdim. Bu çizim tekniğine tıpta ne ad verilir?",
    post: {
      correct: "Mükemmel! Anatomik diseksiyon çizimleri, modern tıbbi illüstrasyonun temelini attı.",
      wrong: "Sistematik diseksiyon! Cesetleri katman katman inceleyip çizdim. Bu çalışmalar yüzyıllar sonra bile doğruluğunu koruyor.",
    },
  },
  {
    questionIndex: 13,
    pre: "Heykel yaparken oranlar çok önemlidir. İdeal insan boyunun kaç 'baş' uzunluğunda olduğunu biliyor musunuz?",
    post: {
      correct: "Harika! Sekiz baş oranı, Antik Yunan'dan bu yana ideal insan proporsiyonudur.",
      wrong: "Yaklaşık 8 baş uzunluğu! Polykleitos'tan bu yana sanatçılar bu oranı temel alır.",
    },
  },
  {
    questionIndex: 14,
    pre: "Floransa'daki bir yarışmada Michelangelo ile karşı karşıya geldik. İkimiz de hangi konuda duvar resmi yapacaktık?",
    post: {
      correct: "Evet! Anghiari Savaşı benim konumdu, Michelangelo ise Cascina Savaşı'nı yapacaktı. İkimiz de tamamlayamadık.",
      wrong: "Palazzo Vecchio'daki savaş sahneleri! Ben Anghiari Savaşı'nı, Michelangelo Cascina Savaşı'nı üstlendi. İkisi de tamamlanamayan başyapıtlar olarak kaldı.",
    },
  },

  // ═══ ODA 4: İcat Odası (15-19) ═══
  {
    questionIndex: 15,
    pre: "Gökyüzüne hep hayran oldum. Kuşları inceleyerek bir uçma makinesi tasarladım. Bu tasarımın adı nedir?",
    post: {
      correct: "Mükemmel! Ornitopter, kuş kanatlarından ilham alan insan gücüyle çalışan uçma makinemdir.",
      wrong: "Ornitopter! Kuşların kanat çırpma hareketini taklit eden bir makine. Çalışmasa da havacılık tarihinin öncüsüdür.",
    },
  },
  {
    questionIndex: 16,
    pre: "Savaş mühendisliği de yaptım. Etrafında dönen bıçakları olan zırhlı bir araç tasarladım. Bu tasarım neyin öncüsü sayılır?",
    post: {
      correct: "Doğru! Zırhlı savaş arabam, modern tankın atası olarak kabul edilir.",
      wrong: "Tank! Zırhlı savaş arabam, 20. yüzyılda gerçeğe dönüşecek bir vizyondu.",
    },
  },
  {
    questionIndex: 17,
    pre: "Defterlerimi neden ayna yazısıyla yazdığımı merak ediyor musunuz? Solak olmam mı, gizlilik mi, yoksa başka bir sebep mi?",
    post: {
      correct: "Doğru! Solak olduğum için sağdan sola yazmak mürekkebi bulaştırmıyordu. Gizlilik de bir bonus oldu tabii.",
      wrong: "Aslında en pratik sebep solaklığımdı — sağdan sola yazınca mürekkep bulaşmıyordu. Ama gizemli görünmesi de hoşuma gitti!",
    },
  },
  {
    questionIndex: 18,
    pre: "Su mühendisliğiyle de uğraştım. Milano'daki kanal sistemi için çizdiğim bu yapının adı nedir?",
    post: {
      correct: "Harika! Navigli kanallarının kapak sistemi, Milano'nun su yönetiminde devrim yarattı.",
      wrong: "Kanal kapak (lock) sistemi! Milano'nun Navigli kanallarını ıslah etmek için çalıştım. Su seviyesini kontrol eden bu sistem hâlâ kullanılıyor.",
    },
  },
  {
    questionIndex: 19,
    pre: "Son bir icat sorusu: Havada süzülmek için piramit şeklinde bir kumaş tasarladım. Bu icadın modern karşılığı nedir?",
    post: {
      correct: "Evet! Paraşüt tasarımım, yüzyıllar sonra test edildiğinde gerçekten işe yaradı!",
      wrong: "Paraşüt! Piramit şeklindeki tasarımımı 2000 yılında Adrian Nicholas test etti ve başarıyla indi!",
    },
  },

  // ═══ ODA 5: Kütüphane (20-24) ═══
  {
    questionIndex: 20,
    pre: "Kütüphaneme hoş geldiniz. İlk soru: Defterlerimde yaklaşık kaç sayfa günümüze ulaştı?",
    post: {
      correct: "Doğru! Yaklaşık 7.000 sayfa ulaştı, ama orijinalin çok daha fazla olduğu tahmin ediliyor.",
      wrong: "Günümüze yaklaşık 7.000 sayfa ulaştı. Orijinalin 13.000 sayfayı aştığı düşünülüyor — kaybolan sayfalar hâlâ aranıyor.",
    },
  },
  {
    questionIndex: 21,
    pre: "Hayatımın son yıllarını bir kralın konuğu olarak geçirdim. Hangi ülkede ve kimin yanında öldüğümü biliyor musunuz?",
    post: {
      correct: "Mükemmel! Fransa Kralı I. François beni Amboise'a davet etti. Son günlerimi orada huzur içinde geçirdim.",
      wrong: "Fransa'da, Kral I. François'nın konuğu olarak! Amboise yakınlarındaki Clos Lucé şatosunda hayata gözlerimi yumdum.",
    },
  },
  {
    questionIndex: 22,
    pre: "Bir terim var: sanatçı, bilim insanı, mucit, yazar, müzisyen... Birden fazla alanda uzmanlaşmış kişiye ne denir?",
    post: {
      correct: "Harika! Polymath — çok yönlü deha. Bazıları beni 'Rönesans insanı'nın prototipi olarak görür.",
      wrong: "Polymath! 'Çok bilen' anlamına gelir. Rönesans dönemi, bizim gibi çok yönlü düşünürleri teşvik ederdi.",
    },
  },
  {
    questionIndex: 23,
    pre: "Codex Leicester adlı defterimi bugün dünyanın en zengin insanlarından biri satın aldı. Kim olduğunu biliyor musunuz?",
    post: {
      correct: "Evet! Bill Gates, 1994'te 30.8 milyon dolara satın aldı. Dijital kopyalarını herkesle paylaştı.",
      wrong: "Bill Gates! 1994'te açık artırmada rekor fiyata aldı. En azından defterimi dijitalleştirip paylaştı.",
    },
  },
  {
    questionIndex: 24,
    pre: "Son soru, genç dostum. Vasiyetimde en değerli eserlerimi kime bıraktığımı biliyor musunuz? Bir ipucu: yıllarca yanımda olan sadık öğrencim...",
    post: {
      correct: "Bravo! Francesco Melzi, en sadık öğrencimdi. Defterlerimi ve eserlerimi ona emanet ettim.",
      wrong: "Francesco Melzi! Yanımda yıllarca çalıştı, Fransa'ya benimle geldi. Mirasımın koruyucusu oldu.",
    },
  },
];
