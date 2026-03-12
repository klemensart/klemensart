import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import RSSParser from "rss-parser";
import { createAdminClient } from "@/lib/supabase-admin";
import { Resend } from "resend";
import { render } from "@react-email/render";
import StoryBildirimi from "@/emails/StoryBildirimi";

// ── Modeller ────────────────────────────────────────────────────────────────
const HAIKU = "claude-haiku-4-5-20251001"; // filtreleme — ucuz, hızlı
const SONNET = "claude-sonnet-4-6"; // içerik üretimi — kaliteli

// ── RSS Kaynakları ──────────────────────────────────────────────────────────
const SOURCES: { name: string; url: string; lang: "en" | "tr" }[] = [
  // Küresel
  { name: "Hyperallergic", url: "https://hyperallergic.com/feed/", lang: "en" },
  { name: "Colossal", url: "https://www.thisiscolossal.com/feed/", lang: "en" },
  { name: "ARTnews", url: "https://www.artnews.com/feed/", lang: "en" },
  { name: "The Art Newspaper", url: "https://www.theartnewspaper.com/rss", lang: "en" },
  { name: "Frieze", url: "https://www.frieze.com/rss.xml", lang: "en" },
  { name: "Apollo Magazine", url: "https://www.apollo-magazine.com/feed/", lang: "en" },
  { name: "e-flux", url: "https://www.e-flux.com/rss/", lang: "en" },
  { name: "Dezeen", url: "https://www.dezeen.com/feed/", lang: "en" },
];

// ── Tipler ──────────────────────────────────────────────────────────────────
type FeedItem = {
  source: string;
  title: string;
  link: string;
  summary: string;
  fullText: string;
  image: string | null;
  pubDate: string | null;
};

type ScoredItem = FeedItem & {
  score: number;
  reason: string;
  suggestedCategory: string;
  suggestedTags: string[];
};

// ── Kaynak Makale Çekici ─────────────────────────────────────────────────────
async function fetchArticleText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "KlemensArt/1.0 (+https://klemensart.com)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    // HTML'den metin çıkar: tag'leri kaldır, fazla boşlukları temizle
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
    // İlk 3000 karakter yeterli (token limiti)
    return text.slice(0, 3000);
  } catch {
    return "";
  }
}

