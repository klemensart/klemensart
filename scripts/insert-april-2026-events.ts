/**
 * Nisan 2026 — Ankara'nın en önemli 9 kültür-sanat etkinliği
 * (Işığın Sesi — Ani Çelik Arevyan zaten mevcut)
 *
 * Kullanım: set -a && source .env.local && set +a && npx tsx scripts/insert-april-2026-events.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.\n" +
      ".env.local dosyasını source edin: set -a && source .env.local && set +a"
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface EventInput {
  title: string;
  description: string;
  ai_comment: string;
  event_type: string;
  venue: string;
  address: string;
  event_date: string;
  end_date: string | null;
  source_url: string;
  source_name: string;
  price_info: string;
  image_url: string | null;
  is_klemens_event: boolean;
  status: string;
}

const events: EventInput[] = [
  // ── 1. 40. Uluslararası Ankara Müzik Festivali ─────────────────────
  {
    title: "40. Uluslararası Ankara Müzik Festivali",
    description:
      "Sevda-Cenap And Müzik Vakfı'nın 1985'ten bu yana düzenlediği festival, 40. yılını \"Bir Ankara Senfonisi: 40 Yıldır\" mottosuyla kutluyor. Klasik müzikten caza, flamenkodan modern dansa uzanan 13 ayrı programda 12 ülkeden yaklaşık 250 sanatçı sahne alacak. Açılış konseri 4 Nisan'da şef Orhun Orhon yönetimindeki Ankara Festival Orkestrası ve çellist Benedict Kloeckner solistliğinde CSO Ada Ankara'da; kapanış konseri ise 30 Nisan'da piyanist Salih Can Gevrek solistliğinde gerçekleşecek.",
    ai_comment:
      "Kırk yıllık bir gelenek, her Nisan'da Ankara'yı dünyanın müzik başkentlerinden birine dönüştürüyor. Bu yıl 12 ülkeden 250 sanatçıyla, başkentte yaşamanın ayrıcalığını bir kez daha hissettirecek bir festival.",
    event_type: "festival",
    venue: "CSO Ada Ankara & Bilkent Konser Salonu",
    address: "Cumhurbaşkanlığı Senfoni Orkestrası Konser Salonu, Ankara",
    event_date: "2026-04-04T20:00:00+03:00",
    end_date: "2026-04-30T23:00:00+03:00",
    source_url: "https://www.ankarafestival.com/en",
    source_name: "Uluslararası Ankara Müzik Festivali",
    price_info: "Etkinliğe göre değişir — biletler ankarafestival.com'da",
    image_url:
      "https://festtr.com/wp-content/uploads/klasik-muzik-2-30.09.2020-04-42-17.jpg",
    is_klemens_event: false,
    status: "approved",
  },

  // ── 2. 23. Ankara Kitap Fuarı ──────────────────────────────────────
  {
    title: "23. Ankara Kitap Fuarı",
    description:
      "Ankara'nın en büyük kitap etkinliği, 23. yılında ATO Congresium'da kapılarını açıyor. Bu yılın onur konuğu usta yazar Ayla Kutlu. 250'den fazla yayınevi, 1000'i aşkın yazar, 100+ imza günü ve 75'ten fazla söyleşi ile 10 gün boyunca kitapseverlerin buluşma noktası olacak. Fuar her gün 10:00–20:00 saatleri arasında ziyaret edilebilir.",
    ai_comment:
      "Ankara'nın edebiyat mevsimi Nisan'da başlıyor. Bin yazar, yüzlerce söyleşi ve onur konuğu Ayla Kutlu — kitap kokusu ve sohbet arayanlar için on günlük bir şölen.",
    event_type: "festival",
    venue: "ATO Congresium Kongre ve Sergi Sarayı",
    address: "Söğütözü Cad. No:1, Söğütözü, Ankara",
    event_date: "2026-04-03T10:00:00+03:00",
    end_date: "2026-04-12T20:00:00+03:00",
    source_url: "https://ankarakitapfuari.org.tr/",
    source_name: "Ankara Kitap Fuarı",
    price_info: "Ücretsiz",
    image_url:
      "https://festtr.com/wp-content/uploads/kitap-30.09.2020-04-38-20.jpg",
    is_klemens_event: false,
    status: "approved",
  },

  // ── 3. 23. Uluslararası Ankara Öykü Günleri ────────────────────────
  {
    title: "23. Uluslararası Ankara Öykü Günleri",
    description:
      "Pelin Buzluk'un öncülüğünde 23 yıldır düzenlenen Ankara Öykü Günleri, bu yıl \"Ekoloji\" temasıyla edebiyatseverlerle buluşuyor. İklim krizi ve ekolojik yıkımın edebiyattaki yansımalarını tartışan paneller, söyleşiler, atölyeler, film gösterimleri ve konser etkinlikleriyle dolu bir program sunuyor. Sivil Düşün desteğiyle düzenlenen festival, çoğunlukla fiziksel formatta gerçekleşecek.",
    ai_comment:
      "Doğayla ilişkimizin kırılganlaşmasını edebiyatın diliyle düşünmek — 23 yıllık bir geleneğin bu yılki teması, zamanlama açısından da son derece isabetli.",
    event_type: "festival",
    venue: "Çeşitli Mekanlar",
    address: "Ankara",
    event_date: "2026-04-02T10:00:00+03:00",
    end_date: "2026-04-10T22:00:00+03:00",
    source_url:
      "https://www.sivildusun.net/23-uluslararasi-ankara-oyku-gunleri-geliyor/",
    source_name: "Sivil Düşün",
    price_info: "Ücretsiz",
    image_url:
      "https://festtr.com/wp-content/uploads/ankara-oyku-gunleri-10.04.2024-10-17-36.jpg",
    is_klemens_event: false,
    status: "approved",
  },

  // ── 4. Duman Konseri ────────────────────────────────────────────────
  {
    title: "Duman Konseri",
    description:
      "Türk rock müziğinin efsane grubu Duman, CerModern'in açık hava sahnesinde Ankaralı hayranlarıyla buluşuyor. Kaan Tangöze, Batuhan Mutlugil ve ekibinin performansıyla unutulmaz bir gece vaat eden konser, 4 Nisan Cumartesi 21:00'de başlayacak.",
    ai_comment:
      "Ankara'nın en sevilen açık hava mekanında, Türk rock'ının tartışmasız en güçlü sahne gruplarından biri. Bahar akşamında CerModern'de Duman dinlemek — başlı başına bir deneyim.",
    event_type: "konser",
    venue: "CerModern",
    address: "Altınsoy Cad. No:3, Sıhhiye, Ankara",
    event_date: "2026-04-04T21:00:00+03:00",
    end_date: null,
    source_url:
      "https://www.ifperformance.com/etkinlikler/ankara/branch=cermodern",
    source_name: "IF Performance Hall",
    price_info: "1.250 TL'den başlayan fiyatlarla",
    image_url:
      "https://d2xv8sv7visuzh.cloudfront.net/ifperformance/events/duman-Fgoa3.webp",
    is_klemens_event: false,
    status: "approved",
  },

  // ── 5. Başkent Ankara Sergisi ───────────────────────────────────────
  {
    title: "Başkent Ankara Sergisi",
    description:
      "Türk Devletleri Teşkilatı tarafından \"Türk Dünyası Turizm Başkenti\" seçilen Ankara'nın tarihi yapıları ve mekanları, 22 çağdaş Türk ressamın fırçasından tuvale taşınıyor. Kültür Yolu Festivalleri ve Sanat Meydan Projesi kapsamında hazırlanan sergi, yağlıboya ve akrilik tekniklerle 2025 yılında üretilmiş 24 eserden oluşuyor. CSO Ada Ankara üst kat fuaye alanında 10 Nisan'a kadar ziyaret edilebilir.",
    ai_comment:
      "Ankara'yı her gün yaşıyoruz ama ne kadar görüyoruz? 22 ressamın gözünden başkentin sessiz güzelliğini yeniden keşfetmek için son günler.",
    event_type: "sergi",
    venue: "CSO Ada Ankara — Üst Kat Fuaye",
    address: "Cumhurbaşkanlığı Senfoni Orkestrası Konser Salonu, Ankara",
    event_date: "2026-03-01T10:00:00+03:00",
    end_date: "2026-04-10T20:00:00+03:00",
    source_url:
      "https://www.hurriyet.com.tr/gundem/cumhuriyetin-baskenti-ankaranin-hafizasi-tuvale-tasindi-43132064",
    source_name: "Hürriyet",
    price_info: "Ücretsiz",
    image_url:
      "https://image.hurimg.com/i/hurriyet/90/0x0/69bba22385323b0e839e19eb.jpg",
    is_klemens_event: false,
    status: "approved",
  },

  // ── 6. Bulaşıkçılar (Tiyatro) ──────────────────────────────────────
  {
    title: "Bulaşıkçılar",
    description:
      "Özge Özpirinçci, Şebnem Sönmez, Ahsen Eroğlu ve Ekin Eryılmaz'ın rol aldığı \"Bulaşıkçılar\", bir restoranın bulaşıkhanesinde çalışan üç kadının hikâyesini anlatıyor. Absürt mizah ve çarpıcı gerçekliğin iç içe geçtiği oyun, sistemin kıyısında sıkışıp kalmış kadınların trajikomik dünyasına seyirciyi davet ediyor. 29 Nisan Çarşamba, saat 20:30'da Nazım Hikmet Kültür Merkezi'nde.",
    ai_comment:
      "Türkiye'nin en güçlü kadın oyuncu kadrosundan biri, bulaşıkhane duvarları arasında hayatın hem acısını hem komikliğini sahneye taşıyor. Kaçırılmaması gereken bir tiyatro gecesi.",
    event_type: "tiyatro",
    venue: "Nazım Hikmet Kültür Merkezi",
    address: "Mehmet Akif Ersoy Mah. Bağdat Cad. No:50, Yenimahalle, Ankara",
    event_date: "2026-04-29T20:30:00+03:00",
    end_date: null,
    source_url: "https://tiyatrolar.com.tr/tiyatro/bulasikcilar-2",
    source_name: "tiyatrolar.com.tr",
    price_info: "Bilet bilgisi için tiyatrolar.com.tr'yi ziyaret edin",
    image_url:
      "https://tiyatrolar.com.tr/files/activity/b/bulasikcilar-2/gallery/32589/bulasikcilar-2-32589.jpg",
    is_klemens_event: false,
    status: "approved",
  },

  // ── 7. Efsane Şarkılar — Oldies But Goldies ────────────────────────
  {
    title: 'Efsane Şarkılar — "Oldies But Goldies"',
    description:
      "Aysun ve Ali Kocatepe çifti, Ceyda Pirali Orkestrası eşliğinde 1970'lerden günümüze uzanan unutulmaz Türkçe ve yabancı şarkıları sahneye taşıyor. Nihal Saruhanlı (davul), Oğuz Aktaş (gitar), Ufuk Çağlar Akman (bas) ve Yuri Ryadchenko'nun (saksafon & akordeon) da yer aldığı topluluk, nostalji dolu bir gece vaat ediyor.",
    ai_comment:
      "Bazı şarkılar zamanla eskimez, aksine daha da güzelleşir. 70'lerden bugüne, hafızalarımıza kazınmış melodileri canlı orkestra eşliğinde yeniden dinlemek için harika bir fırsat.",
    event_type: "konser",
    venue: "CSO Ada Ankara — Bankkart Mavi Salon",
    address: "Cumhurbaşkanlığı Senfoni Orkestrası Konser Salonu, Ankara",
    event_date: "2026-04-12T20:00:00+03:00",
    end_date: null,
    source_url:
      "https://www.kadikoylife.com/aysun-ali-kocatepe-efsane-sarkilar-ile-geliyor/",
    source_name: "Kadıköy Life",
    price_info: "Bilet bilgisi için CSO Ada web sitesini ziyaret edin",
    image_url:
      "https://www.kadikoylife.com/wp-content/uploads/2026/01/aysun-ali-kocatepe-efsane-sarkilar-ile-geliyor.webp",
    is_klemens_event: false,
    status: "approved",
  },

  // ── 8. ODTÜ THBT Tiyatro Şenliği ──────────────────────────────────
  {
    title: "ODTÜ THBT Tiyatro Şenliği",
    description:
      "ODTÜ Türk Halk Bilimleri Topluluğu'nun geleneksel tiyatro şenliği, üniversite tiyatro topluluklarını ODTÜ Mimarlık Amfisi'nde buluşturuyor. Genç tiyatrocuların enerjisi ve yaratıcılığıyla dolu beş günlük program, 1–5 Nisan tarihleri arasında ücretsiz olarak izlenebilir.",
    ai_comment:
      "Üniversitenin enerjisi ve tiyatronun büyüsü bir arada. Genç yetenekleri keşfetmek ve kampüs atmosferini yaşamak isteyenler için ideal bir bahar şenliği.",
    event_type: "festival",
    venue: "ODTÜ Mimarlık Amfisi",
    address: "Orta Doğu Teknik Üniversitesi, Çankaya, Ankara",
    event_date: "2026-04-01T18:00:00+03:00",
    end_date: "2026-04-05T22:00:00+03:00",
    source_url: "https://festtr.com/ankara/",
    source_name: "FestTR",
    price_info: "Ücretsiz",
    image_url: null,
    is_klemens_event: false,
    status: "approved",
  },

  // ── 9. Büyük Ankara Çocuk Festivali ─────────────────────────────────
  {
    title: "Büyük Ankara Çocuk Festivali",
    description:
      "23 Nisan ruhunu yaşatan Büyük Ankara Çocuk Festivali, CerModern'de iki gün boyunca aileler ve çocukları bekliyor. Atölye ve stüdyo çalışmaları, eğlence alanları, yüz boyama, dans gösterileri, yarışmalar ve oyun alanlarıyla dolu program 10:00–20:00 saatleri arasında devam edecek. Tiyatro ve müzikal gösterileri ayrı biletlidir.",
    ai_comment:
      "23 Nisan'ın coşkusunu CerModern'in geniş alanlarında yaşamak isteyen aileler için iki günlük renkli bir festival. Çocukların hayal gücüne sınır yok.",
    event_type: "festival",
    venue: "CerModern",
    address: "Altınsoy Cad. No:3, Sıhhiye, Ankara",
    event_date: "2026-04-25T10:00:00+03:00",
    end_date: "2026-04-26T20:00:00+03:00",
    source_url:
      "https://www.bubilet.com.tr/ankara/etkinlik/buyuk-ankara-cocuk-festivali",
    source_name: "Bubilet",
    price_info: "99 TL (tiyatro ve müzikal gösterileri ayrı biletlidir)",
    image_url: null,
    is_klemens_event: false,
    status: "approved",
  },
];

async function main() {
  console.log("Ankara Nisan 2026 — 9 etkinlik ekleniyor...\n");

  let ok = 0;
  let fail = 0;

  for (const ev of events) {
    process.stdout.write(`  → ${ev.title} ... `);

    const { data, error } = await supabase
      .from("events")
      .insert(ev)
      .select("id")
      .single();

    if (error) {
      console.log(`HATA: ${error.message}`);
      fail++;
    } else {
      console.log(`OK (${data.id})`);
      console.log(`    https://klemensart.com/etkinlikler/${data.id}`);
      ok++;
    }
  }

  console.log(`\nSonuç: ${ok} eklendi, ${fail} başarısız.`);
}

main();
