import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase-admin";

// ── Model ─────────────────────────────────────────────────────────────────────
// Haiku kullanıyoruz — günlük bulk yorum üretimi için maliyet açısından ideal.
// Sonnet ile değiştirmek için: "claude-sonnet-4-6"
const AI_MODEL = "claude-haiku-4-5-20251001";

// ── Types ─────────────────────────────────────────────────────────────────────
type ScrapedEvent = {
  title: string;
  description: string;
  event_type: string;
  venue: string;
  address: string;
  event_date: string;       // ISO string
  end_date: string | null;
  source_url: string;
  source_name: string;
  image_url: string | null;
  price_info: string | null;
};

// ── İzin verilen türler ───────────────────────────────────────────────────────
const ALLOWED_TYPES = new Set([
  "sergi", "tiyatro", "soylesi", "panel", "festival",
  "film-festivali", "performans", "opera", "bale",
]);

// Konser filtresi — sadece bu anahtar kelimelerden biri başlık/açıklamada varsa kabul et
const MUSIC_INCLUDE = [
  "jazz", "klasik", "blues", "oda orkestrası", "oda müziği", "senfoni",
  "opera", "bale", "filarmoni", "keman", "piyano", "çello", "viyola",
  "akustik", "enstrümantal", "barok", "konçerto",
];
// Bu kelimeler varsa müzik etkinliğini reddet
const MUSIC_EXCLUDE = [
  "pop", "rock", "rap", "hip hop", "hip-hop", "r&b", "edm", "metal",
  "punk", "trap", "reggae", "elektronik müzik", "dj set", "dj ",
];

function isRelevantConcert(title: string, desc: string): boolean {
  const combined = `${title} ${desc}`.toLowerCase();
  if (MUSIC_EXCLUDE.some((kw) => combined.includes(kw))) return false;
  return MUSIC_INCLUDE.some((kw) => combined.includes(kw));
}

function isRelevant(event: Pick<ScrapedEvent, "title" | "description" | "event_type">): boolean {
  if (event.event_type === "konser") {
    return isRelevantConcert(event.title, event.description);
  }
  return ALLOWED_TYPES.has(event.event_type);
}

// ── Scraper 1: CerModern ──────────────────────────────────────────────────────
// Ankara Cer Modern sanat merkezi — sunucu taraflı HTML, cheerio ile parse edilir.
async function scrapeCerModern(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];

  // Her URL'ye özel selector tanımı
  const sources: { url: string; selector: string }[] = [
    { url: "https://www.cermodern.org/etkinlikler", selector: ".event-box" },
    { url: "https://www.cermodern.org/sergiler?filter=current", selector: ".exhibition-box" },
  ];

  for (const { url, selector } of sources) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      $(selector).each((_, el) => {
        const $el = $(el);

        const title = $el.find("h3, h2, .title").first().text().trim();
        if (!title) return;

        const desc   = $el.find("p, .description").first().text().trim();
        const dateRaw = $el.find("time, .date, [datetime], p").filter((_, e) => {
          const text = $(e).text().trim();
          // Tarih formatına benzeyen paragrafları yakala
          return /\d{1,2}\s+[a-zığüşöçA-ZİĞÜŞÖÇ]+\s*\d{0,4}/i.test(text) || /\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}/.test(text);
        }).first();
        const dateStr = dateRaw.attr("datetime") ?? dateRaw.text().trim();
        // Tarih aralığı varsa (ör. "10 Şubat 2026 - 30 Nisan 2026") ilk tarihi al
        const dateParts = dateStr.split(/\s*[-–]\s*/);

        const href    = $el.is("a") ? ($el.attr("href") ?? "") : ($el.find("a").first().attr("href") ?? "");
        const imgSrc  = $el.find("img").first().attr("src") ?? null;

        const eventDate = parseTurkishDate(dateParts[0]);
        if (!eventDate) return; // tarihi çözemezsek atla

        // Bitiş tarihi varsa parse et
        const endDate = dateParts.length > 1 ? parseTurkishDate(dateParts[1]) : null;

        const source_url = href.startsWith("http") ? href : `https://www.cermodern.org${href.startsWith("/") ? href : "/" + href}`;

        // Tür tahmini — başlık/metinden
        const inferredType = inferEventType(title, desc, url);
        if (!isRelevant({ title, description: desc, event_type: inferredType })) return;

        events.push({
          title,
          description: desc.slice(0, 400),
          event_type: inferredType,
          venue: "Cer Modern",
          address: "Altındağ, Ankara",
          event_date: eventDate,
          end_date: endDate,
          source_url,
          source_name: "CerModern",
          image_url: imgSrc ? (imgSrc.startsWith("http") ? imgSrc : `https://www.cermodern.org${imgSrc}`) : null,
          price_info: null,
        });
      });
    } catch (err) {
      console.error(`[CerModern] ${url} hatası:`, err);
    }
  }

  return events;
}