// ── RSS Toplama ─────────────────────────────────────────────────────────────
async function fetchAllFeeds(): Promise<FeedItem[]> {
  const parser = new RSSParser({
    timeout: 15_000,
    headers: { "User-Agent": "KlemensArt/1.0 (+https://klemensart.com)" },
  });

  const items: FeedItem[] = [];

  const results = await Promise.allSettled(
    SOURCES.map(async (src) => {
      try {
        const feed = await parser.parseURL(src.url);
        const recent = (feed.items ?? []).slice(0, 15); // son 15 haber

        for (const item of recent) {
          // Görsel: enclosure, media:content veya content içindeki ilk <img>
          let image: string | null = null;
          if (item.enclosure?.url) image = item.enclosure.url;
          else if ((item as Record<string, unknown>)["media:content"]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mc = (item as Record<string, unknown>)["media:content"] as any;
            image = mc?.["$"]?.url ?? mc?.url ?? null;
          }
          if (!image && item["content:encoded"]) {
            const match = item["content:encoded"].match(/<img[^>]+src="([^"]+)"/);
            if (match) image = match[1];
          }

          // content:encoded genelde tam makale metnini içerir
          const encoded = item["content:encoded"] ?? "";
          const snippet = item.contentSnippet ?? item.content ?? "";
          const rawText = encoded
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          items.push({
            source: src.name,
            title: item.title ?? "",
            link: item.link ?? "",
            summary: snippet.slice(0, 500),
            fullText: rawText.slice(0, 2000),
            image,
            pubDate: item.pubDate ?? item.isoDate ?? null,
          });
        }
      } catch (e) {
        console.warn(`[curate] RSS hatası (${src.name}):`, (e as Error).message);
      }
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(`[curate] ${items.length} haber toplandı, ${failed} kaynak başarısız.`);

  return items;
}

// ── Duplikasyon Kontrolü ────────────────────────────────────────────────────
async function filterExistingSlugs(
  items: FeedItem[],
  admin: ReturnType<typeof createAdminClient>
): Promise<FeedItem[]> {
  // Son 7 günde eklenen yazıların başlıklarını al
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const { data: existing } = await admin
    .from("articles")
    .select("title")
    .gte("date", weekAgo);

  const existingTitles = new Set(
    (existing ?? []).map((a) => a.title.toLowerCase().trim())
  );

  return items.filter(
    (item) => !existingTitles.has(item.title.toLowerCase().trim())
  );
}

// ── AI Filtreleme + SEO Puanlaması (Haiku — toplu) ─────────────────────────
async function scoreAndFilter(
  items: FeedItem[],
  anthropic: Anthropic
): Promise<ScoredItem[]> {
  // 30'ar haber batch'i ile işle (token limiti aşmamak için)
  const BATCH = 30;
  const allScored: ScoredItem[] = [];

  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);

    const listing = batch
      .map(
        (item, idx) =>
          `[${idx}] "${item.title}" — ${item.source}\n${item.summary.slice(0, 200)}`
      )
      .join("\n\n");

    const resp = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Sen bir kültür-sanat editörüsün. Aşağıdaki haberleri Klemens Art platformu için değerlendir.

Klemens Art multidisipliner bir platformdur: sanat tarihi, felsefe, mimarlık, sinema, edebiyat, müzik, arkeoloji, sosyoloji konularını kapsar. Sıradan sergi duyuruları, piyasa haberleri, açık artırma fiyatları veya dedikodu içerikleri ELENMELI.

İlginç, düşündürücü, kültürel derinliği olan haberleri SEÇ. Türk okuyucuyu meraklandıracak evrensel konular öncelikli.

Her haber için JSON döndür:
- "i": haber indeksi
- "score": 0-100 arası SEO/CTR potansiyeli (Türk kültür-sanat okuyucusu için)
- "reason": 1 cümle neden seçildiği/elenmediği
- "category": "Odak" | "Kültür & Sanat" | "İlham Verenler" | "Kent & Yaşam"
- "tags": en fazla 3 etiket

Sadece score >= 60 olanları döndür. JSON array olarak yanıtla, başka metin yazma.

HABERLER:
${listing}`,
        },
      ],
    });

    try {
      const text =
        resp.content[0].type === "text" ? resp.content[0].text : "";
      const cleaned = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      const parsed: {
        i: number;
        score: number;
        reason: string;
        category: string;
        tags: string[];
      }[] = JSON.parse(cleaned);

      for (const entry of parsed) {
        const item = batch[entry.i];
        if (!item) continue;
        allScored.push({
          ...item,
          score: entry.score,
          reason: entry.reason,
          suggestedCategory: entry.category,
          suggestedTags: entry.tags,
        });
      }
    } catch (e) {
      console.warn("[curate] Haiku parse hatası:", (e as Error).message);
    }
  }

  // En yüksek puanlı 2 tanesini seç
  allScored.sort((a, b) => b.score - a.score);
  return allScored.slice(0, 2);
}

// ── İçerik Üretimi (Sonnet — kaliteli yazım) ───────────────────────────────
const SYSTEM_PROMPT = `Sen Klemens Art'ın editoryal yazarısın.

KİMLİĞİN:
Klemens Art, Türkiye merkezli multidisipliner bir kültür, sanat ve düşünce platformudur. Sanat tarihi, felsefe, mimarlık, sinema, edebiyat, müzik ve arkeoloji alanlarında derinlemesine içerikler üretir. Okuyucusu: kültüre meraklı, entelektüel ama elitist olmayan, 25-45 yaş arası kentli birey.

DOĞRULUK KURALLARI (EN ÖNEMLİ):
- SADECE kaynak metinde verilen bilgileri kullan. Tarih, sayı, isim, yer gibi olgusal bilgileri ASLA uydurma.
- Kaynakta olmayan istatistik, tarih, rakam veya detay EKLEME. Bilmiyorsan yazma.
- Bir olayın tarihinden emin değilsen tarih verme, "yakın dönemde" gibi genel ifadeler kullan.
- Mimari detaylar (sütun sayısı, yapım yılı vb.) gibi spesifik bilgileri SADECE kaynakta varsa yaz.
- Türkiye'den referans verirken de olgusal doğruluğa dikkat et — uydurma benzetme yapma.
- Şüphe duyduğun her bilgiyi atla. Yanlış bilgi vermektense eksik bırakmak tercih edilir.

DİL VE TON:
- Zarif, dingin, otoriter ama samimi ve davetkâr.
- Asla clickbait başlık, ucuz pazarlama dili veya akademik kasıntı kullanma.
- Başlıklar: zekice, merak uyandırıcı, SEO uyumlu. Kısa ve vurucu (50-70 karakter).
- Paragraflar kısa (2-4 cümle). Metin nefes alacak. Dergi kalitesi.
- Birinci çoğul veya edilgen çatı kullan: "incelediğimizde", "dikkat çekiyor", "gösteriyor".
- Asla "bu yazıda ele alacağız" gibi klişe girişler yapma. Doğrudan konuya dal.
- ASLA emoji kullanma. Ne başlıkta, ne spot cümlesinde, ne içerikte. Hiçbir yerde emoji olmamalı.

BİÇİM KURALLARI:
- Format: Markdown.
- Yazı uzunluğu: 800-1200 kelime.
- Alt başlıklar (##) ile bölümlendir; her bölüm farklı bir açı sunmalı.
- Kaynak haberdeki bilgiyi Türk okuyucuya bağla: yerel referanslar, karşılaştırmalar ekle.
- Özgün yorum ve analiz kat; salt tercüme yapma.
- Son paragraf düşündürücü bir kapanış olsun — açık uçlu bir soru veya ufuk açıcı bir gözlem.

ÇIKTI FORMATI (JSON):
{
  "title": "Makale başlığı (emoji yok)",
  "description": "1-2 cümlelik spot/özet (SEO description, max 160 karakter, emoji yok)",
  "category": "Kültür & Sanat",
  "tags": ["etiket1", "etiket2"],
  "content": "## Tam markdown içerik..."
}

Sadece JSON döndür, başka metin yazma.`;

async function generateArticle(
  item: ScoredItem,
  anthropic: Anthropic
): Promise<{
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
} | null> {
  // RSS'teki metin yetersizse kaynak sayfadan tam metni çek
  let sourceText = item.fullText || item.summary;
  if (sourceText.length < 500 && item.link) {
    console.log(`[curate] Kaynak makale çekiliyor: ${item.link}`);
    const fetched = await fetchArticleText(item.link);
    if (fetched.length > sourceText.length) {
      sourceText = fetched;
    }
  }

  const resp = await anthropic.messages.create({
    model: SONNET,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Aşağıdaki haberi Klemens Art'ın editoryal kimliğiyle sıfırdan Türkçe yaz.

KAYNAK: ${item.source}
BAŞLIK: ${item.title}
LİNK: ${item.link}

TAM METİN (kaynak makaleden — SADECE bu metindeki bilgileri kullan, olgusal bilgi ekleme/uydurma):
${sourceText}

ÖNERİLEN KATEGORİ: ${item.suggestedCategory}
ÖNERİLEN ETİKETLER: ${item.suggestedTags.join(", ")}
SEO NOTU: ${item.reason}

ÖNEMLİ: Haberi birebir çevirme ama SADECE kaynak metindeki bilgilere dayan. Tarih, sayı, isim gibi olgusal bilgileri uydurma. Kaynakta olmayan detay ekleme. Klemens Art okuyucusu için yeniden yaz: özgün yorum ve analiz kat ama olgusal bilgileri değiştirme.`,
      },
    ],
  });

  try {
    const text = resp.content[0].type === "text" ? resp.content[0].text : "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("[curate] Sonnet parse hatası:", (e as Error).message);
    return null;
  }
}

