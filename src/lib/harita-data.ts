/* ───────── Harita Veri Dosyası ─────────
   PLACES ve ROUTES hem client (harita) hem server (SEO/JSON-LD) tarafından kullanılır.
*/

export type PlaceType = "müze" | "galeri" | "konser" | "tiyatro" | "tarihi" | "edebiyat" | "miras" | "doğa" | "gastronomi" | "mimari";

export type EraType = "paleolitik" | "hitit" | "frig" | "roma" | "selcuklu" | "osmanli" | "cumhuriyet";

export const ERA_LABELS: Record<EraType, string> = {
  paleolitik: "Paleolitik & Tarihöncesi",
  hitit: "Hitit",
  frig: "Frig",
  roma: "Roma & Bizans",
  selcuklu: "Selçuklu",
  osmanli: "Osmanlı",
  cumhuriyet: "Cumhuriyet",
};

export const ERA_ORDER: EraType[] = ["paleolitik", "hitit", "frig", "roma", "selcuklu", "osmanli", "cumhuriyet"];

export type CulturePlace = {
  lat: number;
  lng: number;
  type: PlaceType;
  name: string;
  desc: string;
  longDesc?: string;
  funFacts?: string[];
  image?: string;
  era?: EraType | EraType[];
  minZoom?: number;
  venueAliases?: string[];
};

export type RouteStop = {
  lat: number;
  lng: number;
  name: string;
  story: string;
};

export type Route = {
  id: number;
  title: string;
  icon: string;
  duration: string;
  color: string;
  desc: string;
  stops: RouteStop[];
  fx?: "xray" | "grayscale" | "noir" | "neon" | "rock";
  nightOnly?: boolean;
};

export const TYPE_LABELS: Record<PlaceType, string> = {
  müze: "Müze",
  galeri: "Galeri",
  konser: "Konser",
  tiyatro: "Tiyatro",
  tarihi: "Tarihi",
  edebiyat: "Edebiyat",
  miras: "Kültürel Miras",
  doğa: "Doğa & Park",
  gastronomi: "Gastronomi",
  mimari: "Mimari",
};