// ── Scraper 2: Ankara Büyükşehir Belediyesi ───────────────────────────────────
// ABB etkinlik sayfası — sunucu taraflı HTML.
async function scrapeAnkaraBB(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];

  const urls = [
    "https://www.ankara.bel.tr/etkinlikler",
    "https://www.ankara.bel.tr/haberler?category=etkinlik",
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // ABB'nin olası kart/liste yapısı
      $("article, .event-item, .etkinlik, .news-item, .haber-item, li.event").each((_, el) => {
        const $el = $(el);

        const title = $el.find("h2, h3, h4, .title, .baslik").first().text().trim();
        if (!title) return;

        const desc   = $el.find("p, .description, .ozet").first().text().trim();
        const dateRaw = $el.find("time, .date, .tarih, [datetime], span.date").first();
        const dateStr = dateRaw.attr("datetime") ?? dateRaw.text().trim();
        const href    = $el.find("a").first().attr("href") ?? "";
        const imgSrc  = $el.find("img").first().attr("src") ?? null;

        const eventDate = parseTurkishDate(dateStr);
        if (!eventDate) return;

        // Sadece ileriki tarihli etkinlikler
        if (new Date(eventDate) < new Date()) return;

        const source_url = href.startsWith("http")
          ? href
          : `https://www.ankara.bel.tr${href.startsWith("/") ? href : "/" + href}`;

        const inferredType = inferEventType(title, desc, url);
        if (!isRelevant({ title, description: desc, event_type: inferredType })) return;

        events.push({
          title,
          description: desc.slice(0, 400),
          event_type: inferredType,
          venue: "Ankara Büyükşehir",
          address: "Ankara",
          event_date: eventDate,
          end_date: null,
          source_url,
          source_name: "Ankara BB",
          image_url: imgSrc ? (imgSrc.startsWith("http") ? imgSrc : `https://www.ankara.bel.tr${imgSrc}`) : null,
          price_info: "Ücretsiz",
        });
      });
    } catch (err) {
      console.error(`[AnkaraBB] ${url} hatası:`, err);
    }
  }

  return events;
}