// ── Slug üretici ────────────────────────────────────────────────────────────
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ── Görseli Supabase Storage'a yükle (CORS sorununu önler) ──────────────────
async function uploadImageToStorage(
  imageUrl: string,
  slug: string,
  admin: ReturnType<typeof createAdminClient>
): Promise<string> {
  if (!imageUrl) return "";
  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "KlemensArt/1.0 (+https://klemensart.com)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return imageUrl; // Yüklenemezse orijinal URL'yi koru
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const path = `article-covers/${slug}.${ext}`;

    const { error } = await admin.storage
      .from("email-assets")
      .upload(path, buffer, { contentType, upsert: true });

    if (error) {
      console.warn(`[curate] Görsel yükleme hatası (${slug}):`, error.message);
      return imageUrl;
    }

    const { data: pub } = admin.storage.from("email-assets").getPublicUrl(path);
    return pub.publicUrl;
  } catch (e) {
    console.warn(`[curate] Görsel indirme hatası:`, (e as Error).message);
    return imageUrl; // Hata durumunda orijinal URL
  }
}

// ── Unsplash kapak görseli ──────────────────────────────────────────────────
async function findCoverImage(query: string): Promise<string> {
  const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
  if (!UNSPLASH_KEY) return "";

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    const data = await res.json();
    const photo = data?.results?.[0];
    if (!photo) return "";
    // Unsplash kuralı: attribution gerekli, UTM link
    return `${photo.urls.regular}&w=1200`;
  } catch {
    return "";
  }
}

