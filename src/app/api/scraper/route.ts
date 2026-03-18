import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";
import { Agent, fetch as undiciFetch } from "undici";
import { createAdminClient } from "@/lib/supabase-admin";

// SSL sertifika zinciri eksik siteler için (csoadaankara.gov.tr)
const insecureAgent = new Agent({ connect: { rejectUnauthorized: false } });

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
// cermodern.org — Etkinlikler ve Sergiler: <a> elementlerinden yapısal parse
async function scrapeCerModern(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];

  const sources: { url: string; isExhibition: boolean }[] = [
    { url: "https://www.cermodern.org/etkinlikler", isExhibition: false },
    { url: "https://www.cermodern.org/sergiler?filter=current", isExhibition: true },
  ];

  for (const { url, isExhibition } of sources) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Her etkinlik/sergi bir <a> elementi — içinde img, h3, tarih metni var
      $("a[href]").each((_, el) => {
        const $a = $(el);
        const href = $a.attr("href") ?? "";
        // Sadece detay sayfalarına yönlenen linkleri al
        if (!href.includes("/etkinlik/") && !href.includes("/sergi/") && !href.includes("/exhibition/")) return;

        const title = $a.find("h3").first().text().trim();
        if (!title) return;

        const desc = $a.find("p").first().text().trim();

        // Tarih: tüm metin içinden tarih kalıbı ara
        const allText = $a.text();
        const dateMatch = allText.match(/(\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+\s+\d{4})/);
        const dateRangeMatch = allText.match(/(\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+\s+\d{4})\s*[-–]\s*(\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+\s+\d{4})/);

        const eventDate = dateMatch ? parseTurkishDate(dateMatch[1]) : null;
        if (!eventDate) return;
        const endDate = dateRangeMatch ? parseTurkishDate(dateRangeMatch[2]) : null;

        const imgSrc = $a.find("img").first().attr("src") ?? null;
        const source_url = href.startsWith("http") ? href : `https://www.cermodern.org${href.startsWith("/") ? href : "/" + href}`;

        const inferredType = isExhibition ? "sergi" : inferEventType(title, desc, url);
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
// ABB etkinlik sayfası — a[href^="/etkinlik/"] linkleri: <strong> başlık, <span> tarih/mekan
async function scrapeAnkaraBB(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const url = "https://www.ankara.bel.tr/etkinlikler";

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return events;

    const html = await res.text();
    const $ = cheerio.load(html);

    const seen = new Set<string>();

    $('a[href*="/etkinlik/"]').each((_, el) => {
      const $a = $(el);
      const href = $a.attr("href") ?? "";
      if (!href.startsWith("/etkinlik/")) return;
      if (seen.has(href)) return;
      seen.add(href);

      // Başlık: title attr, <strong>, veya img alt
      const title = ($a.attr("title") ?? $a.find("strong").first().text() ?? $a.find("img").attr("alt") ?? "").trim();
      if (!title) return;

      const imgSrc = $a.find("img").first().attr("src") ?? null;

      // Kategori: <span> içinde "Konser", "Tiyatro" vb.
      const spans: string[] = [];
      $a.find("span").each((__, sp) => { spans.push($(sp).text().trim()); });

      // Tarih: span'lardan tarih kalıbı ara
      let dateStr = "";
      let venue = "";
      let category = "";
      for (const s of spans) {
        if (/\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+\s+\d{4}/.test(s) || /\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+/.test(s)) {
          if (!dateStr) dateStr = s.replace(/\s+\d{2}:\d{2}.*/, "").trim();
        } else if (!category && ["Konser", "Tiyatro", "Sergi", "Söyleşi", "Festival", "Panel", "Opera", "Bale"].some(c => s.includes(c))) {
          category = s;
        } else if (!venue && s.length > 3 && !s.match(/^\d/)) {
          venue = s;
        }
      }

      const eventDate = parseTurkishDate(dateStr);
      if (!eventDate || !isFutureDate(eventDate)) return;

      const source_url = `https://www.ankara.bel.tr${href}`;

      const inferredType = category
        ? inferEventType(category, title, url)
        : inferEventType(title, "", url);
      if (!isRelevant({ title, description: "", event_type: inferredType })) return;

      events.push({
        title,
        description: "",
        event_type: inferredType,
        venue: venue || "Ankara Büyükşehir",
        address: "Ankara",
        event_date: eventDate,
        end_date: null,
        source_url,
        source_name: "Ankara BB",
        image_url: imgSrc,
        price_info: "Ücretsiz",
      });
    });
  } catch (err) {
    console.error(`[AnkaraBB] hatası:`, err);
  }

  return events;
}

// ── Scraper 3: Biletix ────────────────────────────────────────────────────────
// biletix.com — Solr JSON API ile Ankara etkinlikleri (HTML fallback mevcut)
async function scrapeBiletix(): Promise<ScrapedEvent[]> {
  const BILETIX_SKIP = new Set(["SPORT", "SPOR", "FAMILY", "COCUK"]);

  function mapBiletixCategory(cat: string, subcat: string, title: string, desc: string): string {
    const c = cat.toUpperCase();
    const s = subcat.toLocaleLowerCase("tr-TR");
    if (s.includes("tiyatro") || s.includes("sahne")) return "tiyatro";
    if (s.includes("sergi")) return "sergi";
    if (s.includes("opera")) return "opera";
    if (s.includes("bale") || s.includes("dans")) return "bale";
    if (s.includes("festival")) return "festival";
    if (s.includes("soylesi") || s.includes("panel")) return "soylesi";
    if (c === "ART") return inferEventType(title, desc, "biletix");
    if (c === "MUSIC") return "konser";
    return inferEventType(title, desc, "biletix");
  }

  // ── Yol 1: Solr JSON API ──
  try {
    // BXID cookie al (Solr erişimi için gerekli olabilir)
    let cookieStr = "";
    try {
      const pageRes = await fetch("https://www.biletix.com/anasayfa/ANKARA/tr", {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
      });
      const setCookies = pageRes.headers.get("set-cookie") ?? "";
      const bxMatch = setCookies.match(/BXID=[^;]+/);
      if (bxMatch) cookieStr = bxMatch[0];
    } catch { /* cookie opsiyonel */ }

    const solrUrl = "https://www.biletix.com/solr/tr/select/?q=*:*&fq=region:ANKARA&start=0&rows=200&sort=start+asc,+vote+desc&wt=json";
    const res = await fetch(solrUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Referer": "https://www.biletix.com/arama/ANKARA/tr",
        ...(cookieStr ? { "Cookie": cookieStr } : {}),
      },
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("json")) {
        const data = await res.json();
        const docs: unknown[] = data?.response?.docs ?? [];

        if (docs.length > 0) {
          const events: ScrapedEvent[] = [];

          for (const raw of docs) {
            const doc = raw as Record<string, unknown>;
            const title = String(doc.name ?? "").trim();
            if (!title) continue;

            const category = String(doc.category ?? "");
            const subcategory = String(doc.subcategory ?? "");
            if (BILETIX_SKIP.has(category.toUpperCase())) continue;

            // HTML açıklamayı düz metne çevir
            const descHtml = String(doc.description ?? "");
            const desc = descHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

            const eventType = mapBiletixCategory(category, subcategory, title, desc);
            if (!isRelevant({ title, description: desc, event_type: eventType })) continue;

            const startDate = String(doc.start ?? "");
            const eventDate = parseTurkishDate(startDate);
            if (!eventDate || !isFutureDate(eventDate)) continue;

            const venue = String(doc.venue ?? "").trim();
            const id = String(doc.id ?? "");
            const imageFile = String(doc.image_url ?? "");
            const isGroup = String(doc.type ?? "") === "group";
            const imageDir = isGroup ? "groupimages" : "eventimages";

            events.push({
              title,
              description: desc.slice(0, 400),
              event_type: eventType,
              venue: venue || "Ankara",
              address: "Ankara",
              event_date: eventDate,
              end_date: null,
              source_url: id
                ? `https://www.biletix.com/etkinlik/${id}/ANKARA/tr`
                : "https://www.biletix.com/arama/ANKARA/tr",
              source_name: "Biletix",
              image_url: imageFile
                ? `https://www.biletix.com/static/images/live/event/${imageDir}/${imageFile}`
                : null,
              price_info: null,
            });
          }

          if (events.length > 0) {
            return events;
          }
        }
      }
    }
  } catch (err) {
    console.error("[Biletix] Solr API hatası:", err);
  }

  // ── Yol 2: HTML fallback (JS-rendered, sınırlı sonuç) ──
  const events: ScrapedEvent[] = [];
  const searchUrls = [
    "https://www.biletix.com/arama/ANKARA/tr",
    "https://www.biletix.com/etkinlik/TIYATRO/ANKARA/tr",
  ];

  for (const url of searchUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      $(".searchResultEvent, [class*='listevent']").each((_, el) => {
        const $el = $(el);
        const title = $el.find(".searchResultEventName, .ln1").first().text().trim();
        if (!title || title.length < 3) return;

        const venue = $el.find(".searchResultPlace").first().text().trim();
        const href = $el.find("a").first().attr("href") ?? "";
        const imgSrc = $el.find("img").first().attr("src") ?? null;

        // Tarih: mobil alanda day/month
        const dayNum = $el.find(".searchMobileDateDayNumber").first().text().trim();
        const monthName = $el.find(".searchMobileDateMonth").first().text().trim();
        const dateStr = `${dayNum} ${monthName}`;
        const eventDate = parseTurkishDate(dateStr);
        if (!eventDate || !isFutureDate(eventDate)) return;

        const source_url = href.startsWith("http") ? href : `https://www.biletix.com${href}`;
        const inferredType = inferEventType(title, "", url);
        if (!isRelevant({ title, description: "", event_type: inferredType })) return;

        events.push({
          title,
          description: "",
          event_type: inferredType,
          venue: venue || "Ankara",
          address: "Ankara",
          event_date: eventDate,
          end_date: null,
          source_url,
          source_name: "Biletix",
          image_url: imgSrc,
          price_info: null,
        });
      });
    } catch (err) {
      console.error(`[Biletix] HTML ${url} hatası:`, err);
    }
  }

  return events;
}