// ── Scraper 3: Biletix ────────────────────────────────────────────────────────
// NOT: Biletix React/JS ile render ediyor — sunucu taraflı HTML minimal gelir.
// Şimdilik arama sayfasını dener; ilerleyen aşamada Puppeteer/Playwright gerekebilir.
async function scrapeBiletix(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];

  // Ankara şehir kodu ANK — kategoriler denenebilir
  const searchUrls = [
    "https://www.biletix.com/arama/ANKARA/tr",
    "https://www.biletix.com/etkinlik/TIYATRO/ANKARA/tr",
    "https://www.biletix.com/etkinlik/SERGI/ANKARA/tr",
    "https://www.biletix.com/etkinlik/KONSER/ANKARA/tr",
  ];

  for (const url of searchUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "tr-TR,tr;q=0.9",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Biletix olası HTML yapısı (JS-rendered olabileceğinden minimal kart dönebilir)
      $(".event-card, .eventCard, article.event, .listing-item, [class*='event']").each((_, el) => {
        const $el = $(el);

        const title = $el.find("h2, h3, .event-title, .title, [class*='title']").first().text().trim();
        if (!title || title.length < 3) return;

        const desc    = $el.find("p, .description, .summary").first().text().trim();
        const dateRaw = $el.find("time, .date, [datetime], .event-date, [class*='date']").first();
        const dateStr = dateRaw.attr("datetime") ?? dateRaw.text().trim();
        const href    = $el.find("a").first().attr("href") ?? "";
        const imgSrc  = $el.find("img").first().attr("src") ?? $el.find("img").first().attr("data-src") ?? null;
        const price   = $el.find(".price, [class*='price'], .fiyat").first().text().trim();

        const eventDate = parseTurkishDate(dateStr);
        if (!eventDate) return;

        if (new Date(eventDate) < new Date()) return;

        const source_url = href.startsWith("http") ? href : `https://www.biletix.com${href}`;

        const inferredType = inferEventType(title, desc, url);
        if (!isRelevant({ title, description: desc, event_type: inferredType })) return;

        events.push({
          title,
          description: desc.slice(0, 400),
          event_type: inferredType,
          venue: "",
          address: "Ankara",
          event_date: eventDate,
          end_date: null,
          source_url,
          source_name: "Biletix",
          image_url: imgSrc ?? null,
          price_info: price || null,
        });
      });
    } catch (err) {
      console.error(`[Biletix] ${url} hatası:`, err);
    }
  }

  return events;
}

// ── Scraper 4: Çankaya Belediyesi ────────────────────────────────────────────
// Çankaya Belediyesi kültür-sanat sayfası — sunucu taraflı HTML.
async function scrapeCankaya(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const url = "https://www.cankaya.bel.tr/kultur-sanat";

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return events;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Her .event-card bir <a> tag'ı içinde sarılı
    $(".event-card").each((_, el) => {
      const $el = $(el);
      const $link = $el.closest("a");

      const title = $el.find(".event-title").first().text().trim();
      if (!title) return;

      // Meta item'lardan tarih, mekan, fiyat çek
      let dateStr = "";
      let venue = "";
      let priceInfo: string | null = null;

      $el.find(".event-meta-item").each((__, metaEl) => {
        const $meta = $(metaEl);
        const icon = $meta.find(".material-icons").text().trim();
        const value = $meta.find("span").not(".material-icons").text().trim();

        if (icon === "calendar_today") dateStr = value;
        else if (icon === "location_on") venue = value;
        else if (icon === "stars") priceInfo = value || null;
      });

      const eventDate = parseTurkishDate(dateStr);
      if (!eventDate) return;

      // Geçmiş etkinlikleri atla
      if (new Date(eventDate) < new Date()) return;

      const href = $link.attr("href") ?? "";
      const source_url = href.startsWith("http") ? href : `https://www.cankaya.bel.tr${href.startsWith("/") ? href : "/" + href}`;
      const imgSrc = $el.find(".event-image img").first().attr("src") ?? null;

      const inferredType = inferEventType(title, "", url);
      if (!isRelevant({ title, description: "", event_type: inferredType })) return;

      events.push({
        title,
        description: "",
        event_type: inferredType,
        venue: venue || "Çankaya",
        address: "Çankaya, Ankara",
        event_date: eventDate,
        end_date: null,
        source_url,
        source_name: "Çankaya Belediyesi",
        image_url: imgSrc,
        price_info: priceInfo,
      });
    });
  } catch (err) {
    console.error(`[Çankaya] hatası:`, err);
  }

  return events;
}

