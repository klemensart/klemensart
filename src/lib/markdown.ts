import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import sharp from "sharp";
import { createAdminClient } from "./supabase-admin";
import { extractYouTubeId } from "./video";

export type { ArticleMeta, ParsedArticle } from "@/types/article";
export { extractYouTubeId } from "./video";
import type { ArticleMeta, ParsedArticle } from "@/types/article";

/* ──────────────── markdown processing helpers ──────────────── */

/** Optimize inline images: Next.js image optimization + responsive srcset + lazy load */
function optimizeImages(rawHtml: string): string {
  return rawHtml.replace(
    /<img(\s[^>]*?)src="([^"]*?)"([^>]*?)>/g,
    (_match, before: string, src: string, after: string) => {
      // Already optimized? Skip
      if (before.includes("loading=") || after.includes("loading=")) return _match;

      const isLocal = src.startsWith("/");
      const isSupabase = src.includes("sgabkrzzzszfqrtgkord.supabase.co");

      // Non-optimizable external images: just add lazy loading
      if (!isLocal && !isSupabase) {
        return `<img${before}src="${src}"${after} loading="lazy" decoding="async">`;
      }

      const encoded = encodeURIComponent(src);
      const srcset = [
        `/_next/image?url=${encoded}&w=640&q=75 640w`,
        `/_next/image?url=${encoded}&w=828&q=75 828w`,
        `/_next/image?url=${encoded}&w=1080&q=75 1080w`,
      ].join(", ");

      return `<img${before}src="/_next/image?url=${encoded}&w=828&q=75"${after} srcset="${srcset}" sizes="(max-width: 768px) 100vw, 680px" loading="lazy" decoding="async">`;
    },
  );
}

/** Image → <figure> + optional <figcaption> from title attr or italic caption */
function processImageCaptions(rawHtml: string): string {
  // 1. NEW FORMAT: <p><img title="caption"></p> → <figure><figcaption>
  let result = rawHtml.replace(
    /<p>(<img\s[^>]*>)<\/p>/g,
    (match, imgTag) => {
      const titleMatch = imgTag.match(/\btitle="([^"]*)"/);
      const title = titleMatch?.[1];
      const cleanImg = imgTag.replace(/\s*title="[^"]*"/, "");
      if (title?.trim()) {
        return `<figure>${cleanImg}<figcaption>${title}</figcaption></figure>`;
      }
      return `<figure>${cleanImg}</figure>`;
    },
  );

  // 2. OLD FORMAT (backward compat): <figure><img></figure> + <p><em>caption</em></p>
  result = result.replace(
    /<figure>(<img\s[^>]*>)<\/figure>\s*<p><em>([\s\S]*?)<\/em><\/p>/g,
    (_, img, caption) =>
      `<figure>${img}<figcaption>${caption}</figcaption></figure>`,
  );

  return result;
}

function processWarningBoxes(rawHtml: string): string {
  // ⚠️ (U+26A0) ile başlayan paragrafları uyarı kutusu olarak işaretle
  return rawHtml.replace(
    /<p>(\u26A0[\s\S]*?)<\/p>/g,
    (_, inner) => `<p class="warning-box">${inner}</p>`
  );
}

function processBlockquotes(rawHtml: string): string {
  return rawHtml.replace(
    /<blockquote>([\s\S]*?)<\/blockquote>/g,
    (_, inner) => {
      // [poem] marker → .poem class
      const isPoem = inner.includes("[poem]");
      const cleaned = isPoem ? inner.replace(/\[poem\]\s*(<br\s*\/?>)?/g, "") : inner;

      const withAttribution = cleaned.replace(
        /(<p>)(.{10,}?)\s+—\s+(.+?)(<\/p>)/g,
        '$1$2<span class="quote-attribution">— $3</span>$4'
      );
      const cls = isPoem ? "inline-quote poem" : "inline-quote";
      return `<blockquote class="${cls}">${withAttribution.replace(/["""'']/g, "")}</blockquote>`;
    }
  );
}

function processKaynakca(rawHtml: string): string {
  return rawHtml.replace(
    /<p><strong>Kaynakça<\/strong><\/p>([\s\S]*)$/,
    (_, rest) =>
      `<div class="kaynakca-section"><p class="kaynakca-heading">Kaynakça</p>${rest}</div>`
  );
}