// ── Scraper 4: Çankaya Belediyesi ────────────────────────────────────────────
// Çankaya Belediyesi kültür-sanat sayfası — .event-featured-card kartları
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

    // Yeni yapı: .event-featured-card — içinde .event-featured-title, .event-featured-meta
    $(".event-featured-card").each((_, el) => {
      const $el = $(el);
      const $link = $el.closest("a").length ? $el.closest("a") : $el.find("a").first();

      const title = $el.find(".event-featured-title").first().text().trim();
      if (!title) return;

      const category = $el.find(".event-featured-category").first().text().trim();

      // Meta item'lardan tarih, mekan, fiyat çek
      let dateStr = "";
      let venue = "";
      let priceInfo: string | null = null;

      $el.find(".event-featured-meta-item").each((__, metaEl) => {
        const $meta = $(metaEl);
        const text = $meta.text().trim();
        // SVG ikon kullanıyorlar — metinden tür tahmin et
        if (/\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+/.test(text) || /\d{1,2}[./]\d{1,2}/.test(text)) {
          if (!dateStr) dateStr = text;
        } else if (text.length > 3 && !dateStr) {
          venue = text;
        } else if (!venue && text.length > 3) {
          venue = text;
        }
      });

      // Fallback: tüm meta metninden tarih ara
      if (!dateStr) {
        const metaText = $el.find(".event-featured-meta").text();
        const m = metaText.match(/(\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+\s*\d{0,4})/);
        if (m) dateStr = m[1];
      }

      const eventDate = parseTurkishDate(dateStr);
      if (!eventDate) return;
      if (new Date(eventDate) < new Date()) return;

      const href = $link.attr("href") ?? "";
      const source_url = href.startsWith("http") ? href : `https://www.cankaya.bel.tr${href.startsWith("/") ? href : "/" + href}`;
      const imgSrc = $el.find(".event-featured-image img").first().attr("src") ?? null;

      let inferredType = category ? inferEventType(category, title, url) : inferEventType(title, "", url);
      if (inferredType === "etkinlik") {
        const venueLower = venue.toLowerCase();
        if (venueLower.includes("salon") || venueLower.includes("sahne")) inferredType = "tiyatro";
        else if (venueLower.includes("galeri") || venueLower.includes("sergi")) inferredType = "sergi";
        else inferredType = "tiyatro";
      }

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
// bilet.bilkent.edu.tr — JS-rendered site; SSR HTML'den yapısal parse
async function scrapeBilkent(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const url = "https://bilet.bilkent.edu.tr/";

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return events;

    const html = await res.text();
    const $ = cheerio.load(html);

    const seen = new Set<string>();

    // Bilet linkleri: a[href*="/bilet/"] veya yapısal etkinlik elementleri
    // Ayrıca .concert class hâlâ çalışabilir (fallback)
    const selectors = [".concert", 'a[href*="/bilet/"]'];

    for (const sel of selectors) {
      $(sel).each((_, el) => {
        const $el = $(el);
        const isLink = el.tagName === "a";

        // Başlık
        let title = "";
        if (isLink) {
          title = ($el.attr("title") ?? $el.text()).trim();
        } else {
          title = ($el.find(".concert-name").first().text() || $el.find("h3, h2").first().text()).trim();
        }
        if (!title || title.length < 3) return;
        if (seen.has(title)) return;
        seen.add(title);

        // Tarih: metin içinden tarih kalıbı ara
        const allText = isLink ? $el.parent().text() : $el.text();
        const dateMatch = allText.match(/(\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+\s+\d{4})/);
        const eventDate = dateMatch ? parseTurkishDate(dateMatch[1]) : null;
        if (!eventDate || !isFutureDate(eventDate)) return;

        // Mekan
        const venue = ($el.find(".concert-place").first().text() || "").trim();
        const desc = ($el.find(".concert-extra-info").first().text() || "").trim();

        // Bilet linki
        const href = isLink
          ? ($el.attr("href") ?? "")
          : ($el.find('a[href*="/bilet/"]').first().attr("href") ?? "");
        const source_url = href.startsWith("http") ? href : `https://bilet.bilkent.edu.tr${href}`;

        // Resim: background-image veya img
        const styleAttr = $el.find("[style*='background']").first().attr("style") ?? "";
        const imgMatch = styleAttr.match(/url\(['"]?([^'")\s]+)['"]?\)/);
        const imgSrc = imgMatch?.[1] ?? $el.find("img").first().attr("src") ?? null;
        const image_url = imgSrc
          ? (imgSrc.startsWith("http") ? imgSrc : `https://bilet.bilkent.edu.tr${imgSrc}`)
          : null;

        const inferredType = inferEventType(title, desc, url);
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
    }
  } catch (err) {
    console.error(`[Bilkent] hatası:`, err);
  }

  return events;
}

// ── Scraper 6: CSO Ada Ankara ─────────────────────────────────────────────────
// csoadaankara.gov.tr — .event_list kartları, tarih .event_date span'larından
async function scrapeCSOAda(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const url = "https://csoadaankara.gov.tr/tr/Event";

  // Gün isimleri — tarih parse'ta hariç tutulacak
  const DAY_NAMES = new Set([
    "PAZARTESI", "SALI", "ÇARŞAMBA", "PERŞEMBE", "PERSEMBE",
    "CUMA", "CUMARTESI", "CUMARTESİ", "PAZAR",
  ]);

  try {
    // CSO Ada sertifika zinciri eksik — undici ile SSL doğrulamasını atla
    const res = await undiciFetch(url, {
      dispatcher: insecureAgent,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return events;

    const html = await res.text();
    const $ = cheerio.load(html);

    $(".event_list").each((_, el) => {
      const $el = $(el);

      const title = $el.find("a.event_title_link h3").first().text().trim();
      if (!title) return;

      // Tarih: .event_date içindeki span'lar → ay, gün (.date), yıl, gün adı
      const $date = $el.find(".event_date");
      let month = "", day = "", year = "";

      $date.children("span").each((__, sp) => {
        const text = $(sp).text().trim();
        if ($(sp).hasClass("date")) { day = text; return; }
        if (/^\d{4}$/.test(text)) { year = text; return; }
        if (/^[A-ZİĞÜŞÖÇa-zığüşöç]+$/.test(text) && !DAY_NAMES.has(text.toLocaleUpperCase("tr-TR"))) {
          month = text;
        }
      });

      const dateStr = `${day} ${month} ${year}`.trim();
      const eventDate = parseTurkishDate(dateStr);
      if (!eventDate) return;
      if (new Date(eventDate) < new Date()) return;

      const desc = $el.find(".event_shortdetail").first().text().trim();
      const venue = $el.find(".saloon").first().text().trim().replace(/^-\s*/, "");

      const href = $el.find("a.event_title_link").first().attr("href") ?? "";
      const source_url = href.startsWith("http") ? href.replace(/^http:/, "https:") : `https://csoadaankara.gov.tr${href.startsWith("/") ? href : "/" + href}`;
      const imgSrc = $el.find(".event_img img").first().attr("src") ?? null;

      const inferredType = inferEventType(title, desc, url);
      if (!isRelevant({ title, description: desc, event_type: inferredType })) return;

      events.push({
        title,
        description: desc.slice(0, 400),
        event_type: inferredType,
        venue: venue || "CSO Ada Ankara",
        address: "Oran, Çankaya, Ankara",
        event_date: eventDate,
        end_date: null,
        source_url,
        source_name: "CSO Ada Ankara",
        image_url: imgSrc ? (imgSrc.startsWith("http") ? imgSrc : `https://csoadaankara.gov.tr${imgSrc}`) : null,
        price_info: null,
      });
    });
  } catch (err) {
    console.error(`[CSO Ada] hatası:`, err);
  }

  return events;
}

// ── Scraper 7: Lavarla ────────────────────────────────────────────────────────
// lavarla.com — WordPress/Elementor Loop Grid + Post widget
async function scrapeLavarla(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const url = "https://lavarla.com/kategori/pusula/etkinlik/";

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return events;

    const html = await res.text();
    const $ = cheerio.load(html);

    const seen = new Set<string>();

    // Yol 1: Elementor Loop Grid — div.e-loop-item veya .elementor-loop-item
    $("div.e-loop-item, .elementor-loop-item").each((_, el) => {
      const $el = $(el);

      const title = ($el.find(".elementor-heading-title").first().text() || $el.find("h3, h2").first().text()).trim();
      if (!title || seen.has(title)) return;
      seen.add(title);

      // Link: data-premium-element-link JSON attribute veya ilk a
      const linkData = $el.attr("data-premium-element-link");
      let href = "";
      if (linkData) {
        try { href = JSON.parse(linkData).href ?? ""; } catch { /* */ }
      }
      if (!href) href = $el.find("a").first().attr("href") ?? "";

      const dateStr = ($el.find(".elementor-post-info__item--type-date time").first().text() || $el.find("time").first().text() || $el.find(".elementor-post-date").first().text()).trim();
      const imgSrc = $el.find("img").first().attr("src") ?? null;

      const eventDate = parseTurkishDate(dateStr);
      if (!eventDate || !isFutureDate(eventDate)) return;

      const source_url = href.startsWith("http") ? href : `https://lavarla.com${href}`;

      const inferredType = inferEventType(title, "", url);
      if (!isRelevant({ title, description: "", event_type: inferredType })) return;

      events.push({
        title,
        description: "",
        event_type: inferredType,
        venue: "",
        address: "Ankara",
        event_date: eventDate,
        end_date: null,
        source_url,
        source_name: "Lavarla",
        image_url: imgSrc,
        price_info: null,
      });
    });

    // Yol 2: Elementor Post widget — .elementor-post (div veya article)
    $(".elementor-post").each((_, el) => {
      const $el = $(el);

      const $titleLink = $el.find(".elementor-post__title a").first();
      const title = ($titleLink.text() || $el.find("h3, h2").first().text()).trim();
      if (!title || seen.has(title)) return;
      seen.add(title);

      const href = $titleLink.attr("href") ?? $el.find("a").first().attr("href") ?? "";
      const dateStr = ($el.find("span.elementor-post-date").first().text() || $el.find(".elementor-post__meta-data span").first().text()).trim();
      const imgSrc = $el.find(".elementor-post__thumbnail img").first().attr("src") ?? null;

      const eventDate = parseTurkishDate(dateStr);
      if (!eventDate || !isFutureDate(eventDate)) return;

      const source_url = href.startsWith("http") ? href : `https://lavarla.com${href}`;
      const inferredType = inferEventType(title, "", url);
      if (!isRelevant({ title, description: "", event_type: inferredType })) return;

      events.push({
        title,
        description: "",
        event_type: inferredType,
        venue: "",
        address: "Ankara",
        event_date: eventDate,
        end_date: null,
        source_url,
        source_name: "Lavarla",
        image_url: imgSrc,
        price_info: null,
      });
    });
  } catch (err) {
    console.error(`[Lavarla] hatası:`, err);
  }

  return events;
}

// ── Scraper 8: Biletinial ─────────────────────────────────────────────────────
// biletinial.com — Önce JSON API dener, başarısızsa HTML carousel'den okur.
async function scrapeBiletinial(): Promise<ScrapedEvent[]> {
  const BILETINIAL_CDN = "https://b6s54eznn8xq.merlincdn.net";
  const SKIP_TYPES = new Set(["spor", "parti", "stand-up", "sinema", "çocuk", "cocuk"]);

  function mapType(tipRaw: string, tipForUrl: string): string {
    if (tipRaw.includes("tiyatro") || tipForUrl.includes("tiyatro")) return "tiyatro";
    if (tipRaw.includes("sergi") || tipForUrl.includes("sergi")) return "sergi";
    if (tipRaw.includes("opera") || tipForUrl.includes("opera")) return "opera";
    if (tipRaw.includes("bale") || tipForUrl.includes("bale") || tipRaw.includes("dans")) return "bale";
    if (tipRaw.includes("konser") || tipRaw.includes("müzik") || tipRaw.includes("muzik") || tipForUrl.includes("muzik")) return "konser";
    if (tipRaw.includes("söyleşi") || tipRaw.includes("soylesi")) return "soylesi";
    if (tipRaw.includes("festival")) return "festival";
    if (tipRaw.includes("gösteri") || tipRaw.includes("gosteri") || tipRaw.includes("performans")) return "performans";
    return "etkinlik";
  }

  // ── Yol 1: JSON API ──
  const apiUrls = [
    "https://biletinial.com/GetAllEventsByCity?cityId=3&langId=1&countryId=3&langCode=tr&pageNumber=1&pageSize=10000&initial=true",
    "https://www.biletinial.com/GetAllEventsByCity?cityId=3&langId=1&countryId=3&langCode=tr&pageNumber=1&pageSize=10000&initial=true",
  ];

  for (const apiUrl of apiUrls) {
    try {
      const res = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json, text/plain, */*",
          "Referer": "https://biletinial.com/tr-tr/sehrineozel/ankara",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;

      // HTML dönerse JSON parse patlar — content-type kontrol et
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("json")) continue;

      const data = await res.json();
      const items: unknown[] = Array.isArray(data)
        ? data
        : (data?.events ?? data?.result ?? data?.data ?? []);
      if (!Array.isArray(items) || items.length === 0) continue;

      const events: ScrapedEvent[] = [];
      for (const raw of items) {
        const item = raw as Record<string, unknown>;
        const title = String(item.etkinlik ?? item.name ?? "").trim();
        if (!title) continue;

        const tipRaw = String(item.tip ?? item.type ?? "").toLocaleLowerCase("tr-TR");
        const tipForUrl = String(item.tipForUrl ?? "").toLocaleLowerCase("tr-TR");
        if (SKIP_TYPES.has(tipRaw) || SKIP_TYPES.has(tipForUrl)) continue;

        const eventType = mapType(tipRaw, tipForUrl);
        if (!isRelevant({ title, description: "", event_type: eventType })) continue;

        const seanceDate = String(item.SeanceDate ?? "");
        const dateRaw = String(item.tarih ?? item.date ?? "");
        const eventDate = parseTurkishDate(seanceDate) ?? parseTurkishDate(dateRaw);
        if (!eventDate || !isFutureDate(eventDate)) continue;

        const venue = String(item.mekan ?? item.venue ?? "").trim();
        const slug = String(item.url ?? "");
        const category = tipForUrl || tipRaw;
        const source_url = slug
          ? `https://biletinial.com/tr-tr/${category}/${slug}`
          : "https://biletinial.com/tr-tr/sehrineozel/ankara";
        const pic = String(item.pic ?? "");
        const image_url = pic ? `${BILETINIAL_CDN}${pic.startsWith("/") ? "" : "/"}${pic}` : null;

        events.push({
          title, description: "", event_type: eventType,
          venue: venue || "Ankara", address: "Ankara",
          event_date: eventDate, end_date: null,
          source_url, source_name: "Biletinial",
          image_url, price_info: null,
        });
      }

      if (events.length > 0) {
        return events;
      }
    } catch (err) {
      console.error(`[Biletinial] API ${apiUrl} hatası:`, err);
    }
  }

  // ── Yol 2: HTML carousel fallback ──
  const events: ScrapedEvent[] = [];
  try {
    const res = await fetch("https://biletinial.com/tr-tr/sehrineozel/ankara", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "tr-TR,tr;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return events;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Carousel: section.carouselComp a.item — "Populer Etkinlikler"
    $("section.carouselComp a.item").each((_, el) => {
      const $a = $(el);
      const title = ($a.attr("data-slider-item") ?? $a.find("img").attr("alt") ?? "").trim();
      if (!title || title.length < 3) return;

      const href = $a.attr("href") ?? "";
      const imgSrc = $a.find("img").attr("src") ?? null;

      // Carousel'de tarih yok — tür URL'den çıkar, tarih bugünün tarihi olarak ata
      const inferredType = inferEventType(title, "", href);
      if (!isRelevant({ title, description: "", event_type: inferredType })) return;

      const source_url = href.startsWith("http") ? href : `https://biletinial.com${href}`;

      // Carousel etkinlikleri yakında olduğu varsayılır → bugünün tarihi
      const eventDate = new Date().toISOString();

      events.push({
        title, description: "", event_type: inferredType,
        venue: "Ankara", address: "Ankara",
        event_date: eventDate, end_date: null,
        source_url, source_name: "Biletinial",
        image_url: imgSrc, price_info: null,
      });
    });

  } catch (err) {
    console.error("[Biletinial] HTML fallback hatası:", err);
  }

  return events;
}

// ── Scraper 9: Ankara Masası ──────────────────────────────────────────────────
// ankaramasasi.com.tr — a[href*="/haber/"] linkleri, lazy-loaded images
async function scrapeAnkaraMasasi(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const url = "https://www.ankaramasasi.com.tr/haberler/kultur-sanat";

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return events;

    const html = await res.text();
    const $ = cheerio.load(html);

    const seen = new Set<string>();

    // Haber linkleri: a[href*="/haber/"]
    $('a[href*="/haber/"]').each((_, el) => {
      const $link = $(el);
      const href = $link.attr("href") ?? "";
      if (!href.includes("/haber/")) return;
      if (seen.has(href)) return;
      seen.add(href);

      // Başlık: h2, h3, img alt, veya link text
      const $parent = $link.parent();
      const title = ($parent.find("h2").first().text() || $parent.find("h3").first().text()
        || $link.find("img").attr("alt") || $link.text()).trim();
      if (!title || title.length < 10) return;

      // Resim: data-src (lazy load) veya src
      const $img = $link.find("img").first().length ? $link.find("img").first() : $parent.find("img").first();
      const imgSrc = $img.attr("data-src") ?? $img.attr("src") ?? null;
      const image_url = imgSrc && !imgSrc.includes("lazy.webp") ? imgSrc : null;

      const source_url = href.startsWith("http") ? href : `https://www.ankaramasasi.com.tr${href}`;

      const eventDate = new Date().toISOString();

      const inferredType = inferEventType(title, "", url);
      if (!isRelevant({ title, description: "", event_type: inferredType })) return;

      events.push({
        title,
        description: "",
        event_type: inferredType,
        venue: "",
        address: "Ankara",
        event_date: eventDate,
        end_date: null,
        source_url,
        source_name: "Ankara Masası",
        image_url: image_url,
        price_info: null,
      });
    });
  } catch (err) {
    console.error(`[AnkaraMasası] hatası:`, err);
  }

  return events;
}

// ── Scraper 10: Bubilet ──────────────────────────────────────────────────────
// bubilet.com.tr — Next.js SSR, a[href*="/ankara/etkinlik/"] linkleri
async function scrapeBubilet(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  // URL değişti: /ankara-etkinlikleri → /ankara
  const urls = [
    "https://www.bubilet.com.tr/ankara",
    "https://www.bubilet.com.tr/ankara-etkinlikleri",
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      const seen = new Set<string>();

      $('a[href*="/etkinlik/"]').each((_, el) => {
        const $a = $(el);
        const href = $a.attr("href") ?? "";
        if (seen.has(href)) return;
        seen.add(href);

        const title = ($a.attr("title") ?? $a.find("h3, h2").first().text() ?? "").trim();
        if (!title || title.length < 3) return;

        const textEls: string[] = [];
        $a.find("p, span").each((__, p) => {
          const t = $(p).text().trim();
          if (t && t !== title) textEls.push(t);
        });

        let dateStr = "";
        let venue = "";
        for (const t of textEls) {
          if (/\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]{3,}/.test(t) || /[A-ZİĞÜŞÖÇa-zığüşöç]{3,}\s+\d/.test(t)) {
            dateStr = t.replace(/\s*-\s*\d{2}:\d{2}.*/, "").trim();
          } else if (!venue && t.length > 2 && !t.includes("TL")) {
            venue = t;
          }
        }

        const eventDate = parseTurkishDate(dateStr);
        if (!eventDate || !isFutureDate(eventDate)) return;

        const priceEl = $a.find("span").filter((__, s) => $(s).text().includes("TL")).first().text().trim();
        const price = priceEl || null;
        const imgSrc = $a.find("img").first().attr("src") ?? null;
        const source_url = href.startsWith("http") ? href : `https://www.bubilet.com.tr${href}`;
        const inferredType = inferEventType(title, "", url);
        if (!isRelevant({ title, description: "", event_type: inferredType })) return;

        events.push({
          title,
          description: "",
          event_type: inferredType,
          venue: venue || "Ankara",
          address: "Ankara",
          event_date: eventDate,
          end_date: null,
          source_url,
          source_name: "Bubilet",
          image_url: imgSrc,
          price_info: price,
        });
      });

      if (events.length > 0) break; // İlk çalışan URL yeterli
    } catch (err) {
      console.error("[Bubilet] hatası:", err);
    }
  }

  return events;
}