// ── Scraper 5: Bilkent Konser Salonu ─────────────────────────────────────────
// bilet.bilkent.edu.tr — sunucu taraflı HTML, klasik müzik & sanat etkinlikleri.
async function scrapeBilkent(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const url = "https://bilet.bilkent.edu.tr/";

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return events;

    const html = await res.text();
    const $ = cheerio.load(html);

    $(".concert").each((_, el) => {
      const $el = $(el);

      const title = $el.find(".concert-name").first().text().trim();
      if (!title) return;

      const dateRaw = $el.find(".concert-date").first().text().trim();
      // "07 Mart 2026 - Cumartesi, 20:00" → tarih kısmını al
      const dateClean = dateRaw.split("-")[0]?.trim() ?? dateRaw;
      const eventDate = parseTurkishDate(dateClean);
      if (!eventDate) return;

      // Geçmiş etkinlikleri atla
      if (new Date(eventDate) < new Date()) return;

      const venue = $el.find(".concert-place").first().text().trim().replace(/^\s*/, "");
      const desc = $el.find(".concert-extra-info").first().text().trim();
      const concertType = $el.find(".concert-type").first().text().trim();

      // Bilet linki
      const href = $el.find(".buy-buttons a").first().attr("href") ?? "";
      const source_url = href.startsWith("http") ? href : `https://bilet.bilkent.edu.tr${href}`;

      // Resim: background-image: url('...') şeklinde
      const styleAttr = $el.find(".concert-image").first().attr("style") ?? "";
      const imgMatch = styleAttr.match(/url\(['"]?([^'")\s]+)['"]?\)/);
      const imgSrc = imgMatch?.[1] ?? null;
      const image_url = imgSrc
        ? (imgSrc.startsWith("http") ? imgSrc : `https://bilet.bilkent.edu.tr${imgSrc}`)
        : null;

      // Bilkent genelde klasik müzik, bale, opera — tür tahmini
      const inferredType = inferEventType(title, `${desc} ${concertType}`, url);
      if (!isRelevant({ title, description: desc, event_type: inferredType })) return;

      events.push({
        title,
        description: desc.slice(0, 400),
        event_type: inferredType,
        venue: venue || "Bilkent Konser Salonu",
        address: "Bilkent, Ankara",
        event_date: eventDate,
        end_date: null,
        source_url,
        source_name: "Bilkent",
        image_url,
        price_info: null,
      });
    });
  } catch (err) {
    console.error(`[Bilkent] hatası:`, err);
  }

  return events;
}

// ── Yardımcı: Tür tahmini ─────────────────────────────────────────────────────
function inferEventType(title: string, desc: string, url: string): string {
  const combined = `${title} ${desc} ${url}`.toLowerCase();

  if (combined.includes("sergi") || combined.includes("exhibition")) return "sergi";
  if (combined.includes("tiyatro") || combined.includes("oyun") || combined.includes("theatre")) return "tiyatro";
  if (combined.includes("söyleşi") || combined.includes("sohbet") || combined.includes("talk")) return "soylesi";
  if (combined.includes("panel") || combined.includes("konferans") || combined.includes("sempozyum")) return "panel";
  if (combined.includes("film festivali") || combined.includes("sinema festivali")) return "film-festivali";
  if (combined.includes("festival")) return "festival";
  if (combined.includes("performans") || combined.includes("performance")) return "performans";
  if (combined.includes("opera")) return "opera";
  if (combined.includes("bale") || combined.includes("ballet")) return "bale";
  if (
    combined.includes("konser") || combined.includes("concert") ||
    combined.includes("müzik") || combined.includes("music") ||
    combined.includes("senfoni") || combined.includes("symphony") ||
    combined.includes("konçerto") || combined.includes("sonat")
  ) return "konser";

  // URL'den tahmin
  if (url.includes("SERGI") || url.includes("sergiler")) return "sergi";
  if (url.includes("TIYATRO")) return "tiyatro";
  if (url.includes("KONSER")) return "konser";

  return "etkinlik"; // bilinmiyor → filtre isRelevant'ta elecek
}

