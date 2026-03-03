import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDir = path.join(process.cwd(), "src/content/icerikler");

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

function extractYouTubeId(url: string): string | null {
  const m = url.match(/[?&]v=([\w-]+)/) ?? url.match(/youtu\.be\/([\w-]+)/);
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
  // Step 1: ilk uygun <p>'yi spot-quote yap
  // Hem attribute'lu hem attribute'suz <p> tag'lerini tara.
  // Atlama koşulları:
  //   a) Zaten class'ı olan paragraflar (warning-box, oneri-title vs.)
  //   b) Text içeriği ⚠️ (U+26A0) ile başlayanlar (processWarningBoxes kaçırırsa backup)
  let html = rawHtml;
  const pRegex = /<p([^>]*)>([\s\S]*?)<\/p>/g;
  let m: RegExpExecArray | null;
  while ((m = pRegex.exec(rawHtml)) !== null) {
    const attrs = m[1];   // örn: ' class="warning-box"' veya ''
    const inner = m[2];
    // class attribute'u olan paragrafları atla
    if (attrs.includes("class=")) continue;
    // Text içeriği ⚠️ ile başlıyorsa atla (güvenlik ağı)
    const textOnly = inner.replace(/<[^>]+>/g, "").trimStart();
    if (textOnly.startsWith("\u26A0")) continue;
    const stripped = inner.replace(/["""'']/g, "");
    html = rawHtml.slice(0, m.index)
      + `<p class="spot-quote">${stripped}</p>`
      + rawHtml.slice(m.index + m[0].length);
    break; // Sadece tek paragraf — duruyoruz
  }

  // Step 2: TÜM blockquote'lar (ilki dahil) → inline-quote
  return html.replace(
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
  // <p><strong>Kaynakça</strong></p> ile başlayan bölümü sarmalayarak özel stil uygula
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

function processYouTubeEmbeds(rawHtml: string): string {
  return rawHtml.replace(/<youtube>([\s\S]*?)<\/youtube>/g, (_, url) => {
    const id = extractYouTubeId(url.trim());
    if (!id) return "";
    return `<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  });
}

export async function getArticleBySlug(slug: string): Promise<ParsedArticle | null> {
  const filePath = path.join(contentDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

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

  // 4. Post-process pipeline:
  //    Warning boxes ÖNCE çalışır → ⚠️ paragrafları <p class="warning-box"> olur
  //    Spot tespiti SONRA çalışır → <p> regex attribute'lu tag'leri atlar,
  //    warning-box paragraflar otomatik hariç tutulur
  contentHtml = processWarningBoxes(contentHtml);
  contentHtml = processYouTubeEmbeds(processBlockquotes(contentHtml));
  contentHtml = processKaynakca(contentHtml);

  // Auto-calculate read time from word count (200 words/min, min 1 dk)
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));
  const readTime = `${minutes} dk`;

  return {
    meta: { ...(data as ArticleMeta), readTime },
    contentHtml,
  };
}

export function getAllArticleSlugs(): string[] {
  if (!fs.existsSync(contentDir)) return [];
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export async function getAllArticlesMetadata(): Promise<ArticleMeta[]> {
  const slugs = getAllArticleSlugs();
  const results = await Promise.all(slugs.map(getArticleBySlug));
  return results
    .filter((a): a is ParsedArticle => a !== null)
    .map((a) => a.meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // en yeni üstte
}