// ── Scraper 11: Mobilet ──────────────────────────────────────────────────────
// mobilet.com — CMS GraphQL API (cms.mobilet.com/graphql)
async function scrapeMobilet(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const CDN_URL = "https://cdn.mobilet.com";

  const MOBILET_SKIP = new Set(["spor", "egitim"]);

  function mapMobiletType(typeName: string): string {
    const t = typeName.toLocaleLowerCase("tr-TR");
    if (t.includes("tiyatro")) return "tiyatro";
    if (t.includes("sergi")) return "sergi";
    if (t.includes("opera")) return "opera";
    if (t.includes("bale") || t.includes("dans")) return "bale";
    if (t.includes("festival")) return "festival";
    if (t.includes("söyleşi") || t.includes("soylesi") || t.includes("panel")) return "soylesi";
    if (t.includes("müzik") || t.includes("muzik") || t.includes("konser")) return "konser";
    if (t.includes("gösteri") || t.includes("performans")) return "performans";
    return "etkinlik";
  }

  const query = `{
    events(
      pagination: { limit: 100 }
      filters: { eventLocation: { locationName: { containsi: "Ankara" } } }
    ) {
      data {
        attributes {
          eventId
          eventName
          eventDates { eventStartDate }
          eventBody
          eventLocation { data { attributes { locationName } } }
          eventHorizontalImage { data { attributes { url } } }
          eventType { data { attributes { eventTypeName } } }
        }
      }
    }
  }`;

  try {
    const res = await fetch("https://cms.mobilet.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error(`[Mobilet] GraphQL HTTP ${res.status}`);
      return events;
    }

    const json = await res.json();
    const items = json?.data?.events?.data ?? [];

    for (const item of items) {
      const attrs = item?.attributes;
      if (!attrs) continue;

      const title = String(attrs.eventName ?? "").trim();
      if (!title) continue;

      const typeName = attrs.eventType?.data?.attributes?.eventTypeName ?? "";
      const typeKey = mapMobiletType(typeName);
      if (MOBILET_SKIP.has(typeKey)) continue;
      if (!isRelevant({ title, description: "", event_type: typeKey })) continue;

      // İlk tarih
      const dates = Array.isArray(attrs.eventDates) ? attrs.eventDates : [];
      const firstDate = dates[0]?.eventStartDate ?? null;
      const eventDate = firstDate ? parseTurkishDate(firstDate) : null;
      if (!eventDate || !isFutureDate(eventDate)) continue;

      const venue = attrs.eventLocation?.data?.attributes?.locationName ?? "";
      const desc = String(attrs.eventBody ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

      // Resim
      const imgPath = attrs.eventHorizontalImage?.data?.attributes?.url ?? "";
      const image_url = imgPath ? `${CDN_URL}${imgPath.startsWith("/") ? "" : "/"}${imgPath}` : null;

      const eventId = attrs.eventId ?? "";
      const slug = title.toLocaleLowerCase("tr-TR").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      const source_url = eventId
        ? `https://www.mobilet.com/tr/event/${slug}-${eventId}/`
        : "https://www.mobilet.com";

      events.push({
        title,
        description: desc.slice(0, 400),
        event_type: typeKey,
        venue: venue || "Ankara",
        address: "Ankara",
        event_date: eventDate,
        end_date: null,
        source_url,
        source_name: "Mobilet",
        image_url,
        price_info: null,
      });
    }

  } catch (err) {
    console.error("[Mobilet] GraphQL hatası:", err);
  }

  return events;
}

// ── Scraper 12: Unite Ortak Mekan ────────────────────────────────────────────
// uniteankara.com — Squarespace; a[href*="/calendar/"] linkleri
async function scrapeUnite(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const url = "https://uniteankara.com/calendar";

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return events;

    const html = await res.text();
    const $ = cheerio.load(html);

    const seen = new Set<string>();

    // Eski yapı fallback + yeni yapı: a[href*="/calendar/"]
    const candidates = $(".eventlist-event, a[href*='/calendar/']");

    candidates.each((_, el) => {
      const $el = $(el);
      const isLink = el.tagName === "a";

      // Başlık
      let title = "";
      if (isLink) {
        title = ($el.find("h3").first().text() || $el.attr("title") || $el.text().split("\n")[0]).trim();
      } else {
        title = ($el.find(".eventlist-title-link").first().text() || $el.find("h3").first().text()).trim();
      }
      if (!title || title.length < 3 || seen.has(title)) return;
      seen.add(title);

      // Tarih: eski yapıdan veya metin parse
      let eventDate: string | null = null;
      if (!isLink) {
        const month = $el.find(".eventlist-datetag-startdate--month").first().text().trim();
        const day = $el.find(".eventlist-datetag-startdate--day").first().text().trim();
        eventDate = parseTurkishDate(`${day} ${month}`);
      }
      if (!eventDate) {
        const allText = isLink ? $el.parent().text() : $el.text();
        const dateMatch = allText.match(/(\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+\s*\d{0,4})/);
        if (dateMatch) eventDate = parseTurkishDate(dateMatch[1]);
      }
      // Fallback: p element'lerden tarih ara
      if (!eventDate) {
        $el.find("p").each((__, p) => {
          if (eventDate) return;
          const t = $(p).text().trim();
          const m = t.match(/(\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+)/);
          if (m) eventDate = parseTurkishDate(m[1]);
        });
      }
      if (!eventDate || !isFutureDate(eventDate)) return;

      const href = isLink
        ? ($el.attr("href") ?? "")
        : ($el.find(".eventlist-title-link, a").first().attr("href") ?? "");
      const source_url = href
        ? (href.startsWith("http") ? href : `https://uniteankara.com${href}`)
        : url;

      const imgSrc = $el.find("img").first().attr("data-src")
        ?? $el.find("img").first().attr("src")
        ?? null;
      const desc = ($el.find(".eventlist-excerpt, p").first().text() || "").trim();

      const inferredType = inferEventType(title, desc, url);
      if (!isRelevant({ title, description: desc, event_type: inferredType })) return;

      events.push({
        title,
        description: desc.slice(0, 400),
        event_type: inferredType,
        venue: "Unite Ortak Mekan",
        address: "Cinnah 7A, Çankaya, Ankara",
        event_date: eventDate,
        end_date: null,
        source_url,
        source_name: "Unite Ortak Mekan",
        image_url: imgSrc,
        price_info: null,
      });
    });
  } catch (err) {
    console.error("[Unite] hatası:", err);
  }

  return events;
}

