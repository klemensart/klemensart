/**
 * Adnan Çoker "Mutlak Siyah" sergisi — etkinlik + story oluştur
 * Kullanım: set -a && source .env.local && set +a && npx tsx scripts/insert-coker-event-and-story.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  console.error(".env.local dosyasını source edin: set -a && source .env.local && set +a");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const IMAGE_URL =
  "https://www.gazetekritik.com/cropImages/1280x720/uploads/haberler/2026/3/7214-adnan-cokerin-mutlak-siyah-sergisi-17-martta-sanatseverlerle-bulusuyor.jpg";

async function main() {
  // ── 1. Etkinlik ekle ──────────────────────────────────────────────
  console.log("1) Etkinlik ekleniyor...");

  const { data: event, error: eventErr } = await supabase
    .from("events")
    .insert({
      title: "Mutlak Siyah — Adnan Çoker Sergisi",
      description:
        'Türk soyut resminin öncülerinden Adnan Çoker\'in "Mutlak Siyah" retrospektif sergisi, sanatçının onlarca yıla yayılan üretimini bir araya getiriyor. Çoker\'in minimalist siyah kompozisyonları, geometrik formları ve ışık-gölge denemeleri Ankara\'da sanatseverlerle buluşuyor. Sergi 17 Mart 2026 saat 19.00\'da açılıyor ve 26 Nisan 2026\'ya kadar ziyaret edilebilir.',
      ai_comment:
        "Siyahın içindeki sonsuzluğu keşfetmek isteyenler için kaçırılmaması gereken bir sergi. Adnan Çoker'in tuvallerinde karanlık, bir yokluk değil — derinliğin ve sessizliğin dili.",
      event_type: "sergi",
      venue: "Doğan Taşdelen Çağdaş Sanatlar Merkezi",
      address: "Çankaya Belediyesi, Çankaya, Ankara",
      event_date: "2026-03-17T19:00:00+03:00",
      end_date: "2026-04-26T23:59:00+03:00",
      source_url:
        "https://www.gazetekritik.com/kultur-sanat/adnan-cokerin-mutlak-siyah-sergisi-17-martta-sanatseverlerle-bulusuyor/410861",
      source_name: "Gazete Kritik",
      price_info: "Ücretsiz",
      image_url: IMAGE_URL,
      is_klemens_event: false,
      status: "approved",
    })
    .select("id")
    .single();

  if (eventErr) {
    console.error("Etkinlik eklenemedi:", eventErr.message);
  } else {
    console.log(`   Etkinlik eklendi! ID: ${event.id}`);
    console.log(`   URL: https://klemensart.com/etkinlikler/${event.id}`);
  }

  // ── 2. Story tasarımı oluştur ─────────────────────────────────────
  console.log("\n2) Story tasarımı oluşturuluyor...");

  const TITLE = "Mutlak Siyah — Adnan Çoker Sergisi";
  const SPOT =
    "Türk soyut resminin büyük ismi Adnan Çoker'in retrospektif sergisi Ankara'da. 17 Mart – 26 Nisan, Doğan Taşdelen Çağdaş Sanatlar Merkezi.";

  const canvasData = {
    backgroundColor: "#FFFBF7",
    objects: [
      // Krem arka plan
      {
        type: "shape",
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        fill: "#FFFBF7",
        shapeType: "rect",
        opacity: 1,
        rotation: 0,
      },
      // Cover görseli
      {
        type: "image",
        x: 80,
        y: 70,
        width: 920,
        height: 640,
        src: IMAGE_URL,
        opacity: 1,
        rotation: 0,
      },
      // Kategori etiketi
      {
        type: "text",
        x: 80,
        y: 790,
        width: 920,
        text: "SERGİ",
        fontSize: 43,
        fontFamily: "Montserrat",
        fontStyle: "bold",
        fill: "#ff6c5f",
        align: "left",
        letterSpacing: 12,
        lineHeight: 1.2,
        opacity: 1,
        rotation: 0,
      },
      // Başlık
      {
        type: "text",
        x: 80,
        y: 870,
        width: 920,
        text: SPOT,
        fontSize: 34,
        fontFamily: "Montserrat",
        fontStyle: "normal",
        fill: "#2c3e50",
        align: "left",
        letterSpacing: 0,
        lineHeight: 1.79,
        opacity: 1,
        rotation: 0,
      },
      // İmza
      {
        type: "text",
        x: 80,
        y: 1250,
        width: 920,
        text: "— Klemens Art",
        fontSize: 30,
        fontFamily: "Montserrat",
        fontStyle: "italic",
        fill: "#2c3e50",
        align: "left",
        letterSpacing: 0,
        lineHeight: 1.2,
        opacity: 1,
        rotation: 0,
      },
    ],
  };

  // Eski story'yi sil (varsa)
  const { data: existing } = await supabase
    .from("designs")
    .select("id")
    .like("name", `Story — ${TITLE}%`);

  if (existing && existing.length > 0) {
    const ids = existing.map((d: { id: string }) => d.id);
    await supabase.from("designs").delete().in("id", ids);
    console.log(`   Eski ${ids.length} story silindi.`);
  }

  const { data: design, error: designErr } = await supabase
    .from("designs")
    .insert({
      name: `Story — ${TITLE}`,
      platform: "instagram-story",
      width: 1080,
      height: 1920,
      canvas_data: canvasData,
      thumbnail_url: null,
      is_template: false,
      created_by: null,
    })
    .select("id")
    .single();

  if (designErr) {
    console.error("Story kaydedilemedi:", designErr.message);
    process.exit(1);
  }

  console.log(`   Story oluşturuldu! ID: ${design.id}`);
  console.log(`   Editörde aç: /admin/tasarim/${design.id}`);
  console.log(`   PNG olarak indirebilirsiniz.`);
}

main();
