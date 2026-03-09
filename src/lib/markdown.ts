import { remark } from "remark";
import html from "remark-html";
import { createAdminClient } from "./supabase-admin";

export type ArticleMeta = {
  title: string;
  description: string;
  author: string;
  authorIg?: string;
  authorEmail?: string;
  date: string;
  category: string;
  tags: string[];
  image: string;
  readTime: string;
  slug: string;
};

export type ParsedArticle = {
  meta: ArticleMeta;
  contentHtml: string;
};

/* ──────────────── markdown processing helpers ──────────────── */

function extractYouTubeId(url: string): string | null {
  const m =
    url.match(/[?&]v=([\w-]+)/) ??
    url.match(/youtu\.be\/([\w-]+)/) ??
    url.match(/youtube\.com\/embed\/([\w-]+)/) ??
    url.match(/youtube\.com\/shorts\/([\w-]+)/);
  return m ? m[1] : null;
}

function processWarningBoxes(rawHtml: string): string {
  // ⚠️ (U+26A0) ile başlayan paragrafları uyarı kutusu olarak işaretle
  return rawHtml.replace(
    /<p>(\u26A0[\s\S]*?)<\/p>/g,
    (_, inner) => `<p class="warning-box">${inner}</p>`
  );
}

function processBlockquotes(rawHtml: string): string {
  // TÜM blockquote'lar → inline-quote
  return rawHtml.replace(
    /<blockquote>([\s\S]*?)<\/blockquote>/g,
    (_, inner) => {
      const withAttribution = inner.replace(
        /(<p>)(.{10,}?)\s+—\s+(.+?)(<\/p>)/g,
        '$1$2<span class="quote-attribution">— $3</span>$4'
      );
      return `<blockquote class="inline-quote">${withAttribution.replace(/["""'']/g, "")}</blockquote>`;
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
  return `<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
}

const YT_URL_RE = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s<"]*|youtu\.be\/[\w-]+[^\s<"]*|youtube\.com\/embed\/[\w-]+[^\s<"]*|m\.youtube\.com\/watch\?[^\s<"]*)/g;

function processYouTubeEmbeds(rawHtml: string): string {
  // 1. <youtube>URL</youtube> custom tag
  let result = rawHtml.replace(/<youtube>([\s\S]*?)<\/youtube>/g, (_, url) => {
    const id = extractYouTubeId(url.trim());
    return id ? youtubeIframe(id) : "";
  });

  // 2. YouTube <a> links that are alone in a <p> → embed
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
  result = result.replace(
    /(<p>[\s\S]*?)\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch|youtu\.be\/|m\.youtube\.com\/watch)[^\s<]*)\s*(<\/p>)/g,
    (match, before, url, after) => {
      const id = extractYouTubeId(url);
      if (!id) return match;
      // Remove trailing <br> or whitespace from the text before
      const cleanBefore = before.replace(/\s*(<br\s*\/?>)?\s*$/, "");
      return `${cleanBefore}${after}\n${youtubeIframe(id)}`;
    }
  );

  // 5. YouTube <a> links at end of a <p> → split: keep text, embed after
  result = result.replace(
    /(<p>[\s\S]*?)\s*<a [^>]*href="([^"]*youtube[^"]*|[^"]*youtu\.be[^"]*)"[^>]*>[^<]*<\/a>\s*(<\/p>)/g,
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

/** Markdown content → processed HTML (tüm özel bloklar dahil) */
export async function markdownToHtml(content: string): Promise<string> {
  // 1. Pre-process: extract custom blocks before remark runs
  const { content: withOneriTokens, blocks: oneriBlocks } = extractOneriBlocks(content);
  const mdWithDurak = extractDurakBlocks(withOneriTokens);

  // 2. Run remark on pre-processed content
  const processed = await remark().use(html, { sanitize: false }).process(mdWithDurak);
  let contentHtml = processed.toString();

  // 3. Inject oneri blocks (process their inner markdown separately)
  for (const [token, innerMd] of oneriBlocks) {
    const innerProcessed = await remark().use(html, { sanitize: false }).process(innerMd);
    const innerHtml = innerProcessed
      .toString()
      .replace(/<a href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
    const blockHtml = `<div class="oneri-block"><p class="oneri-title">Öneri</p>${innerHtml}</div>`;
    contentHtml = contentHtml.replace(`<p>${token}</p>`, blockHtml).replace(token, blockHtml);
  }

  // 4. Post-process pipeline
  contentHtml = processWarningBoxes(contentHtml);
  contentHtml = processYouTubeEmbeds(processBlockquotes(contentHtml));
  contentHtml = processKaynakca(contentHtml);

  return contentHtml;
}

/* ──────────────── Supabase data functions ──────────────── */

export async function getArticleBySlug(slug: string): Promise<ParsedArticle | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;

  const content: string = data.content ?? "";

  // Markdown → HTML (tüm özel bloklar korunuyor)
  const contentHtml = await markdownToHtml(content);

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
    readTime,
    slug: data.slug,
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

export async function getAllArticlesMetadata(): Promise<ArticleMeta[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, description, author, author_ig, author_email, date, category, tags, image, content")
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
    };
  });
}