// ── Yardımcı: Türkçe tarih parse ─────────────────────────────────────────────
const TR_MONTHS: Record<string, number> = {
  ocak: 0, şubat: 1, mart: 2, nisan: 3, mayıs: 4, haziran: 5,
  temmuz: 6, ağustos: 7, eylül: 8, ekim: 9, kasım: 10, aralık: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseTurkishDate(raw: string): string | null {
  if (!raw) return null;
  raw = raw.trim();

  // ISO format — direkt kullan
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // DD.MM.YYYY veya DD/MM/YYYY
  const dmy = raw.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  if (dmy) {
    const d = new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // "15 Mart 2026" veya "15 mart" (yıl eksikse mevcut yılı kullan)
  const trDate = raw.match(/(\d{1,2})\s+([a-zığüşöçA-ZİĞÜŞÖÇ]+)\s*(\d{4})?/i);
  if (trDate) {
    const day   = +trDate[1];
    const month = TR_MONTHS[trDate[2].toLowerCase()];
    const year  = trDate[3] ? +trDate[3] : new Date().getFullYear();
    if (month !== undefined) {
      const d = new Date(year, month, day, 20, 0);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }
  }

  return null;
}

// ── AI Yorum Üretimi ──────────────────────────────────────────────────────────
async function generateAIComment(event: ScrapedEvent): Promise<string> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 120,
      messages: [
        {
          role: "user",
          content: `Bu etkinlik için Klemens platformunun üslubuyla 1-2 cümlelik kısa bir öneri yorumu yaz. Sıcak, davetkar, akademik olmayan bir ton kullan. Yorum "Bu" veya "Etkinlik" ile başlamasın — doğrudan içeriğe gir. Türkçe yaz, tırnak işareti kullanma.

Etkinlik: ${event.title}
Tür: ${event.event_type}
Mekan: ${event.venue}
Açıklama: ${event.description.slice(0, 200)}`,
        },
      ],
    });

    const block = msg.content[0];
    return block.type === "text" ? block.text.trim() : "";
  } catch (err) {
    console.error("[AI] Yorum üretme hatası:", err);
    return "";
  }
}

// ── Duplikasyon kontrolü ──────────────────────────────────────────────────────
async function isDuplicate(title: string, eventDate: string): Promise<boolean> {
  const admin = createAdminClient();
  // Aynı başlık + aynı günün etkinliği varsa duplicate say
  const dayStart = eventDate.slice(0, 10); // YYYY-MM-DD
  const { count } = await admin
    .from("events")
    .select("id", { count: "exact", head: true })
    .ilike("title", title.slice(0, 60))
    .gte("event_date", `${dayStart}T00:00:00Z`)
    .lte("event_date", `${dayStart}T23:59:59Z`);

  return (count ?? 0) > 0;
}

// ── Ana Route Handler ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // 1. Auth: Vercel Cron veya manuel admin tetiklemesi
  const authHeader = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";

  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  type StatEntry = { found: number; added: number; error: string | null };
  const results: Record<string, StatEntry> = {
    biletix:   { found: 0, added: 0, error: null },
    cerModern: { found: 0, added: 0, error: null },
    ankaraBB:  { found: 0, added: 0, error: null },
    cankaya:   { found: 0, added: 0, error: null },
    bilkent:   { found: 0, added: 0, error: null },
  };

  // 2. Her scraper'ı bağımsız çalıştır
  const scraperKeys = ["biletix", "cerModern", "ankaraBB", "cankaya", "bilkent"] as const;
  const settled = await Promise.allSettled([
    scrapeBiletix(),
    scrapeCerModern(),
    scrapeAnkaraBB(),
    scrapeCankaya(),
    scrapeBilkent(),
  ]);

  const scraperResults: [StatEntry, ScrapedEvent[]][] = scraperKeys.map((key, i) => {
    const s = settled[i];
    if (s.status === "rejected") results[key].error = String(s.reason);
    return [results[key], s.status === "fulfilled" ? s.value : []];
  });

  const admin = createAdminClient();

  // 3. Her etkinliği işle
  for (const [stat, events] of scraperResults) {
    stat.found = events.length;

    for (const event of events) {
      try {
        // Duplicate kontrolü
        if (await isDuplicate(event.title, event.event_date)) continue;

        // AI yorumu
        const ai_comment = await generateAIComment(event);

        // DB'ye kaydet
        const { error } = await admin.from("events").insert({
          ...event,
          ai_comment,
          status: "pending",
          is_klemens_event: false,
        });

        if (!error) stat.added++;
        else console.error("[DB] Insert hatası:", error.message);
      } catch (err) {
        console.error("[İşleme] Hata:", err);
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  return NextResponse.json({
    success: true,
    elapsed_sec: elapsed,
    results,
    total: {
      found: scraperResults.reduce((s, [, ev]) => s + ev.length, 0),
      added: Object.values(results).reduce((s, r) => s + r.added, 0),
    },
  });
}