export const PLACES: CulturePlace[] = [
  /* ── MÜZELER ── */
  { lat: 39.9381, lng: 32.8645, type: "müze", name: "Anadolu Medeniyetleri Müzesi", desc: "1921 kurulan, Paleolitik'ten Osmanlı'ya 1 milyon+ eser. 1997 Avrupa Yılın Müzesi.", era: ["hitit", "frig", "roma", "selcuklu", "osmanli", "cumhuriyet"], longDesc: "Anadolu Medeniyetleri Müzesi, Ankara Kalesi eteklerinde 15. yüzyıl yapımı Mahmut Paşa Bedesteni ve Kurşunlu Han binalarında yer alır. 1921'de Atatürk'ün talimatıyla kurulan müze, Paleolitik Çağ'dan Osmanlı Dönemi'ne kadar kesintisiz bir uygarlık panoraması sunar.\n\nKoleksiyonun yıldızları arasında Çatalhöyük ana tanrıça heykelciği, Alacahöyük güneş kursları, Hitit kabartmaları ve dünyanın bilinen en eski haritası olarak kabul edilen Nippur şehir planı yer alır. Frig, Urartu ve Lidya uygarlıklarına ait eserler de kronolojik düzen içinde sergilenir.\n\n1997'de Avrupa Konseyi tarafından 'Yılın Müzesi' seçilen müze, yılda 500 binin üzerinde ziyaretçi ağırlar. 2023'te tamamlanan kapsamlı restorasyon ile sergileme alanları genişletilmiş, multimedya destekli anlatım sistemi kurulmuştur.", funFacts: ["Dünyanın bilinen en eski haritası (Nippur şehir planı) burada sergileniyor.", "1997'de Avrupa Konseyi tarafından 'Yılın Müzesi' seçildi.", "Koleksiyonda 1 milyonun üzerinde eser bulunuyor."] },
  { lat: 39.9430, lng: 32.8540, type: "müze", name: "I. TBMM Binası (Kurtuluş Savaşı Müzesi)", desc: "23 Nisan 1920'de açılan Meclis, Milli Mücadele'nin yönetildiği bina.", era: "cumhuriyet", longDesc: "23 Nisan 1920'de Büyük Millet Meclisi'nin açıldığı bu tarihi bina, İttihat ve Terakki Cemiyeti'nin Ankara Kulübü olarak 1915-1920 yılları arasında inşa edilmiştir. Milli Mücadele'nin tüm kritik kararları — Başkomutanlık Kanunu, İstiklal Mahkemeleri, Sakarya ve Büyük Taarruz hazırlıkları — bu çatı altında alındı.\n\nBina, 1981'den bu yana Kurtuluş Savaşı Müzesi olarak hizmet vermektedir. Meclis Başkanlık odası, Atatürk'ün çalışma odası ve tarihi Genel Kurul Salonu orijinal haliyle korunmuştur. Duvarlarda dönemin fotoğrafları, belgeleri ve Milli Mücadele haritaları sergilenir." },
  { lat: 39.9425, lng: 32.8545, type: "müze", name: "II. TBMM Binası (Cumhuriyet Müzesi)", desc: "1924-1960 parlamento binası. Mimar Vedat Tek tasarımı.", era: "cumhuriyet", longDesc: "Mimar Vedat Tek tarafından tasarlanan bu görkemli yapı, 1924'ten 1960'a kadar Türkiye Büyük Millet Meclisi'nin ikinci binası olarak kullanıldı. Cumhuriyet'in ilanı, Halifeliğin kaldırılması ve devrim kanunları bu salonda kabul edildi.\n\nGünümüzde Cumhuriyet Müzesi olarak hizmet veren bina, Genel Kurul Salonu'nu orijinal düzeniyle koruyor. Cumhurbaşkanlığı locası, milletvekili sıraları ve kürsü dönemin atmosferini yaşatır. Müzede ayrıca Cumhuriyet dönemi belgeleri, fotoğraflar ve kişisel eşyalar sergilenmektedir." },
  { lat: 39.9254, lng: 32.8369, type: "müze", name: "Anıtkabir ve Kurtuluş Savaşı Müzesi", desc: "Emin Onat ve Orhan Arda tasarımı, Atatürk'ün anıt mezarı.", era: "cumhuriyet", longDesc: "Anıtkabir, Türkiye Cumhuriyeti'nin kurucusu Mustafa Kemal Atatürk'ün anıt mezarıdır. 1944-1953 yılları arasında mimarlar Emin Onat ve Orhan Arda'nın tasarımıyla 750.000 m²'lik alanda inşa edildi. Hitit, Selçuklu ve modern mimari öğelerini harmanlayan yapı, Anadolu uygarlıklarına saygı duruşudur.\n\nAslanlı Yol'dan Tören Alanı'na uzanan güzergâh üzerinde 24 Hitit aslanı heykeli yer alır. Mozole'nin içinde 40 tonluk mermer lahit bulunur. Kurtuluş Savaşı Müzesi bölümünde, Milli Mücadele'ye ait 30.000'i aşkın eser — kişisel eşyalar, mektuplar, haritalar ve silahlar — kronolojik düzende sergilenir.\n\nAnıtkabir, yılda 8-10 milyon ziyaretçisiyle Türkiye'nin en çok ziyaret edilen anıtıdır. 10 Kasım anma törenlerinde on binlerce kişi saygı duruşunda bulunur.", funFacts: ["Aslanlı Yol'daki 24 aslan heykeli Hitit medeniyetine saygı olarak dikilmiştir.", "Mozole'deki mermer lahit 40 ton ağırlığındadır.", "Yılda 8-10 milyon ziyaretçiyle Türkiye'nin en çok ziyaret edilen anıtıdır."] },
  { lat: 39.9390, lng: 32.8550, type: "müze", name: "Ankara Etnografya Müzesi", desc: "1930 açılış, Türk-İslam halk kültürü. 1938-53 Atatürk'ün geçici kabri.", era: "cumhuriyet", longDesc: "1930'da Atatürk tarafından açılan Etnografya Müzesi, Ankara'nın Namazgâh Tepesi'nde mimar Arif Hikmet Koyunoğlu'nun tasarımıyla inşa edilmiştir. Osmanlı sonrası ve Selçuklu dönemine ait halılar, kilimler, ahşap eserler, madeni objeler, çini ve seramikler ile Türk-İslam halk kültürünün en kapsamlı koleksiyonunu barındırır.\n\n1938'den 1953'e kadar — Anıtkabir'in tamamlanmasına dek — Atatürk'ün naaşı bu müzenin giriş holünde muhafaza edilmiştir. Bu tarihi detay müzeye ayrı bir maneviyat katmaktadır. Girişte Atatürk'ün atlı bronz heykeli ziyaretçileri karşılar." },
  { lat: 39.9385, lng: 32.8650, type: "müze", name: "Çengelhan Rahmi M. Koç Müzesi", desc: "1522 yapımı handa sanayi ve teknoloji tarihi.", era: "osmanli", longDesc: "1522'de inşa edilen Çengelhan, Ankara Kalesi eteklerindeki Osmanlı ticaret hanlarının en görkemli örneklerinden biridir. 2005'te kapsamlı bir restorasyon geçirerek Rahmi M. Koç Sanayi Müzesi'ne dönüştürülmüştür.\n\nMüzede ulaşım, iletişim, bilim ve endüstri tarihine ait binlerce eser sergilenir: buharlı makinelerden eski otomobillere, telgraf cihazlarından denizaltı periskoplarına kadar. Avlulu han yapısının orijinal mimarisi korunarak modern müzecilik anlayışıyla buluşturulmuştur.", funFacts: ["1522 yapımı görkemli Osmanlı ticaret hanı, 500 yıllık tarihiyle Ankara'nın en eski ticari yapılarından.", "Müzede Osmanlı'dan Cumhuriyet'e uzanan sanayi devriminin Türkiye ayağı sergileniyor."] },
  { lat: 39.9370, lng: 32.8640, type: "müze", name: "Erimtan Arkeoloji ve Sanat Müzesi", desc: "2015 açılış, MÖ 3000'den Bizans'a eserler.", era: ["roma", "cumhuriyet"], longDesc: "İş insanı ve koleksiyoner Yüksel Erimtan'ın özel koleksiyonundan oluşan müze, 2015'te Ankara Kalesi eteklerinde açıldı. MÖ 3000'den Bizans dönemine kadar uzanan geniş bir zaman dilimini kapsayan arkeolojik eserler, modern mimari bir yapıda sergilenmektedir.\n\nKoleksiyonda Hitit, Frig, Urartu, Lidya, Roma ve Bizans dönemlerine ait takılar, heykeller, seramikler ve cam eserler yer alır. Müze, aynı zamanda dönemsel sergiler ve kültürel etkinliklere de ev sahipliği yapar." },
  { lat: 39.9392, lng: 32.8538, type: "müze", name: "Ziraat Bankası Müzesi", desc: "Giulio Mongeri tasarımı 1929 binada, Türkiye'nin ilk banka müzesi.", era: "cumhuriyet" },
  { lat: 39.9428, lng: 32.8532, type: "müze", name: "Türkiye İş Bankası İktisadi Bağımsızlık Müzesi", desc: "Mongeri tasarımı binada ekonomi tarihi.", era: "cumhuriyet" },
  { lat: 39.9415, lng: 32.8535, type: "müze", name: "PTT Pul Müzesi", desc: "Clemens Holzmeister tasarımı binada filateli ve haberleşme tarihi.", era: "cumhuriyet" },
  { lat: 39.9383, lng: 32.8655, type: "müze", name: "Gökyay Vakfı Satranç Müzesi", desc: "110 ülkeden 700+ satranç takımı, Guinness rekoru.", era: "cumhuriyet", longDesc: "Ankara Kalesi içindeki tarihi bir Osmanlı evinde yer alan Gökyay Vakfı Satranç Müzesi, dünyada bir eve sığdırılmış en kapsamlı satranç koleksiyonuna sahiptir. Koleksiyoner Akın Gökyay'ın ömrünü adadığı bu müzede 110 ülkeden toplanmış 700'ü aşkın satranç takımı sergilenir.\n\nGünlük eşyalardan yapılmış takımlardan antik dönem replikalarına, Osmanlı minyatür takımlarından devasa bahçe satranç setlerine uzanan çeşitlilik, müzeyi dünyanın en özgün satranç koleksiyonlarından biri kılar. Guinness Dünya Rekorları tarafından tescillenmiş koleksiyon, her yaştan ziyaretçinin ilgisini çeker.", funFacts: ["110 ülkeden 700'ü aşkın satranç takımıyla Guinness Rekorlar Kitabı'na girdi.", "Ankara Kalesi içindeki tarihi Osmanlı evinde kurulmuş, dünyanın en kapsamlı satranç müzesi."] },
  { lat: 39.9740, lng: 32.9598, type: "müze", name: "Altınköy Açık Hava Müzesi", desc: "1930'lar Anadolu köy yaşamı, 500 dönümlük alan.", era: "cumhuriyet", longDesc: "500 dönümlük bir alanda kurulan Altınköy Açık Hava Müzesi, 1930'ların Anadolu köy yaşamını birebir canlandırır. Geleneksel taş ve kerpiç evler, değirmenler, samanlıklar, ahırlar ve bağ evleri orijinal malzemelerle inşa edilmiş veya taşınarak restore edilmiştir.\n\nMüze, ziyaretçilere el sanatları atölyelerinde çanak çömlek, keçe ve dokuma deneyimi sunar. Mevsimlik festivaller ve köy düğünü canlandırmaları ile yaşayan bir müze anlayışını benimser." },
  { lat: 39.9022, lng: 32.7986, type: "müze", name: "MTA Tabiat Tarihi Müzesi", desc: "1968 kurulan, dinozor fosillerinden meteoritlere.", era: "cumhuriyet", longDesc: "1968'de kurulan MTA Tabiat Tarihi Müzesi, Türkiye'nin en kapsamlı doğa tarihi koleksiyonunu barındırır. 140 milyon yıllık dinozor fosillerinden meteoritlere, minerallerden volkanik kayaçlara kadar geniş bir yelpazede jeolojik ve paleontolojik eserler sergilenir.\n\nMüzenin en dikkat çekici parçaları arasında Anadolu'dan çıkarılmış dev memeli fosilleri, nadir mineral örnekleri ve interaktif deprem simülasyonu yer alır. Çocuklar için hazırlanmış eğitim alanları, doğa bilimlerini eğlenceli bir şekilde keşfetme imkânı sunar.", funFacts: ["140 milyon yıllık fosiller barındırıyor — Anadolu'nun en eski yaşam izleri burada.", "Türkiye'nin en kapsamlı mineral ve meteorit koleksiyonuna sahip."] },
  { lat: 39.9031, lng: 32.6387, type: "müze", name: "Etimesgut Türk Tarih Müzesi", desc: "İskitlerden Cumhuriyet'e 200+ heykel, Orhun Yazıtları replikaları.", era: "cumhuriyet" },
  { lat: 39.8947, lng: 32.8610, type: "müze", name: "Pembe Köşk (İsmet İnönü Müze Evi)", desc: "2. Cumhurbaşkanı'nın 48 yıl yaşadığı ev.", era: "cumhuriyet", longDesc: "Pembe Köşk, Türkiye'nin 2. Cumhurbaşkanı İsmet İnönü'nün 1925'ten 1973'teki vefatına kadar 48 yıl boyunca yaşadığı konuttur. Art Deco etkili mimarisiyle Çankaya sırtlarında yer alan bina, Cumhuriyet'in kuruluş döneminin tanığıdır.\n\nMüzeye dönüştürülen köşkte İnönü'nün kişisel eşyaları, mektupları, kitaplığı ve çalışma odası orijinal haliyle korunmaktadır. Lozan görüşmelerine ait belgeler ve aile fotoğrafları da sergilenmektedir." },
  { lat: 39.8895, lng: 32.8649, type: "müze", name: "Çankaya Köşkü (Atatürk Müze Köşkü)", desc: "1921-1932 Atatürk'ün ikameti, devrimlerin planlandığı yer. 1950'den beri müze.", era: "cumhuriyet", image: "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/harita/cankaya-kosku-ataturk-muze-kosku.png", longDesc: "Deniz seviyesinden 1.071 metre yükseklikte, kökeninde mütevazı bir Ankara bağ evi olan Çankaya Köşkü, ününü şatafatına değil içinde alınan tarihi kararlara borçludur. Mustafa Kemal Paşa, Ankara halkının satın alıp hediye ettiği bu eve Haziran 1921'de yerleşmiş; yapı, 1932'ye kadar Cumhuriyetin ilk Cumhurbaşkanlığı Köşkü olarak kullanılmıştır.\n\n1923-24'te Mimar Vedat Tek, açık avluyu kapatıp şadırvanı kaldırarak diplomatik kabullere uygun bir dönüşüm gerçekleştirmiştir. Giriş holünde Hatai üsluplu kalem işi tavan süslemeleri ve ceviz ağacından Fransız Neo-Klasik (XVI. Louis) mobilyalar yer alır. Yemek Salonu ise Rönesans-Barok-Rokoko karışımı bir üslupla dekore edilmiş olup, Maison Psalty Ticarethanesi'nden özel sipariş meşe mobilyalarla donatılmıştır.\n\nÜst katta Atatürk'ün çalışma odası, kütüphanesi ve Büyük Nutuk'un yazıldığı alan bulunur. Yapı, Atatürk'ün hayattayken Türk Ordusuna bağışlamasının ardından 1950'den bu yana müze olarak korunmaktadır.", funFacts: ["Giriş holündeki sekizgen mermer iz, aslında eski bağ evinin açık havada şırıl şırıl akan şadırvanının kalıntısı — 1924'te Mimar Vedat Tek diplomatik misafirler için avlunun üstünü kapatıp havuzu iptal etti.", "Köşkteki 100 yıldan eski koltuk ve sandalyeler üzerinde yapılan akademik analizler, bu mobilyaların bel açısı ve yükseklik bakımından günümüz uluslararası ergonomi standartlarıyla birebir uyumlu olduğunu kanıtladı.", "Banyodaki gömme mermer küvetin hemen yanında, merdiven sahanlığına açılan gizli bir kapı bulunuyor — güvenlik veya pratik kullanım amacıyla tasarlanmış stratejik bir mimari detay.", "Dünyaca ünlü Büyük Nutuk, üst kattaki mütevazı çalışma odasında geceler boyu süren mesailerle bizzat Atatürk tarafından kaleme alındı."] },
  { lat: 39.9360, lng: 32.8610, type: "müze", name: "Somut Olmayan Kültürel Miras Müzesi", desc: "Karagöz, meddahlık, ebru. Türkiye'nin ilk SOKÜM müzesi.", era: ["osmanli", "cumhuriyet"] },
  { lat: 40.1709, lng: 31.9178, type: "müze", name: "Beypazarı Yaşayan Müze", desc: "19. yy Abbaszade Konağı'nda halk kültürü deneyimi.", era: "osmanli" },
  { lat: 40.1685, lng: 31.9195, type: "müze", name: "Türk Hamam Müzesi", desc: "Türkiye'nin ilk hamam müzesi. Roma'dan Osmanlı'ya yıkanma kültürü.", era: ["roma", "osmanli"] },

  /* ── EDEBİYAT ── */
  { lat: 39.9426, lng: 32.8709, type: "edebiyat", name: "Kelime Müzesi", desc: "2022, Türkiye'nin ilk dil müzesi. Kelimelerin kökenlerini sanatsal anlatım.", era: "cumhuriyet" },
  { lat: 39.8769, lng: 32.8491, type: "edebiyat", name: "Cin Ali Müzesi", desc: "Rasim Kaygusuz'un kült karakterine adanmış pedagojik müze.", era: "cumhuriyet" },
  { lat: 39.9388, lng: 32.8670, type: "edebiyat", name: "Mehmet Akif Ersoy Müze Evi (Taceddin Dergahı)", desc: "İstiklal Marşı'nın yazıldığı mekan.", era: "cumhuriyet", longDesc: "Taceddin Dergâhı, Ankara'nın Hamamönü semtinde yer alan tarihi bir tekke yapısıdır. Milli şairimiz Mehmet Akif Ersoy, 1920-1921 yıllarında burada misafir edilmiş ve İstiklal Marşı'nı bu dergâhın odalarında kaleme almıştır.\n\nGünümüzde müze evi olarak hizmet veren yapıda, Mehmet Akif'in kişisel eşyaları, İstiklal Marşı'nın yazılış süreci ve dönemin Ankara'sına ait belgeler sergilenmektedir. Dergâhın huzurlu avlusu ve sade mimarisi, marşın yazıldığı ortamı hissettirmektedir.", funFacts: ["İstiklal Marşı burada, bu odada yazıldı — 1921 yılının soğuk kış gecelerinde.", "Mehmet Akif Ersoy, Milli Mücadele yıllarında bu dergâhta misafir edildi."] },
  { lat: 39.9398, lng: 32.8648, type: "edebiyat", name: "Ahmet Hamdi Tanpınar Edebiyat Müze Kütüphanesi", desc: "El yazmaları ve nadir eserler.", era: "cumhuriyet" },
  { lat: 39.9245, lng: 32.8006, type: "edebiyat", name: "Cumhurbaşkanlığı Millet Kütüphanesi", desc: "2020, Selçuklu-Osmanlı-çağdaş mimari sentezi, dev kültür kompleksi.", era: "cumhuriyet", longDesc: "2020'de açılan Cumhurbaşkanlığı Millet Kütüphanesi, 125.000 m²'lik alanıyla Türkiye'nin en büyük kütüphanesidir. Selçuklu, Osmanlı ve çağdaş mimari öğelerini harmanlayan yapı, 4 milyon kitap kapasitesiyle dünyanın en büyük kütüphaneleri arasında yer alır.\n\nYapı, enerji verimli tasarımı, depreme dayanıklı mühendisliği ve engelsiz erişim standartlarıyla çağdaş kütüphanecilik anlayışını temsil eder. Nadir eserler salonu, çocuk kütüphanesi, konferans salonları ve kafeteryalarıyla kapsamlı bir kültür merkezi işlevi görür." },

  /* ── GALERİLER ── */
  { lat: 39.9400, lng: 32.8530, type: "galeri", name: "Ankara Devlet Resim ve Heykel Müzesi", desc: "1927, Birinci Ulusal Mimarlık şaheseri. Türk plastik sanatlarının başkent yuvası.", era: "cumhuriyet", image: "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/harita/ankara-devlet-resim-heykel-muzesi.png", longDesc: "Ulus'taki Namazgah Tepesi'nde, Mimar Arif Hikmet Koyunoğlu'nun tasarımıyla 1927'de Türk Ocakları Merkez Binası olarak inşa edilen yapı, Birinci Ulusal Mimarlık Akımı'nın en seçkin örneklerinden biridir. 1980'den bu yana Devlet Resim ve Heykel Müzesi olarak hizmet vermektedir.\n\nCephe kurgusu gizli bir hiyerarşi barındırır: bodrum katta sade dikdörtgen, zemin katta basık kemerli, prestij katında ise görkemli sivri Osmanlı kemerli pencereler kullanılmıştır. Vestibülde mermere işlenmiş kum saati motifleri, Bursa-kemer formlu balkon korkulukları ve mihrabiye nişleri milli kimlik vurgusu yapar.\n\n19. yüzyıldan günümüze Türk ressamlarının eşsiz eserleri, hüsn-i hat, tezhip ve minyatür örnekleri ile Ankara'nın kamusal alanlarına yayılmış heykellerin soyut mirası bu müzede bir araya gelir.", funFacts: ["Binaya dışarıdan bakıldığında pencerelerin şekli aşağıdan yukarıya değişir: düz dikdörtgen → basık kemer → sivri Osmanlı kemeri. Bu, cephede gizli bir statü ve hiyerarşi kurgusudur.", "Bina aslında bir müze olarak değil, Cumhuriyet'in fikri temellerini atan Türk Ocakları'nın merkez binası olarak inşa edildi.", "1970'lerde Ankaralı sanatçılar, İstanbul merkezli Güzel Sanatlar Akademisi'nin dayattığı tek tip 'resmi sanat tarihi' anlatısına karşı bu mekanda ideolojik bir isyan başlattı."] },
  { lat: 39.9395, lng: 32.8480, type: "galeri", name: "CerModern", desc: "2010, eski TCDD atölyelerinde uluslararası çağdaş sanat merkezi.", era: "cumhuriyet", venueAliases: ["Cer Modern"], longDesc: "CerModern, 1920'lerin TCDD vagon bakım atölyelerinin 2010 yılında çağdaş sanat merkezine dönüştürülmesiyle kurulmuştur. 10.000 m²'lik sergi alanıyla Türkiye'nin en büyük çağdaş sanat mekânlarından biridir.\n\nEndüstriyel mimarinin korunarak yeniden yorumlandığı yapıda, ulusal ve uluslararası sergiler, performans sanatları, atölyeler ve film gösterimleri düzenlenir. Açık hava heykel bahçesi ve geniş avlusu, kentlilerin buluşma noktasıdır." },
  { lat: 39.7930, lng: 32.6970, type: "galeri", name: "Müze Evliyagil", desc: "2015, çağdaş Türk sanatı, açık hava heykel bahçesi.", era: "cumhuriyet" },
  { lat: 39.8900, lng: 32.8587, type: "galeri", name: "Galeri Siyah Beyaz", desc: "1984'ten beri, Ankara'nın en köklü özel galerisi.", era: "cumhuriyet" },
  { lat: 39.8893, lng: 32.8508, type: "galeri", name: "Doğan Taşdelen Çağdaş Sanatlar Merkezi", desc: "Kamuya ait en kapsamlı sanat galerisi.", era: "cumhuriyet" },

  /* ── KONSER ── */
  { lat: 39.9147, lng: 32.8107, type: "konser", name: "CSO Ada Ankara", desc: "2020, fütüristik küre formlu müzik kampüsü.", era: "cumhuriyet", venueAliases: ["CSO", "CSO Ada"], longDesc: "2020'de açılan CSO Ada Ankara, fütüristik küre formuyla başkentin yeni müzik ikonu haline gelmiştir. Cumhurbaşkanlığı Senfoni Orkestrası'nın yeni evi olan yapı, 2.020 kişilik ana salon, 500 kişilik oda müziği salonu ve açık hava amfi tiyatrosuyla kapsamlı bir müzik kampüsüdür.\n\nAkustik tasarımı dünyaca ünlü uzmanlar tarafından gerçekleştirilen salon, klasik müzikten caz ve dünya müziklerine kadar geniş bir repertuvarla etkinlik düzenler." },
  { lat: 39.8673, lng: 32.7495, type: "konser", name: "Bilkent Konser Salonu", desc: "1994, Türkiye'nin ilk özel akademik senfoni salonu.", era: "cumhuriyet", venueAliases: ["Bilkent Ödül", "Bilkent"] },

  /* ── TİYATRO ── */
  { lat: 39.9352, lng: 32.8534, type: "tiyatro", name: "Büyük Tiyatro (Opera Sahnesi)", desc: "1933 Şevki Balmumcu / 1948 Paul Bonatz, anıtsal sahne.", era: "cumhuriyet", venueAliases: ["DOB", "Devlet Opera", "Opera Sahnesi", "Büyük Tiyatro"] },
  { lat: 39.9386, lng: 32.8531, type: "tiyatro", name: "Küçük Tiyatro", desc: "1930 yapımı Mimar Kemaleddin eseri, 1947'den beri aktif.", era: "cumhuriyet" },
  { lat: 39.9040, lng: 32.8595, type: "tiyatro", name: "Şinasi Sahnesi", desc: "1988'den beri kült oyunların prömiyeri.", era: "cumhuriyet" },
  { lat: 39.9039, lng: 32.8593, type: "tiyatro", name: "Akün Sahnesi", desc: "1975 sinema, 2002'de tiyatroya dönüştürüldü.", era: "cumhuriyet" },

  /* ── TARİHİ & ARKEOLOJİK ── */
  { lat: 39.9408, lng: 32.8644, type: "tarihi", name: "Ankara Kalesi", desc: "MÖ 2. binyıl, Galat-Roma-Selçuklu-Osmanlı katmanları.", era: ["hitit", "frig", "roma", "selcuklu", "osmanli"], longDesc: "Ankara Kalesi, MÖ 2. binyıldan günümüze kesintisiz iskân görmüş, Anadolu'nun en çok katmanlı savunma yapılarından biridir. Hitit, Frig, Galat, Roma, Bizans, Selçuklu ve Osmanlı medeniyetlerinin izlerini taşıyan surlar, 8 farklı uygarlıktan devşirme taşlarla örülmüştür.\n\nİç Kale ve Dış Kale olmak üzere iki bölümden oluşan yapı, yaklaşık 43.000 m²'lik bir alanı kaplar. İç Kale surlarında Roma dönemi sütun başlıkları ve friz parçaları devşirme olarak kullanılmıştır. Selçuklu döneminde sivri kemerli kapılar ve poternler eklenmiştir.\n\nGünümüzde kale içi, restore edilmiş Osmanlı evleri, sanat galerileri, butik oteller ve kafelerle canlı bir kültür bölgesine dönüşmüştür. Kale'nin en yüksek noktasından Ankara'nın 360 derecelik panoramik manzarası seyredilir.", funFacts: ["Surlarındaki taşlar 8 farklı medeniyetten devşirme — Hitit'ten Osmanlı'ya.", "İç Kale'nin en yüksek noktası deniz seviyesinden 978 metre yüksekliktedir.", "Roma dönemine ait sütun başlıkları surlara yapı taşı olarak gömülmüştür."] },
  { lat: 39.6550, lng: 31.9940, type: "tarihi", name: "Gordion Antik Kenti ve Midas Tümülüsü", desc: "2023 UNESCO, MÖ 12. yy Frigya başkenti.", era: ["hitit", "frig", "roma"], longDesc: "Gordion, MÖ 12. yüzyıldan itibaren Frigya Krallığı'nın başkenti olarak tarih sahnesine çıkmış ve 2023'te UNESCO Dünya Mirası Listesi'ne alınmıştır. Efsanevi Kral Midas'ın sarayı ve dünyanın bilinen en eski ahşap mezar odası burada yer alır.\n\nMidas Tümülüsü, 53 metre yüksekliği ve 300 metre çapıyla Anadolu'nun en büyük tümülüslerinden biridir. Mezar odasında bulunan ahşap mobilyalar, MÖ 8. yüzyıla tarihlenen ve hâlâ korunmuş dünyanın en eski ahşap eserleridir. Gordion Müzesi'nde Hitit, Frig ve Roma dönemlerine ait eserler sergilenmektedir.\n\nİskender'in kestiği efsanevi 'Gordion Düğümü'nün de bu antik kentte çözüldüğü rivayet edilir.", funFacts: ["Dünyanın en eski ahşap mezar odası burada — MÖ 8. yüzyıldan.", "Büyük İskender'in 'Gordion Düğümü'nü kılıçla kestiği efsane bu şehirde geçer.", "2023'te UNESCO Dünya Mirası Listesi'ne alındı."] },
  { lat: 39.9367, lng: 32.8653, type: "tarihi", name: "Arslanhane Camii", desc: "2023 UNESCO, 1290 Selçuklu şaheseri.", era: "selcuklu", longDesc: "1290 yılında inşa edilen Arslanhane Camii (Ahi Şerafeddin Camii), Anadolu Selçuklu mimarisinin Ankara'daki en görkemli temsilcisidir. 2023'te UNESCO Dünya Mirası Listesi'ne alınarak uluslararası koruma altına girmiştir.\n\nCaminin iç mekânını 24 ahşap direk taşır. Roma dönemi devşirme sütun başlıkları, Selçuklu çini mozaikleri ve geometrik ahşap oymalar bir arada bulunur. Mihrap, firuze ve kobalt mavisi çinilerle bezeli Selçuklu sanatının şaheseridir.\n\nAdını, giriş kapısı yanındaki aslan kabartmalarından alan cami, 730 yılı aşkın süredir kesintisiz ibadet mekânı olarak kullanılmaktadır.", funFacts: ["2023'te UNESCO Dünya Mirası Listesi'ne alındı.", "730 yılı aşkın süredir kesintisiz ibadet mekânı olarak hizmet veriyor.", "İçindeki 24 ahşap direk Roma dönemi devşirme sütun başlıklarıyla taçlandırılmış."] },
  { lat: 39.9412, lng: 32.8632, type: "tarihi", name: "Augustus Tapınağı", desc: "MÖ 25-20, Res Gestae'nin en iyi korunmuş kopyası.", era: "roma", longDesc: "MÖ 25-20 yılları arasında Roma İmparatoru Augustus adına inşa edilen bu tapınak, antik Ancyra'nın (Ankara) en önemli Roma dönemi yapısıdır. Duvarlarında kazılı bulunan Res Gestae Divi Augusti — İmparator Augustus'un siyasi vasiyetnamesi — metnin dünyada en iyi korunmuş Latince-Yunanca kopyasıdır.\n\nTapınak, Hacı Bayram Veli Camii'nin hemen bitişiğinde yer alır ve iki farklı inancın yan yana durması, Ankara'nın çok katmanlı tarihinin sembolik görüntüsünü oluşturur. Korint düzenindeki sütunlar ve cella duvarları kısmen ayaktadır.", funFacts: ["Roma İmparatoru Augustus'un vasiyetnamesi Res Gestae'nin dünyadaki en iyi korunmuş kopyası burada.", "MÖ 25-20 yapımı — Ankara'nın 2.000 yılı aşkın tarihinin en eski tanıklarından.", "Hacı Bayram Camii ile yan yana duruşu, antik pagan ve İslam mimarisinin eşsiz buluşması."] },
  { lat: 39.9440, lng: 32.8600, type: "tarihi", name: "Roma Hamamı", desc: "MS 3. yy, İmparator Caracalla dönemi.", era: "roma", longDesc: "MS 3. yüzyılda İmparator Caracalla döneminde inşa edilen Roma Hamamı, Ankara'nın en büyük Roma dönemi kalıntısıdır. Frigidarium (soğukluk), tepidarium (ılıklık) ve caldarium (sıcaklık) bölümleri ile klasik Roma hamam planını yansıtır.\n\nAçık hava müzesi olarak ziyarete açık alanda, hypocaust (yeraltı ısıtma sistemi), su kanalları ve sütun tabanları görülebilir. Hamamın toplam alanı yaklaşık 80×130 metre olup, antik Ancyra'nın büyüklüğü hakkında önemli ipuçları verir." },
  { lat: 39.9433, lng: 32.8562, type: "tarihi", name: "Julianus Sütunu", desc: "MS 362, 15m korint başlıklı Roma sütunu.", era: "roma" },
  { lat: 39.9395, lng: 32.8680, type: "tarihi", name: "Hamamönü Tarihi Evleri", desc: "19. yy Osmanlı sivil mimarisi, restore edilmiş kültür bölgesi.", era: "osmanli", longDesc: "Hamamönü, Ankara'nın en iyi korunmuş tarihi mahallelerinden biridir. 19. yüzyıl Osmanlı sivil mimarisinin tipik örnekleri olan ahşap ve taş evler, 2009'dan itibaren kapsamlı bir restorasyon programıyla yeniden hayat bulmuştur.\n\nBugün Hamamönü, el sanatları atölyeleri, antika dükkânları, geleneksel kahvehaneler ve yöresel mutfak sunan restoranlarıyla canlı bir kültür bölgesidir. Dar sokakları ve avlulu evleriyle Osmanlı döneminin günlük yaşam atmosferini yeniden yaşatır." },
  { lat: 39.9410, lng: 32.8630, type: "tarihi", name: "Hacı Bayram Veli Camii", desc: "1427-28, Augustus Tapınağı bitişiğinde. Bayramiyye tarikatının merkezi.", era: ["roma", "osmanli"], image: "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/harita/haci-bayram-veli-camii.png", longDesc: "Ankara'nın Ulus semtinde, 1427-28 yılında mutasavvıf Hacı Bayram-ı Veli adına inşa edilen cami, Anadolu'nun en önemli inanç mekânlarından biridir. Yapıyı eşsiz kılan, Roma İmparatoru Augustus adına dikilen MÖ 25-20 tarihli tapınağın duvarına bitişik olması — pagan kültünden İslam tasavvufuna uzanan inançların aynı avluda buluşmasının mimari manifestosudur.\n\nİç mekânda, Osmanlı saraylısı Nakkaş Mustafa Paşa'nın bizzat yaptığı ahşap boyama nakışlar ve 26 adet hüsn-i hat levhası bulunur. Erkekler bölümünde anıtsal celi sülüs, kadınlar mahfilinde ise geometrik kufi yazı kullanılarak bilinçli bir mekansal estetik ayrım kurulmuştur. Kompleks alanına giriş ücretsiz olup Altındağ'da Sarıbağ Sokak'ta ziyarete açıktır.", funFacts: ["Bitişiğindeki Augustus Tapınağı duvarlarında Roma İmparatoru'nun dünya egemenliğini anlatan Latince yazıt, birkaç santimetre ötedeki cami duvarlarında ise dünyevi hırsların reddini öğütleyen Kuran ayetleri yer alır — Ankara'nın en derin felsefi tezatı.", "Caminin muhteşem ahşap nakışlarını yapan Nakkaş Mustafa, sadece bir sanatçı değil; Mısır ve Budin beylerbeyi, kubbe veziri ve I. Ahmed'in damadıydı.", "Alt katta erkeklerin ibadet ettiği bölümde kıvrımlı celi sülüs, üst katta kadınlar mahfilinde köşeli kufi yazı kullanılmış — mekanın karakterine göre tasarlanmış bilinçli bir estetik ayrım."] },
  { lat: 39.9398, lng: 32.8668, type: "tarihi", name: "Tarihi Karacabey Hamamı", desc: "1440, 580+ yıldır kesintisiz hizmet.", era: "osmanli" },
  { lat: 39.9381, lng: 32.8733, type: "tarihi", name: "Ulucanlar Cezaevi Müzesi", desc: "1925-2006, Nazım Hikmet'in yattığı koğuşlar.", era: "cumhuriyet", longDesc: "1925'ten 2006'ya kadar cezaevi olarak kullanılan Ulucanlar, 2011'de müzeye dönüştürülerek Türkiye'nin ilk cezaevi müzesi olmuştur. Nazım Hikmet, Sevgi Soysal, Bülent Ecevit gibi pek çok önemli isim bu duvarların ardında tutuklu kalmıştır.\n\nNazım Hikmet, 'Memleketimden İnsan Manzaraları' destanının önemli bölümlerini burada yazmıştır. Müzede orijinal koğuşlar, hücre odaları ve infaz alanı korunmuş olup, dönemin koşullarını çarpıcı biçimde gözler önüne serer.", funFacts: ["Nâzım Hikmet 'Memleketimden İnsan Manzaraları'nı burada yazdı.", "Türkiye'nin müzeye dönüştürülmüş ilk cezaevi.", "81 yıl boyunca (1925-2006) faaliyette kalan cezaevinde binlerce siyasi tutuklu yattı."] },
  { lat: 39.5315, lng: 32.5589, type: "tarihi", name: "Gavurkale", desc: "MÖ 13. yy Hitit kabartmaları.", era: "hitit" },
  { lat: 40.0667, lng: 31.6667, type: "tarihi", name: "Juliopolis Antik Kenti", desc: "Helenistik-Roma-Bizans, kaya mezarları.", era: ["roma"] },
  { lat: 40.3193, lng: 32.4649, type: "tarihi", name: "Alicin Manastırı", desc: "Erken Hristiyanlık inziva merkezi, Sümela benzeri.", era: "roma" },
  { lat: 39.7743, lng: 32.6835, type: "tarihi", name: "Tulumtaş Mağarası", desc: "5 milyon yıllık karstik oluşum.", era: "paleolitik", funFacts: ["5 milyon yıllık karstik oluşum — Ankara'nın jeolojik geçmişinin canlı tanığı."] },
  { lat: 39.5878, lng: 32.1312, type: "tarihi", name: "Sakarya Meydan Muharebesi Tarihi Milli Parkı", desc: "1921, 137 bin hektar.", era: "cumhuriyet" },
  { lat: 40.1675, lng: 31.9211, type: "tarihi", name: "Beypazarı Tarihi Konakları", desc: "Osmanlı-Türk sivil mimarisinin en iyi korunmuş dokusu.", era: "osmanli" },
  { lat: 40.3575, lng: 32.5475, type: "tarihi", name: "Mahkeme Ağacın Kaya Yerleşimleri", desc: "Roma dönemi yeraltı kiliseleri.", era: "roma" },
  { lat: 40.0972, lng: 33.4083, type: "tarihi", name: "Kalecik Kalesi", desc: "Galat ve Roma izleri, Kızılırmak vadisine hakim.", era: ["roma"] },
  { lat: 39.9523, lng: 32.8261, type: "tarihi", name: "Akköprü", desc: "1222, I. Alaeddin Keykubad, 7 kemer gözlü anıtsal Selçuklu köprüsü. Üçgen mahmuzlar ve Arapça kitabe.", era: "selcuklu" },
  { lat: 40.1849, lng: 31.3501, type: "tarihi", name: "Nasuh Paşa Hanı", desc: "1599, 43 odalı Osmanlı ticaret hanı.", era: "osmanli" },
  { lat: 40.2197, lng: 32.2448, type: "tarihi", name: "İnönü Mağaraları", desc: "Hitit'ten Bizans'a çok katlı kaya yerleşimleri.", era: ["hitit", "roma"] },

  /* ── GASTRONOMİ ── */

  /* ── EK MÜZELER ── */
  { lat: 39.9350, lng: 32.8500, type: "müze", name: "Ankara Palas Müzesi", desc: "1928 yapımı Cumhuriyet konukevi, Şubat 2024'te müzeye dönüştürüldü.", era: "cumhuriyet" },
  { lat: 39.9359, lng: 32.8546, type: "müze", name: "Vakıf Eserleri Müzesi", desc: "1927 yapımı Hukuk Mektebi binasında halı, kilim, vakıf eserleri.", era: "cumhuriyet" },
  { lat: 39.9366, lng: 32.8433, type: "müze", name: "Direksiyon Binası (TCDD Milli Mücadele Müzesi)", desc: "1892, Atatürk'ün ilk karargahı.", era: "cumhuriyet" },
  { lat: 39.9017, lng: 32.7713, type: "müze", name: "ODTÜ Bilim ve Teknoloji Müzesi", desc: "MÖ 3500'den bilgisayar devrimine teknoloji evrimi.", era: "cumhuriyet" },
  { lat: 39.9690, lng: 32.8623, type: "müze", name: "Meteoroloji Müzesi", desc: "1908, Atatürk'ün 6 ay karargah kullandığı bina.", era: "cumhuriyet" },
  { lat: 39.9320, lng: 32.8300, type: "müze", name: "Ankara Üniversitesi Oyuncak Müzesi", desc: "1990, Türkiye'nin ilk oyuncak müzesi.", era: "cumhuriyet" },
  { lat: 39.8680, lng: 32.8190, type: "müze", name: "TRT Yayıncılık Tarihi Müzesi", desc: "Radyo ve TV tarihi, nostaljik stüdyolar.", era: "cumhuriyet" },
  { lat: 39.9476, lng: 32.7052, type: "müze", name: "Hava Kuvvetleri Müzesi", desc: "1998, ilk uçaklardan savaş jetlerine.", era: "cumhuriyet" },
  { lat: 39.9328, lng: 32.8464, type: "müze", name: "TCDD Açık Hava Buharlı Lokomotif Müzesi", desc: "Tarihi buharlı lokomotifler.", era: "cumhuriyet" },
  { lat: 39.6200, lng: 32.1500, type: "müze", name: "Alagöz Karargâh Müzesi", desc: "Sakarya Muharebesi'nde Atatürk'ün cephe karargahı.", era: "cumhuriyet" },
  { lat: 39.7850, lng: 32.3870, type: "müze", name: "Malıköy Tren İstasyonu Müzesi", desc: "Kurtuluş Savaşı lojistik merkezi.", era: "cumhuriyet" },
  { lat: 39.9300, lng: 32.8700, type: "müze", name: "Haritacılık Müzesi", desc: "Osmanlı'dan Cumhuriyet'e haritacılık tekniklerinin evrimi.", era: "cumhuriyet" },
  { lat: 40.4930, lng: 32.4750, type: "müze", name: "Çamlıdere Doğa ve Hayvan Müzesi", desc: "Türkiye'nin en kapsamlı doğa müzesi.", era: "cumhuriyet" },

  /* ── EK GALERİLER ── */
  { lat: 39.9371, lng: 32.8641, type: "galeri", name: "Pilavoğlu Han", desc: "16. yy, sanatçı atölyelerine dönüşmüş avlulu han.", era: "osmanli" },
  { lat: 39.8860, lng: 32.8530, type: "galeri", name: "Şefik Bursalı Müze Evi", desc: "Türk resim ustasının orijinal atölyesi.", era: "cumhuriyet" },
  { lat: 39.8950, lng: 32.8340, type: "galeri", name: "Mustafa Ayaz Sanat Müzesi", desc: "Çağdaş Türk resmi, genç yeteneklere alan.", era: "cumhuriyet" },
  { lat: 39.9340, lng: 32.8550, type: "galeri", name: "Hacettepe Sanat Müzesi", desc: "Çağdaş Türk resim ve heykel koleksiyonu.", era: "cumhuriyet" },
  { lat: 39.8850, lng: 32.7480, type: "galeri", name: "Fikret Otyam Sanat Merkezi", desc: "Çağdaş sanat, dijital enstalasyonlar.", era: "cumhuriyet" },
  { lat: 39.8830, lng: 32.8100, type: "galeri", name: "Zülfü Livaneli Kültür Merkezi", desc: "Sergiler, edebiyat söyleşileri, sanat filmi.", era: "cumhuriyet" },

  /* ── EK KONSER ── */
  { lat: 39.9340, lng: 32.8620, type: "konser", name: "Musiki Muallim Mektebi", desc: "1924, Cumhuriyet'in ilk müzik okulu.", era: "cumhuriyet" },
  { lat: 39.8756, lng: 32.7521, type: "konser", name: "Bilkent Odeon", desc: "Antik amfitiyatro ilhamı, 4000 kişilik açık hava arena.", era: "cumhuriyet" },
  { lat: 39.9350, lng: 32.8520, type: "konser", name: "CSO Tarihi Binası", desc: "1961-2020, kentin çoksesli müzik hafızası.", era: "cumhuriyet", venueAliases: ["CSO Tarihi"] },
  { lat: 39.9360, lng: 32.8252, type: "konser", name: "MEB Şura Salonu", desc: "Senfonik konser, bale, festival merkezi.", era: "cumhuriyet" },

  /* ── EK TİYATRO ── */
  { lat: 39.9650, lng: 32.7600, type: "tiyatro", name: "İrfan Şahinbaş Atölye Sahnesi", desc: "Deneysel ve yenilikçi oyunlar.", era: "cumhuriyet" },
  { lat: 39.8987, lng: 32.8575, type: "tiyatro", name: "Tatbikat Sahnesi", desc: "Avangart prodüksiyonlar, bağımsız performans.", era: "cumhuriyet" },
  { lat: 39.8700, lng: 32.7400, type: "tiyatro", name: "Cüneyt Gökçer Sahnesi", desc: "Döner sahne teknolojisi, geniş kapasiteli.", era: "cumhuriyet" },

  /* ── EK TARİHİ ── */
  { lat: 39.9431, lng: 32.8600, type: "tarihi", name: "Antik Roma Tiyatrosu", desc: "MS 1-2. yy, Ankara Kalesi eteklerinde.", era: "roma", longDesc: "1982 yılında tesadüfen keşfedilen Antik Roma Tiyatrosu, Augustus Tapınağı ile Roma Hamamı arasındaki alanda yer alır. MS 1-2. yüzyıla tarihlenen yapı, yarım daire planlı orkestra, theatron (seyirci tribünü) ve skene (sahne binası) kalıntılarıyla klasik Roma tiyatro mimarisini yansıtır.\n\nKazılarda ortaya çıkan oturma sıraları ve sahne duvarları, antik Ancyra'nın önemli bir kültür merkezi olduğunu kanıtlamaktadır. Tiyatro, kent surlarının hemen eteklerinde konumlanması nedeniyle Ankara'nın Roma dönemindeki kentsel planlamasına dair önemli ipuçları sunar.", funFacts: ["1982'de bir inşaat kazısı sırasında tesadüfen keşfedildi.", "Augustus Tapınağı ile Roma Hamamı arasında konumlanarak antik Ancyra'nın kültürel aksını ortaya koyar.", "Klasik Roma tiyatro planına uygun yarım daire orkestra, theatron ve skene yapılarını içerir."] },
  { lat: 39.9370, lng: 32.8650, type: "tarihi", name: "Ahi Elvan Camii", desc: "1382, Selçuklu ahşap direkli cami.", era: "selcuklu", longDesc: "14. yüzyıl sonunda inşa edilen Ahi Elvan Camii, Ankara'daki Ahilik geleneğinin önemli bir yansımasıdır. Bazilikal planlı yapı, dört nef ve 14 ahşap direkle taşınan düz ahşap tavanıyla Anadolu Selçuklu cami mimarisinin karakteristik bir örneğidir.\n\nCaminin sütun başlıkları Roma ve Bizans dönemlerinden devşirmedir; bu detay, Ankara'nın çok katmanlı tarihinin somut bir göstergesidir. Ceviz ağacından oyma minberi, dönemin ahşap işçiliğinin en zarif örneklerinden sayılır.", funFacts: ["4 nef ve 14 ahşap direkli bazilikal planıyla Anadolu Selçuklu cami tipinin nadir örneklerinden.", "Sütun başlıkları Roma ve Bizans dönemlerinden devşirme — binlerce yıllık mimari katmanlar bir arada.", "Ceviz ağacından oyma minberi, Selçuklu ahşap işçiliğinin Ankara'daki en zarif örneklerinden biri."] },
  { lat: 39.9397, lng: 32.8583, type: "tarihi", name: "Suluhan (Hasanpaşa Hanı)", desc: "1508-1511, çifte avlulu Osmanlı ticaret hanı.", era: "osmanli" },
  { lat: 39.9375, lng: 32.8560, type: "tarihi", name: "Pirinç Han", desc: "18. yy, antikacılar ve sahafların mekanı.", era: "osmanli" },
  { lat: 39.9350, lng: 32.8430, type: "mimari", name: "Tarihi Ankara Garı", desc: "1937, Art Deco, Şekip Akalın tasarımı.", era: "cumhuriyet", longDesc: "1937'de mimar Şekip Akalın tarafından Art Deco üslubunda tasarlanan Ankara Garı, Cumhuriyet'in ulaşım politikasının sembolüdür. Simetrik cephesi, geometrik süslemeleri ve yüksek giriş holüyle dönemin modernleşme idealini yansıtır.\n\nBina, Anadolu demiryolu ağının merkez istasyonu olarak stratejik öneme sahipti. Kurtuluş Savaşı sırasında cephane ve malzeme sevkiyatının ana noktası olan gar, Cumhuriyet döneminde diplomatik ziyaretlerin karşılama merasimlerine de sahne olmuştur." },
  { lat: 39.9350, lng: 32.8260, type: "mimari", name: "Gazi Üniversitesi Rektörlük Binası", desc: "1927-30, Mimar Kemaleddin eseri.", era: "cumhuriyet", longDesc: "1927-1930 yılları arasında Mimar Kemaleddin Bey tarafından tasarlanan bu yapı, I. Ulusal Mimarlık Akımı'nın Ankara'daki en önemli örneklerindendir. Osmanlı mimari geleneğinin Cumhuriyet'e taşınmasını simgeler.\n\nSivri kemerler, çini süslemeler ve taş işçiliği, Selçuklu-Osmanlı estetiğini modern bir eğitim yapısında yorumlar. Bina, Gazi Eğitim Enstitüsü olarak açılmış, Atatürk bizzat açılış törenine katılmıştır." },
  { lat: 39.9297, lng: 32.8556, type: "mimari", name: "DTCF Binası", desc: "1936, Bruno Taut tasarımı.", era: "cumhuriyet", longDesc: "Alman mimar Bruno Taut'un Ankara'daki başyapıtı olan Dil ve Tarih-Coğrafya Fakültesi binası, 1937'de hizmete girmiştir. Bauhaus estetiğini Anadolu iklim koşullarına uyarlayan yapı, rasyonalist mimari akımın Türkiye'deki en güçlü temsilcilerindendir.\n\nTaut, iç mekânda doğal aydınlatmayı en üst düzeye çıkaran geniş pencereler ve açık koridorlar tasarlamıştır. Fakülte, Atatürk'ün 'Tarih tezini' desteklemek amacıyla kurulmuş ve Cumhuriyet'in entelektüel misyonunun sembolü olmuştur." },
  { lat: 39.5900, lng: 32.1600, type: "tarihi", name: "Polatlı Duatepe Anıtı", desc: "Sakarya Muharebesi zafer noktası.", era: "cumhuriyet" },
  { lat: 39.9350, lng: 32.8540, type: "tarihi", name: "Güven Anıtı ve Güvenpark", desc: "1935, bronz ve taş rölyef kompleksi.", era: "cumhuriyet", longDesc: "1935'te Avusturyalı mimar Clemens Holzmeister'ın tasarımıyla Hürriyet Meydanı'nda (bugünkü Güvenpark) dikilen Güven Anıtı, Türk halkının hükümete güvenini simgeler. Anıt, yüksek bir kaide üzerinde bronz ve mermer rölyeflerle çevrili, Cumhuriyet'in erken dönem anıt mimarisinin en önemli örneklerindendir.\n\nÇevresindeki Güvenpark, Ankara'nın en merkezi yeşil alanlarından biridir ve Kızılay meydanının kalbinde yer alır. Anıt, Atatürk'ün \"Türk! Öğün, çalış, güven\" sözünden ilham almıştır.", funFacts: ["Avusturyalı mimar Clemens Holzmeister tarafından tasarlandı.", "Atatürk'ün 'Türk! Öğün, çalış, güven' sözünden ilham alır.", "Kızılay meydanının kalbinde, Ankara'nın en merkezi yeşil alanı Güvenpark'ın içinde yer alır."] },
  { lat: 39.9419, lng: 32.8547, type: "tarihi", name: "Ulus Zafer Anıtı", desc: "1927, Heinrich Krippel, tunç meydan heykeli.", era: "cumhuriyet", longDesc: "1927'de Avusturyalı heykeltıraş Heinrich Krippel tarafından yapılan Zafer Anıtı, Cumhuriyet'in Ankara'daki ilk anıtsal heykelidir. Atlı Atatürk figürü, Kurtuluş Savaşı'nın zaferini simgeler; kaidesindeki mermer rölyefler cephe sahnelerini betimler.\n\nAnıt, dönemin yeni başkentinin simgesel merkezi olan Ulus Meydanı'na konumlandırılmıştır. Krippel, Ankara'ya bizzat gelerek heykeli yerinde şekillendirmiş ve Cumhuriyet'in kuruluş ideallerini taşa işlemiştir.", funFacts: ["Cumhuriyet'in Ankara'daki ilk anıtsal heykeli (1927).", "Avusturyalı heykeltıraş Heinrich Krippel, Ankara'ya gelerek heykeli bizzat yerinde şekillendirdi.", "Kaidedeki mermer rölyefler, Kurtuluş Savaşı'nın önemli cephe sahnelerini betimler."] },
  { lat: 40.2386, lng: 33.0331, type: "tarihi", name: "Çubuk-1 Barajı", desc: "1936, Türkiye'nin ilk betonarme barajı.", era: "cumhuriyet", funFacts: ["Türkiye'nin ilk betonarme barajı (1936) — genç Cumhuriyet'in mühendislik gururu."] },
  { lat: 40.2140, lng: 32.2450, type: "tarihi", name: "Güdül Tarihi Kent (Cittaslow)", desc: "Sakin Şehir, otantik Osmanlı kasabası.", era: "osmanli" },
  { lat: 40.0900, lng: 32.6850, type: "tarihi", name: "Karalar Galat Mezarları", desc: "MÖ 1. yüzyıl, Kelt kökenli kral mezarları.", era: "roma" },
  { lat: 40.4333, lng: 32.4167, type: "tarihi", name: "Pelitçik Fosil Ormanı", desc: "20 milyon yıllık taşlaşmış ağaçlar.", era: "paleolitik" },
  { lat: 40.4930, lng: 32.4700, type: "tarihi", name: "Şeyh Ali Semerkandi Türbesi", desc: "15. yy İslam alimi, manevi turizm.", era: "osmanli" },
  { lat: 39.9400, lng: 32.8550, type: "tarihi", name: "Zincirli Camii", desc: "17. yy, kırmızı tuğla ve ahşap tavan.", era: "osmanli", longDesc: "17. yüzyılın ikinci yarısında inşa edilen Zincirli Camii, Ankara'nın Ulus semtinde yer alır. Adını, rivayete göre girişinde asılı olan zincirlerden alır — cemaatin başını eğerek saygıyla girmesini sağlamak amacıyla konulmuştur.\n\nCaminin en dikkat çekici özelliği silindirik tuğla minaresidir; bu form, Ankara'daki diğer Osmanlı camilerinden farklı bir karaktere sahiptir. İç mekânda kırmızı tuğla duvarlar ve ahşap tavan, dönemin sade ama zarif Osmanlı taşra mimarisini yansıtır.", funFacts: ["Adını girişindeki zincirlerden alır — cemaatin başını eğerek saygıyla girmesi için konulmuş.", "Silindirik tuğla minaresi, Ankara'daki diğer Osmanlı camilerinden ayırt edici bir özellik.", "17. yüzyıl Osmanlı taşra mimarisinin sade ama zarif bir örneği."] },
  { lat: 39.9895, lng: 33.1738, type: "tarihi", name: "Hasanoğlan Köy Enstitüsü", desc: "1941, aydınlanma projesi mirası.", era: "cumhuriyet" },
  { lat: 39.3490, lng: 31.5890, type: "tarihi", name: "Pessinus (Ballıhisar) Antik Kenti", desc: "Frig-Roma dönemi antik kent, Ana Tanrıça Kybele tapınağıyla ünlü.", era: ["frig", "roma"], longDesc: "Ankara'nın güneybatısında, Ballıhisar köyü yakınlarında yer alan Pessinus, Antik Çağ'ın en önemli dini merkezlerinden biriydi. Frig döneminde Ana Tanrıça Kybele'nin (Magna Mater) en kutsal tapınağı burada bulunuyordu.\n\nRomalılar MÖ 204'te Kybele kültünü Roma'ya taşımış, ancak Pessinus önemini korumaya devam etmiştir. Kazılarda tapınak kalıntıları, Roma dönemi tiyatrosu, stoalar ve su kanalları ortaya çıkarılmıştır. Antik kent, Frig'den Roma'ya uzanan kesintisiz bir yerleşim tarihine sahiptir.", funFacts: ["Ana Tanrıça Kybele'nin (Magna Mater) Antik Dünya'daki en kutsal tapınağı buradaydı.", "Romalılar MÖ 204'te Kybele kültünü Pessinus'tan Roma'ya taşıdı.", "Frig, Galat ve Roma dönemlerinden kalıntılar bir arada — binlerce yıllık kesintisiz yerleşim."], minZoom: 9 },

  /* ── KALE VE SAVUNMA YAPILARI ── */
  { lat: 39.9415, lng: 32.8658, type: "tarihi", name: "Akkale (İç Kale)", desc: "Selçuklu dönemi, çokgen planlı, sivri kemerli kapılar ve poternler. Kayıp St. Clemens Kilisesi ahşapları burada korunuyor.", era: "selcuklu" },
  { lat: 39.9395, lng: 32.8660, type: "tarihi", name: "Şarkkale ve Zindan Kapı", desc: "İç kalenin güneydoğu burcu. Roma mimari parçaları Türk döneminde devşirilmiş. Tarihi seyirdim yolu.", era: ["roma", "selcuklu"] },
  { lat: 39.9390, lng: 32.8625, type: "tarihi", name: "Kale Kapısı ve İlhanlı Kitabesi", desc: "Dış surların anıtsal girişi. 1330 tarihli Farsça İlhanlı vergi kitabesi. Yanındaki burç geç Osmanlı saat kulesine dönüştürülmüş.", era: ["selcuklu", "osmanli"] },
  { lat: 39.9435, lng: 32.8580, type: "tarihi", name: "Roma Dönemi Sur Kalıntıları", desc: "Çankırı Caddesi, 1999-2006 kazılarında bulunan MS 2-3. yy bosajlı taş örgülü anıtsal Roma surları.", era: "roma" },
  { lat: 39.9405, lng: 32.8660, type: "tarihi", name: "İç Kale Sarnıcı", desc: "Doğu surlarında, yıkık evin altından çıkan beşik tonozlu tuğla sarnıç. Kuşatma dönemi hayatta kalma stratejisi.", era: "roma" },

  /* ── İNANÇ VE BELLEK MEKANLARI ── */
  { lat: 39.9400, lng: 32.8640, type: "tarihi", name: "Sultan Alaeddin Camii", desc: "1197-98, İç Kale'de surlara yaslanmış. Ahşap tavan ve alçı mihrap ile Selçuklu estetiğinin Ankara'daki en eski temsilcisi.", era: "selcuklu", funFacts: ["İç Kale'nin en eski camii — 1197-98 tarihli, Ankara'daki Selçuklu estetiğinin ilk temsilcisi.", "Surlara yaslanarak inşa edilmiş, savunma mimarisiyle ibadet mekânını birleştiren nadir örneklerden.", "Alçı mihrabı ve ahşap tavanı, 800 yılı aşkın süredir özgün halini korumaktadır."] },
  { lat: 39.9375, lng: 32.8665, type: "tarihi", name: "Zöhre Hatun (Felekeddin) Türbesi", desc: "14-15. yy, gizemli baldaken (açık) türbe. Dört sütun, tuğla kemerler ve kirpi saçaklar.", era: "selcuklu" },
  { lat: 39.9365, lng: 32.8655, type: "tarihi", name: "Ahi Şerafeddin Türbesi", desc: "1330, Ahilik teşkilatının izi. Firuze ve mavi-beyaz sırlı çini sandukalar. Orijinal ahşap sanduka Etnografya Müzesi'nde.", era: "selcuklu" },
  { lat: 40.0170, lng: 32.3380, type: "tarihi", name: "Ayaş Ulu Camii", desc: "15. yy, mukarnas başlıklı ahşap direkler, kaba yonu taş işçiliği, taklit kündekari minber. Anadolu ahşap mimarisinin sessiz devi.", era: "osmanli" },
  { lat: 39.9390, lng: 32.8600, type: "tarihi", name: "Kurşunlu Camii", desc: "16. yy, Anafartalar Caddesi üzerinde klasik Osmanlı camii. Kurşun kaplı kubbesiyle adını almış.", era: "osmanli", longDesc: "16. yüzyılda inşa edilen Kurşunlu Camii, Anafartalar Caddesi üzerinde Ankara'nın ticari merkezinde yer alır. Adını, dönemin karakteristik yapı malzemesi olan kurşun levhalarla kaplı kubbesinden alır.\n\nKlasik Osmanlı cami planını yansıtan yapı, tek kubbeli ibadet mekânı ve son cemaat yeriyle sade ama zarif bir mimariye sahiptir. Ankara'nın Osmanlı dönemindeki ticari canlılığının ve kentsel dokusunun önemli bir parçasıdır.", funFacts: ["Adını kurşun levhalarla kaplı kubbesinden alır.", "Anafartalar Caddesi'ndeki konumuyla Ankara'nın tarihi ticaret aksı üzerinde yer alır."] },
  { lat: 39.9310, lng: 32.8540, type: "tarihi", name: "Maltepe Camii", desc: "Erken Cumhuriyet dönemi, klasik Osmanlı üslubunda inşa edilmiş cami.", era: "cumhuriyet", longDesc: "Cumhuriyet'in ilk yıllarında klasik Osmanlı üslubuyla inşa edilen Maltepe Camii, yeni başkent Ankara'nın dini yapı ihtiyacına cevap veren önemli eserlerden biridir. Geleneksel cami mimarisinin Cumhuriyet dönemine taşınmasını simgeler.\n\nMaltepe semtinin merkezinde yer alan yapı, çevresiyle birlikte mahalle kültürünün devamını sağlayan sosyal bir odak noktasıdır." },
  { lat: 39.9395, lng: 32.8665, type: "tarihi", name: "Karacabey Camii", desc: "15. yy, Karacabey Külliyesi'nin parçası. Ankara'nın tek üç duvarlı revaklı camii.", era: "osmanli", longDesc: "15. yüzyılda Karacabey Külliyesi'nin bir parçası olarak inşa edilen bu cami, yanındaki Karacabey Hamamı ile birlikte bir bütün oluşturur. Ankara'nın tek üç duvarlı revaklı camii olma özelliğiyle mimari açıdan benzersizdir.\n\nKülliye, cami, hamam, medrese ve imaretten oluşan Osmanlı sosyal yaşam kompleksinin Ankara'daki en iyi korunmuş örneklerinden biridir. Ahilik geleneğinin güçlü olduğu dönemde inşa edilen yapı, şehrin ticari ve toplumsal yaşamında merkezi bir rol oynamıştır.", funFacts: ["Ankara'nın tek üç duvarlı revaklı camii.", "Karacabey Külliyesi'nin parçası — yanındaki 580+ yıllık hamam hâlâ faaliyette.", "Ahilik geleneğinin güçlü olduğu 15. yüzyılda, ticaret ve toplum yaşamının merkezi olarak inşa edilmiş."] },

  /* ── KÖPRÜLER VE SU YAPILARI ── */
  { lat: 39.9850, lng: 32.5600, type: "tarihi", name: "Zir Köprüsü", desc: "İstanoz Vadisi girişinde Ortaçağ taş köprüsü. 4 kemer gözü. Yakınında Ermenice yazıtlı mezar taşları.", era: "selcuklu" },

  /* ── EK EDEBİYAT ── */
  { lat: 39.9210, lng: 32.8560, type: "edebiyat", name: "Adnan Ötüken İl Halk Kütüphanesi", desc: "1922, Paul Bonatz binası.", era: "cumhuriyet" },
  { lat: 39.9200, lng: 32.8550, type: "edebiyat", name: "Mülkiyeliler Birliği", desc: "1859 köklü, aydınların buluşma mekanı.", era: "osmanli" },
  { lat: 39.9070, lng: 32.8600, type: "edebiyat", name: "Kuğulu Park", desc: "1958, Sevgi Soysal'ın edebi mekanı.", era: "cumhuriyet" },
  { lat: 39.9390, lng: 32.8670, type: "edebiyat", name: "Şairler ve Yazarlar Evi", desc: "Hamamönü'nde şiir dinletileri.", era: "cumhuriyet" },

  /* ── EK GASTRONOMİ ── */

  /* ── KÜLTÜREL MİRAS (Resmi Envanter) ── */

  /* Beypazarı */
  { lat: 40.1698, lng: 31.9192, type: "miras", name: "Beypazarı Bedesteni", desc: "Osmanlı dönemi kapalı çarşısı, altı kubbeli taş yapı. Tescilli kültür varlığı.", era: "osmanli" },
  { lat: 40.1688, lng: 31.9185, type: "miras", name: "Paşa Hamamı (Beypazarı)", desc: "Osmanlı klasik hamam mimarisi. Sıcaklık, soğukluk ve halvet bölümleriyle korunmuş.", era: "osmanli" },
  { lat: 40.1695, lng: 31.9190, type: "miras", name: "Akşemsettin Camii", desc: "Fatih'in hocası Akşemsettin adına. Beypazarı'nın manevi merkezi.", era: "osmanli" },
  { lat: 40.1720, lng: 31.9175, type: "miras", name: "Kaygusuz Abdal Türbesi", desc: "14. yy sufi ozanı. Bektaşi geleneğinin öncülerinden, hicivli nefesleriyle ünlü.", era: "selcuklu" },
  { lat: 40.1660, lng: 31.9100, type: "miras", name: "Hacılar Köprüsü", desc: "Osmanlı dönemi taş köprü, kervan yolu üzerinde.", era: "osmanli" },
  { lat: 40.1550, lng: 31.9400, type: "miras", name: "İnözü Vadisi Kaya Kiliseleri ve Mezarları", desc: "Vadiye oyulmuş Bizans dönemi kaya kiliseleri ve kaya mezarları. Kapadokya benzeri peribacaları.", era: "roma" },
  { lat: 40.1710, lng: 31.9210, type: "miras", name: "Yediler Türbesi", desc: "Yedi evliyanın yattığına inanılan ortak türbe. Halk inancı ve ziyaret geleneği.", era: "osmanli" },

  /* Nallıhan */
  { lat: 40.1850, lng: 31.3480, type: "miras", name: "Tabduk Emre Türbesi", desc: "Yunus Emre'nin hocası, 13. yy mutasavvıfı. Emrem Sultan (Baba Sultan) köyünde.", era: "selcuklu" },
  { lat: 40.1845, lng: 31.3490, type: "miras", name: "Bacım Sultan Türbesi", desc: "Tabduk Emre'nin eşi. Anadolu kadın erenleri geleneğinin sembol ismi.", era: "selcuklu" },
  { lat: 40.1860, lng: 31.3500, type: "miras", name: "Nasuhpaşa Camii (Nallıhan)", desc: "16. yy, Nasuh Paşa Hanı'nın yanında inşa edilmiş külliye parçası.", era: "osmanli" },

  /* Polatlı */
  { lat: 39.6400, lng: 31.9600, type: "miras", name: "Girmeç Kalesi", desc: "Frigya-Roma-Bizans katmanlı yüksek tepe kalesi. Gordion'a hakim stratejik konum.", era: ["frig", "roma"] },
  { lat: 39.6550, lng: 31.9920, type: "miras", name: "Kral Yolu Kalıntıları", desc: "MO 5. yy Pers imparatorluk yolu. Sardis'ten Susa'ya uzanan antik ticaret hattının Gordion kesiti.", era: "frig" },

  /* Kızılcahamam */
  { lat: 40.4710, lng: 32.6510, type: "miras", name: "Sey Hamamı (Kızılcahamam)", desc: "Tarihi kaplıca yapısı. Roma'dan Osmanlı'ya termal su geleneğinin kesintisiz tanığı.", era: ["roma", "osmanli"] },

  /* Sincan */
  { lat: 40.0200, lng: 32.5500, type: "miras", name: "Zincirlikaya Mağaraları ve Kilise Kalıntısı", desc: "Kaya oyma Bizans dönemi kilise ve yaşam alanları. Ankara'nın bilinen en iyi korunmuş kaya manastır kompleksi.", era: "roma" },
  { lat: 39.9800, lng: 32.5800, type: "miras", name: "Yedi Odalar Kaya Yerleşmesi", desc: "Roma/Bizans dönemi, kayaya oyulmuş yedi odalı yerleşim. Manastır veya inziva yeri.", era: "roma" },
  { lat: 39.9700, lng: 32.5600, type: "miras", name: "Hisar Kale (Sincan)", desc: "Ankara Çayı vadisine hakim stratejik tepe kalesi. Bizans-Selçuklu dönemi.", era: ["roma", "selcuklu"] },

  /* Mamak */
  { lat: 39.9450, lng: 32.9250, type: "miras", name: "Hüseyin Gazi Türbesi", desc: "8. yy Emevi-Abbasi savaşlarında şehit düşen komutanın türbesi. Yoğun ziyaret yeri.", era: "roma" },

  /* Keçiören */
  { lat: 39.9600, lng: 32.8600, type: "miras", name: "Etlik Köprüsü", desc: "Osmanlı dönemi taş köprü. Keçiören'in en eski sivil yapılarından.", era: "osmanli" },

  /* Çankaya */
  { lat: 39.9200, lng: 32.8600, type: "miras", name: "Saraçoğlu Mahallesi", desc: "1944-46, Paul Bonatz tasarımı. Cumhuriyet'in ilk planlı konut yerleşkesi, kentsel sit alanı.", era: "cumhuriyet", longDesc: "1944-1946 yılları arasında Alman mimar Paul Bonatz tarafından tasarlanan Saraçoğlu Mahallesi, Cumhuriyet'in ilk planlı konut yerleşkesidir. Devlet memurları için inşa edilen 434 daireden oluşan yerleşke, bahçe-şehir anlayışıyla tasarlanmıştır.\n\nKentsel sit alanı ilan edilen mahalle, düşük yoğunluklu yapılaşması, geniş yeşil alanları ve yaya dostu sokak dokusuyladır. Modernist mimari ile Ankara'nın iklim koşullarını birleştiren yapılar, 2020'lerde kapsamlı bir restorasyon sürecine girmiştir." },

  /* Kazan */
  { lat: 40.2300, lng: 32.6800, type: "miras", name: "Dur Hasan Şah Türbesi", desc: "Kazan'daki tescilli Osmanlı türbesi. Bölgenin manevi hafızası.", era: "osmanli" },

  /* Çamlıdere */
  { lat: 40.4920, lng: 32.4680, type: "miras", name: "Peçenek Bucağı Camii", desc: "Çamlıdere'de tescilli tarihi ahşap cami. Kırsal Anadolu cami mimarisinin sade örneği.", era: "osmanli" },

  /* Gölbaşı — AST 2023, Doç. Dr. Derya Yılmaz, AGHA Projesi */
  { lat: 39.7800, lng: 32.8000, type: "miras", name: "Tulumtaş Manastır Mağaraları", desc: "Gölbaşı'nda kayaya oyulmuş Bizans manastır kompleksi. Şarap üretim tekneleri kalıntıları.", era: "roma" },
  { lat: 39.7540, lng: 32.8200, type: "miras", name: "Hacılar Höyüğü (Gölbaşı)", desc: "165x200 m, 22 m yüksekliğinde anıtsal höyük. 1940-41'de R.O. Arık tarafından Türk Tarih Kurumu adına kazılmış; Frig dönemi yapıları ortaya çıkarılmış. 7 km doğusundaki Karaoğlan kazısıyla bağlantılı. MÖ III. bin'den MÖ I. bin'e kesintisiz yerleşim. Hitit yol ağının Gölbaşı güzergahında stratejik konum. (AST 2023)", era: ["hitit", "frig"] },
  { lat: 39.7650, lng: 32.7900, type: "miras", name: "Devedaşı Höyüğü", desc: "306x256 m boyutunda, Gölbaşı'nın en büyük höyüklerinden. Kalkolitik Çağ'dan Demir Çağı sonuna kadar yerleşim katmanları. 1. derece arkeolojik sit alanı. Yüzeyinde seramikten yapılmış ikincil kullanım disk ağırşak bulunmuş. (AST 2023, AGHA Projesi)", era: "paleolitik" },
  { lat: 39.7630, lng: 32.8300, type: "miras", name: "Tulumtaş Höyüğü", desc: "2007-2008'de Anadolu Medeniyetleri Müzesi kurtarma kazısı. En az 4 tabaka: Orta Tunç Çağı, Roma, Helenistik ve Erken Doğu Roma. İncek yolu höyüğü ikiye bölmüş. Kesikköprü Barajı su projesi sırasında keşfedilmiş. (AST 2023)", era: ["hitit", "roma"] },
  { lat: 39.7600, lng: 32.8250, type: "miras", name: "Kapaklı Höyüğü ve Antik Şarap Teknesi", desc: "Höyüğün hemen yanında, ana kayaya oyulmuş taş şarap sıkma teknesi — tel çitle koruma altında. Bizans dönemi bağcılık ve şarap üretiminin fiziksel kanıtı. Höyükte MÖ III. bin'den Bizans'a seramik. (AST 2023)", era: "roma" },
  { lat: 39.7700, lng: 32.8100, type: "miras", name: "Taştepe (Taşdeve Mağarası)", desc: "Mogan Gölü'nü besleyen Çölova Deresi kıyısında, 1118 m rakımlı doğal kayalık üzerinde Geç Roma/Bizans karakol yerleşimi. Tepe merkezinde eski bir mağara girişi ('Taşdeve Mağarası') bulunuyordu; tahribatla kapanmış. Vadiye hakim stratejik gözetleme noktası. (AST 2023)", era: "roma" },
  { lat: 39.7750, lng: 32.7950, type: "miras", name: "Karaağızlı Höyüğü", desc: "Geç Kalkolitik'ten Bizans'a 5000 yıllık yerleşim. 13.80 m boyunca izlenebilen sur duvarı kalıntısı ve tepede Klasik Çağ'a ait devasa taş yapı temeli. Haymana yoluna hakim konumda. İlk kez 1994'te S. Omura tarafından tespit edilmiş. (AST 2023)", era: "paleolitik" },

  /* Gölbaşı — AST 2023, Prof. Dr. Gizem & Metin Kartal, Paleolitik Araştırma */
  { lat: 39.7680, lng: 32.8460, type: "miras", name: "Bezirhane-Kazmalı Paleolitik Alanı", desc: "2022'de keşfedilen, Ankara için ilk üçgen formlu iki yüzeyli alet (biface). Yoğun çört yumruları ve Orta Paleolitik levallois çekirdekler. Gölbaşı'nın en zengin Paleolitik buluntu noktalarından. Hammadde kaynağı ve açık hava atölyesi niteliğinde. (AST 2023, Kartal & Kartal)", era: "paleolitik" },
  { lat: 39.7720, lng: 32.8350, type: "miras", name: "Dikilitaş Levallois Açık Hava Atölyesi", desc: "Taş ocağı çevresinde 10'dan fazla buluntu noktasında yoğun Orta Paleolitik levallois çekirdek, yonga ve düzeltili parça koleksiyonu. Ankara'nın bilinen en kapsamlı Paleolitik açık hava atölye alanı. Tipik levallois çekirdekler Anadolu Medeniyetleri Müzesi'ne teslim edilmiş. (AST 2023)", era: "paleolitik" },
  { lat: 39.7580, lng: 32.8150, type: "miras", name: "Boyalık Paleolitik Çört Yatağı", desc: "Alt ve Orta Paleolitik buluntuların yoğun olduğu doğal çört hammadde kaynağı. Kıyıcılar, levallois çekirdekler ve yüzlerce yontma taş alet parçası. Ankara'nın en eski insan izlerinin (Alt Paleolitik, ~500.000+ yıl) bulunduğu alanlardan. (AST 2023)", era: "paleolitik" },

  /* Güdül — AST 2023, Prof. Dr. Mehmet Sağır, Paleontolojik Araştırma */
  { lat: 40.2100, lng: 32.2900, type: "miras", name: "Kaşharman Fosil Lokalitesi (Güdül)", desc: "Miyosen Dönem (5-20 milyon yıl) memeli fosil yatağı. At familyası (Equidae) ve sığırgiller (Bovidae) fosil kalıntıları yamaç kenarında yoğun dağılım halinde. Kirmil Çayı kenarında keşfedilmiş. Ankara'nın paleontolojik zenginliğinin en yeni kanıtı. (AST 2023, Sağır)", era: "paleolitik" },

  /* Yenimahalle */
  { lat: 39.9550, lng: 32.8200, type: "miras", name: "Akköprü (1222)", desc: "Sultan I. Alâeddin Keykubad tarafından 619/1222'de yaptırılan 7 kemerli Selçuklu köprüsü. 79.74 m uzunluk, 4.77 m genişlik. Ankara Çayı üzerinde 800 yıldır ayakta. Ayakların üçgen mahmuzlu kesme taş kaplaması özgün. İstanbul Yolu'nun en eski geçiş noktası. (AST 2023, Bozkurt)", era: "selcuklu" },

  /* Şereflikoçhisar */
  { lat: 38.9400, lng: 33.5400, type: "miras", name: "Alaeddin (Kurşunlu) Camii (Şereflikoçhisar)", desc: "Selçuklu dönemi kurşun kaplı kubbeli cami. Tuz Gölü havzasının en eski ibadet yapısı.", era: "selcuklu" },

  /* ── AST 2023 CİLT 3 ── */

  /* Polatlı — AST 2023, Doç. Dr. Müge Durusu-Tanrıöver, PYAP Projesi */
  { lat: 39.6200, lng: 32.1450, type: "miras", name: "Sarıoba Höyük", desc: "Kalkolitik'ten Roma'ya kesintisiz 5 dönem yerleşim. Polatlı kuzeyinde Ankara Çayı'na 300 m mesafede. 2022'de %100 kapsama yüzey taraması yapıldı. Küçük Kalkolitik yerleşim, Tunç Çağları boyunca genişlemiş, seyrek Demir Çağı ve ardından Helenistik-Roma yeniden iskanı. Bölgenin MÖ 2. binyılını anlamak için en kritik iki höyükten biri. (AST 2023, PYAP)", era: "paleolitik" },
  { lat: 39.5450, lng: 32.0500, type: "miras", name: "Karayavşan Höyük", desc: "Kalkolitik, İlk Tunç ve Orta Tunç Çağı höyüğü. 1960'larda Raci Temizer tarafından Anadolu Medeniyetleri Müzesi adına kazıldı. İlk Tunç Çağı figürinleri bulunmuş. 2022'de yüzeyde İlk Tunç Çağı'na ait metal eritme potası keşfedilip müzeye teslim edildi — bölgede erken metalürjinin kanıtı. Kaçak kazı ve toprak alımıyla ciddi tahribata uğramış. (AST 2023, PYAP)", era: "paleolitik" },
  { lat: 39.5600, lng: 32.1700, type: "miras", name: "Kargalı Kalesi", desc: "Demir Çağı, Roma ve Bizans dönemlerine tarihlenen tepedeki kale. Ulaşılması güç, hakim konumda stratejik bir yapı. Yüzey buluntuları olası Galat kökenine işaret ediyor. Polatlı'nın en gizemli savunma yapısı. (AST 2023, PYAP)", era: ["frig", "roma"] },
  { lat: 39.6350, lng: 32.1200, type: "miras", name: "Hacıtuğrul Baba Türbesi ve Yerleşimi", desc: "Selçuklu dönemi türbe, doğu ve güneydoğusunda geniş bir yerleşim alanıyla çevrili. Yeşil, sarı, kahverengi sırlı ve mavi-beyaz bezemeli seramikler Selçuklu-Türk dönemine tarihlenirken, buluntular arasında Frig gri malları da tespit edilmiş — bölgenin Demir Çağı'na uzanan derinliğinin kanıtı. (AST 2023, PYAP)", era: ["frig", "selcuklu"] },
  { lat: 39.6050, lng: 32.1750, type: "miras", name: "Enik Tepe", desc: "Polatlı merkezin 3 km kuzeydoğusunda doğal bir tepe üzerinde Bizans dönemi yamaç yerleşimi. Pembe hamurlu boyasız çanak çömlek ve mavi cam bilezik parçaları (Bizans mezarlıklarının tipik buluntusu) keşfedilmiş. (AST 2023, PYAP)", era: "roma" },

  /* Elmadağ — AST 2023, Görür, Çetin vd. Yüzey Araştırması */
  { lat: 39.8800, lng: 33.0500, type: "miras", name: "Tekke Yazılıkaya Kaya Resimleri", desc: "Tarih öncesi kaya sanatı! Tekke köyü kuzeydoğusunda iki ayrı noktada: Kaya Pınar mevkiinde düzleştirilmiş kaya yüzeyine kolları kalkık insan figürleri oyulmuş. İkinci nokta (Akçaali-Tekke arası) kazıma tekniğiyle dikdörtgen ve yarım daire şekiller — muhtemelen kubbeli yapı tasvirleri. Ankara'nın bilinen en eski sanat eserleri arasında. (AST 2023, Elmadağ)", era: "paleolitik" },
  { lat: 39.8700, lng: 33.0900, type: "miras", name: "Kuşcuali Kaya Şapeli", desc: "Bizans dönemi kaya oyma şapel. Dikdörtgen planlı naos (5.45 × 2.31 m), yarım daire apsisi (1.58 × 1.22 m) ve beşik tonoz örtüsü. Define avcıları tarafından ağır tahribata uğramış, bezeme izleri yok olmuş. Ankara'nın az bilinen Bizans kaya mimarisi örneklerinden. (AST 2023, Elmadağ)", era: "roma" },
  { lat: 39.9300, lng: 32.8800, type: "miras", name: "Hasanoğlan Köy Enstitüsü Yerleşkesi", desc: "1940'larda kurulan efsanevi köy enstitüsü kampüsü. Tescilli yapılar: ana bina, açık hava amfi tiyatrosu, müzik okulu ve konser salonu, atölye binaları. Cumhuriyet eğitim idealinin somut mirası. Ayrıca yakınında tarih öncesi Hasanoğlan Figürini'nin bulunduğu alan, Roma dönemi mil taşları ve kabartmalar da mevcut. (AST 2023, Elmadağ)", era: "cumhuriyet" },
  { lat: 39.8900, lng: 33.0400, type: "miras", name: "Tekke Dibektaşı Kutsal Alanı", desc: "Tekke köyü kuzeyinde antik kayalık alanda oyulmuş çukurlar ve kanallar — adak/sunu ritüellerine işaret eden kutsal alan. 10 m batıda tahrip edilmiş pithos gömüsü ve pişmiş toprak parçaları tespit edilmiş. Antik dönemde (muhtemelen Roma öncesi) dinsel/ritüel işlev gören nadir bir açık hava tapınım alanı. (AST 2023, Elmadağ)", era: "roma" },

  /* Ayaş — AST 2023, Doç. Dr. Tolga Bozkurt, Ortaçağ Ankara Kuzeybatı */
  { lat: 40.0150, lng: 32.3400, type: "miras", name: "Ayaş Kilik Camii (1560-61)", desc: "968/1560-61 tarihli kitabesiyle Ayaş'ın en anıtsal camisi. 9.88 × 16.98 m geniş dikdörtgen plan, 4 sıra ahşap sütunla 5 sahına bölünmüş. Özgün alçı kalıplı mihrap, boyalı bezemeli minber. Kuzeydoğu köşesinde ahşap minare. Hacıveli Mahallesi'nde. (AST 2023, Bozkurt)", era: "osmanli" },
  { lat: 40.0100, lng: 32.3380, type: "miras", name: "Bünyamin Ayaşî Camii ve Türbesi", desc: "16. yüzyıl Bayramî-Melamî şeyhi Bünyamin Ayaşî'ye atfedilen üç sahınlı cami. Özgün ahşap minber. Kuzeydoğu köşesinde kare gövdeli, kubbeli türbe — şeyhin kabri burada. Dervişimam Mahallesi'nde. Ankara'nın tasavvuf geleneğinin Ayaş'taki somut izi. (AST 2023, Bozkurt)", era: "osmanli" },

  /* Beypazarı — AST 2023, Bozkurt */
  { lat: 40.0700, lng: 32.2200, type: "miras", name: "Adaören Kalesi", desc: "Beypazarı'nın 30 km doğusunda, Kirmir Çayı vadisinde yarımada şeklindeki yükselti üzerinde ortaçağ kalesi. Dik kayalıklar ve çay doğal hendek görevi görüyor. Güneydoğudan giriş, iki altıgen burçlu doğu kapısı (biri kısmen ayakta). Roma tonozlu oda, Bizans devşirme malzeme, Türk-İslam kültürel varlığına işaret eden ovo tipi dikili taşlar. Üç dönemin izini taşıyan stratejik savunma yapısı. (AST 2023, Bozkurt)", era: ["roma", "selcuklu"] },

  /* Sincan — AST 2023, Bozkurt */
  { lat: 39.9900, lng: 32.6100, type: "miras", name: "Zir Köprüsü (Yenikent)", desc: "Yenikent'te Zir (İstanoz) Vadisi girişinde, dere üzerinde 4 kemerli taş köprü. 4.40 m genişlik, 40 m uzunluk. Memba tarafı ayaklarında mahmuzlar. İlk yapım ortaçağa tarihleniyor olabilir. Yakınında Osmanlı dönemi gayrimüslim mezarlığı — Ermeni kitabeli ve haç monogramlı mezar taşlarıyla birlikte. (AST 2023, Bozkurt)", era: "selcuklu" },
  { lat: 39.9700, lng: 32.5500, type: "miras", name: "Fatma Bacı Türbesi (1310)", desc: "Sincan Bacı Mahallesi'nde kare gövdeli, piramidal çatılı türbe. 25 Haziran 1310'da vefat eden Fatma Bacı'ya ait — Sincan çevresinin en eski tarihli tescilli yapısı. Yanında mihrap duvarına dik üç sahınlı cami. Ahi geleneğinin kadın kolunun (Bacıyan-ı Rum) nadir fiziksel kanıtlarından. (AST 2023, Bozkurt)", era: "selcuklu" },

  /* Çubuk — AST 2023, Albayrak vd. 1402 Ankara Meydan Savaşı Araştırması */
  { lat: 40.1700, lng: 32.9500, type: "miras", name: "Gayri Tepesi (1402 Savaş Alanı)", desc: "1402 Ankara Meydan Savaşı'nın en çarpıcı bulgusu. Çubuk'un 10 km güneybatısında, Kutuören yakınında yoğun insan kemik kalıntıları yüzeyde tespit edilmiş. Tarla sürme ve yol yapımıyla en az 30 birey: 4 kadın, 15 erkek, 6-10 yaş çocuklar. Tibia kondilinde kesik izleri, kaburga parçalarında 500-600°C yanık. Yıldırım Bayezid'in kaçış rotası üzerinde. Jeoradar ve kazı planlanıyor. (AST 2023, Albayrak)", era: "osmanli" },
  { lat: 40.2200, lng: 33.0200, type: "miras", name: "Melikşah Tepesi", desc: "Çubuk'ta Yıldırım Bayezid'in 1402 Ankara Meydan Savaşı'nda komuta ettiği tepe olarak önerilen alan. Doğu yamacında Osmanlı dönemi sırlı seramikler ve bir at nalı parçası bulunmuş (nal Anadolu Medeniyetleri Müzesi'ne teslim edildi). Güneyde Bizans ve Osmanlı seramikleri. Yakınında tescilli Melikşah Hamamı. (AST 2023, Albayrak)", era: "osmanli" },

  /* ── AST 2019-2020 ── */

  /* Evren — AST 2019-2020, Prof. Dr. Mehmet Sağır, Ankara İli Yüzey Araştırması */
  { lat: 39.2100, lng: 33.2500, type: "miras", name: "Cebirli Fosil Lokalitesi (Evren)", desc: "Hirfanlı Barajı kıyısında keşfedilen Üst Miyosen Dönem (5-11 milyon yıl) zengin fosil yatağı. Bovidae (sığırgiller), zürafa, gergedan ve hortumlulara (fil benzeri) ait fosiller baraj su seviyesinin hemen üzerindeki çökellerde yoğun biçimde dağılmış. 2020'de Anadolu Medeniyetleri Müzesi ile kurtarma kazısı yapıldı. Baraj suları alanı giderek tahrip ediyor. (AST 2019-2020, Sağır)", era: "paleolitik" },
  { lat: 40.0800, lng: 32.6200, type: "miras", name: "Kocatepe Mağarası (Kazan)", desc: "Kahraman Kazan ilçesi Kınık Mahallesi kuzeyinde arkeolojik mağara. İçerisinde kültürel dolgu, seramik parçaları ve insan kemikleri tespit edilmiş. Kemikler Anadolu Medeniyetleri Müzesi'ne teslim edildi. Kaçak kazı çukurlarıyla tahribata uğramış. Çevresindeki Karataş ve Değirmen Çeşme lokalitelerinde Orta Paleolitik el baltaları, çekirdekler ve kazıyıcılar bulunmuş. (AST 2019-2020, Sağır)", era: "paleolitik" },
  { lat: 39.7350, lng: 32.7600, type: "miras", name: "Çakmaklıbel Paleolitik Alanı (Gölbaşı)", desc: "Gölbaşı ilçesi Selametli Mahallesi'nde Çakmaklı Tepe yamaçlarında Orta Paleolitik açık hava alanı. Çok sayıda çakmaktaşı çekirdek, yonga ve kenar kazıyıcı tespit edilmiş. Yakın çevrede insan eli ile oyulmuş arkeolojik mağaralar da keşfedildi. Ankara'nın güney ilçelerindeki Paleolitik insan izlerinin yeni kanıtı. (AST 2019-2020, Sağır)", era: "paleolitik" },

  /* Kazan — AST 2019, Prof. Dr. Mehmet Sağır, 2018 Yılı Ankara İli Araştırması */
  { lat: 40.1000, lng: 32.6500, type: "miras", name: "Sinaptepe Paleolitik Alanı (Kazan)", desc: "Kahraman Kazan ilçesi Yassıören Mahallesi kuzeyinde Sinaptepe'nin batı yamaçlarında yoğun Pleistosen Dönem taş alet yatağı. Çekirdek, vurgaç, ön kazıyıcı, kenar kazıyıcı, yonga, dilgi ve çentikli aletler. Aynı alanda Miyosen çökelleri içinde omurgalı fosilleri de gözlemlendi. Ankara'nın kuzey batısında Paleolitik insan varlığının önemli kanıtı. (AST 2019, Sağır)", era: "paleolitik" },
  { lat: 40.0700, lng: 32.5800, type: "miras", name: "Karataş Paleolitik Lokalitesi (Kazan)", desc: "Kahraman Kazan Sarılar Mahallesi'nde keşfedilen çok zengin açık hava Paleolitik alanı. Alt Paleolitik ve Orta Paleolitik başlangıcına ait el baltaları (iki yüzeyli), çekirdekler, vurgaçlar, kazıyıcılar. Buluntuların yoğunluğu araştırmacıları 'kazı gerektirecek nitelikte' değerlendirmesine götürdü. Ankara Paleolitiği için kritik bir keşif. (AST 2019, Sağır)", era: "paleolitik" },

  /* Ayaş — AST 2019, Sağır, 2018 Ankara İli Araştırması */
  { lat: 40.0600, lng: 32.3800, type: "miras", name: "Asarıntepe Fosil Lokalitesi (Ayaş)", desc: "Ayaş ilçesi Pınaryaka Köyü'nün 3 km kuzeydoğusunda Miyosen Dönem omurgalı fosil yatağı. At familyasına ait kemik kalıntıları ve küçük baş hayvanlara ait fosiller yamaçlara yayılmış halde. Tarım faaliyetleriyle giderek tahrip oluyor. (AST 2019, Sağır)", era: "paleolitik" },

  /* ── AST 2011 ── */

  /* Çankaya/Gölbaşı — AST 2011, Doç. Dr. İlgezdi Bertram & Bertram, ODTÜ İTÇ Araştırması */
  { lat: 39.8900, lng: 32.7800, type: "miras", name: "Koçumbeli İlk Tunç Çağı Yerleşimi", desc: "ODTÜ kampüsü yakınında İlk Tunç Çağı II'ye (MÖ ~2700-2400) tarihlenen müstahkem yerleşim. 45 × 40 m boyutlarında, üç yandan çevre duvarıyla çevrili. 1960'larda B. Tezcan tarafından kazılmış. 650 m güneybatısında benzer planlı Ahlatlıbel yerleşimi yer alıyor. Ankara'nın merkezinde İlk Tunç Çağı yaşamının nadir kanıtı. (AST 2011, İlgezdi Bertram)", era: "hitit" },
  { lat: 39.7400, lng: 32.7900, type: "miras", name: "Karaoğlan Höyük (Gölbaşı)", desc: "1937-1942 yıllarında R.O. Arık başkanlığında kazılan önemli İlk Tunç Çağı höyüğü. Siyah açkılı, yiv bezemeli ve kırmızı açkılı seramikleriyle tanınır. 2010'da ODTÜ ekibi çevresinde 8 İlk Tunç Çağı yerleşimi daha tespit etti. Koçumbeli ve Ahlatlıbel ile birlikte 'Ankara Grubu' olarak anılan İTÇ kültür çevresinin merkezi. (AST 2011, İlgezdi Bertram)", era: "hitit" },

  /* ── AST 2018 (2017 Sezonu) ── */

  /* Kalecik — AST 2018, Prof. Dr. Mehmet Sağır, 2017 Ankara İli Araştırması */
  { lat: 40.2949, lng: 33.4870, type: "miras", name: "Çandır Fosil Lokalitesi (Kalecik)", desc: "Ankara'nın Kalecik ilçesi Çandır Köyü'nde Orta Miyosen Dönem (yaklaşık 12-14 milyon yıl) büyük memeli fosil yatağı. Hortumlu hayvanlar (Proboscidea), çift tırnaklılar (Artiodactyla) ve tek tırnaklılar (Perissodactyla) fosilleri. Daha önceki kazılarda hominoid (insansı primat) kalıntıları da bulunmuş — Anadolu'nun en önemli Miyosen primat lokalitelerinden. GPS: 40°17'41\"K, 33°29'13\"D. (AST 2018, Sağır)", era: "paleolitik" },
  { lat: 39.7368, lng: 33.0720, type: "miras", name: "Yaylaköy Miyosen Fosil Yatağı (Çankaya)", desc: "Çankaya ilçesi Yaylaköy-Evcilerağılları Mevkii'nde in-situ (yerinde) Miyosen Dönem fosil yatağı. Tek tırnaklılar (at familyası), çift tırnaklılar ve hortumlu hayvan fosilleri doğal konumlarında keşfedildi. Tarla açma faaliyetleriyle tehdit altında. MTA tarafından da önceden tespit edilmişti. GPS: 39°44'12\"K, 33°04'19\"D. (AST 2018, Sağır)", era: "paleolitik" },
  { lat: 39.7200, lng: 32.8200, type: "miras", name: "Yaylabağ Alt Paleolitik Alanı (Gölbaşı)", desc: "Gölbaşı ilçesi Yaylabağ Köyü doğusunda hem Alt Paleolitik hem Orta Paleolitik döneme ait taş aletlerin bulunduğu geniş alan. Andezitten büyük yonga parçaları (Alt Paleolitik) ve çok sayıda düzeltili yonga (Orta Paleolitik). Ankara'nın güney bölgesinde en az ~500.000 yıllık insan varlığının kanıtı. (AST 2018, Sağır)", era: "paleolitik" },

  /* ── DOĞA & PARK ── */
  { lat: 39.9450, lng: 32.8470, type: "doğa", name: "Gençlik Parkı", desc: "1943, Cumhuriyet'in gençliğe armağanı. Havuz, lunapark ve açık hava etkinlik alanları.", era: "cumhuriyet", longDesc: "1943'te açılan Gençlik Parkı, genç Cumhuriyet'in Ankara'ya kazandırdığı ilk büyük kamusal rekreasyon alanıdır. Hermann Jansen'in Ankara şehir planında öngörülen yeşil alanlardan biri olarak tasarlanmıştır.\n\nParkın merkezindeki büyük havuz, çevresindeki yürüyüş yolları ve çay bahçeleri, onlarca yıl boyunca Ankaralıların en sevdiği buluşma noktası olmuştur. Ulus semtinin hemen yanında yer alan park, tarihi kent merkezinde bir nefes alma alanı sunmaktadır.", funFacts: ["1943'te açılan park, Cumhuriyet Ankara'sının ilk büyük kamusal rekreasyon alanı.", "Hermann Jansen'in Ankara şehir planında öngörülen yeşil alanlardan biri olarak tasarlandı.", "Ulus'un hemen yanında konumuyla tarihi kent merkezinin yeşil akciğeri."] },
  { lat: 39.9600, lng: 32.8350, type: "doğa", name: "Altınpark", desc: "Ankara'nın en büyük park ve fuar alanı. Gölet, amfi tiyatro, lunapark ve botanik bahçesiyle aile dostu.", era: "cumhuriyet" },
  { lat: 39.9510, lng: 32.8950, type: "doğa", name: "Göksu Parkı", desc: "Mamak'ın yeşil akciğeri. Yürüyüş parkurları, piknik alanları ve çocuk oyun alanları.", era: "cumhuriyet" },
  { lat: 39.8900, lng: 32.8400, type: "doğa", name: "Dikmen Vadisi Parkı", desc: "5 km uzunluğundaki vadi parkı. Göletler, şelaleler, yürüyüş yolları ve açık hava sergisi.", era: "cumhuriyet" },
  { lat: 39.9200, lng: 32.8300, type: "doğa", name: "Ankara Üniversitesi Botanik Bahçesi (10. Yıl Parkı)", desc: "Cumhuriyet'in 10. yılında kurulan, 200+ türle Anadolu florasının canlı kataloğu.", era: "cumhuriyet" },
  { lat: 39.9330, lng: 32.8500, type: "doğa", name: "Meclis Parkı (TBMM Millî Egemenlik Parkı)", desc: "TBMM kampüsü yanında halkın dinlenme alanı. Anıtsal ağaçlar ve geniş çim alanlar.", era: "cumhuriyet" },
  { lat: 39.9270, lng: 32.8200, type: "doğa", name: "50. Yıl Parkı", desc: "Cumhuriyet'in 50. yılı anısına düzenlenen geniş park alanı.", era: "cumhuriyet" },
  { lat: 40.7200, lng: 32.6500, type: "doğa", name: "Soğuksu Milli Parkı", desc: "1959'da ilan edilen milli park. Karaçam ormanları, kızıl geyik ve yaban domuzu habitat alanı. 1.050 hektar.", era: "cumhuriyet" },
  { lat: 40.1700, lng: 31.3600, type: "doğa", name: "Nallıhan Kuş Cenneti (Emremsultan Sazlığı)", desc: "Sarıyar Barajı kıyısında 500+ kuş türü gözlemlenen sulak alan. Flamingo, turna ve pelikan kolonileri.", era: "cumhuriyet" },
  { lat: 40.1200, lng: 31.4000, type: "doğa", name: "Mavi Göl (Nallıhan)", desc: "Turkuaz renkli doğal göl. Kayın ve çam ormanlarıyla çevrili doğa harikası.", era: "cumhuriyet" },
  { lat: 40.2500, lng: 33.0500, type: "doğa", name: "Çubuk-2 Barajı ve Karagöl Tabiat Parkı", desc: "Baraj gölü çevresinde piknik, kamp ve doğa yürüyüşü alanı. Çubuk'un doğa turizmi merkezi.", era: "cumhuriyet" },
  { lat: 40.2000, lng: 32.7000, type: "doğa", name: "Kurtboğazı Barajı", desc: "Ankara'nın su ihtiyacını karşılayan baraj. Çevresinde trekking ve doğa fotoğrafçılığı rotaları.", era: "cumhuriyet" },
  { lat: 40.4800, lng: 32.4500, type: "doğa", name: "Sarıbuğa Tabiat Parkı (Çamlıdere)", desc: "Çamlıdere'de el değmemiş ormanlar içinde doğa yürüyüşü ve kamp alanı.", era: "cumhuriyet" },
  { lat: 39.5800, lng: 33.0000, type: "doğa", name: "Bala Karagöl", desc: "Bala ilçesindeki doğal göl. Kuş gözlemciliği ve fotoğrafçılık için ideal.", era: "cumhuriyet" },
  { lat: 39.9350, lng: 32.8150, type: "doğa", name: "Atatürk Orman Çiftliği (AOÇ)", desc: "1925'te Atatürk tarafından kurulan 33.000 dönümlük çiftlik ve park alanı. Bira fabrikası, süt çiftliği ve hayvanat bahçesi.", era: "cumhuriyet", longDesc: "1925'te Mustafa Kemal Atatürk'ün kendi cebinden satın aldığı arazide kurulan Atatürk Orman Çiftliği, genç Cumhuriyet'in tarımda modernleşme idealinin sembolüdür. 33.000 dönümlük alanda bira fabrikası, süt işleme tesisi, hayvanat bahçesi, fidanlık ve piknik alanları yer alır.\n\nBugün AOÇ, Ankaralıların hafta sonu uğrak noktasıdır. Tarihi bira fabrikası binası, Atatürk'ün çiftlik evi ve geniş yeşil alanlar korunarak kullanılmaktadır." },
  { lat: 39.9050, lng: 32.8570, type: "doğa", name: "Kuğulu Park", desc: "1958'de düzenlenen Çankaya'nın ikonik parkı. Kuğuların yüzdüğü gölet, devasa çınarlar ve kent hayatının huzurlu durağı.", era: "cumhuriyet" },

  /* ── GASTRONOMİ MEKANLARI ── */
  { lat: 40.1700, lng: 31.9200, type: "gastronomi", name: "Beypazarı Kurusu Çarşısı", desc: "Osmanlı döneminden süregelen geleneksel Beypazarı kurusu üretim ve satış merkezi. Konak evlerinde organik tatlar.", era: "osmanli", longDesc: "Beypazarı, Ankara'nın gastronomi başkentidir. Osmanlı döneminden bu yana üretilen Beypazarı kurusu (havuç lokumu), tarhanası ve gazozuyla ünlüdür. Tarihi çarşıda yüzlerce dükkânda el yapımı ürünler sunulur.\n\nBölgenin organik tarım geleneği ve özgün lezzetleri, Cittaslow (Sakin Şehir) unvanıyla da tescillenmiştir." },
  { lat: 40.2400, lng: 33.0300, type: "gastronomi", name: "Çubuk Turşusu Festivali Alanı", desc: "Her yıl düzenlenen Uluslararası Çubuk Turşu Festivali'nin merkezi. 60+ çeşit turşu yarışması.", era: "cumhuriyet", funFacts: ["Çubuk turşusu festivali 60'tan fazla turşu çeşidiyle uluslararası üne sahip."] },
  { lat: 39.9395, lng: 32.8680, type: "gastronomi", name: "Hamamönü Yöresel Lezzet Sokağı", desc: "Restore edilmiş Osmanlı evlerinde Ankara mutfağının otantik tatları: keşkek, bandırma, çiğ köfte.", era: "osmanli" },
  { lat: 40.4700, lng: 32.6500, type: "gastronomi", name: "Kızılcahamam Alabalık Restoranları", desc: "Soğuksu deresinin berrak sularında yetişen taze alabalık. Doğanın içinde piknik sofraları.", era: "cumhuriyet" },
  { lat: 39.9230, lng: 32.8650, type: "gastronomi", name: "Tarihi Aspava (Esat)", desc: "1968'den beri Ankara'nın döner ve kebap kültürünün simgesi. Gece yarısı ritüelinin vazgeçilmezi.", era: "cumhuriyet" },
  { lat: 39.9420, lng: 32.8540, type: "gastronomi", name: "Ulus Tarihi Çarşı ve Lokantaları", desc: "Ankara'nın en eski ticaret merkezi. Geleneksel Ankara tava, kelle paça ve işkembe lokantaları.", era: "osmanli" },
  { lat: 39.9340, lng: 32.8380, type: "gastronomi", name: "AOÇ Tarihi Bira Fabrikası Restoran", desc: "1933'te kurulan Atatürk Orman Çiftliği bira fabrikasının tarihi binasında restoran.", era: "cumhuriyet" },
  { lat: 39.9445, lng: 32.8555, type: "gastronomi", name: "Ankara Kebabı Lokantaları (Ulus)", desc: "Ankara'nın özgün kebap geleneği: pide üzerinde tereyağlı et, domates ve biber.", era: "osmanli" },

  /* ── MİMARİ ESERLER ── */
  { lat: 39.9428, lng: 32.8530, type: "mimari", name: "İş Bankası Genel Müdürlüğü (Ulus)", desc: "1929, Giulio Mongeri tasarımı. I. Ulusal Mimarlık Akımı'nın en güçlü örneklerinden.", era: "cumhuriyet", longDesc: "İtalyan mimar Giulio Mongeri tarafından 1929'da tasarlanan İş Bankası Genel Müdürlüğü binası, I. Ulusal Mimarlık Akımı'nın Ulus'taki en görkemli temsilcisidir. Osmanlı ve Selçuklu mimari öğelerini modern bankacılık yapısında yorumlayan Mongeri, Ankara'nın erken Cumhuriyet dönemindeki kentsel dönüşümün mimarlarından biridir.\n\nSivri kemerler, çini süslemeler ve simetrik cephe düzeni, ulusal kimlik arayışının mimarideki yansımasıdır." },
  { lat: 39.9360, lng: 32.8440, type: "mimari", name: "Sümerbank Binası", desc: "1937, Martin Elsaesser tasarımı. Alman ekspresyonist mimarinin Ankara'daki örneği.", era: "cumhuriyet" },
  { lat: 39.9300, lng: 32.8555, type: "mimari", name: "Ankara Hukuk Fakültesi (Cebeci)", desc: "1927, Cumhuriyet'in ilk hukuk okulu. Mimar Ernst Egli tasarımı.", era: "cumhuriyet" },
  { lat: 39.8870, lng: 32.8580, type: "mimari", name: "Atakule", desc: "1989, Ragıp Buluç tasarımı. 125 metre yüksekliğinde döner restoranlı Ankara simgesi.", era: "cumhuriyet", longDesc: "1989'da mimar Ragıp Buluç tarafından tasarlanan Atakule, 125 metre yüksekliğiyle Ankara'nın en tanınmış silüet öğesidir. 360 derece panoramik manzara sunan döner restoran ve seyir terasıyla kentin ikonik yapısıdır.\n\nKüresel formlu gözlem katı, Ankara ovasının tamamını kapsayan eşsiz bir bakış açısı sunar. Gece aydınlatmasıyla Çankaya sırtlarının simgesi haline gelmiştir." },
  { lat: 39.9100, lng: 32.8560, type: "mimari", name: "Kocatepe Camii", desc: "1987, Hüsrev Tayla ve Fatih Uluengin tasarımı. 24.000 kişi kapasiteli Ankara'nın en büyük camii.", era: "cumhuriyet", longDesc: "1967-1987 yılları arasında inşa edilen Kocatepe Camii, Ankara'nın en büyük ibadet mekânıdır. Mimarlar Hüsrev Tayla ve Fatih Uluengin tarafından Osmanlı klasik cami geleneğini yorumlayan bir anlayışla tasarlanmıştır.\n\n24.000 kişi kapasiteli cami, 4 minaresi ve merkezi kubbesiyle Kızılay'dan bile görülebilir. Alt katında alışveriş merkezi bulunması, yapıyı kentsel fonksiyon açısından da ilginç kılmaktadır." },
  { lat: 39.8960, lng: 32.8610, type: "mimari", name: "Devlet Misafirhanesi (Çankaya)", desc: "1933, Ernst Egli tasarımı. Cumhuriyet'in ilk devlet konukevi, modernist mimari.", era: "cumhuriyet" },
  { lat: 39.9410, lng: 32.8470, type: "mimari", name: "TBMM Kampüsü (III. Meclis)", desc: "1938-1961, Clemens Holzmeister tasarımı. Cumhuriyet'in parlamenter mimarisinin zirvesi.", era: "cumhuriyet", longDesc: "Avusturyalı mimar Clemens Holzmeister tarafından tasarlanan TBMM kampüsü, 1961'den bu yana Türkiye Büyük Millet Meclisi'ne ev sahipliği yapmaktadır. Anıtsal cephesi, geniş avlusu ve simetrik planıyla Cumhuriyet'in devlet mimarisinin en önemli örneğidir.\n\nHolzmeister, aynı zamanda Ankara'da Başbakanlık, Genelkurmay ve çeşitli bakanlık binalarını da tasarlamış, başkentin mimari kimliğini şekillendiren en etkili yabancı mimar olmuştur." },
  { lat: 39.9395, lng: 32.8530, type: "mimari", name: "Ankara Palas (Ulus)", desc: "1928, Vedat Tek tasarımı. Cumhuriyet balolarının efsanevi mekanı, I. Ulusal Mimarlık.", era: "cumhuriyet" },
];