// ── Ana endpoint ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Güvenlik kontrolü
  const auth = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-vercel-cron");
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && !cronHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const admin = createAdminClient();
  const anthropic = new Anthropic();

  try {
    // 1. RSS feed'lerden haber topla
    const allItems = await fetchAllFeeds();
    if (allItems.length === 0) {
      return NextResponse.json({ message: "Haber bulunamadı", duration: Date.now() - start });
    }

    // 2. Duplikasyon kontrolü
    const freshItems = await filterExistingSlugs(allItems, admin);
    console.log(`[curate] ${freshItems.length} yeni haber (duplikasyonlar elendi).`);

    if (freshItems.length === 0) {
      return NextResponse.json({ message: "Yeni haber yok", duration: Date.now() - start });
    }

    // 3. AI filtrele ve en iyi 2'yi seç
    const top2 = await scoreAndFilter(freshItems, anthropic);
    console.log(`[curate] En iyi 2 seçildi:`, top2.map((t) => t.title));

    if (top2.length === 0) {
      return NextResponse.json({ message: "Uygun haber bulunamadı", duration: Date.now() - start });
    }

    // 4. İçerik üret ve kaydet
    const created: string[] = [];
    const createdArticles: {
      title: string;
      description: string;
      category: string;
      image: string;
      designId: string | null;
    }[] = [];

    for (const item of top2) {
      const article = await generateArticle(item, anthropic);
      if (!article) continue;

      const slug = toSlug(article.title);
      const today = new Date().toISOString().slice(0, 10);

      // Kaynak haberin görselini tercih et, yoksa Unsplash
      let image = item.image ?? "";
      if (!image) {
        const searchQuery = article.tags[0] ?? article.title.split(" ").slice(0, 3).join(" ");
        image = await findCoverImage(searchQuery);
      }

      // Görseli Supabase Storage'a yükle (CORS sorununu önler)
      if (image) {
        image = await uploadImageToStorage(image, slug, admin);
      }

      // Kaynak bağlantısını içeriğin sonuna ekle
      const sourceAttribution = `\n\n---\n\n**Kaynak:** [${item.source}](${item.link})`;
      const contentWithSource = article.content + sourceAttribution;

      const { data, error } = await admin
        .from("articles")
        .insert({
          slug,
          title: article.title,
          description: article.description,
          author: "KLEMENS",
          author_email: "info@klemensart.com",
          date: today,
          category: article.category,
          tags: article.tags,
          image,
          content: contentWithSource,
          status: "draft",
        })
        .select("id")
        .single();

      if (error) {
        console.error(`[curate] Insert hatası (${slug}):`, error.message);
        continue;
      }

      // Auto-story tasarımı oluştur
      let designId: string | null = null;
      try {
        const { generateStoryDesignRow } = await import("@/lib/auto-story");
        const designRow = generateStoryDesignRow(
          {
            title: article.title,
            description: article.description,
            author: "KLEMENS",
            category: article.category,
            image,
          },
          "system" // cron job — kullanıcı yok
        );
        const { data: designData, error: designErr } = await admin
          .from("designs")
          .insert(designRow)
          .select("id")
          .single();
        if (designErr) {
          console.warn(`[curate] Story tasarımı hatası (${slug}):`, designErr.message);
        } else {
          designId = designData.id;
          console.log(`[curate] Story tasarımı oluşturuldu: ${article.title}`);
        }
      } catch (e) {
        console.warn(`[curate] Story oluşturulamadı:`, (e as Error).message);
      }

      created.push(`${data.id} — ${article.title}`);
      createdArticles.push({
        title: article.title,
        description: article.description,
        category: article.category,
        image,
        designId,
      });
      console.log(`[curate] Taslak kaydedildi: ${article.title}`);
    }

    // 5. Admin'e story bildirim e-postası gönder
    if (createdArticles.length > 0) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "info@klemensart.com";

        const articleCards = createdArticles
          .filter((a) => a.designId)
          .map((a) => ({
            title: a.title,
            description: a.description,
            category: a.category,
            image: a.image,
            designId: a.designId!,
          }));

        if (articleCards.length > 0) {
          const emailHtml = await render(
            StoryBildirimi({ articles: articleCards })
          );

          const titles = articleCards.map((a) => a.title);
          const subject =
            titles.length === 1
              ? `Yeni Story Hazır — ${titles[0]}`
              : `Yeni Story'ler Hazır — ${titles[0]} & ${titles[1]}`;

          await resend.emails.send({
            from: "Klemens Art <info@klemensart.com>",
            to: ADMIN_EMAIL,
            subject,
            html: emailHtml,
          });

          console.log(`[curate] Story bildirimi gönderildi: ${ADMIN_EMAIL}`);
        }
      } catch (e) {
        // Bildirim hatası cron'un geri kalanını etkilememeli
        console.error("[curate] Bildirim e-postası gönderilemedi:", (e as Error).message);
      }
    }

    return NextResponse.json({
      message: `${created.length} taslak oluşturuldu`,
      articles: created,
      totalScanned: allItems.length,
      duration: Date.now() - start,
    });
  } catch (e) {
    console.error("[curate] Genel hata:", e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
