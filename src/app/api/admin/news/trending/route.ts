import { NextRequest, NextResponse } from "next/server";
import RSSParser from "rss-parser";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

const HAIKU = "claude-haiku-4-5-20251001";

const parser = new RSSParser({
  timeout: 15_000,
  headers: { "User-Agent": "KlemensArt/1.0 (+https://klemensart.com)" },
});

// ── Google News RSS sorguları ────────────────────────────────────────────────
const GOOGLE_NEWS_QUERIES = [
  {
    q: "kültür sanat sergi müze",
    hl: "tr",
    gl: "TR",
    ceid: "TR:tr",
  },
  {
    q: "tiyatro sinema edebiyat konser festival Türkiye",
    hl: "tr",
    gl: "TR",
    ceid: "TR:tr",
  },
  {
    q: "art exhibition museum biennale culture 2026",
    hl: "en",
    gl: "US",
    ceid: "US:en",
  },
];

// ── Engelli konular (spor vs.) ──────────────────────────────────────────────
const BLOCKED_KEYWORDS = [
  "futbol",
  "süper lig",
  "şampiyonlar ligi",
  "europa league",
  "transfer",
  "gol",
  "maç",
  "stadyum",
  "teknik direktör",
  "galatasaray",
  "fenerbahçe",
  "beşiktaş",
  "trabzonspor",
  "premier league",
  "la liga",
  "bundesliga",
  "serie a",
  "fifa",
  "uefa",
  "tff",
];

function isBlocked(text: string): boolean {
  const lower = text.toLocaleLowerCase("tr");
  return BLOCKED_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Google News başlıklarından kaynak adını ayır ─────────────────────────────
function parseGoogleTitle(raw: string): { title: string; source: string } {
  const lastDash = raw.lastIndexOf(" - ");
  if (lastDash > 0) {
    return {
      title: raw.substring(0, lastDash).trim(),
      source: raw.substring(lastDash + 3).trim(),
    };
  }
  return { title: raw, source: "" };
}

// ── Normalize title for dedup ────────────────────────────────────────────────
function normalizeTitle(t: string): string {
  return t
    .toLocaleLowerCase("tr")
    .replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9]/g, "");
}

// ── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // 1. Google News RSS'lerini çek
  type RawItem = {
    title: string;
    source: string;
    url: string;
    summary: string;
  };
  const rawItems: RawItem[] = [];

  await Promise.all(
    GOOGLE_NEWS_QUERIES.map(async ({ q, hl, gl, ceid }) => {
      try {
        const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
        const feed = await parser.parseURL(feedUrl);
        for (const item of feed.items?.slice(0, 15) ?? []) {
          if (!item.title) continue;
          const { title, source } = parseGoogleTitle(item.title);
          if (isBlocked(title + " " + (item.contentSnippet ?? ""))) continue;
          rawItems.push({
            title,
            source,
            url: item.link || "",
            summary: item.contentSnippet || "",
          });
        }
      } catch {
        // skip failed feed
      }
    }),
  );

  if (rawItems.length === 0) {
    return NextResponse.json({
      success: true,
      message: "Google News'den güncel haber bulunamadı.",
      added: 0,
    });
  }

  // 2. Başlık bazında deduplicate
  const seen = new Set<string>();
  const unique = rawItems.filter((item) => {
    const key = normalizeTitle(item.title);
    if (key.length < 5 || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 3. Mevcut haberlerle karşılaştır (son 14 gün)
  const { data: existing } = await admin
    .from("news_items")
    .select("title")
    .gte(
      "created_at",
      new Date(Date.now() - 14 * 86_400_000).toISOString(),
    );

  const existingKeys = new Set(
    (existing ?? []).map((e) => normalizeTitle(e.title)),
  );

  const fresh = unique.filter(
    (item) => !existingKeys.has(normalizeTitle(item.title)),
  );

  if (fresh.length === 0) {
    return NextResponse.json({
      success: true,
      message: "Tüm güncel haberler zaten sistemde.",
      added: 0,
    });
  }

  // 4. AI ile formatla (max 20 haber)
  const toProcess = fresh.slice(0, 20);
  const anthropic = new Anthropic();

  try {
    const response = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Sen Klemens Art kültür-sanat platformunun editörüsün. Aşağıdaki ham haber listesini, e-bülten ve haber listesinde yayınlanacak formata dönüştür.

HAM HABERLER:
${JSON.stringify(toProcess, null, 2)}

KURALLAR:
- Her haber için: title (Türkçe, max 100 karakter), summary (Türkçe, 2-3 cümle, max 300 karakter), source_name, url
- İngilizce haberleri Türkçe'ye çevir
- Sadece kültür, sanat, sergi, müze, tiyatro, sinema, edebiyat, müzik, arkeoloji konularını dahil et
- Spor, politika, ekonomi, magazin haberlerini ÇIKAR (o öğeyi diziye ekleme)
- Gereksiz promosyon dilini ve abartılı sıfatları temizle
- url alanını olduğu gibi koru
- Doğal, gazetecilik diline yakın, samimi bir ton kullan

SADECE JSON dizisi döndür, başka bir şey yazma:
[{"title": "...", "summary": "...", "source_name": "...", "url": "..."}]`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Markdown code block veya düz JSON dizisi
    const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      console.error("AI trending parse fail. Raw text:", text.slice(0, 500));
      return NextResponse.json(
        { error: `AI yanıtı okunamadı. Ham: ${text.slice(0, 200)}` },
        { status: 500 },
      );
    }

    let formatted: Array<{
      title: string;
      summary: string;
      source_name: string;
      url: string;
    }>;

    try {
      formatted = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("JSON parse fail:", jsonMatch[0].slice(0, 300));
      return NextResponse.json(
        { error: "AI yanıtı JSON olarak ayrıştırılamadı." },
        { status: 500 },
      );
    }

    const valid = formatted.filter((f) => f.title?.trim());

    if (valid.length === 0) {
      return NextResponse.json({
        success: true,
        message: "İlgili kültür-sanat haberi bulunamadı.",
        added: 0,
      });
    }

    // 5. news_items'a ekle
    const rows = valid.map((item) => ({
      guid: `trending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: item.title,
      summary: item.summary || null,
      url: item.url || null,
      image_url: null,
      source_name: item.source_name || "Web",
      status: "new",
      is_manual: false,
      published_at: new Date().toISOString(),
    }));

    const { error } = await admin.from("news_items").insert(rows);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${valid.length} güncel kültür-sanat haberi eklendi.`,
      added: valid.length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