export const ROUTES: Route[] = [
  {
    id: 1,
    title: "Dünyayı Giyindiren Şehir: Sof ve Kervanlar",
    icon: "\u{1F42A}",
    duration: "~2.5 saat \u{1F463}",
    color: "#D4A843",
    desc: "Ankara'nın dünyaca ünlü Sof kumaşı ticaretinin izi",
    stops: [
      { lat: 39.9397, lng: 32.8583, name: "Suluhan (Hasanpaşa Hanı)", story: "1508-1511 yılları arasında inşa edilen çifte avlulu han, Ankara'nın dünyaca ünlü Sof kumaşı ticaretinin kalbiydi." },
      { lat: 39.9375, lng: 32.8560, name: "Pirinç Han", story: "18. yüzyıl ahşap hatıllı sivil mimari. Bugün antikacılara ve sahaflara ev sahipliği yapıyor." },
      { lat: 39.9385, lng: 32.8650, name: "Çengelhan", story: "1522 yapımı görkemli ticaret hanı. Bugün Rahmi M. Koç Müzesi olarak yaşıyor." },
      { lat: 39.9381, lng: 32.8645, name: "Kurşunlu Han (Anadolu Medeniyetleri Müzesi)", story: "15. yüzyıl yapımı kurşun kaplı çatısıyla ünlü han." },
      { lat: 39.9383, lng: 32.8647, name: "Mahmut Paşa Bedesteni", story: "Osmanlı'nın kapalı çarşı geleneğinin Ankara'daki temsilcisi." },
    ],
  },
  {
    id: 2,
    title: "Ahiler Cumhuriyeti: Ahşabın Sırrı",
    icon: "\u{1FAB5}",
    duration: "~2 saat \u{1F463}",
    color: "#8B6914",
    desc: "Ahilik geleneği ve ahşap ustalığının izinde",
    stops: [
      { lat: 39.9370, lng: 32.8650, name: "Ahi Elvan Camii", story: "1382'de ahiler tarafından inşa edildi." },
      { lat: 39.9367, lng: 32.8653, name: "Arslanhane (Ahi Şerafeddin) Camii", story: "1290 yapımı, 2023 UNESCO Dünya Mirası." },
      { lat: 39.9400, lng: 32.8550, name: "Zincirli Camii", story: "17. yüzyıl, kırmızı tuğla ve ahşap tavan." },
      { lat: 39.9398, lng: 32.8668, name: "Tarihi Karacabey Hamamı", story: "1440'tan bu yana 580+ yıldır kesintisiz hizmet." },
      { lat: 39.9360, lng: 32.8610, name: "Somut Olmayan Kültürel Miras Müzesi", story: "Karagöz, meddahlık, ebru — ahi zanaat ve gösteri sanatları." },
    ],
  },
  {
    id: 3,
    title: "Antik Ancyra: Roma ve Galatlar",
    icon: "\u{1F3DB}\uFE0F",
    duration: "~2.5 saat \u{1F463}",
    color: "#FFB300",
    desc: "Roma İmparatorluğu ve Kelt Galatlarının izinde",
    stops: [
      { lat: 39.9431, lng: 32.8600, name: "Antik Roma Tiyatrosu", story: "MS 1-2. yüzyılda inşa edilen antik seyir alanı." },
      { lat: 39.9412, lng: 32.8632, name: "Augustus Tapınağı", story: "MÖ 25-20, Res Gestae'nin en iyi korunmuş kopyası." },
      { lat: 39.9433, lng: 32.8562, name: "Julianus Sütunu", story: "MS 362, 15 metrelik korint başlıklı monolitik sütun." },
      { lat: 39.9440, lng: 32.8600, name: "Roma Hamamı", story: "MS 3. yüzyıl, İmparator Caracalla dönemi." },
      { lat: 39.9408, lng: 32.8644, name: "Ankara Kalesi", story: "MÖ 2. binyıl, çok katmanlı savunma kompleksi." },
      { lat: 40.0900, lng: 32.6850, name: "Karalar Galat Mezarları", story: "MÖ 1. yüzyıl, Kelt kökenli kral mezarı." },
    ],
  },
  {
    id: 4,
    title: "Çiçero Operasyonu: II. Dünya Savaşı Casusları",
    icon: "\u{1F575}\uFE0F",
    duration: "~2 saat \u{1F463}",
    color: "#607D8B",
    desc: "II. Dünya Savaşı'nda Ankara'nın casus sokakları",
    stops: [
      { lat: 39.9350, lng: 32.8500, name: "Ankara Palas Müzesi", story: "1928 yapımı Cumhuriyet konukevi, istihbarat satrancı." },
      { lat: 39.9419, lng: 32.8547, name: "Tarihi Ulus Meydanı", story: "Casusların buluştuğu efsanevi Karpiç Lokantası." },
      { lat: 39.9350, lng: 32.8430, name: "Tarihi Ankara Garı", story: "1937 Art Deco yapı, diplomatik postaların geçiş noktası." },
      { lat: 39.8927, lng: 32.8564, name: "Eski Çankaya Elçilikler Bölgesi", story: "İstihbarat operasyonlarının merkezi." },
    ],
  },
  {
    id: 5,
    title: "Mürekkep Kokulu Sokaklar: Edebi Hafıza",
    icon: "\u{1F58B}\uFE0F",
    duration: "~3 saat \u{1F463}",
    color: "#8B5CF6",
    desc: "Şairlerin, yazarların ve aydınların izinde",
    stops: [
      { lat: 39.9388, lng: 32.8670, name: "Taceddin Dergahı (Mehmet Akif Ersoy)", story: "İstiklal Marşı'nın yazıldığı yer." },
      { lat: 39.9381, lng: 32.8733, name: "Ulucanlar Cezaevi Müzesi", story: "Nazım Hikmet, Sevgi Soysal — edebiyatın karanlık sayfaları." },
      { lat: 39.9390, lng: 32.8670, name: "Şairler ve Yazarlar Evi", story: "Hamamönü'nde edebiyatçıların buluşma noktası." },
      { lat: 39.9398, lng: 32.8648, name: "Ahmet Hamdi Tanpınar Edebiyat Müze Kütüphanesi", story: "El yazmaları ve nadir eserler." },
      { lat: 39.9200, lng: 32.8550, name: "Mülkiyeliler Birliği", story: "Şairler, yazarlar, aydınlar burada buluştu." },
      { lat: 39.9070, lng: 32.8600, name: "Kuğulu Park", story: "1958, Sevgi Soysal'ın edebi parkı." },
    ],
  },
  {
    id: 6,
    title: "Paslı Çarklardan Sanata: Endüstriyel Dönüşüm",
    icon: "\u2699\uFE0F",
    duration: "~Tam gün \u{1F697}",
    color: "#78909C",
    desc: "Demiryolu atölyelerinden sanat merkezlerine dönüşüm",
    stops: [
      { lat: 39.9395, lng: 32.8480, name: "CerModern", story: "1920'ler TCDD vagon atölyeleri, 2010'da çağdaş sanat merkezi." },
      { lat: 39.9328, lng: 32.8464, name: "TCDD Açık Hava Buharlı Lokomotif Müzesi", story: "Tarihi buharlı lokomotifler." },
      { lat: 39.7850, lng: 32.3870, name: "Malıköy Tren İstasyonu Müzesi", story: "Kurtuluş Savaşı lojistik merkezi." },
      { lat: 40.2386, lng: 33.0331, name: "Çubuk-1 Barajı", story: "1936, Türkiye'nin ilk betonarme barajı." },
    ],
  },
  {
    id: 7,
    title: "Kayalara Oyulan Sırlar: İnziva Rotası",
    icon: "\u{1F9D7}",
    duration: "~Tam gün \u{1F697}+\u{1F463}",
    color: "#4CAF50",
    desc: "Kaya kiliseleri, manastırlar ve fosil ormanları",
    stops: [
      { lat: 40.3575, lng: 32.5475, name: "Mahkeme Ağacın Kaya Yerleşimleri", story: "Roma dönemi yeraltı kiliseleri." },
      { lat: 40.3193, lng: 32.4649, name: "Alicin Manastırı", story: "Sümela benzeri Erken Hristiyanlık inziva merkezi." },
      { lat: 40.2197, lng: 32.2448, name: "İnönü Mağaraları", story: "Hitit'ten Bizans'a çok katlı kaya yerleşimleri." },
      { lat: 40.4333, lng: 32.4167, name: "Pelitçik Fosil Ormanı", story: "20 milyon yıllık taşlaşmış ağaçlar." },
    ],
  },
  {
    id: 8,
    title: "Frigya ve Gordion Efsaneleri",
    icon: "\u{1F451}",
    duration: "~Tam gün \u{1F697}",
    color: "#FFC107",
    desc: "Kral Midas'ın efsanevi başkenti ve Sakarya zafer noktası",
    stops: [
      { lat: 39.6540, lng: 31.9930, name: "Gordion Müzesi", story: "2023 UNESCO, MÖ 12. yy Frigya başkenti." },
      { lat: 39.6560, lng: 31.9950, name: "Midas Tümülüsü", story: "Efsanevi Kral Midas'ın mezarı, dünyanın en eski ahşap mezar odası." },
      { lat: 39.6550, lng: 31.9940, name: "Gordion Antik Kenti (Yassıhöyük)", story: "Saray kalıntıları, megaron yapılar, mozaikler." },
      { lat: 39.5900, lng: 32.1600, name: "Polatlı Duatepe Anıtı", story: "1921 Sakarya Muharebesi zafer noktası." },
    ],
  },
  {
    id: 9,
    title: "Görünmez Şehir: Kayıp Sular",
    icon: "\u{1F4A7}",
    duration: "~2 saat \u{1F463}",
    color: "#00BCD4",
    desc: "Ankara'nın yeraltına hapsedilen kayıp nehirleri",
    fx: "xray",
    stops: [
      { lat: 39.9550, lng: 32.8200, name: "Akköprü", story: "800 yıllık Selçuklu köprüsü, kayıp suların son tanığı." },
      { lat: 39.9420, lng: 32.8530, name: "Bentderesi (Kayıp Vadi)", story: "1950'lere kadar şelalelerin aktığı vadinin üzeri kapatıldı." },
      { lat: 39.9150, lng: 32.8580, name: "Kavaklıdere Su Kaynağı", story: "Kavak ağaçlarının gölgesindeki dere Kuğulu Park'ın altından akıyor." },
      { lat: 39.9440, lng: 32.8600, name: "Roma Hamamı Hipokost Sistemi", story: "Antik çağda sıcak su ve buhar döngüsünü sağlayan yeraltı dehlizleri." },
    ],
  },
  {
    id: 10,
    title: "Betonun Şiiri: Brütalist Ankara",
    icon: "\u{1F6F8}",
    duration: "~3 saat \u{1F4F8}",
    color: "#90A4AE",
    desc: "Fotoğrafçılar için brütalist mimari turu",
    fx: "grayscale",
    stops: [
      { lat: 39.9170, lng: 32.8620, name: "Cinnah 19", story: "1957, uzay çağı estetiğiyle ilk avangart sivil yapı." },
      { lat: 39.8910, lng: 32.7870, name: "ODTÜ Mimarlık Fakültesi", story: "Altuğ ve Behruz Çinici tasarımı, brutalizmin şiiri." },
      { lat: 39.9210, lng: 32.8540, name: "Kızılay Emek İşhanı", story: "1959, Türkiye'nin ilk modern gökdeleni." },
      { lat: 39.9130, lng: 32.8600, name: "Türk Dil Kurumu Binası", story: "Cengiz Bektaş'ın ödüllü başyapıtı." },
    ],
  },
  {
    id: 11,
    title: "Ankara Noir: Sis, Cinayet ve Daktilo",
    icon: "\u{1F575}\uFE0F",
    duration: "~2.5 saat \u{1F463}",
    color: "#37474F",
    desc: "Ankara'nın karanlık ve gizemli yüzü",
    fx: "noir",
    stops: [
      { lat: 39.9415, lng: 32.8530, name: "Rüzgarlı Sokak", story: "Eski matbaaların ve gazetecilerin melankolik caddesi." },
      { lat: 39.9430, lng: 32.8700, name: "Ulucanlar Cezaevi — Dar Ağacı Avlusu", story: "Siyasi ve edebi tarihin en ağır bedellerinin ödendiği yer." },
      { lat: 39.9350, lng: 32.8750, name: "Cebeci Asri Mezarlığı", story: "Faili meçhul cinayetlere kurban giden aydınlar burada yatıyor." },
      { lat: 39.9410, lng: 32.8560, name: "İtfaiye Meydanı (Hergelen Meydanı)", story: "Eski Ankara'nın bitpazarı ve karanlık hafızası." },
    ],
  },
  {
    id: 12,
    title: "Gece Vardiyası: 03:00'ten Sonra Bozkır",
    icon: "\u{1F989}",
    duration: "~Gece turu \u{1F319}",
    color: "#FF9800",
    desc: "Gece kuşları için — 23:00'te açılır",
    fx: "neon",
    nightOnly: true,
    stops: [
      { lat: 39.9350, lng: 32.8100, name: "AOÇ Sabaha Karşı Kokoreç", story: "Odun ateşinde kokoreç, Ankara'nın en demokratik sofrası." },
      { lat: 39.9230, lng: 32.8650, name: "Esat Caddesi Aspava Savaşları", story: "Saat 04:00, gece kulübü çıkışı döner ritüeli." },
      { lat: 39.9410, lng: 32.8560, name: "İtfaiye Meydanı Gece Çorbacıları", story: "Gece yarısı kelle paça, salaş plastik sandalyeler." },
      { lat: 39.9500, lng: 32.7400, name: "Şaşmaz Sanayi Gece Köftecileri", story: "Sanayi sitesinde gece yarısı beliren mangal ateşleri." },
    ],
  },
  {
    id: 13,
    title: "Bozkırın Distorsiyonu: 90'lar Rock",
    icon: "\u{1F3B8}",
    duration: "~2 saat \u{1F463}+\u{1F3B5}",
    color: "#F44336",
    desc: "Ankara rock ve metal alt kültürünün izinde",
    fx: "rock",
    stops: [
      { lat: 39.9200, lng: 32.8540, name: "Kızılay SSK İşhanı", story: "Ankara rock ve heavy metal alt kültürünün doğum yeri." },
      { lat: 39.9130, lng: 32.8590, name: "Tunalı Pasajları", story: "Sokak müzisyenlerinin ve ilk stüdyoların yuvası." },
      { lat: 39.9210, lng: 32.8530, name: "Zafer Çarşısı Sahafları", story: "İsyankar gençliğin korsan kaset avına çıktığı çarşı." },
      { lat: 39.9220, lng: 32.8550, name: "Sakarya Caddesi", story: "Salaş birahaneler, canlı müzik barları — Ankara rock'ının ana caddesi." },
    ],
  },
  {
    id: 14,
    title: "Cumhuriyet'in İzinde",
    icon: "🏛️",
    duration: "~3 saat 🚶",
    color: "#C62828",
    desc: "Milli Mücadele'den Cumhuriyet'e: başkentin kuruluş hikâyesi",
    stops: [
      { lat: 39.9430, lng: 32.8540, name: "I. TBMM Binası (Kurtuluş Savaşı Müzesi)", story: "23 Nisan 1920'de Büyük Millet Meclisi bu çatı altında açıldı. Milli Mücadele'nin tüm kritik kararları burada alındı." },
      { lat: 39.9425, lng: 32.8545, name: "II. TBMM Binası (Cumhuriyet Müzesi)", story: "Mimar Vedat Tek tasarımı. Cumhuriyet'in ilanı ve devrim kanunları bu salonda kabul edildi." },
      { lat: 39.9419, lng: 32.8547, name: "Ulus Zafer Anıtı", story: "1927, Heinrich Krippel'in eseri. Milli Mücadele zaferinin tunç sembolü." },
      { lat: 39.9350, lng: 32.8500, name: "Ankara Palas Müzesi", story: "Cumhuriyet balolarının efsanevi mekânı. Atatürk burada dans etti, diplomatlar burada ağırlandı." },
      { lat: 39.9390, lng: 32.8550, name: "Ankara Etnografya Müzesi", story: "1938-1953 arası Atatürk'ün naaşının muhafaza edildiği bina. Cumhuriyet'in kültür politikasının sembolü." },
      { lat: 39.9254, lng: 32.8369, name: "Anıtkabir", story: "Atatürk'ün ebedi istirahatgâhı. Aslanlı Yol'dan mozoleye uzanan anıtsal güzergâh." },
    ],
  },
  {
    id: 15,
    title: "Medeniyetler Geçidi",
    icon: "⏳",
    duration: "~3 saat 🚶",
    color: "#E65100",
    desc: "Roma'dan Selçuklu'ya, 2.000 yıllık medeniyetler yolculuğu",
    stops: [
      { lat: 39.9440, lng: 32.8600, name: "Roma Hamamı", story: "MS 3. yüzyıl, İmparator Caracalla dönemi. Hipokost sistemi ve sütun tabanları hâlâ görülebilir." },
      { lat: 39.9412, lng: 32.8632, name: "Augustus Tapınağı", story: "MÖ 25-20, Res Gestae'nin dünyadaki en iyi korunmuş kopyası. Hacı Bayram Camii ile yan yana eşsiz bir görüntü." },
      { lat: 39.9433, lng: 32.8562, name: "Julianus Sütunu", story: "MS 362, 15 metrelik korint başlıklı monolitik sütun. Roma İmparatoru Julian'ın Ankara ziyareti anısına." },
      { lat: 39.9367, lng: 32.8653, name: "Arslanhane Camii", story: "1290, 2023 UNESCO Dünya Mirası. 24 ahşap direkli Selçuklu şaheseri." },
      { lat: 39.9408, lng: 32.8644, name: "Ankara Kalesi", story: "8 farklı uygarlığın izlerini taşıyan surlar. Hitit'ten Osmanlı'ya kesintisiz iskân." },
      { lat: 39.9381, lng: 32.8645, name: "Anadolu Medeniyetleri Müzesi", story: "Paleolitik'ten Osmanlı'ya 1 milyon+ eser. Medeniyetler geçidinin son durağı ve özeti." },
    ],
  },
  {
    id: 16,
    title: "Ankara'nın Gizli Müzeleri",
    icon: "🔍",
    duration: "~4 saat 🚶",
    color: "#6A1B9A",
    desc: "Turistlerin bilmediği niş müzeler turu",
    stops: [
      { lat: 39.9383, lng: 32.8655, name: "Gökyay Vakfı Satranç Müzesi", story: "110 ülkeden 700+ satranç takımı, Guinness rekoru! Ankara Kalesi içindeki tarihi evde." },
      { lat: 39.9415, lng: 32.8535, name: "PTT Pul Müzesi", story: "Clemens Holzmeister binasında filateli hazineleri ve haberleşme tarihi." },
      { lat: 39.9300, lng: 32.8700, name: "Haritacılık Müzesi", story: "Osmanlı'dan Cumhuriyet'e haritacılık tekniklerinin evrimi." },
      { lat: 39.9690, lng: 32.8623, name: "Meteoroloji Müzesi", story: "1908 yapımı binada Atatürk'ün 6 ay karargâh olarak kullandığı mekân." },
      { lat: 39.8680, lng: 32.8190, name: "TRT Yayıncılık Tarihi Müzesi", story: "Radyo ve TV'nin Türkiye serüveni, nostaljik stüdyolar." },
      { lat: 40.1685, lng: 31.9195, name: "Türk Hamam Müzesi", story: "Türkiye'nin ilk hamam müzesi. Roma'dan Osmanlı'ya yıkanma kültürü." },
    ],
  },
  {
    id: 17,
    title: "Mimari Başkent: Ustalar ve Yapılar",
    icon: "🏗️",
    duration: "~3 saat 🚶",
    color: "#5D4037",
    desc: "Taut, Holzmeister, Mongeri — başkenti inşa eden mimarlar",
    stops: [
      { lat: 39.9297, lng: 32.8556, name: "DTCF Binası", story: "Bruno Taut'un başyapıtı. Bauhaus estetiğini Anadolu iklimine uyarlayan rasyonalist mimari." },
      { lat: 39.9350, lng: 32.8430, name: "Tarihi Ankara Garı", story: "1937, Art Deco, Şekip Akalın tasarımı. Cumhuriyet ulaşım politikasının sembolü." },
      { lat: 39.9200, lng: 32.8600, name: "Saraçoğlu Mahallesi", story: "1944-46, Paul Bonatz tasarımı. Cumhuriyet'in ilk planlı konut yerleşkesi." },
      { lat: 39.9350, lng: 32.8540, name: "Güven Anıtı ve Güvenpark", story: "1935, anıtsal rölyef kompleksi. Cumhuriyet idealinin taşa ve bronza dönüşmüş hali." },
      { lat: 39.9147, lng: 32.8107, name: "CSO Ada Ankara", story: "2020, fütüristik küre formlu müzik kampüsü. Çağdaş Ankara mimarisinin en cesur yapısı." },
      { lat: 39.9352, lng: 32.8534, name: "Büyük Tiyatro (Opera Sahnesi)", story: "1933 Şevki Balmumcu başlangıcı, 1948 Paul Bonatz tamamlaması. Anıtsal sahne." },
    ],
  },
  {
    id: 18,
    title: "Lezzet Rotası: Ulus'tan Beypazarı'na",
    icon: "🍽️",
    duration: "~Tam gün 🚗",
    color: "#E65100",
    desc: "Ankara'nın yöresel lezzetlerini keşfet",
    stops: [
      { lat: 39.9420, lng: 32.8540, name: "Ulus Tarihi Çarşı", story: "Geleneksel Ankara tava, kelle paça ve işkembe çorbası. Esnaf lokantalarında otantik başkent lezzetleri." },
      { lat: 39.9395, lng: 32.8680, name: "Hamamönü Yöresel Lezzet Sokağı", story: "Restore edilmiş Osmanlı evlerinde keşkek, bandırma ve el yapımı mantı." },
      { lat: 40.2400, lng: 33.0300, name: "Çubuk Turşusu Festivali Alanı", story: "60+ çeşit turşunun yarıştığı uluslararası festival alanı." },
      { lat: 40.4700, lng: 32.6500, name: "Kızılcahamam Alabalık", story: "Soğuksu deresinin berrak sularında yetişen taze alabalık, doğanın içinde sofra." },
      { lat: 40.1700, lng: 31.9200, name: "Beypazarı Kurusu Çarşısı", story: "Osmanlı'dan bu yana üretilen geleneksel Beypazarı kurusu, tarhanası ve gazoz." },
    ],
  },
];