function extractOneriBlocks(mdContent: string): { content: string; blocks: Map<string, string> } {
  const blocks = new Map<string, string>();
  let counter = 0;
  const content = mdContent.replace(
    /:::oneri(?:\{[^}]*\})?\s*\n([\s\S]*?)\n:::/g,
    (_, inner) => {
      const token = `KLEMENS_ONERI_${counter++}_TOKEN`;
      blocks.set(token, inner.trim());
      return `\n\n${token}\n\n`;
    }
  );
  return { content, blocks };
}

function extractDurakBlocks(mdContent: string): string {
  return mdContent.replace(
    /:::durak\{number=["']?(\d+)["']?\}\s*\n#{1,3}\s+(.+?)\s*\n:::/g,
    (_, num, title) =>
      `<div class="durak-block"><span class="durak-badge">DURAK ${num}</span><div class="durak-title">${title.trim()}</div></div>`
  );
}

function youtubeIframe(id: string): string {
  return `<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
}

/* ── Spotify embed ── */

function extractSpotifyInfo(url: string): { type: string; id: string } | null {
  const m = url.match(/open\.spotify\.com\/(track|episode|playlist|album|show)\/([a-zA-Z0-9]+)/);
  return m ? { type: m[1], id: m[2] } : null;
}

function spotifyIframe(type: string, id: string): string {
  return `<div class="spotify-embed my-6"><iframe src="https://open.spotify.com/embed/${type}/${id}?theme=0" width="100%" height="152" frameborder="0" loading="lazy" allow="clipboard-write; encrypted-media; fullscreen"></iframe></div>`;
}

function processSpotifyEmbeds(rawHtml: string): string {
  // 1. <spotify>URL</spotify> custom tag
  let result = rawHtml.replace(/<spotify>([\s\S]*?)<\/spotify>/g, (_, url) => {
    const info = extractSpotifyInfo(url.trim());
    return info ? spotifyIframe(info.type, info.id) : "";
  });

  // 2. Spotify <a> links alone in a <p> → embed
  result = result.replace(
    /<p>\s*<a [^>]*href="([^"]*open\.spotify\.com[^"]*)"[^>]*>[^<]*<\/a>\s*<\/p>/g,
    (match, url) => {
      const info = extractSpotifyInfo(url);
      return info ? spotifyIframe(info.type, info.id) : match;
    }
  );

  // 3. Bare Spotify URLs alone in a <p> → embed
  result = result.replace(
    /<p>\s*(https?:\/\/open\.spotify\.com\/[^\s<]+)\s*<\/p>/g,
    (match, url) => {
      const info = extractSpotifyInfo(url);
      return info ? spotifyIframe(info.type, info.id) : match;
    }
  );

  return result;
}

/* ── Audio embed ── */

function audioPlayer(src: string, caption?: string): string {
  const cap = caption?.trim()
    ? `<figcaption><span class="caption-rule"></span><em>${caption.trim()}</em></figcaption>`
    : "";
  return `<figure class="audio-embed my-6"><audio controls preload="metadata" src="${src}"></audio>${cap}</figure>`;
}

function processAudioEmbeds(rawHtml: string): string {
  // <ses>URL</ses> or <ses>URL|caption text</ses>
  // Inner text only — no attributes (TipTap strips unknown element attrs)
  return rawHtml.replace(
    /<ses>([\s\S]*?)<\/ses>/g,
    (_, inner) => {
      const text = inner.trim();
      const pipeIdx = text.indexOf("|");
      const src = pipeIdx > -1 ? text.slice(0, pipeIdx).trim() : text;
      const caption = pipeIdx > -1 ? text.slice(pipeIdx + 1).trim() : "";
      if (!src) return "";
      return audioPlayer(src, caption);
    }
  );
}

function processYouTubeEmbeds(rawHtml: string): string {
  // 1. <youtube>URL</youtube> custom tag
  let result = rawHtml.replace(/<youtube>([\s\S]*?)<\/youtube>/g, (_, url) => {
    const id = extractYouTubeId(url.trim());
    return id ? youtubeIframe(id) : "";
  });

  // 2. YouTube <a> links that are alone in a <p> → embed
  //    [^<]* instead of [\s\S]*? to avoid matching across tags/paragraphs
  result = result.replace(
    /<p>\s*<a [^>]*href="([^"]*)"[^>]*>[^<]*<\/a>\s*<\/p>/g,
    (match, url) => {
      const id = extractYouTubeId(url);
      return id ? youtubeIframe(id) : match;
    }
  );

  // 3. Bare YouTube URLs alone in a <p> → embed
  result = result.replace(
    /<p>\s*(https?:\/\/[^\s<]+)\s*<\/p>/g,
    (match, url) => {
      const id = extractYouTubeId(url);
      return id ? youtubeIframe(id) : match;
    }
  );

  // 4. YouTube URL at end of a <p> (after text) → split: keep text, add embed after
  //    (?:(?!<\/p>).)*? to avoid matching across paragraphs
  result = result.replace(
    /(<p>(?:(?!<\/p>).)*?)\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch|youtu\.be\/|m\.youtube\.com\/watch)[^\s<]*)\s*(<\/p>)/g,
    (match, before, url, after) => {
      const id = extractYouTubeId(url);
      if (!id) return match;
      // Remove trailing <br> or whitespace from the text before
      const cleanBefore = before.replace(/\s*(<br\s*\/?>)?\s*$/, "");
      return `${cleanBefore}${after}\n${youtubeIframe(id)}`;
    }
  );

  // 5. YouTube <a> links at end of a <p> → split: keep text, embed after
  //    [^<]* inside <a> to avoid matching across tags; (?:(?!<p>).)*? for before
  result = result.replace(
    /(<p>(?:(?!<\/p>).)*?)\s*<a [^>]*href="([^"]*youtube[^"]*|[^"]*youtu\.be[^"]*)"[^>]*>[^<]*<\/a>\s*(<\/p>)/g,
    (match, before, url, after) => {
      const id = extractYouTubeId(url);
      if (!id) return match;
      const cleanBefore = before.replace(/\s*(<br\s*\/?>)?\s*$/, "");
      return `${cleanBefore}${after}\n${youtubeIframe(id)}`;
    }
  );

  // 6. Remaining YouTube <a> links → open in new tab
  result = result.replace(
    /<a href="(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|m\.youtube\.com)\/[^"]*)"(?![^>]*target=)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );

  return result;
}

/* ──────────────── otomatik iç link sistemi ──────────────── */

// Sabit sayfa linkleri — sıklıkla geçen anahtar kelimeler
const STATIC_LINKS: { keyword: string; url: string }[] = [
  { keyword: "kültür haritası", url: "/harita" },
  { keyword: "interaktif harita", url: "/harita" },
  { keyword: "sanat tarihi atölye", url: "/atolyeler" },
  { keyword: "atölye", url: "/atolyeler" },
  { keyword: "etkinlik takvimi", url: "/etkinlikler" },
  { keyword: "Loca Club", url: "/club" },
];

/**
 * Makale içinde geçen diğer makale başlıklarını ve sabit anahtar kelimeleri
 * otomatik iç linklere çevirir. Kurallar:
 * - Zaten bir <a> tag'ı içindeyse dokunma
 * - Heading'ler içindeyse dokunma
 * - Aynı link'i en fazla 1 kez ekle (ilk eşleşme)
 * - Mevcut makaleye link verme (currentSlug)
 */
function processInternalLinks(
  rawHtml: string,
  otherArticles: { title: string; slug: string }[],
  currentSlug: string,
): string {
  const usedUrls = new Set<string>();
  let result = rawHtml;

  // Hem makale linklerini hem sabit linkleri birleştir
  const allLinks: { keyword: string; url: string }[] = [
    // Makale linkleri (uzun başlıklardan başla — greedy match)
    ...otherArticles
      .filter((a) => a.slug !== currentSlug && a.title.length >= 8)
      .sort((a, b) => b.title.length - a.title.length)
      .map((a) => ({ keyword: a.title, url: `/icerikler/yazi/${a.slug}` })),
    // Sabit linkler
    ...STATIC_LINKS,
  ];

  for (const { keyword, url } of allLinks) {
    if (usedUrls.has(url)) continue;

    // Escape special regex chars in keyword
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Sadece <p> tag'ları içindeki eşleşmeleri bul (heading'leri atla)
    // Zaten <a> içinde değilse değiştir
    const pattern = new RegExp(
      `(<p[^>]*>(?:(?!<\\/p>).)*?)\\b(${escaped})\\b((?:(?!<\\/p>).)*?<\\/p>)`,
      "is",
    );

    const match = result.match(pattern);
    if (!match) continue;

    // Eşleşen bölümün bir <a> tag'ı içinde olmadığını doğrula
    const before = match[1];
    const openAnchor = (before.match(/<a /g) || []).length;
    const closeAnchor = (before.match(/<\/a>/g) || []).length;
    if (openAnchor > closeAnchor) continue; // <a> içindeyiz, atla

    result = result.replace(
      pattern,
      `$1<a href="${url}" class="internal-link">$2</a>$3`,
    );
    usedUrls.add(url);
  }

  return result;
}

/** Server-side figure classification: probe image dimensions and add layout class */
async function classifyFigures(htmlContent: string): Promise<string> {
  const figurePattern = /<figure><img\s[^>]*?src="([^"]*)"[^>]*>/g;
  const matches = [...htmlContent.matchAll(figurePattern)];
  if (matches.length === 0) return htmlContent;

  // Probe all image dimensions in parallel
  const probes = matches.map(async (m) => {
    let url = m[1];
    // Decode /_next/image proxy URL to get original
    const proxyMatch = url.match(/\/_next\/image\?url=([^&]+)/);
    if (proxyMatch) url = decodeURIComponent(proxyMatch[1]);

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return null;
      const buffer = Buffer.from(await res.arrayBuffer());
      const meta = await sharp(buffer).metadata();
      if (!meta.width || !meta.height) return null;
      const ratio = meta.width / meta.height;
      if (ratio < 0.8) return "figure-portrait";
      if (ratio <= 1.3) return "figure-square";
      return "figure-landscape";
    } catch {
      return null;
    }
  });

  const classes = await Promise.all(probes);

  // Replace each <figure> with <figure class="..."> in order
  let result = htmlContent;
  for (const cls of classes) {
    if (cls) {
      result = result.replace("<figure>", `<figure class="${cls}">`);
    } else {
      // Skip this figure — leave it as-is (replace with itself to advance)
      result = result.replace("<figure>", "<figure data-skip>");
    }
  }
  // Clean up skip markers
  result = result.replace(/ data-skip>/g, ">");

  return result;
}

/** Markdown content → processed HTML (tüm özel bloklar dahil) */
export async function markdownToHtml(content: string): Promise<string> {
  // 1. Pre-process: extract custom blocks before remark runs
  const { content: withOneriTokens, blocks: oneriBlocks } = extractOneriBlocks(content);
  const mdWithDurak = extractDurakBlocks(withOneriTokens);

  // 2. Run remark on pre-processed content
  const processed = await remark().use(remarkGfm).use(html, { sanitize: false }).process(mdWithDurak);
  let contentHtml = processed.toString();

  // 3. Inject oneri blocks (process their inner markdown separately)
  for (const [token, innerMd] of oneriBlocks) {
    const innerProcessed = await remark().use(remarkGfm).use(html, { sanitize: false }).process(innerMd);
    const innerHtml = innerProcessed
      .toString()
      .replace(/<a href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
    const blockHtml = `<div class="oneri-block"><p class="oneri-title">Öneri</p>${innerHtml}</div>`;
    contentHtml = contentHtml.replace(`<p>${token}</p>`, blockHtml).replace(token, blockHtml);
  }

  // 4. Post-process pipeline
  contentHtml = processImageCaptions(contentHtml);
  contentHtml = optimizeImages(contentHtml);
  contentHtml = await classifyFigures(contentHtml);
  contentHtml = processWarningBoxes(contentHtml);
  contentHtml = processYouTubeEmbeds(processBlockquotes(contentHtml));
  contentHtml = processSpotifyEmbeds(contentHtml);
  contentHtml = processAudioEmbeds(contentHtml);
  contentHtml = processKaynakca(contentHtml);

  return contentHtml;
}

/* ──────────────── Supabase data functions ──────────────── */

export async function getArticleBySlug(slug: string): Promise<ParsedArticle | null> {
  const supabase = createAdminClient();
  const [articleRes, otherArticlesRes] = await Promise.all([
    supabase
      .from("articles")
      .select("*, author_person:people!articles_author_id_fkey(id, slug, name, avatar_url, short_bio, instagram, expertise)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("articles")
      .select("slug, title")
      .eq("status", "published")
      .neq("slug", slug)
      .limit(100),
  ]);

  const { data, error } = articleRes;
  if (error || !data) return null;

  const content: string = data.content ?? "";

  // Markdown → HTML (tüm özel bloklar korunuyor)
  let contentHtml = await markdownToHtml(content);

  // İç link sistemi: diğer makalelere + sabit sayfalara otomatik link
  const otherArticles = (otherArticlesRes.data ?? []).map((a) => ({
    title: a.title as string,
    slug: a.slug as string,
  }));
  contentHtml = processInternalLinks(contentHtml, otherArticles, slug);

  // Auto-calculate read time from word count (200 words/min, min 1 dk)
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));
  const readTime = `${minutes} dk`;

  const meta: ArticleMeta = {
    title: data.title ?? "",
    description: data.description ?? "",
    author: data.author ?? "",
    authorIg: data.author_ig ?? undefined,
    authorEmail: data.author_email ?? undefined,
    date: data.date ?? "",
    category: data.category ?? "",
    tags: data.tags ?? [],
    image: data.image ?? "",
    cover_caption: data.cover_caption ?? null,
    cover_video_url: data.cover_video_url ?? null,
    cover_video_duration: data.cover_video_duration ?? null,
    hero_overlay_enabled: data.hero_overlay_enabled ?? false,
    readTime,
    slug: data.slug,
    author_id: data.author_id ?? null,
    author_person: (Array.isArray(data.author_person) ? data.author_person[0] : data.author_person) ?? null,
  };

  return { meta, contentHtml };
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published");

  if (error || !data) return [];
  return data.map((row) => row.slug);
}

export async function getRelatedArticles(
  currentSlug: string,
  category: string,
  limit = 3
): Promise<ArticleMeta[]> {
  const supabase = createAdminClient();

  // Önce aynı kategoriden makaleleri dene
  const { data: sameCat } = await supabase
    .from("articles")
    .select("slug, title, description, author, author_ig, author_email, date, category, tags, image, content, author_id, author_person:people!articles_author_id_fkey(id, slug, name, avatar_url, short_bio, instagram, expertise)")
    .eq("status", "published")
    .eq("category", category)
    .neq("slug", currentSlug)
    .order("date", { ascending: false })
    .limit(limit);

  let rows = sameCat ?? [];

  // Yetersizse diğer kategorilerden tamamla
  if (rows.length < limit) {
    const existingSlugs = [currentSlug, ...rows.map((r) => r.slug)];
    const { data: others } = await supabase
      .from("articles")
      .select("slug, title, description, author, author_ig, author_email, date, category, tags, image, content, author_id, author_person:people!articles_author_id_fkey(id, slug, name, avatar_url, short_bio, instagram, expertise)")
      .eq("status", "published")
      .not("slug", "in", `(${existingSlugs.join(",")})`)
      .order("date", { ascending: false })
      .limit(limit - rows.length);
    if (others) rows = [...rows, ...others];
  }

  return rows.map((row) => {
    const wordCount = (row.content ?? "").trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(wordCount / 200));
    return {
      title: row.title ?? "",
      description: row.description ?? "",
      author: row.author ?? "",
      authorIg: row.author_ig ?? undefined,
      authorEmail: row.author_email ?? undefined,
      date: row.date ?? "",
      category: row.category ?? "",
      tags: row.tags ?? [],
      image: row.image ?? "",
      readTime: `${minutes} dk`,
      slug: row.slug,
      author_id: row.author_id ?? null,
      author_person: (Array.isArray(row.author_person) ? row.author_person[0] : row.author_person) ?? null,
    };
  });
}

export async function getAllArticlesMetadata(): Promise<ArticleMeta[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, description, author, author_ig, author_email, date, category, tags, image, content, author_id, author_person:people!articles_author_id_fkey(id, slug, name, avatar_url, short_bio, instagram, expertise)")
    .eq("status", "published")
    .order("date", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const wordCount = (row.content ?? "").trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(wordCount / 200));
    return {
      title: row.title ?? "",
      description: row.description ?? "",
      author: row.author ?? "",
      authorIg: row.author_ig ?? undefined,
      authorEmail: row.author_email ?? undefined,
      date: row.date ?? "",
      category: row.category ?? "",
      tags: row.tags ?? [],
      image: row.image ?? "",
      readTime: `${minutes} dk`,
      slug: row.slug,
      author_id: row.author_id ?? null,
      author_person: (Array.isArray(row.author_person) ? row.author_person[0] : row.author_person) ?? null,
    };
  });
}
