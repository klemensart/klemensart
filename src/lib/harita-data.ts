/* ───────── Harita Veri Dosyası ─────────
   PLACES ve ROUTES hem client (harita) hem server (SEO/JSON-LD) tarafından kullanılır.
*/

export type PlaceType = "müze" | "galeri" | "konser" | "tiyatro" | "tarihi" | "edebiyat" | "gastronomi" | "miras";

export type CulturePlace = {
  lat: number;
  lng: number;
  type: PlaceType;
  name: string;
  desc: string;
  minZoom?: number;
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
  gastronomi: "Gastronomi",
  miras: "Kültürel Miras",
};

export const PLACES: CulturePlace[] = [
  /* ── MÜZELER ── */
  { lat: 39.9381, lng: 32.8645, type: "müze", name: "Anadolu Medeniyetleri Müzesi", desc: "1921 kurulan, Paleolitik'ten Osmanlı'ya 1 milyon+ eser. 1997 Avrupa Yılın Müzesi." },
  { lat: 39.9430, lng: 32.8540, type: "müze", name: "I. TBMM Binası (Kurtuluş Savaşı Müzesi)", desc: "23 Nisan 1920'de açılan Meclis, Milli Mücadele'nin yönetildiği bina." },
  { lat: 39.9425, lng: 32.8545, type: "müze", name: "II. TBMM Binası (Cumhuriyet Müzesi)", desc: "1924-1960 parlamento binası. Mimar Vedat Tek tasarımı." },
  { lat: 39.9254, lng: 32.8369, type: "müze", name: "Anıtkabir ve Kurtuluş Savaşı Müzesi", desc: "Emin Onat ve Orhan Arda tasarımı, Atatürk'ün anıt mezarı." },
  { lat: 39.9390, lng: 32.8550, type: "müze", name: "Ankara Etnografya Müzesi", desc: "1930 açılış, Türk-İslam halk kültürü. 1938-53 Atatürk'ün geçici kabri." },
  { lat: 39.9385, lng: 32.8650, type: "müze", name: "Çengelhan Rahmi M. Koç Müzesi", desc: "1522 yapımı handa sanayi ve teknoloji tarihi." },
  { lat: 39.9370, lng: 32.8640, type: "müze", name: "Erimtan Arkeoloji ve Sanat Müzesi", desc: "2015 açılış, MÖ 3000'den Bizans'a eserler." },
  { lat: 39.9392, lng: 32.8538, type: "müze", name: "Ziraat Bankası Müzesi", desc: "Giulio Mongeri tasarımı 1929 binada, Türkiye'nin ilk banka müzesi." },
  { lat: 39.9428, lng: 32.8532, type: "müze", name: "Türkiye İş Bankası İktisadi Bağımsızlık Müzesi", desc: "Mongeri tasarımı binada ekonomi tarihi." },
  { lat: 39.9415, lng: 32.8535, type: "müze", name: "PTT Pul Müzesi", desc: "Clemens Holzmeister tasarımı binada filateli ve haberleşme tarihi." },
  { lat: 39.9383, lng: 32.8655, type: "müze", name: "Gökyay Vakfı Satranç Müzesi", desc: "110 ülkeden 700+ satranç takımı, Guinness rekoru." },
  { lat: 39.9740, lng: 32.9598, type: "müze", name: "Altınköy Açık Hava Müzesi", desc: "1930'lar Anadolu köy yaşamı, 500 dönümlük alan." },
  { lat: 39.9022, lng: 32.7986, type: "müze", name: "MTA Tabiat Tarihi Müzesi", desc: "1968 kurulan, dinozor fosillerinden meteoritlere." },
  { lat: 39.9031, lng: 32.6387, type: "müze", name: "Etimesgut Türk Tarih Müzesi", desc: "İskitlerden Cumhuriyet'e 200+ heykel, Orhun Yazıtları replikaları." },
  { lat: 39.8947, lng: 32.8610, type: "müze", name: "Pembe Köşk (İsmet İnönü Müze Evi)", desc: "2. Cumhurbaşkanı'nın 48 yıl yaşadığı ev." },
  { lat: 39.8895, lng: 32.8649, type: "müze", name: "Çankaya Köşkü (Atatürk Müze Köşkü)", desc: "1921-1932 Atatürk'ün ikameti, devrimlerin planlandığı yer." },
  { lat: 39.9360, lng: 32.8610, type: "müze", name: "Somut Olmayan Kültürel Miras Müzesi", desc: "Karagöz, meddahlık, ebru. Türkiye'nin ilk SOKÜM müzesi." },
  { lat: 40.1709, lng: 31.9178, type: "müze", name: "Beypazarı Yaşayan Müze", desc: "19. yy Abbaszade Konağı'nda halk kültürü deneyimi." },
  { lat: 40.1685, lng: 31.9195, type: "müze", name: "Türk Hamam Müzesi", desc: "Türkiye'nin ilk hamam müzesi. Roma'dan Osmanlı'ya yıkanma kültürü." },

  /* ── EDEBİYAT ── */
  { lat: 39.9426, lng: 32.8709, type: "edebiyat", name: "Kelime Müzesi", desc: "2022, Türkiye'nin ilk dil müzesi. Kelimelerin kökenlerini sanatsal anlatım." },
  { lat: 39.8769, lng: 32.8491, type: "edebiyat", name: "Cin Ali Müzesi", desc: "Rasim Kaygusuz'un kült karakterine adanmış pedagojik müze." },
  { lat: 39.9388, lng: 32.8670, type: "edebiyat", name: "Mehmet Akif Ersoy Müze Evi (Taceddin Dergahı)", desc: "İstiklal Marşı'nın yazıldığı mekan." },
  { lat: 39.9398, lng: 32.8648, type: "edebiyat", name: "Ahmet Hamdi Tanpınar Edebiyat Müze Kütüphanesi", desc: "El yazmaları ve nadir eserler." },
  { lat: 39.9245, lng: 32.8006, type: "edebiyat", name: "Cumhurbaşkanlığı Millet Kütüphanesi", desc: "2020, Selçuklu-Osmanlı-çağdaş mimari sentezi, dev kültür kompleksi." },

  /* ── GALERİLER ── */
  { lat: 39.9400, lng: 32.8530, type: "galeri", name: "Ankara Devlet Resim ve Heykel Müzesi", desc: "1927, Osman Hamdi Bey'den günümüze Türk plastik sanatları." },
  { lat: 39.9395, lng: 32.8480, type: "galeri", name: "CerModern", desc: "2010, eski TCDD atölyelerinde uluslararası çağdaş sanat merkezi." },
  { lat: 39.7930, lng: 32.6970, type: "galeri", name: "Müze Evliyagil", desc: "2015, çağdaş Türk sanatı, açık hava heykel bahçesi." },
  { lat: 39.8900, lng: 32.8587, type: "galeri", name: "Galeri Siyah Beyaz", desc: "1984'ten beri, Ankara'nın en köklü özel galerisi." },
  { lat: 39.8893, lng: 32.8508, type: "galeri", name: "Doğan Taşdelen Çağdaş Sanatlar Merkezi", desc: "Kamuya ait en kapsamlı sanat galerisi." },

  /* ── KONSER ── */
  { lat: 39.9147, lng: 32.8107, type: "konser", name: "CSO Ada Ankara", desc: "2020, fütüristik küre formlu müzik kampüsü." },
  { lat: 39.8673, lng: 32.7495, type: "konser", name: "Bilkent Konser Salonu", desc: "1994, Türkiye'nin ilk özel akademik senfoni salonu." },

  /* ── TİYATRO ── */
  { lat: 39.9352, lng: 32.8534, type: "tiyatro", name: "Büyük Tiyatro (Opera Sahnesi)", desc: "1933 Şevki Balmumcu / 1948 Paul Bonatz, anıtsal sahne." },
  { lat: 39.9386, lng: 32.8531, type: "tiyatro", name: "Küçük Tiyatro", desc: "1930 yapımı Mimar Kemaleddin eseri, 1947'den beri aktif." },
  { lat: 39.9040, lng: 32.8595, type: "tiyatro", name: "Şinasi Sahnesi", desc: "1988'den beri kült oyunların prömiyeri." },
  { lat: 39.9039, lng: 32.8593, type: "tiyatro", name: "Akün Sahnesi", desc: "1975 sinema, 2002'de tiyatroya dönüştürüldü." },

  /* ── TARİHİ & ARKEOLOJİK ── */
  { lat: 39.9408, lng: 32.8644, type: "tarihi", name: "Ankara Kalesi", desc: "MÖ 2. binyıl, Galat-Roma-Selçuklu-Osmanlı katmanları." },
  { lat: 39.6550, lng: 31.9940, type: "tarihi", name: "Gordion Antik Kenti ve Midas Tümülüsü", desc: "2023 UNESCO, MÖ 12. yy Frigya başkenti." },
  { lat: 39.9367, lng: 32.8653, type: "tarihi", name: "Arslanhane Camii", desc: "2023 UNESCO, 1290 Selçuklu şaheseri." },
  { lat: 39.9412, lng: 32.8632, type: "tarihi", name: "Augustus Tapınağı", desc: "MÖ 25-20, Res Gestae'nin en iyi korunmuş kopyası." },
  { lat: 39.9440, lng: 32.8600, type: "tarihi", name: "Roma Hamamı", desc: "MS 3. yy, İmparator Caracalla dönemi." },
  { lat: 39.9433, lng: 32.8562, type: "tarihi", name: "Julianus Sütunu", desc: "MS 362, 15m korint başlıklı Roma sütunu." },
  { lat: 39.9395, lng: 32.8680, type: "tarihi", name: "Hamamönü Tarihi Evleri", desc: "19. yy Osmanlı sivil mimarisi, restore edilmiş kültür bölgesi." },
  { lat: 39.9410, lng: 32.8630, type: "tarihi", name: "Hacı Bayram Veli Camii", desc: "1427-28, Augustus Tapınağı bitişiğinde." },
  { lat: 39.9398, lng: 32.8668, type: "tarihi", name: "Tarihi Karacabey Hamamı", desc: "1440, 580+ yıldır kesintisiz hizmet." },
  { lat: 39.9381, lng: 32.8733, type: "tarihi", name: "Ulucanlar Cezaevi Müzesi", desc: "1925-2006, Nazım Hikmet'in yattığı koğuşlar." },
  { lat: 39.5315, lng: 32.5589, type: "tarihi", name: "Gavurkale", desc: "MÖ 13. yy Hitit kabartmaları." },
  { lat: 40.0667, lng: 31.6667, type: "tarihi", name: "Juliopolis Antik Kenti", desc: "Helenistik-Roma-Bizans, kaya mezarları." },
  { lat: 40.3193, lng: 32.4649, type: "tarihi", name: "Alicin Manastırı", desc: "Erken Hristiyanlık inziva merkezi, Sümela benzeri." },
  { lat: 39.7743, lng: 32.6835, type: "tarihi", name: "Tulumtaş Mağarası", desc: "5 milyon yıllık karstik oluşum." },
  { lat: 39.5878, lng: 32.1312, type: "tarihi", name: "Sakarya Meydan Muharebesi Tarihi Milli Parkı", desc: "1921, 137 bin hektar." },
  { lat: 40.1675, lng: 31.9211, type: "tarihi", name: "Beypazarı Tarihi Konakları", desc: "Osmanlı-Türk sivil mimarisinin en iyi korunmuş dokusu." },
  { lat: 40.3575, lng: 32.5475, type: "tarihi", name: "Mahkeme Ağacın Kaya Yerleşimleri", desc: "Roma dönemi yeraltı kiliseleri." },
  { lat: 40.0972, lng: 33.4083, type: "tarihi", name: "Kalecik Kalesi", desc: "Galat ve Roma izleri, Kızılırmak vadisine hakim." },
  { lat: 39.9523, lng: 32.8261, type: "tarihi", name: "Akköprü", desc: "1222, I. Alaeddin Keykubad, 7 kemer gözlü anıtsal Selçuklu köprüsü. Üçgen mahmuzlar ve Arapça kitabe." },
  { lat: 40.1849, lng: 31.3501, type: "tarihi", name: "Nasuh Paşa Hanı", desc: "1599, 43 odalı Osmanlı ticaret hanı." },
  { lat: 40.2197, lng: 32.2448, type: "tarihi", name: "İnönü Mağaraları", desc: "Hitit'ten Bizans'a çok katlı kaya yerleşimleri." },

  /* ── GASTRONOMİ ── */
  { lat: 39.9380, lng: 32.8630, type: "gastronomi", name: "Tarihi Boğaziçi Lokantası", desc: "1956, meşhur Ankara Tavası, bakır tencerelerde." },
  { lat: 39.9420, lng: 32.8540, type: "gastronomi", name: "Tarihi Ulus Hali", desc: "1937, Robert Oerley tasarımı, geleneksel hal kültürü." },
  { lat: 39.9360, lng: 32.8030, type: "gastronomi", name: "AOÇ Merkez Lokantası", desc: "1925 kurulan çiftlikte tarihi gastronomi kampüsü." },
  { lat: 39.9380, lng: 32.8640, type: "gastronomi", name: "Zenger Paşa Konağı", desc: "18. yy konak, müze-restoran, yöresel mutfak." },
  { lat: 40.1680, lng: 31.9210, type: "gastronomi", name: "Beypazarı Taş Fırınları ve Alaaddin Sokak", desc: "Coğrafi işaretli Beypazarı Kurusu." },
  { lat: 40.1070, lng: 33.4180, type: "gastronomi", name: "Kalecik Karası Üzüm Bağları", desc: "MÖ 2000'den beri bağcılık, şarap rotası." },
  { lat: 40.2620, lng: 33.0160, type: "gastronomi", name: "Çubuk Turşu Köyü", desc: "15. yy'dan beri coğrafi işaretli Çubuk Turşusu üretimi." },

  /* ── EK MÜZELER ── */
  { lat: 39.9350, lng: 32.8500, type: "müze", name: "Ankara Palas Müzesi", desc: "1928 yapımı Cumhuriyet konukevi, Şubat 2024'te müzeye dönüştürüldü." },
  { lat: 39.9359, lng: 32.8546, type: "müze", name: "Vakıf Eserleri Müzesi", desc: "1927 yapımı Hukuk Mektebi binasında halı, kilim, vakıf eserleri." },
  { lat: 39.9366, lng: 32.8433, type: "müze", name: "Direksiyon Binası (TCDD Milli Mücadele Müzesi)", desc: "1892, Atatürk'ün ilk karargahı." },
  { lat: 39.9017, lng: 32.7713, type: "müze", name: "ODTÜ Bilim ve Teknoloji Müzesi", desc: "MÖ 3500'den bilgisayar devrimine teknoloji evrimi." },
  { lat: 39.9690, lng: 32.8623, type: "müze", name: "Meteoroloji Müzesi", desc: "1908, Atatürk'ün 6 ay karargah kullandığı bina." },
  { lat: 39.9320, lng: 32.8300, type: "müze", name: "Ankara Üniversitesi Oyuncak Müzesi", desc: "1990, Türkiye'nin ilk oyuncak müzesi." },
  { lat: 39.8680, lng: 32.8190, type: "müze", name: "TRT Yayıncılık Tarihi Müzesi", desc: "Radyo ve TV tarihi, nostaljik stüdyolar." },
  { lat: 39.9476, lng: 32.7052, type: "müze", name: "Hava Kuvvetleri Müzesi", desc: "1998, ilk uçaklardan savaş jetlerine." },
  { lat: 39.9328, lng: 32.8464, type: "müze", name: "TCDD Açık Hava Buharlı Lokomotif Müzesi", desc: "Tarihi buharlı lokomotifler." },
  { lat: 39.6200, lng: 32.1500, type: "müze", name: "Alagöz Karargâh Müzesi", desc: "Sakarya Muharebesi'nde Atatürk'ün cephe karargahı." },
  { lat: 39.7850, lng: 32.3870, type: "müze", name: "Malıköy Tren İstasyonu Müzesi", desc: "Kurtuluş Savaşı lojistik merkezi." },
  { lat: 39.9300, lng: 32.8700, type: "müze", name: "Haritacılık Müzesi", desc: "Osmanlı'dan Cumhuriyet'e haritacılık tekniklerinin evrimi." },
  { lat: 40.4930, lng: 32.4750, type: "müze", name: "Çamlıdere Doğa ve Hayvan Müzesi", desc: "Türkiye'nin en kapsamlı doğa müzesi." },

  /* ── EK GALERİLER ── */
  { lat: 39.9371, lng: 32.8641, type: "galeri", name: "Pilavoğlu Han", desc: "16. yy, sanatçı atölyelerine dönüşmüş avlulu han." },
  { lat: 39.8860, lng: 32.8530, type: "galeri", name: "Şefik Bursalı Müze Evi", desc: "Türk resim ustasının orijinal atölyesi." },
  { lat: 39.8950, lng: 32.8340, type: "galeri", name: "Mustafa Ayaz Sanat Müzesi", desc: "Çağdaş Türk resmi, genç yeteneklere alan." },
  { lat: 39.9340, lng: 32.8550, type: "galeri", name: "Hacettepe Sanat Müzesi", desc: "Çağdaş Türk resim ve heykel koleksiyonu." },
  { lat: 39.8850, lng: 32.7480, type: "galeri", name: "Fikret Otyam Sanat Merkezi", desc: "Çağdaş sanat, dijital enstalasyonlar." },
  { lat: 39.8830, lng: 32.8100, type: "galeri", name: "Zülfü Livaneli Kültür Merkezi", desc: "Sergiler, edebiyat söyleşileri, sanat filmi." },

  /* ── EK KONSER ── */
  { lat: 39.9340, lng: 32.8620, type: "konser", name: "Musiki Muallim Mektebi", desc: "1924, Cumhuriyet'in ilk müzik okulu." },
  { lat: 39.8756, lng: 32.7521, type: "konser", name: "Bilkent Odeon", desc: "Antik amfitiyatro ilhamı, 4000 kişilik açık hava arena." },
  { lat: 39.9350, lng: 32.8520, type: "konser", name: "CSO Tarihi Binası", desc: "1961-2020, kentin çoksesli müzik hafızası." },
  { lat: 39.9360, lng: 32.8252, type: "konser", name: "MEB Şura Salonu", desc: "Senfonik konser, bale, festival merkezi." },

  /* ── EK TİYATRO ── */
  { lat: 39.9650, lng: 32.7600, type: "tiyatro", name: "İrfan Şahinbaş Atölye Sahnesi", desc: "Deneysel ve yenilikçi oyunlar." },
  { lat: 39.8987, lng: 32.8575, type: "tiyatro", name: "Tatbikat Sahnesi", desc: "Avangart prodüksiyonlar, bağımsız performans." },
  { lat: 39.8700, lng: 32.7400, type: "tiyatro", name: "Cüneyt Gökçer Sahnesi", desc: "Döner sahne teknolojisi, geniş kapasiteli." },

  /* ── EK TARİHİ ── */
  { lat: 39.9431, lng: 32.8600, type: "tarihi", name: "Antik Roma Tiyatrosu", desc: "MS 1-2. yy, Ankara Kalesi eteklerinde." },
  { lat: 39.9370, lng: 32.8650, type: "tarihi", name: "Ahi Elvan Camii", desc: "1382, Selçuklu ahşap direkli cami." },
  { lat: 39.9397, lng: 32.8583, type: "tarihi", name: "Suluhan (Hasanpaşa Hanı)", desc: "1508-1511, çifte avlulu Osmanlı ticaret hanı." },
  { lat: 39.9375, lng: 32.8560, type: "tarihi", name: "Pirinç Han", desc: "18. yy, antikacılar ve sahafların mekanı." },
  { lat: 39.9350, lng: 32.8430, type: "tarihi", name: "Tarihi Ankara Garı", desc: "1937, Art Deco, Şekip Akalın tasarımı." },
  { lat: 39.9350, lng: 32.8260, type: "tarihi", name: "Gazi Üniversitesi Rektörlük Binası", desc: "1927-30, Mimar Kemaleddin eseri." },
  { lat: 39.9297, lng: 32.8556, type: "tarihi", name: "DTCF Binası", desc: "1936, Bruno Taut tasarımı." },
  { lat: 39.5900, lng: 32.1600, type: "tarihi", name: "Polatlı Duatepe Anıtı", desc: "Sakarya Muharebesi zafer noktası." },
  { lat: 39.9350, lng: 32.8540, type: "tarihi", name: "Güven Anıtı ve Güvenpark", desc: "1935, bronz ve taş rölyef kompleksi." },
  { lat: 39.9419, lng: 32.8547, type: "tarihi", name: "Ulus Zafer Anıtı", desc: "1927, Heinrich Krippel, tunç meydan heykeli." },
  { lat: 40.2386, lng: 33.0331, type: "tarihi", name: "Çubuk-1 Barajı", desc: "1936, Türkiye'nin ilk betonarme barajı." },
  { lat: 40.2140, lng: 32.2450, type: "tarihi", name: "Güdül Tarihi Kent (Cittaslow)", desc: "Sakin Şehir, otantik Osmanlı kasabası." },
  { lat: 40.0900, lng: 32.6850, type: "tarihi", name: "Karalar Galat Mezarları", desc: "MÖ 1. yüzyıl, Kelt kökenli kral mezarları." },
  { lat: 40.4333, lng: 32.4167, type: "tarihi", name: "Pelitçik Fosil Ormanı", desc: "20 milyon yıllık taşlaşmış ağaçlar." },
  { lat: 40.4930, lng: 32.4700, type: "tarihi", name: "Şeyh Ali Semerkandi Türbesi", desc: "15. yy İslam alimi, manevi turizm." },
  { lat: 39.9400, lng: 32.8550, type: "tarihi", name: "Zincirli Camii", desc: "17. yy, kırmızı tuğla ve ahşap tavan." },
  { lat: 39.9895, lng: 33.1738, type: "tarihi", name: "Hasanoğlan Köy Enstitüsü", desc: "1941, aydınlanma projesi mirası." },

  /* ── KALE VE SAVUNMA YAPILARI ── */
  { lat: 39.9415, lng: 32.8658, type: "tarihi", name: "Akkale (İç Kale)", desc: "Selçuklu dönemi, çokgen planlı, sivri kemerli kapılar ve poternler. Kayıp St. Clemens Kilisesi ahşapları burada korunuyor." },
  { lat: 39.9395, lng: 32.8660, type: "tarihi", name: "Şarkkale ve Zindan Kapı", desc: "İç kalenin güneydoğu burcu. Roma mimari parçaları Türk döneminde devşirilmiş. Tarihi seyirdim yolu." },
  { lat: 39.9390, lng: 32.8625, type: "tarihi", name: "Kale Kapısı ve İlhanlı Kitabesi", desc: "Dış surların anıtsal girişi. 1330 tarihli Farsça İlhanlı vergi kitabesi. Yanındaki burç geç Osmanlı saat kulesine dönüştürülmüş." },
  { lat: 39.9435, lng: 32.8580, type: "tarihi", name: "Roma Dönemi Sur Kalıntıları", desc: "Çankırı Caddesi, 1999-2006 kazılarında bulunan MS 2-3. yy bosajlı taş örgülü anıtsal Roma surları." },
  { lat: 39.9405, lng: 32.8660, type: "tarihi", name: "İç Kale Sarnıcı", desc: "Doğu surlarında, yıkık evin altından çıkan beşik tonozlu tuğla sarnıç. Kuşatma dönemi hayatta kalma stratejisi." },

  /* ── İNANÇ VE BELLEK MEKANLARI ── */
  { lat: 39.9400, lng: 32.8640, type: "tarihi", name: "Sultan Alaeddin Camii", desc: "1197-98, İç Kale'de surlara yaslanmış. Ahşap tavan ve alçı mihrap ile Selçuklu estetiğinin Ankara'daki en eski temsilcisi." },
  { lat: 39.9375, lng: 32.8665, type: "tarihi", name: "Zöhre Hatun (Felekeddin) Türbesi", desc: "14-15. yy, gizemli baldaken (açık) türbe. Dört sütun, tuğla kemerler ve kirpi saçaklar." },
  { lat: 39.9365, lng: 32.8655, type: "tarihi", name: "Ahi Şerafeddin Türbesi", desc: "1330, Ahilik teşkilatının izi. Firuze ve mavi-beyaz sırlı çini sandukalar. Orijinal ahşap sanduka Etnografya Müzesi'nde." },
  { lat: 40.0170, lng: 32.3380, type: "tarihi", name: "Ayaş Ulu Camii", desc: "15. yy, mukarnas başlıklı ahşap direkler, kaba yonu taş işçiliği, taklit kündekari minber. Anadolu ahşap mimarisinin sessiz devi." },

  /* ── KÖPRÜLER VE SU YAPILARI ── */
  { lat: 39.9850, lng: 32.5600, type: "tarihi", name: "Zir Köprüsü", desc: "İstanoz Vadisi girişinde Ortaçağ taş köprüsü. 4 kemer gözü. Yakınında Ermenice yazıtlı mezar taşları." },

  /* ── EK EDEBİYAT ── */
  { lat: 39.9210, lng: 32.8560, type: "edebiyat", name: "Adnan Ötüken İl Halk Kütüphanesi", desc: "1922, Paul Bonatz binası." },
  { lat: 39.9200, lng: 32.8550, type: "edebiyat", name: "Mülkiyeliler Birliği", desc: "1859 köklü, aydınların buluşma mekanı." },
  { lat: 39.9070, lng: 32.8600, type: "edebiyat", name: "Kuğulu Park", desc: "1958, Sevgi Soysal'ın edebi mekanı." },
  { lat: 39.9390, lng: 32.8670, type: "edebiyat", name: "Şairler ve Yazarlar Evi", desc: "Hamamönü'nde şiir dinletileri." },

  /* ── EK GASTRONOMİ ── */
  { lat: 39.9410, lng: 32.8555, type: "gastronomi", name: "Tarihi Merkez Efendi Fırını", desc: "Coğrafi işaretli Ankara Simidi." },
  { lat: 39.9410, lng: 32.8560, type: "gastronomi", name: "Ali Uzun Şekercisi", desc: "1930'lar, akide şekeri ve lokum." },
  { lat: 39.9420, lng: 32.8530, type: "gastronomi", name: "Tarihi Uludağ Kebapçısı", desc: "1950'ler, klasik esnaf lokantası." },
  { lat: 40.0900, lng: 32.6850, type: "gastronomi", name: "Kazan Kavurması Lokantaları", desc: "Coğrafi işaretli Kazan Kavurması." },
  { lat: 39.9150, lng: 32.8600, type: "gastronomi", name: "Aspava Gastronomi Kültürü", desc: "1970'ler, Ankara'ya özgü yeme-içme ritüeli." },

  /* ── KÜLTÜREL MİRAS (Resmi Envanter) ── */

  /* Beypazarı */
  { lat: 40.1698, lng: 31.9192, type: "miras", name: "Beypazarı Bedesteni", desc: "Osmanlı dönemi kapalı çarşısı, altı kubbeli taş yapı. Tescilli kültür varlığı." },
  { lat: 40.1688, lng: 31.9185, type: "miras", name: "Paşa Hamamı (Beypazarı)", desc: "Osmanlı klasik hamam mimarisi. Sıcaklık, soğukluk ve halvet bölümleriyle korunmuş." },
  { lat: 40.1695, lng: 31.9190, type: "miras", name: "Akşemsettin Camii", desc: "Fatih'in hocası Akşemsettin adına. Beypazarı'nın manevi merkezi." },
  { lat: 40.1720, lng: 31.9175, type: "miras", name: "Kaygusuz Abdal Türbesi", desc: "14. yy sufi ozanı. Bektaşi geleneğinin öncülerinden, hicivli nefesleriyle ünlü." },
  { lat: 40.1660, lng: 31.9100, type: "miras", name: "Hacılar Köprüsü", desc: "Osmanlı dönemi taş köprü, kervan yolu üzerinde." },
  { lat: 40.1550, lng: 31.9400, type: "miras", name: "İnözü Vadisi Kaya Kiliseleri ve Mezarları", desc: "Vadiye oyulmuş Bizans dönemi kaya kiliseleri ve kaya mezarları. Kapadokya benzeri peribacaları." },
  { lat: 40.1710, lng: 31.9210, type: "miras", name: "Yediler Türbesi", desc: "Yedi evliyanın yattığına inanılan ortak türbe. Halk inancı ve ziyaret geleneği." },

  /* Nallıhan */
  { lat: 40.1850, lng: 31.3480, type: "miras", name: "Tabduk Emre Türbesi", desc: "Yunus Emre'nin hocası, 13. yy mutasavvıfı. Emrem Sultan (Baba Sultan) köyünde." },
  { lat: 40.1845, lng: 31.3490, type: "miras", name: "Bacım Sultan Türbesi", desc: "Tabduk Emre'nin eşi. Anadolu kadın erenleri geleneğinin sembol ismi." },
  { lat: 40.1860, lng: 31.3500, type: "miras", name: "Nasuhpaşa Camii (Nallıhan)", desc: "16. yy, Nasuh Paşa Hanı'nın yanında inşa edilmiş külliye parçası." },

  /* Polatlı */
  { lat: 39.6400, lng: 31.9600, type: "miras", name: "Girmeç Kalesi", desc: "Frigya-Roma-Bizans katmanlı yüksek tepe kalesi. Gordion'a hakim stratejik konum." },
  { lat: 39.6550, lng: 31.9920, type: "miras", name: "Kral Yolu Kalıntıları", desc: "MO 5. yy Pers imparatorluk yolu. Sardis'ten Susa'ya uzanan antik ticaret hattının Gordion kesiti." },

  /* Kızılcahamam */
  { lat: 40.4710, lng: 32.6510, type: "miras", name: "Sey Hamamı (Kızılcahamam)", desc: "Tarihi kaplıca yapısı. Roma'dan Osmanlı'ya termal su geleneğinin kesintisiz tanığı." },

  /* Sincan */
  { lat: 40.0200, lng: 32.5500, type: "miras", name: "Zincirlikaya Mağaraları ve Kilise Kalıntısı", desc: "Kaya oyma Bizans dönemi kilise ve yaşam alanları. Ankara'nın bilinen en iyi korunmuş kaya manastır kompleksi." },
  { lat: 39.9800, lng: 32.5800, type: "miras", name: "Yedi Odalar Kaya Yerleşmesi", desc: "Roma/Bizans dönemi, kayaya oyulmuş yedi odalı yerleşim. Manastır veya inziva yeri." },
  { lat: 39.9700, lng: 32.5600, type: "miras", name: "Hisar Kale (Sincan)", desc: "Ankara Çayı vadisine hakim stratejik tepe kalesi. Bizans-Selçuklu dönemi." },

  /* Mamak */
  { lat: 39.9450, lng: 32.9250, type: "miras", name: "Hüseyin Gazi Türbesi", desc: "8. yy Emevi-Abbasi savaşlarında şehit düşen komutanın türbesi. Yoğun ziyaret yeri." },

  /* Keçiören */
  { lat: 39.9600, lng: 32.8600, type: "miras", name: "Etlik Köprüsü", desc: "Osmanlı dönemi taş köprü. Keçiören'in en eski sivil yapılarından." },

  /* Çankaya */
  { lat: 39.9200, lng: 32.8600, type: "miras", name: "Saraçoğlu Mahallesi", desc: "1944-46, Paul Bonatz tasarımı. Cumhuriyet'in ilk planlı konut yerleşkesi, kentsel sit alanı." },

  /* Kazan */
  { lat: 40.2300, lng: 32.6800, type: "miras", name: "Dur Hasan Şah Türbesi", desc: "Kazan'daki tescilli Osmanlı türbesi. Bölgenin manevi hafızası." },

  /* Çamlıdere */
  { lat: 40.4920, lng: 32.4680, type: "miras", name: "Peçenek Bucağı Camii", desc: "Çamlıdere'de tescilli tarihi ahşap cami. Kırsal Anadolu cami mimarisinin sade örneği." },

  /* Gölbaşı — AST 2023, Doç. Dr. Derya Yılmaz, AGHA Projesi */
  { lat: 39.7800, lng: 32.8000, type: "miras", name: "Tulumtaş Manastır Mağaraları", desc: "Gölbaşı'nda kayaya oyulmuş Bizans manastır kompleksi. Şarap üretim tekneleri kalıntıları." },
  { lat: 39.7540, lng: 32.8200, type: "miras", name: "Hacılar Höyüğü (Gölbaşı)", desc: "165x200 m, 22 m yüksekliğinde anıtsal höyük. 1940-41'de R.O. Arık tarafından Türk Tarih Kurumu adına kazılmış; Frig dönemi yapıları ortaya çıkarılmış. 7 km doğusundaki Karaoğlan kazısıyla bağlantılı. MÖ III. bin'den MÖ I. bin'e kesintisiz yerleşim. Hitit yol ağının Gölbaşı güzergahında stratejik konum. (AST 2023)" },
  { lat: 39.7650, lng: 32.7900, type: "miras", name: "Devedaşı Höyüğü", desc: "306x256 m boyutunda, Gölbaşı'nın en büyük höyüklerinden. Kalkolitik Çağ'dan Demir Çağı sonuna kadar yerleşim katmanları. 1. derece arkeolojik sit alanı. Yüzeyinde seramikten yapılmış ikincil kullanım disk ağırşak bulunmuş. (AST 2023, AGHA Projesi)" },
  { lat: 39.7630, lng: 32.8300, type: "miras", name: "Tulumtaş Höyüğü", desc: "2007-2008'de Anadolu Medeniyetleri Müzesi kurtarma kazısı. En az 4 tabaka: Orta Tunç Çağı, Roma, Helenistik ve Erken Doğu Roma. İncek yolu höyüğü ikiye bölmüş. Kesikköprü Barajı su projesi sırasında keşfedilmiş. (AST 2023)" },
  { lat: 39.7600, lng: 32.8250, type: "miras", name: "Kapaklı Höyüğü ve Antik Şarap Teknesi", desc: "Höyüğün hemen yanında, ana kayaya oyulmuş taş şarap sıkma teknesi — tel çitle koruma altında. Bizans dönemi bağcılık ve şarap üretiminin fiziksel kanıtı. Höyükte MÖ III. bin'den Bizans'a seramik. (AST 2023)" },
  { lat: 39.7700, lng: 32.8100, type: "miras", name: "Taştepe (Taşdeve Mağarası)", desc: "Mogan Gölü'nü besleyen Çölova Deresi kıyısında, 1118 m rakımlı doğal kayalık üzerinde Geç Roma/Bizans karakol yerleşimi. Tepe merkezinde eski bir mağara girişi ('Taşdeve Mağarası') bulunuyordu; tahribatla kapanmış. Vadiye hakim stratejik gözetleme noktası. (AST 2023)" },
  { lat: 39.7750, lng: 32.7950, type: "miras", name: "Karaağızlı Höyüğü", desc: "Geç Kalkolitik'ten Bizans'a 5000 yıllık yerleşim. 13.80 m boyunca izlenebilen sur duvarı kalıntısı ve tepede Klasik Çağ'a ait devasa taş yapı temeli. Haymana yoluna hakim konumda. İlk kez 1994'te S. Omura tarafından tespit edilmiş. (AST 2023)" },

  /* Gölbaşı — AST 2023, Prof. Dr. Gizem & Metin Kartal, Paleolitik Araştırma */
  { lat: 39.7680, lng: 32.8460, type: "miras", name: "Bezirhane-Kazmalı Paleolitik Alanı", desc: "2022'de keşfedilen, Ankara için ilk üçgen formlu iki yüzeyli alet (biface). Yoğun çört yumruları ve Orta Paleolitik levallois çekirdekler. Gölbaşı'nın en zengin Paleolitik buluntu noktalarından. Hammadde kaynağı ve açık hava atölyesi niteliğinde. (AST 2023, Kartal & Kartal)" },
  { lat: 39.7720, lng: 32.8350, type: "miras", name: "Dikilitaş Levallois Açık Hava Atölyesi", desc: "Taş ocağı çevresinde 10'dan fazla buluntu noktasında yoğun Orta Paleolitik levallois çekirdek, yonga ve düzeltili parça koleksiyonu. Ankara'nın bilinen en kapsamlı Paleolitik açık hava atölye alanı. Tipik levallois çekirdekler Anadolu Medeniyetleri Müzesi'ne teslim edilmiş. (AST 2023)" },
  { lat: 39.7580, lng: 32.8150, type: "miras", name: "Boyalık Paleolitik Çört Yatağı", desc: "Alt ve Orta Paleolitik buluntuların yoğun olduğu doğal çört hammadde kaynağı. Kıyıcılar, levallois çekirdekler ve yüzlerce yontma taş alet parçası. Ankara'nın en eski insan izlerinin (Alt Paleolitik, ~500.000+ yıl) bulunduğu alanlardan. (AST 2023)" },

  /* Güdül — AST 2023, Prof. Dr. Mehmet Sağır, Paleontolojik Araştırma */
  { lat: 40.2100, lng: 32.2900, type: "miras", name: "Kaşharman Fosil Lokalitesi (Güdül)", desc: "Miyosen Dönem (5-20 milyon yıl) memeli fosil yatağı. At familyası (Equidae) ve sığırgiller (Bovidae) fosil kalıntıları yamaç kenarında yoğun dağılım halinde. Kirmil Çayı kenarında keşfedilmiş. Ankara'nın paleontolojik zenginliğinin en yeni kanıtı. (AST 2023, Sağır)" },

  /* Yenimahalle */
  { lat: 39.9550, lng: 32.8200, type: "miras", name: "Akköprü (1222)", desc: "Sultan I. Alâeddin Keykubad tarafından 619/1222'de yaptırılan 7 kemerli Selçuklu köprüsü. 79.74 m uzunluk, 4.77 m genişlik. Ankara Çayı üzerinde 800 yıldır ayakta. Ayakların üçgen mahmuzlu kesme taş kaplaması özgün. İstanbul Yolu'nun en eski geçiş noktası. (AST 2023, Bozkurt)" },

  /* Şereflikoçhisar */
  { lat: 38.9400, lng: 33.5400, type: "miras", name: "Alaeddin (Kurşunlu) Camii (Şereflikoçhisar)", desc: "Selçuklu dönemi kurşun kaplı kubbeli cami. Tuz Gölü havzasının en eski ibadet yapısı." },

  /* ── AST 2023 CİLT 3 ── */

  /* Polatlı — AST 2023, Doç. Dr. Müge Durusu-Tanrıöver, PYAP Projesi */
  { lat: 39.6200, lng: 32.1450, type: "miras", name: "Sarıoba Höyük", desc: "Kalkolitik'ten Roma'ya kesintisiz 5 dönem yerleşim. Polatlı kuzeyinde Ankara Çayı'na 300 m mesafede. 2022'de %100 kapsama yüzey taraması yapıldı. Küçük Kalkolitik yerleşim, Tunç Çağları boyunca genişlemiş, seyrek Demir Çağı ve ardından Helenistik-Roma yeniden iskanı. Bölgenin MÖ 2. binyılını anlamak için en kritik iki höyükten biri. (AST 2023, PYAP)" },
  { lat: 39.5450, lng: 32.0500, type: "miras", name: "Karayavşan Höyük", desc: "Kalkolitik, İlk Tunç ve Orta Tunç Çağı höyüğü. 1960'larda Raci Temizer tarafından Anadolu Medeniyetleri Müzesi adına kazıldı. İlk Tunç Çağı figürinleri bulunmuş. 2022'de yüzeyde İlk Tunç Çağı'na ait metal eritme potası keşfedilip müzeye teslim edildi — bölgede erken metalürjinin kanıtı. Kaçak kazı ve toprak alımıyla ciddi tahribata uğramış. (AST 2023, PYAP)" },
  { lat: 39.5600, lng: 32.1700, type: "miras", name: "Kargalı Kalesi", desc: "Demir Çağı, Roma ve Bizans dönemlerine tarihlenen tepedeki kale. Ulaşılması güç, hakim konumda stratejik bir yapı. Yüzey buluntuları olası Galat kökenine işaret ediyor. Polatlı'nın en gizemli savunma yapısı. (AST 2023, PYAP)" },
  { lat: 39.6350, lng: 32.1200, type: "miras", name: "Hacıtuğrul Baba Türbesi ve Yerleşimi", desc: "Selçuklu dönemi türbe, doğu ve güneydoğusunda geniş bir yerleşim alanıyla çevrili. Yeşil, sarı, kahverengi sırlı ve mavi-beyaz bezemeli seramikler Selçuklu-Türk dönemine tarihlenirken, buluntular arasında Frig gri malları da tespit edilmiş — bölgenin Demir Çağı'na uzanan derinliğinin kanıtı. (AST 2023, PYAP)" },
  { lat: 39.6050, lng: 32.1750, type: "miras", name: "Enik Tepe", desc: "Polatlı merkezin 3 km kuzeydoğusunda doğal bir tepe üzerinde Bizans dönemi yamaç yerleşimi. Pembe hamurlu boyasız çanak çömlek ve mavi cam bilezik parçaları (Bizans mezarlıklarının tipik buluntusu) keşfedilmiş. (AST 2023, PYAP)" },

  /* Elmadağ — AST 2023, Görür, Çetin vd. Yüzey Araştırması */
  { lat: 39.8800, lng: 33.0500, type: "miras", name: "Tekke Yazılıkaya Kaya Resimleri", desc: "Tarih öncesi kaya sanatı! Tekke köyü kuzeydoğusunda iki ayrı noktada: Kaya Pınar mevkiinde düzleştirilmiş kaya yüzeyine kolları kalkık insan figürleri oyulmuş. İkinci nokta (Akçaali-Tekke arası) kazıma tekniğiyle dikdörtgen ve yarım daire şekiller — muhtemelen kubbeli yapı tasvirleri. Ankara'nın bilinen en eski sanat eserleri arasında. (AST 2023, Elmadağ)" },
  { lat: 39.8700, lng: 33.0900, type: "miras", name: "Kuşcuali Kaya Şapeli", desc: "Bizans dönemi kaya oyma şapel. Dikdörtgen planlı naos (5.45 × 2.31 m), yarım daire apsisi (1.58 × 1.22 m) ve beşik tonoz örtüsü. Define avcıları tarafından ağır tahribata uğramış, bezeme izleri yok olmuş. Ankara'nın az bilinen Bizans kaya mimarisi örneklerinden. (AST 2023, Elmadağ)" },
  { lat: 39.9300, lng: 32.8800, type: "miras", name: "Hasanoğlan Köy Enstitüsü Yerleşkesi", desc: "1940'larda kurulan efsanevi köy enstitüsü kampüsü. Tescilli yapılar: ana bina, açık hava amfi tiyatrosu, müzik okulu ve konser salonu, atölye binaları. Cumhuriyet eğitim idealinin somut mirası. Ayrıca yakınında tarih öncesi Hasanoğlan Figürini'nin bulunduğu alan, Roma dönemi mil taşları ve kabartmalar da mevcut. (AST 2023, Elmadağ)" },
  { lat: 39.8900, lng: 33.0400, type: "miras", name: "Tekke Dibektaşı Kutsal Alanı", desc: "Tekke köyü kuzeyinde antik kayalık alanda oyulmuş çukurlar ve kanallar — adak/sunu ritüellerine işaret eden kutsal alan. 10 m batıda tahrip edilmiş pithos gömüsü ve pişmiş toprak parçaları tespit edilmiş. Antik dönemde (muhtemelen Roma öncesi) dinsel/ritüel işlev gören nadir bir açık hava tapınım alanı. (AST 2023, Elmadağ)" },

  /* Ayaş — AST 2023, Doç. Dr. Tolga Bozkurt, Ortaçağ Ankara Kuzeybatı */
  { lat: 40.0150, lng: 32.3400, type: "miras", name: "Ayaş Kilik Camii (1560-61)", desc: "968/1560-61 tarihli kitabesiyle Ayaş'ın en anıtsal camisi. 9.88 × 16.98 m geniş dikdörtgen plan, 4 sıra ahşap sütunla 5 sahına bölünmüş. Özgün alçı kalıplı mihrap, boyalı bezemeli minber. Kuzeydoğu köşesinde ahşap minare. Hacıveli Mahallesi'nde. (AST 2023, Bozkurt)" },
  { lat: 40.0100, lng: 32.3380, type: "miras", name: "Bünyamin Ayaşî Camii ve Türbesi", desc: "16. yüzyıl Bayramî-Melamî şeyhi Bünyamin Ayaşî'ye atfedilen üç sahınlı cami. Özgün ahşap minber. Kuzeydoğu köşesinde kare gövdeli, kubbeli türbe — şeyhin kabri burada. Dervişimam Mahallesi'nde. Ankara'nın tasavvuf geleneğinin Ayaş'taki somut izi. (AST 2023, Bozkurt)" },

  /* Beypazarı — AST 2023, Bozkurt */
  { lat: 40.0700, lng: 32.2200, type: "miras", name: "Adaören Kalesi", desc: "Beypazarı'nın 30 km doğusunda, Kirmir Çayı vadisinde yarımada şeklindeki yükselti üzerinde ortaçağ kalesi. Dik kayalıklar ve çay doğal hendek görevi görüyor. Güneydoğudan giriş, iki altıgen burçlu doğu kapısı (biri kısmen ayakta). Roma tonozlu oda, Bizans devşirme malzeme, Türk-İslam kültürel varlığına işaret eden ovo tipi dikili taşlar. Üç dönemin izini taşıyan stratejik savunma yapısı. (AST 2023, Bozkurt)" },

  /* Sincan — AST 2023, Bozkurt */
  { lat: 39.9900, lng: 32.6100, type: "miras", name: "Zir Köprüsü", desc: "Yenikent'te Zir (İstanoz) Vadisi girişinde, dere üzerinde 4 kemerli taş köprü. 4.40 m genişlik, 40 m uzunluk. Memba tarafı ayaklarında mahmuzlar. İlk yapım ortaçağa tarihleniyor olabilir. Yakınında Osmanlı dönemi gayrimüslim mezarlığı — Ermeni kitabeli ve haç monogramlı mezar taşlarıyla birlikte. (AST 2023, Bozkurt)" },
  { lat: 39.9700, lng: 32.5500, type: "miras", name: "Fatma Bacı Türbesi (1310)", desc: "Sincan Bacı Mahallesi'nde kare gövdeli, piramidal çatılı türbe. 25 Haziran 1310'da vefat eden Fatma Bacı'ya ait — Sincan çevresinin en eski tarihli tescilli yapısı. Yanında mihrap duvarına dik üç sahınlı cami. Ahi geleneğinin kadın kolunun (Bacıyan-ı Rum) nadir fiziksel kanıtlarından. (AST 2023, Bozkurt)" },

  /* Çubuk — AST 2023, Albayrak vd. 1402 Ankara Meydan Savaşı Araştırması */
  { lat: 40.1700, lng: 32.9500, type: "miras", name: "Gayri Tepesi (1402 Savaş Alanı)", desc: "1402 Ankara Meydan Savaşı'nın en çarpıcı bulgusu. Çubuk'un 10 km güneybatısında, Kutuören yakınında yoğun insan kemik kalıntıları yüzeyde tespit edilmiş. Tarla sürme ve yol yapımıyla en az 30 birey: 4 kadın, 15 erkek, 6-10 yaş çocuklar. Tibia kondilinde kesik izleri, kaburga parçalarında 500-600°C yanık. Yıldırım Bayezid'in kaçış rotası üzerinde. Jeoradar ve kazı planlanıyor. (AST 2023, Albayrak)" },
  { lat: 40.2200, lng: 33.0200, type: "miras", name: "Melikşah Tepesi", desc: "Çubuk'ta Yıldırım Bayezid'in 1402 Ankara Meydan Savaşı'nda komuta ettiği tepe olarak önerilen alan. Doğu yamacında Osmanlı dönemi sırlı seramikler ve bir at nalı parçası bulunmuş (nal Anadolu Medeniyetleri Müzesi'ne teslim edildi). Güneyde Bizans ve Osmanlı seramikleri. Yakınında tescilli Melikşah Hamamı. (AST 2023, Albayrak)" },

  /* ── AST 2019-2020 ── */

  /* Evren — AST 2019-2020, Prof. Dr. Mehmet Sağır, Ankara İli Yüzey Araştırması */
  { lat: 39.2100, lng: 33.2500, type: "miras", name: "Cebirli Fosil Lokalitesi (Evren)", desc: "Hirfanlı Barajı kıyısında keşfedilen Üst Miyosen Dönem (5-11 milyon yıl) zengin fosil yatağı. Bovidae (sığırgiller), zürafa, gergedan ve hortumlulara (fil benzeri) ait fosiller baraj su seviyesinin hemen üzerindeki çökellerde yoğun biçimde dağılmış. 2020'de Anadolu Medeniyetleri Müzesi ile kurtarma kazısı yapıldı. Baraj suları alanı giderek tahrip ediyor. (AST 2019-2020, Sağır)" },
  { lat: 40.0800, lng: 32.6200, type: "miras", name: "Kocatepe Mağarası (Kazan)", desc: "Kahraman Kazan ilçesi Kınık Mahallesi kuzeyinde arkeolojik mağara. İçerisinde kültürel dolgu, seramik parçaları ve insan kemikleri tespit edilmiş. Kemikler Anadolu Medeniyetleri Müzesi'ne teslim edildi. Kaçak kazı çukurlarıyla tahribata uğramış. Çevresindeki Karataş ve Değirmen Çeşme lokalitelerinde Orta Paleolitik el baltaları, çekirdekler ve kazıyıcılar bulunmuş. (AST 2019-2020, Sağır)" },
  { lat: 39.7350, lng: 32.7600, type: "miras", name: "Çakmaklıbel Paleolitik Alanı (Gölbaşı)", desc: "Gölbaşı ilçesi Selametli Mahallesi'nde Çakmaklı Tepe yamaçlarında Orta Paleolitik açık hava alanı. Çok sayıda çakmaktaşı çekirdek, yonga ve kenar kazıyıcı tespit edilmiş. Yakın çevrede insan eli ile oyulmuş arkeolojik mağaralar da keşfedildi. Ankara'nın güney ilçelerindeki Paleolitik insan izlerinin yeni kanıtı. (AST 2019-2020, Sağır)" },

  /* Kazan — AST 2019, Prof. Dr. Mehmet Sağır, 2018 Yılı Ankara İli Araştırması */
  { lat: 40.1000, lng: 32.6500, type: "miras", name: "Sinaptepe Paleolitik Alanı (Kazan)", desc: "Kahraman Kazan ilçesi Yassıören Mahallesi kuzeyinde Sinaptepe'nin batı yamaçlarında yoğun Pleistosen Dönem taş alet yatağı. Çekirdek, vurgaç, ön kazıyıcı, kenar kazıyıcı, yonga, dilgi ve çentikli aletler. Aynı alanda Miyosen çökelleri içinde omurgalı fosilleri de gözlemlendi. Ankara'nın kuzey batısında Paleolitik insan varlığının önemli kanıtı. (AST 2019, Sağır)" },
  { lat: 40.0700, lng: 32.5800, type: "miras", name: "Karataş Paleolitik Lokalitesi (Kazan)", desc: "Kahraman Kazan Sarılar Mahallesi'nde keşfedilen çok zengin açık hava Paleolitik alanı. Alt Paleolitik ve Orta Paleolitik başlangıcına ait el baltaları (iki yüzeyli), çekirdekler, vurgaçlar, kazıyıcılar. Buluntuların yoğunluğu araştırmacıları 'kazı gerektirecek nitelikte' değerlendirmesine götürdü. Ankara Paleolitiği için kritik bir keşif. (AST 2019, Sağır)" },

  /* Ayaş — AST 2019, Sağır, 2018 Ankara İli Araştırması */
  { lat: 40.0600, lng: 32.3800, type: "miras", name: "Asarıntepe Fosil Lokalitesi (Ayaş)", desc: "Ayaş ilçesi Pınaryaka Köyü'nün 3 km kuzeydoğusunda Miyosen Dönem omurgalı fosil yatağı. At familyasına ait kemik kalıntıları ve küçük baş hayvanlara ait fosiller yamaçlara yayılmış halde. Tarım faaliyetleriyle giderek tahrip oluyor. (AST 2019, Sağır)" },

  /* ── AST 2011 ── */

  /* Çankaya/Gölbaşı — AST 2011, Doç. Dr. İlgezdi Bertram & Bertram, ODTÜ İTÇ Araştırması */
  { lat: 39.8900, lng: 32.7800, type: "miras", name: "Koçumbeli İlk Tunç Çağı Yerleşimi", desc: "ODTÜ kampüsü yakınında İlk Tunç Çağı II'ye (MÖ ~2700-2400) tarihlenen müstahkem yerleşim. 45 × 40 m boyutlarında, üç yandan çevre duvarıyla çevrili. 1960'larda B. Tezcan tarafından kazılmış. 650 m güneybatısında benzer planlı Ahlatlıbel yerleşimi yer alıyor. Ankara'nın merkezinde İlk Tunç Çağı yaşamının nadir kanıtı. (AST 2011, İlgezdi Bertram)" },
  { lat: 39.7400, lng: 32.7900, type: "miras", name: "Karaoğlan Höyük (Gölbaşı)", desc: "1937-1942 yıllarında R.O. Arık başkanlığında kazılan önemli İlk Tunç Çağı höyüğü. Siyah açkılı, yiv bezemeli ve kırmızı açkılı seramikleriyle tanınır. 2010'da ODTÜ ekibi çevresinde 8 İlk Tunç Çağı yerleşimi daha tespit etti. Koçumbeli ve Ahlatlıbel ile birlikte 'Ankara Grubu' olarak anılan İTÇ kültür çevresinin merkezi. (AST 2011, İlgezdi Bertram)" },

  /* ── AST 2018 (2017 Sezonu) ── */

  /* Kalecik — AST 2018, Prof. Dr. Mehmet Sağır, 2017 Ankara İli Araştırması */
  { lat: 40.2949, lng: 33.4870, type: "miras", name: "Çandır Fosil Lokalitesi (Kalecik)", desc: "Ankara'nın Kalecik ilçesi Çandır Köyü'nde Orta Miyosen Dönem (yaklaşık 12-14 milyon yıl) büyük memeli fosil yatağı. Hortumlu hayvanlar (Proboscidea), çift tırnaklılar (Artiodactyla) ve tek tırnaklılar (Perissodactyla) fosilleri. Daha önceki kazılarda hominoid (insansı primat) kalıntıları da bulunmuş — Anadolu'nun en önemli Miyosen primat lokalitelerinden. GPS: 40°17'41\"K, 33°29'13\"D. (AST 2018, Sağır)" },
  { lat: 39.7368, lng: 33.0720, type: "miras", name: "Yaylaköy Miyosen Fosil Yatağı (Çankaya)", desc: "Çankaya ilçesi Yaylaköy-Evcilerağılları Mevkii'nde in-situ (yerinde) Miyosen Dönem fosil yatağı. Tek tırnaklılar (at familyası), çift tırnaklılar ve hortumlu hayvan fosilleri doğal konumlarında keşfedildi. Tarla açma faaliyetleriyle tehdit altında. MTA tarafından da önceden tespit edilmişti. GPS: 39°44'12\"K, 33°04'19\"D. (AST 2018, Sağır)" },
  { lat: 39.7200, lng: 32.8200, type: "miras", name: "Yaylabağ Alt Paleolitik Alanı (Gölbaşı)", desc: "Gölbaşı ilçesi Yaylabağ Köyü doğusunda hem Alt Paleolitik hem Orta Paleolitik döneme ait taş aletlerin bulunduğu geniş alan. Andezitten büyük yonga parçaları (Alt Paleolitik) ve çok sayıda düzeltili yonga (Orta Paleolitik). Ankara'nın güney bölgesinde en az ~500.000 yıllık insan varlığının kanıtı. (AST 2018, Sağır)" },
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
];