// ── Scraper 13: Kült Kavaklıdere ────────────────────────────────────────────
// kultkavaklidere.org — Ana sayfa carousel + Biletinial venue page fallback
async function scrapeKultKavaklidere(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];

  // Yol 1: Biletinial venue page
  try {
    const res = await fetch("https://biletinial.com/tr-tr/etkinlikleri/kult-kavaklidere-etkinlikleri", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      $("a[href*='/tr-tr/']").each((_, el) => {
        const $a = $(el);
        const href = $a.attr("href") ?? "";
        // Sadece etkinlik linkleri (kategori/slug formatı)
        if (!href.match(/\/tr-tr\/(tiyatro|muzik|sahne-sanatlari|sergi|soylesi|dans|opera|bale|goster|performans|etkinlik)\//)) return;

        const title = ($a.find("img").attr("alt") ?? $a.attr("title") ?? $a.text()).trim();
        if (!title || title.length < 3) return;

        const imgSrc = $a.find("img").attr("src") ?? null;

        // Biletinial venue etkinlikleri genellikle yakın tarihli — bugünün tarihi ata
        const eventDate = new Date().toISOString();

        const source_url = href.startsWith("http") ? href : `https://biletinial.com${href}`;
        const inferredType = inferEventType(title, "", href);
        if (!isRelevant({ title, description: "", event_type: inferredType })) return;

        events.push({
          title,
          description: "",
          event_type: inferredType,
          venue: "Kült Kavaklıdere",
          address: "Tunalı Hilmi Cd. No:105, Çankaya, Ankara",
          event_date: eventDate,
          end_date: null,
          source_url,
          source_name: "Kült Kavaklıdere",
          image_url: imgSrc,
          price_info: null,
        });
      });
    }
  } catch (err) {
    console.error("[Kült] Biletinial hatası:", err);
  }

  // Yol 2: Ana sayfa — <a> elementlerinden yapısal parse (carousel/kart)
  try {
    const res = await fetch("https://www.kultkavaklidere.org/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      const seen = new Set<string>();

      // Tüm linkleri tara: biletinial linkleri veya etkinlik detay linkleri
      $("a[href]").each((_, el) => {
        const $a = $(el);
        const href = $a.attr("href") ?? "";

        // Biletinial etkinlik linkleri veya kendi detay sayfaları
        const isBiletinial = href.includes("biletinial.com/tr-tr/") && href.match(/\/(tiyatro|muzik|sahne|sergi|soylesi|dans|opera|bale|goster|performans|etkinlik|sinema)\//);
        const isDetail = href.startsWith("/") && href.length > 5 && !href.includes("/hakkimizda") && !href.includes("/iletisim");

        if (!isBiletinial && !isDetail) return;

        // Başlık: img alt, title attr, veya metin
        const title = ($a.find("img").attr("alt") ?? $a.attr("title") ?? $a.text()).trim();
        if (!title || title.length < 3 || title === "Afiş") return;
        if (seen.has(title)) return;
        seen.add(title);

        const imgSrc = $a.find("img").attr("src") ?? null;

        // Tarih: metin içinden veya parent'tan
        const allText = $a.parent().text();
        const dateMatch = allText.match(/(\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+)/);
        const eventDate = dateMatch ? parseTurkishDate(dateMatch[1]) : new Date().toISOString();

        const source_url = href.startsWith("http") ? href : `https://www.kultkavaklidere.org${href}`;
        const inferredType = inferEventType(title, "", href);
        if (!isRelevant({ title, description: "", event_type: inferredType })) return;

        events.push({
          title,
          description: "",
          event_type: inferredType,
          venue: "Kült Kavaklıdere",
          address: "Tunalı Hilmi Cd. No:105, Çankaya, Ankara",
          event_date: eventDate,
          end_date: null,
          source_url,
          source_name: "Kült Kavaklıdere",
          image_url: imgSrc,
          price_info: null,
        });
      });
    }
  } catch (err) {
    console.error("[Kült] Ana sayfa hatası:", err);
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

// ── Scraper 15: Ankara Devlet Opera ve Balesi ──────────────────────────────
// operabale.gov.tr — JSON API, Ankara müdürlüğü (id=1)
async function scrapeOperaBale(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const apiUrl = "https://apimain.operabale.gov.tr/v1/web/temsil/mudurluk/listele/1";

  try {
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return events;

    const data: Array<{
      oyunTarihi: string;
      eserAdi: string;
      eserKonu: string;
      sahneAdi: string;
      seoUrl: string;
      seoFullUrl: string;
      afisler: string[];
    }> = await res.json();

    for (const item of data) {
      const title = item.eserAdi?.trim();
      if (!title) continue;

      const eventDate = new Date(item.oyunTarihi).toISOString();
      if (!isFutureDate(eventDate)) continue;

      // Tür tespiti: başlık + sahne adından
      const combined = `${title} ${item.sahneAdi ?? ""}`.toLowerCase();
      let inferredType: string;
      if (combined.includes("opera") || combined.includes("opera sahnesi")) inferredType = "opera";
      else if (combined.includes("bale") || combined.includes("ballet")) inferredType = "bale";
      else if (combined.includes("konser") || combined.includes("müzik") || combined.includes("trio") || combined.includes("duo")) inferredType = "konser";
      else if (combined.includes("tiyatro") || combined.includes("oyun")) inferredType = "tiyatro";
      else inferredType = inferEventType(title, item.eserKonu ?? "", "opera bale");

      // Opera/bale scraper'ından gelen her şey kültür-sanata uygun
      if (!isRelevant({ title, description: item.eserKonu ?? "", event_type: inferredType })) {
        // Fallback: opera/bale kaynağından gelen bilinmeyen türleri kabul et
        if (inferredType === "etkinlik") inferredType = "performans";
        else continue;
      }

      const source_url = item.seoFullUrl || `https://www.operabale.gov.tr/shows/${item.seoUrl}`;
      const image_url = item.afisler?.[0] ?? null;
      const desc = (item.eserKonu ?? "").replace(/\r\n/g, " ").trim().slice(0, 400);

      events.push({
        title,
        description: desc,
        event_type: inferredType,
        venue: item.sahneAdi || "Ankara DOB",
        address: "Opera Caddesi, Ulus, Ankara",
        event_date: eventDate,
        end_date: null,
        source_url,
        source_name: "Ankara DOB",
        image_url,
        price_info: null,
      });
    }
  } catch (err) {
    console.error(`[OperaBale] hatası:`, err);
  }

  return events;
}

// ── Scraper 14: Erimtan Arkeoloji ve Sanat Müzesi ──────────────────────────
// erimtanmuseum.org/tr/takvim — Aylık takvim, <ul> <li> yapısı, <time> etiketleri
async function scrapeErimtan(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const now = new Date();

  // Bu ay + sonraki ay
  const months = [
    { month: now.getMonth() + 1, year: now.getFullYear() },
    { month: now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2, year: now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear() },
  ];

  for (const { month, year } of months) {
    try {
      const url = `https://erimtanmuseum.org/tr/takvim?month=${month}&year=${year}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensBot/1.0)" },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Yapısal: li elementleri — section.content olsun olmasın tüm li'leri tara
      $("li").each((_, el) => {
        const $li = $(el);
        const $a = $li.find("a").first();
        const $time = $li.find("time").first();

        // <time datetime="..."> etiketi olmalı
        const datetime = $time.attr("datetime") ?? "";
        let eventDate: string | null = null;
        if (datetime) {
          try {
            eventDate = new Date(datetime.replace(" ", "T")).toISOString();
          } catch { /* */ }
        }
        // Fallback: metin içinden tarih parse
        if (!eventDate) {
          const text = $li.text();
          const dateMatch = text.match(/(\d{1,2}\s+[A-ZİĞÜŞÖÇa-zığüşöç]+\s+\d{4})/);
          if (dateMatch) eventDate = parseTurkishDate(dateMatch[1]);
        }
        if (!eventDate || !isFutureDate(eventDate)) return;

        // h3 = kategori, h2 = başlık (veya tersi)
        const h3Text = $li.find("h3").first().text().trim();
        const h2Text = $li.find("h2").first().text().trim();
        // Başlık: h2 veya h3 — hangisi daha uzunsa başlık
        let title = h2Text || h3Text;
        let category = h2Text && h3Text ? (h2Text.length > h3Text.length ? h3Text : h2Text) : "";
        if (title === category) category = "";
        if (!title) return;

        // Çocuk atölyelerini atla
        const detail = $li.find("span, .h5").text();
        if (/\b\d+-\d+\s*yaş/i.test(detail) && !detail.toLowerCase().includes("yetişkin")) return;

        const href = $a.attr("href") ?? "";
        if (!href) return; // Navigasyon li'lerini atla
        const source_url = href.startsWith("http") ? href : `https://erimtanmuseum.org${href}`;

        const combined = `${category} ${title}`.toLowerCase();
        let inferredType = inferEventType(category || title, title, "");
        if (inferredType === "etkinlik") {
          if (combined.includes("konser") || combined.includes("müzik") || combined.includes("caz")) {
            inferredType = "konser";
          } else if (combined.includes("konferans")) {
            inferredType = "panel";
          } else if (combined.includes("rehber") || combined.includes("tur")) {
            inferredType = "soylesi";
          } else if (combined.includes("atölye") || combined.includes("eğitim")) {
            inferredType = "performans";
          }
        }

        if (!isRelevant({ title, description: category, event_type: inferredType })) return;

        events.push({
          title,
          description: category || "",
          event_type: inferredType,
          venue: "Erimtan Arkeoloji ve Sanat Müzesi",
          address: "Gözcü Sokak No:2, Kale, Altındağ, Ankara",
          event_date: eventDate,
          end_date: null,
          source_url,
          source_name: "Erimtan Müzesi",
          image_url: null,
          price_info: null,
        });
      });
    } catch (err) {
      console.error(`[Erimtan] hatası:`, err);
    }
  }

  return events;
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

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ISO format — direkt kullan
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw);
    if (isNaN(d.getTime()) || d.getFullYear() < 2024) return null;
    return d.toISOString();
  }

  // DD.MM.YYYY veya DD/MM/YYYY
  const dmy = raw.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  if (dmy) {
    if (+dmy[3] < 2024) return null;
    const d = new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  // "15 Mart 2026" veya "15 mart" (yıl eksik olabilir)
  const trDate = raw.match(/(\d{1,2})\s+([a-zığüşöçA-ZİĞÜŞÖÇ]+)\s*(\d{4})?/i);
  if (trDate) {
    const day   = +trDate[1];
    const month = TR_MONTHS[trDate[2].toLowerCase()];
    if (month === undefined) return null;

    const hasExplicitYear = !!trDate[3];
    let year = hasExplicitYear ? +trDate[3] : now.getFullYear();

    // Explicit year 2024 öncesi → kesinlikle atla
    if (hasExplicitYear && year < 2024) return null;

    const d = new Date(year, month, day, 20, 0);
    if (isNaN(d.getTime())) return null;

    // Yılsız tarih: eğer geçmişteyse → gelecek yıl dene
    if (!hasExplicitYear && d < todayStart) {
      const dNext = new Date(year + 1, month, day, 20, 0);
      // Gelecek yıl da mantıksızsa (6+ ay ötesi) → atla
      const sixMonthsLater = new Date(now.getTime() + 180 * 86400000);
      if (dNext > sixMonthsLater) return null;
      return dNext.toISOString();
    }

    return d.toISOString();
  }

  return null;
}

// ── Title Case (Türkçe) ──────────────────────────────────────────────────────
const TR_LOWER_EXCEPTIONS = new Set([
  "ve", "ile", "bir", "da", "de", "mi", "mu", "mü", "mı",
  "ki", "ya", "veya", "ama", "hem", "ne", "için", "gibi",
]);

function toTitleCaseTR(text: string): string {
  const hasLetters = /[a-zığüşöçA-ZİĞÜŞÖÇ]/.test(text);
  const isAllCaps = hasLetters && text === text.toLocaleUpperCase("tr-TR");
  const base = isAllCaps ? text.toLocaleLowerCase("tr-TR") : text;

  return base
    .split(" ")
    .map((word, i) => {
      if (!word) return word;
      // Keep short uppercase abbreviations (CSO, AKM, vb.)
      if (
        !isAllCaps && word.length >= 2 && word.length <= 4 &&
        word === word.toLocaleUpperCase("tr-TR") &&
        /^[A-ZİĞÜŞÖÇ]+$/.test(word)
      ) return word;
      const lower = word.toLocaleLowerCase("tr-TR");
      if (i > 0 && TR_LOWER_EXCEPTIONS.has(lower)) return lower;
      return word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1).toLocaleLowerCase("tr-TR");
    })
    .join(" ");
}

