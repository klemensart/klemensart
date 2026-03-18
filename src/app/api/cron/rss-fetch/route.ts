import { NextRequest, NextResponse } from "next/server";
import RSSParser from "rss-parser";
import { createAdminClient } from "@/lib/supabase-admin";

// ── Auth: Vercel cron header VEYA Bearer CRON_SECRET ────────────────────────
function isAuthorized(req: NextRequest) {
  if (req.headers.get("x-vercel-cron")) return true;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

// ── RSS Parser ──────────────────────────────────────────────────────────────
const parser = new RSSParser({
  timeout: 15_000,
  headers: { "User-Agent": "KlemensArt/1.0 (+https://klemensart.com)" },
});

// ── Image extraction helpers ────────────────────────────────────────────────
function extractImage(item: Record<string, unknown>): string | null {
  // 1. enclosure
  const enc = item.enclosure as { url?: string } | undefined;
  if (enc?.url) return enc.url;

  // 2. media:content
  const mc = item["media:content"] as { $?: { url?: string }; url?: string } | undefined;
  if (mc?.$?.url) return mc.$.url;
  if (mc?.url) return mc.url;

  // 3. media:thumbnail
  const mt = item["media:thumbnail"] as { $?: { url?: string }; url?: string } | undefined;
  if (mt?.$?.url) return mt.$.url;
  if (mt?.url) return mt.url;

  // 4. content:encoded içindeki ilk <img>
  const encoded = item["content:encoded"] as string | undefined;
  if (encoded) {
    const match = encoded.match(/<img[^>]+src="([^"]+)"/);
    if (match) return match[1];
  }

  // 5. content içindeki ilk <img>
  const content = item.content as string | undefined;
  if (content) {
    const match = content.match(/<img[^>]+src="([^"]+)"/);
    if (match) return match[1];
  }

  return null;
}

// ── Strip HTML helper ───────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// ── Konu filtreleme (futbol vb. istenmeyen içerikler) ────────────────────────
const BLOCKED_KEYWORDS = [
  "futbol", "süper lig", "şampiyonlar ligi", "europa league",
  "transfer", "gol", "maç", "stadyum", "teknik direktör",
  "galatasaray", "fenerbahçe", "beşiktaş", "trabzonspor",
  "premier league", "la liga", "bundesliga", "serie a",
  "fifa", "uefa", "tff",
];

function isBlockedTopic(title: string, summary: string | null): boolean {
  const text = `${title} ${summary ?? ""}`.toLocaleLowerCase("tr");
  return BLOCKED_KEYWORDS.some((kw) => text.includes(kw));
}

// ── Main GET handler ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const start = Date.now();

  // 1. Aktif feed'leri çek
  const { data: feeds, error: feedsErr } = await admin
    .from("news_feeds")
    .select("*")
    .eq("is_active", true);

  if (feedsErr || !feeds?.length) {
    return NextResponse.json({
      success: false,
      error: feedsErr?.message ?? "No active feeds",
    });
  }

  // 2. Her feed'i paralel çek
  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const rss = await parser.parseURL(feed.url);
        const items = (rss.items ?? []).slice(0, 20); // son 20 haber

        const rows = items.map((item) => {
          const raw = item as unknown as Record<string, unknown>;
          const summary = item.contentSnippet
            ? stripHtml(item.contentSnippet).slice(0, 500)
            : item.summary
              ? stripHtml(item.summary).slice(0, 500)
              : null;

          return {
            feed_id: feed.id,
            guid: item.guid || item.link || `${feed.url}#${item.title}`,
            title: item.title?.trim() ?? "Başlıksız",
            summary,
            url: item.link ?? null,
            image_url: extractImage(raw),
            author: item.creator || item.author || null,
            source_name: feed.name,
            published_at: item.isoDate || item.pubDate || null,
            status: "new",
          };
        });

        // Futbol vb. istenmeyen konuları filtrele
        const filtered = rows.filter((r) => !isBlockedTopic(r.title, r.summary));

        // Upsert — guid çakışmasında skip
        if (filtered.length > 0) {
          const { error: upsertErr } = await admin
            .from("news_items")
            .upsert(filtered, { onConflict: "guid", ignoreDuplicates: true });

          if (upsertErr) throw new Error(upsertErr.message);
        }

        // Feed meta güncelle
        await admin
          .from("news_feeds")
          .update({
            last_fetched_at: new Date().toISOString(),
            last_error: null,
            item_count: filtered.length,
          })
          .eq("id", feed.id);

        return { feed: feed.name, items: filtered.length };
      } catch (err) {
        const msg = (err as Error).message;
        // Hata logla ama diğer feed'leri engelleme
        await admin
          .from("news_feeds")
          .update({ last_error: msg.slice(0, 500) })
          .eq("id", feed.id);

        return { feed: feed.name, error: msg };
      }
    })
  );

  // 3. Sonuçları özetle
  let totalItems = 0;
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") {
      const val = r.value;
      if ("error" in val) {
        errorCount++;
        errors.push(`${val.feed}: ${val.error}`);
      } else {
        successCount++;
        totalItems += val.items;
      }
    } else {
      errorCount++;
      errors.push(r.reason?.message ?? "Unknown error");
    }
  }

  // 4. Kendi yazılarımızı (articles) da news_items'a senkronize et
  let articlesSynced = 0;
  try {
    const { data: published } = await admin
      .from("articles")
      .select("id,title,slug,description,image,date")
      .eq("status", "published");

    if (published && published.length > 0) {
      const guids = published.map((a) => `klemens-article-${a.id}`);
      const { data: existing } = await admin
        .from("news_items")
        .select("guid")
        .in("guid", guids);

      const existingSet = new Set((existing ?? []).map((e) => e.guid));

      const toInsert = published
        .filter((a) => !existingSet.has(`klemens-article-${a.id}`))
        .map((a) => ({
          guid: `klemens-article-${a.id}`,
          title: a.title,
          summary: a.description || null,
          url: `https://klemensart.com/icerikler/yazi/${a.slug}`,
          image_url: a.image || null,
          source_name: "Klemens",
          status: "new" as const,
          is_manual: true,
          published_at: a.date || new Date().toISOString(),
          slug: a.slug,
        }));

      if (toInsert.length > 0) {
        await admin.from("news_items").upsert(toInsert, {
          onConflict: "guid",
          ignoreDuplicates: true,
        });
        articlesSynced = toInsert.length;
      }
    }
  } catch (e) {
    console.warn("[rss-fetch] Article sync hatası:", (e as Error).message);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  return NextResponse.json({
    success: true,
    message: `${totalItems} haber çekildi, ${articlesSynced} yazı senkronize edildi (${successCount} kaynak başarılı, ${errorCount} hata) — ${elapsed}s`,
    totalItems,
    articlesSynced,
    successCount,
    errorCount,
    errors: errors.slice(0, 10),
    elapsed_sec: elapsed,
  });
}