/** Başlık normalize: küçük harf, noktalama sil, boşluk sıkıştır */
function normalizeTitle(title: string): string {
  return title
    .toLocaleLowerCase("tr-TR")
    .replace(/[^\p{L}\p{N}\s]/gu, "") // noktalama & özel karakter sil
    .replace(/\s+/g, " ")
    .trim();
}

/** Tarih bugün veya gelecekte mi? (2025 ve öncesi → false) */
function isFutureDate(isoDate: string): boolean {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return false;
  if (d.getFullYear() < 2025) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

/** Jaccard kelime benzerliği (0–1) — aynı gün farklı kaynak aynı etkinliği yakalar */
function titleSimilarity(a: string, b: string): number {
  const wordsA = normalizeTitle(a).split(" ").filter(w => w.length > 1);
  const wordsB = normalizeTitle(b).split(" ").filter(w => w.length > 1);
  if (wordsA.length === 0 && wordsB.length === 0) return 1;
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

const SIMILARITY_THRESHOLD = 0.8;

// ── Duplicate Checker (in-memory cache, tek DB sorgusu) ─────────────────────
type DupEntry = { title: string; normalized: string };

class DuplicateChecker {
  private byDay = new Map<string, DupEntry[]>();
  /** Global başlık indeksi — gün farketmeksizin aynı başlığı yakalar */
  private globalTitles = new Set<string>();

  /** Tüm mevcut etkinlikleri DB'den yükle (tek sorgu) */
  async loadFromDB() {
    const admin = createAdminClient();
    const { data } = await admin
      .from("events")
      .select("title, event_date");
    if (!data) return;
    for (const row of data) {
      const day = (row.event_date ?? "").slice(0, 10);
      if (!day) continue;
      this.add(day, row.title);
    }
  }

  /** Cache'e ekle (yeni insert sonrası da çağrılır) */
  add(day: string, title: string) {
    const norm = normalizeTitle(title);
    // Gün bazlı indeks
    if (!this.byDay.has(day)) this.byDay.set(day, []);
    this.byDay.get(day)!.push({ title, normalized: norm });
    // Global başlık indeksi
    this.globalTitles.add(norm);
  }

  /** Başlık+tarih tekrar mı?
   *  Kontrol 1: Aynı başlık herhangi bir günde zaten var mı? (global exact)
   *  Kontrol 2: Aynı gün, %80+ benzer başlık var mı? (fuzzy same-day) */
  check(title: string, eventDate: string): boolean {
    const norm = normalizeTitle(title);

    // Global exact check — aynı başlık farklı günde de tekrar sayılır
    if (this.globalTitles.has(norm)) return true;

    // Aynı gün fuzzy check — farklı kaynaktan benzer başlık
    const day = eventDate.slice(0, 10);
    const entries = this.byDay.get(day);
    if (entries) {
      for (const e of entries) {
        if (titleSimilarity(title, e.title) >= SIMILARITY_THRESHOLD) return true;
      }
    }

    return false;
  }
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

// ── Ana Route Handler ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // 1. Auth: Vercel Cron veya manuel admin tetiklemesi
  const authHeader = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";

  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  type StatEntry = { found: number; added: number; skipped: number; pastSkipped: number; error: string | null };
  const mk = (): StatEntry => ({ found: 0, added: 0, skipped: 0, pastSkipped: 0, error: null });
  const results: Record<string, StatEntry> = {
    biletix: mk(), cerModern: mk(), ankaraBB: mk(), cankaya: mk(),
    bilkent: mk(), csoAda: mk(), lavarla: mk(), biletinial: mk(), ankaraMasasi: mk(),
    bubilet: mk(), mobilet: mk(), unite: mk(), kultKavaklidere: mk(), erimtan: mk(), operaBale: mk(),
  };

  // 2. Her scraper'ı bağımsız çalıştır
  const scraperKeys = ["biletix", "cerModern", "ankaraBB", "cankaya", "bilkent", "csoAda", "lavarla", "biletinial", "ankaraMasasi", "bubilet", "mobilet", "unite", "kultKavaklidere", "erimtan", "operaBale"] as const;
  const settled = await Promise.allSettled([
    scrapeBiletix(),
    scrapeCerModern(),
    scrapeAnkaraBB(),
    scrapeCankaya(),
    scrapeBilkent(),
    scrapeCSOAda(),
    scrapeLavarla(),
    scrapeBiletinial(),
    scrapeAnkaraMasasi(),
    scrapeBubilet(),
    scrapeMobilet(),
    scrapeUnite(),
    scrapeKultKavaklidere(),
    scrapeErimtan(),
    scrapeOperaBale(),
  ]);

  const scraperResults: [StatEntry, ScrapedEvent[]][] = scraperKeys.map((key, i) => {
    const s = settled[i];
    if (s.status === "rejected") results[key].error = String(s.reason);
    return [results[key], s.status === "fulfilled" ? s.value : []];
  });

  const admin = createAdminClient();

  // 3. Mevcut etkinlikleri tek sorguda yükle (N+1 sorgu yerine)
  const dupChecker = new DuplicateChecker();
  await dupChecker.loadFromDB();

  // 4. Her etkinliği işle
  for (const [stat, events] of scraperResults) {
    stat.found = events.length;

    for (const event of events) {
      try {
        // Title Case uygula
        event.title = toTitleCaseTR(event.title);

        // Geçmiş tarih kontrolü (merkezi filtre — tüm scraperlar için)
        // Sergiler: end_date varsa ona bak, yoksa event_date
        const checkDate = event.event_type === "sergi" && event.end_date
          ? event.end_date
          : event.event_date;
        if (!isFutureDate(checkDate)) {
          stat.pastSkipped++;
          continue;
        }

        // Duplicate kontrolü (exact + %80 benzerlik, aynı gün)
        if (dupChecker.check(event.title, event.event_date)) {
          stat.skipped++;
          continue;
        }

        // AI yorumu
        const ai_comment = await generateAIComment(event);

        // DB'ye kaydet — unique constraint (idx_events_no_dup) tekrarı engeller
        const { error } = await admin.from("events").insert({
          ...event,
          ai_comment,
          status: "pending",
          is_klemens_event: false,
        });

        if (!error) {
          stat.added++;
          dupChecker.add(event.event_date.slice(0, 10), event.title);
        } else if (error.code === "23505") {
          // Unique constraint violation → DB seviyesinde tekrar engeli
          stat.skipped++;
        } else {
          console.error("[DB] Insert hatası:", error.message);
        }
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
      skipped: Object.values(results).reduce((s, r) => s + r.skipped, 0),
      pastSkipped: Object.values(results).reduce((s, r) => s + r.pastSkipped, 0),
    },
  });
}

// ── POST: Mevcut etkinlikleri temizle (Title Case + Fuzzy Dedup) ──────────────
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  let titleCaseUpdated = 0;
  let exactDuplicates = 0;
  let fuzzyDuplicates = 0;

  // 1. Tüm etkinlikleri çek (en eski önce → onu tutacağız)
  const { data: allEvents, error } = await admin
    .from("events")
    .select("id, title, event_date")
    .order("created_at", { ascending: true });

  if (error || !allEvents) {
    return NextResponse.json({ error: error?.message ?? "No data" }, { status: 500 });
  }

  // 2. Title Case uygula
  for (const ev of allEvents) {
    const fixed = toTitleCaseTR(ev.title);
    if (fixed !== ev.title) {
      await admin.from("events").update({ title: fixed }).eq("id", ev.id);
      ev.title = fixed;
      titleCaseUpdated++;
    }
  }

  // 3. Duplikatları bul — 2 katman:
  //    a) Global exact: aynı başlık farklı günde de tekrar (en eski kalır)
  //    b) Same-day fuzzy: aynı gün %80+ benzerlik
  type SeenEntry = { id: string; title: string; normalized: string };
  const seenByDay = new Map<string, SeenEntry[]>();
  const seenGlobal = new Map<string, SeenEntry>(); // normalized → first seen
  const toDelete: string[] = [];

  for (const ev of allEvents) {
    const day = ev.event_date?.slice(0, 10) ?? "unknown";
    const normalized = normalizeTitle(ev.title);

    let dupType: "exact" | "fuzzy" | null = null;

    // Global exact check: aynı başlık herhangi bir günde zaten var mı?
    if (seenGlobal.has(normalized)) {
      dupType = "exact";
    } else {
      // Same-day fuzzy check
      if (!seenByDay.has(day)) seenByDay.set(day, []);
      const dayEntries = seenByDay.get(day)!;
      for (const existing of dayEntries) {
        if (titleSimilarity(ev.title, existing.title) >= SIMILARITY_THRESHOLD) {
          dupType = "fuzzy";
          break;
        }
      }
    }

    if (dupType) {
      toDelete.push(ev.id);
      if (dupType === "exact") exactDuplicates++;
      else fuzzyDuplicates++;
    } else {
      seenGlobal.set(normalized, { id: ev.id, title: ev.title, normalized });
      if (!seenByDay.has(day)) seenByDay.set(day, []);
      seenByDay.get(day)!.push({ id: ev.id, title: ev.title, normalized });
    }
  }

  if (toDelete.length > 0) {
    // Supabase .in() max 100 per batch
    for (let i = 0; i < toDelete.length; i += 100) {
      const batch = toDelete.slice(i, i + 100);
      await admin.from("events").delete().in("id", batch);
    }
  }

  // 4. Geçmiş tarihli etkinlikleri sil
  //    - Sergiler: end_date geçmişse sil (end_date yoksa event_date'e bak)
  //    - Diğerleri: event_date geçmişse sil
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const alreadyDeleted = new Set(toDelete);

  // 4a. Sergi olmayanlar — event_date geçmişse sil
  const { data: pastNonExhibitions } = await admin
    .from("events")
    .select("id")
    .lt("event_date", todayISO)
    .neq("event_type", "sergi");

  // 4b. Sergiler — end_date geçmişse sil (end_date null ise event_date'e bak)
  const { data: allExhibitions } = await admin
    .from("events")
    .select("id, event_date, end_date")
    .eq("event_type", "sergi");

  const pastIds: string[] = [];

  if (pastNonExhibitions) {
    for (const e of pastNonExhibitions) {
      if (!alreadyDeleted.has(e.id)) pastIds.push(e.id);
    }
  }

  if (allExhibitions) {
    for (const e of allExhibitions) {
      if (alreadyDeleted.has(e.id)) continue;
      // Sergi: end_date varsa ona bak, yoksa event_date'e bak
      const checkDate = e.end_date || e.event_date;
      if (checkDate && new Date(checkDate) < today) {
        pastIds.push(e.id);
      }
    }
  }

  let pastRemoved = 0;
  if (pastIds.length > 0) {
    for (let i = 0; i < pastIds.length; i += 100) {
      const batch = pastIds.slice(i, i + 100);
      await admin.from("events").delete().in("id", batch);
    }
    pastRemoved = pastIds.length;
  }

  return NextResponse.json({
    success: true,
    titleCaseUpdated,
    duplicatesRemoved: { exact: exactDuplicates, fuzzy: fuzzyDuplicates, total: toDelete.length },
    pastEventsRemoved: pastRemoved,
    totalProcessed: allEvents.length,
    remaining: allEvents.length - toDelete.length - pastRemoved,
  });
}
