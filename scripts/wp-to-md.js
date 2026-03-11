#!/usr/bin/env node

/**
 * WordPress → Markdown importer
 * Kullanım: node scripts/wp-to-md.js
 *
 * Gereksinimler: npm install --save-dev turndown
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const TurndownService = require("turndown");

// ─── Ayarlar ───────────────────────────────────────────────────────────────
const WP_BASE = "https://klemensart.com/wp-json/wp/v2";
const OUT_DIR = path.join(__dirname, "../src/content/icerikler");
const IMG_DIR = path.join(__dirname, "../public/yazilar");

// WordPress kategori adı → Klemens kategori adı eşlemesi (lowercase key)
const CATEGORY_MAP = {
  "odak": "Odak",
  "kültür & sanat": "Kültür & Sanat",
  "kultur-sanat": "Kültür & Sanat",
  "kültür sanat": "Kültür & Sanat",
  "sanat": "Kültür & Sanat",
  "sinema": "Kültür & Sanat",
  "müzik": "Kültür & Sanat",
  "edebiyat": "Kültür & Sanat",
  "kent & yaşam": "Kent & Yaşam",
  "kent ve yaşam": "Kent & Yaşam",
  "şehir": "Kent & Yaşam",
  "ilham verenler": "İlham Verenler",
  "ilham": "İlham Verenler",
  "röportaj": "İlham Verenler",
  "uncategorized": "Odak",
  "genel": "Odak",
  // "Anasayfa" kasıtlı olarak eklenmedi → içerik bazlı sınıflandırma yapılır
};

// ─── Yardımcı fonksiyonlar ──────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** HTML entity'leri düz metne çevir */
function decodeEntities(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8212;/g, "\u2014")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#160;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": "klemens-wp-importer/1.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchJSON(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(new Error(`JSON parse error for ${url}: ${e.message}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);
    const req = client.get(url, { headers: { "User-Agent": "klemens-wp-importer/1.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlink(destPath, () => {});
        return resolve(downloadFile(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        return reject(new Error(`HTTP ${res.statusCode} downloading ${url}`));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", (err) => { fs.unlink(destPath, () => {}); reject(err); });
    });
    req.on("error", (err) => { fs.unlink(destPath, () => {}); reject(err); });
    req.setTimeout(30000, () => { req.destroy(); reject(new Error(`Download timeout: ${url}`)); });
  });
}

/** URL'den güvenli dosya adı üret */
function urlToFilename(url) {
  try {
    const u = new URL(url);
    return path.basename(u.pathname);
  } catch {
    return url.split("/").pop().split("?")[0] || "gorsel.jpg";
  }
}

/** Görseli indir, public/yazilar/ altına kaydet; web yolunu döndür */
async function downloadImage(url) {
  if (!url) return null;
  const filename = urlToFilename(url);
  const destPath = path.join(IMG_DIR, filename);
  if (!fs.existsSync(destPath)) {
    try {
      await downloadFile(url, destPath);
      console.log(`    📥 Görsel indirildi: ${filename}`);
    } catch (err) {
      console.warn(`    ⚠️  Görsel indirilemedi (${url}): ${err.message}`);
      return null;
    }
  }
  return `/yazilar/${filename}`;
}

/** Kelime sayısından okuma süresi hesapla */
function calcReadTime(text) {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} dk`;
}

/**
 * Ham metin veya HTML'den açıklama üret.
 * ig:/mail: kalıplarını ve boş linkleri temizler.
 */
function makeDescription(text) {
  let plain = text
    .replace(/<[^>]+>/g, " ")          // HTML etiketleri
    .replace(/\[\]\([^)]*\)/g, " ")    // Boş markdown linkler [](URL)
    .replace(/\big\s*:\s*@[\w.]+/gi, "") // ig: @handle
    .replace(/\b(?:mail|e-?mail)\s*:\s*[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/gi, "") // mail: email
    .replace(/\s+/g, " ")
    .trim();
  plain = decodeEntities(plain);
  return plain.length > 160 ? plain.slice(0, 157) + "..." : plain;
}

/** WordPress kategorisini Klemens kategorisine çevir (entity + case tolerant) */
function mapCategory(wpCatName) {
  const decoded = decodeEntities(wpCatName || "").toLowerCase().trim();
  return CATEGORY_MAP[decoded] ?? null; // null → içerik bazlı sınıflandırma yapılacak
}

/**
 * Başlık ve HTML içeriğine göre kategori belirle.
 * "Anasayfa" gibi belirsiz kategori için fallback.
 */
function classifyByContent(title, htmlContent) {
  const text = (title + " " + htmlContent).toLowerCase();

  const scores = {
    "Kent & Yaşam": [
      "istanbul", "ankara", "izmir", "şehir", "kent", "mekan", "mahalle",
      "sokak", "semt", "mimari", "kültürpark", "beyoğlu", "bursa",
      "locus amoenus", "cumhuriyet yolculuğu", "muhit",
    ].filter((k) => text.includes(k)).length,

    "İlham Verenler": [
      "röportaj", "söyleşi", "ile konuştuk", "ile buluştuk",
      "anlattı", "diyor ki", "biyografi", "latifi", "payam",
      "gülnaz", "ozan sağdıç", "siyah-beyaz anılar", "diyarında",
    ].filter((k) => text.includes(k)).length,

    "Kültür & Sanat": [
      "sergi", "tablo", "resim", "heykel", "fotoğraf", "sanatçı",
      "sinema", "film", "tiyatro", "müzik", "edebiyat", "kitap",
      "roman", "şiir", "bienal", "galeri", "ressam", "pisuvar",
      "müze", "sanat eseri", "fuar", "festivali", "perdelerini",
      "koleksiyon", "rönesans", "minyatür",
    ].filter((k) => text.includes(k)).length,

    "Odak": [
      "yalnızlık", "psikoloji", "felsefe", "bilinç", "varoluş",
      "anlam", "kaygı", "özgürlük", "iç dünya", "dijital",
      "yapay zeka", "sosyal medya", "teknoloji", "algorit",
      "korku", "ölüm", "hafıza", "kozmik",
    ].filter((k) => text.includes(k)).length,
  };

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : "Kültür & Sanat"; // en yaygın fallback
}

/** Slug'ı dosya sistemine uygun hale getir */
function sanitizeSlug(slug) {
  return slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

// ─── HTML → Markdown dönüşümü ───────────────────────────────────────────────

/** HTML'yi Turndown'a vermeden önce derinlemesine temizle */
function cleanHtml(html) {
  let s = html;

  // 1. <style> ve <script> bloklarını tamamen sil (içerikleriyle birlikte)
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");

  // 2. HTML yorumları (<!-- ... -->)
  s = s.replace(/<!--[\s\S]*?-->/g, "");

  // 3. WordPress shortcode'ları — açık ve kapalı her formatı yakala
  s = s.replace(/\[[a-zA-Z_][^\]]*\][\s\S]*?\[\/[a-zA-Z_][^\]]*\]/g, "");
  s = s.replace(/\[\/[a-zA-Z_][^\]]*\]/g, "");
  s = s.replace(/\[[a-zA-Z_][^\]]*\]/g, "");

  // 4. Tag attribute'larını temizle
  s = s.replace(/\s+class="[^"]*"/gi, "");
  s = s.replace(/\s+class='[^']*'/gi, "");
  s = s.replace(/\s+style="[^"]*"/gi, "");
  s = s.replace(/\s+style='[^']*'/gi, "");
  s = s.replace(/\s+id="[^"]*"/gi, "");
  s = s.replace(/\s+id='[^']*'/gi, "");
  s = s.replace(/\s+data-[a-z-]+="[^"]*"/gi, "");
  s = s.replace(/\s+aria-[a-z-]+="[^"]*"/gi, "");

  // 5. <div> ve <span> etiketlerini sil, içeriği koru
  s = s.replace(/<div[^>]*>/gi, "\n");
  s = s.replace(/<\/div>/gi, "\n");
  s = s.replace(/<span[^>]*>/gi, "");
  s = s.replace(/<\/span>/gi, "");

  // 6. HTML entity'leri okunabilir karakterlere çevir
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8212;/g, "\u2014")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#160;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));

  return s;
}

/** Markdown'dan kalıntıları temizle */
function cleanMarkdown(md) {
  let s = md;

  // CSS kural blokları: .class { ... }
  s = s.replace(/[.#]?[\w-]+\s*\{[^}]*\}/g, "");

  // CSS property satırları: "property: value;" (satır tek başına CSS ise sil)
  s = s.replace(/^[ \t]*[\w-]+\s*:\s*[^;\n]+;[ \t]*$/gm, "");

  // Turndown'ın escape ettiği köşeli parantezleri geri al
  s = s.replace(/\\\[/g, "[");
  s = s.replace(/\\\]/g, "]");

  // Boş URL'li markdown linkler: [](URL) — Klemens sosyal medya footer linkleri
  s = s.replace(/\[\]\([^)]*\)/g, "");

  // Boş resimler: ![]()
  s = s.replace(/!\[\]\(\)/g, "");

  // Kırık tablo kalıntıları
  s = s.replace(/^\|.*\|$/gm, "");
  s = s.replace(/^[-|: ]+$/gm, "");

  // 3+ boş satırı → 2 boş satıra indir
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}

/**
 * Markdown gövdesinden yazar bilgilerini çıkar ve temizle.
 *
 * Aranan kalıplar:
 *   YAZAR          ← etiket satırı
 *   ## Barış Arslan ← yazar adı başlığı
 *   ig: @barars2023 mail: bararslan2009@gmail.com <açıklama>[](...)
 *
 * Döndürür: { name, ig, email, cleaned }
 */
function extractAuthorFromMarkdown(md) {
  let s = md;
  let name = null, ig = null, email = null;

  // 1. Yazar adını "YAZAR" etiketinin hemen ardından gelen başlıktan çıkar
  //    Örnek: "YAZAR\n\n## Barış Arslan\n"
  const yazarNameRegex = /^YAZAR[ \t]*\n(?:[ \t]*\n)*#{1,3}[ \t]+([^\n]+)/m;
  const nameMatch = s.match(yazarNameRegex);
  if (nameMatch) {
    name = nameMatch[1].replace(/\*/g, "").trim();
    // YAZAR + başlık satırını sil
    s = s.replace(yazarNameRegex, "");
  }

  // 2. Kalan tek "YAZAR" etiket satırlarını sil
  s = s.replace(/^YAZAR[ \t]*\n?/gm, "");

  // 3. ig: handle (@'lu veya @'suz; kaçış karakteri olabilir)
  //    ig ve mail aynı satırda olabilir, önce değerleri çıkar sonra satırları sil
  const igLineMatch = s.match(/^ig:?\s*(@?[\w.\\]+)/im);
  if (igLineMatch) {
    const raw = igLineMatch[1].replace(/\\/g, "");
    ig = raw.startsWith("@") ? raw : "@" + raw;
  }

  // 4. mail: email (kaçış karakterli adresleri de yakala; önce bağımsız satır, yoksa ig: satırı içinde)
  const mailStandalone = s.match(/^(?:mail|e-?mail):?\s*(\S+@\S+)/im);
  const mailInline = !mailStandalone ? s.match(/(?:mail|e-?mail):?\s*(\S+@\S+)/i) : null;
  const mailToken = mailStandalone ?? mailInline;
  if (mailToken) {
    email = mailToken[1].replace(/\\/g, "");
  }

  // Satır başı ig: ve mail: satırlarını tamamen sil
  s = s.replace(/^ig:?\s*@?\S+.*$/gm, "");
  s = s.replace(/^(?:mail|e-?mail):?\s*\S+@\S+.*$/gim, "");

  // 5. Boş URL'li linkler: [](URL) — Klemens footer sosyal medya linkleri
  s = s.replace(/\[\]\([^)]*\)/g, "");

  // 6. Boş satırları düzenle
  s = s.replace(/\n{3,}/g, "\n\n").trim();

  return { name, ig, email, cleaned: s };
}

/** Turndown ile HTML → Markdown */
function htmlToMarkdown(html) {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });

  td.addRule("figure", {
    filter: "figure",
    replacement: (content) => `\n\n${content.trim()}\n\n`,
  });
  td.addRule("figcaption", {
    filter: "figcaption",
    replacement: (content) => `*${content.trim()}*`,
  });

  const cleanedHtml = cleanHtml(html);
  const rawMd = td.turndown(cleanedHtml);
  return cleanMarkdown(rawMd);
}

// ─── Frontmatter ────────────────────────────────────────────────────────────

function buildFrontmatter({ title, description, author, authorIg, authorEmail, date, category, tags, image, readTime, slug }) {
  const lines = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `author: ${JSON.stringify(author)}`,
    authorIg    ? `authorIg: ${JSON.stringify(authorIg)}`       : null,
    authorEmail ? `authorEmail: ${JSON.stringify(authorEmail)}` : null,
    `date: ${JSON.stringify(date)}`,
    `category: ${JSON.stringify(category)}`,
    `tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]`,
    `image: ${JSON.stringify(image || "/yazilar/placeholder.jpg")}`,
    `readTime: ${JSON.stringify(readTime)}`,
    `slug: ${JSON.stringify(slug)}`,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  return lines;
}

// ─── WordPress API çağrıları ────────────────────────────────────────────────

const userCache = new Map();
const categoryCache = new Map();

async function fetchAuthor(authorId) {
  if (userCache.has(authorId)) return userCache.get(authorId);
  try {
    const data = await fetchJSON(`${WP_BASE}/users/${authorId}`);
    const result = { name: data.name || "Klemens", ig: null };
    userCache.set(authorId, result);
    return result;
  } catch {
    const fallback = { name: "Klemens", ig: null };
    userCache.set(authorId, fallback);
    return fallback;
  }
}

async function fetchCategory(catId) {
  if (categoryCache.has(catId)) return categoryCache.get(catId);
  try {
    const data = await fetchJSON(`${WP_BASE}/categories/${catId}`);
    const result = { name: decodeEntities(data.name || "Odak"), slug: data.slug || "" };
    categoryCache.set(catId, result);
    return result;
  } catch {
    const fallback = { name: "Odak", slug: "" };
    categoryCache.set(catId, fallback);
    return fallback;
  }
}

async function fetchFeaturedImage(mediaId) {
  if (!mediaId) return null;
  try {
    const data = await fetchJSON(`${WP_BASE}/media/${mediaId}`);
    return (
      data.source_url ||
      data.media_details?.sizes?.large?.source_url ||
      data.media_details?.sizes?.medium_large?.source_url ||
      data.media_details?.sizes?.medium?.source_url ||
      null
    );
  } catch {
    return null;
  }
}

async function fetchTags(tagIds) {
  if (!tagIds || tagIds.length === 0) return [];
  const tags = [];
  for (const id of tagIds.slice(0, 10)) {
    try {
      const data = await fetchJSON(`${WP_BASE}/tags/${id}`);
      if (data.name) tags.push(decodeEntities(data.name));
    } catch {
      // sessizce atla
    }
  }
  return tags;
}

/** Tüm yazıları sayfalama yaparak çek */
async function fetchAllPosts() {
  const posts = [];
  let page = 1;
  console.log("📡 WordPress'ten yazılar çekiliyor...\n");

  while (true) {
    const url = `${WP_BASE}/posts?per_page=100&page=${page}&status=publish&_fields=id,slug,title,content,excerpt,date,author,categories,tags,featured_media`;
    let data;
    try {
      data = await fetchJSON(url);
    } catch (err) {
      if (err.message.includes("HTTP 400") && page > 1) break;
      throw err;
    }

    if (!Array.isArray(data) || data.length === 0) break;

    console.log(`  Sayfa ${page}: ${data.length} yazı`);
    posts.push(...data);

    if (data.length < 100) break;
    page++;
    await sleep(300);
  }

  console.log(`\n✅ Toplam ${posts.length} yazı bulundu.\n`);
  return posts;
}

// ─── Ana işlem ──────────────────────────────────────────────────────────────

async function processPost(post, index, total) {
  const slug = sanitizeSlug(post.slug || `yazi-${post.id}`);
  const rawTitle = decodeEntities(post.title?.rendered || slug);
  console.log(`[${index + 1}/${total}] "${rawTitle}"`);

  const outPath = path.join(OUT_DIR, `${slug}.md`);
  if (fs.existsSync(outPath)) {
    console.log(`    ⏭️  Zaten var, atlanıyor: ${slug}.md\n`);
    return { slug, status: "skipped" };
  }

  try {
    // Paralel veri çek
    const [wpAuthor, featuredImageUrl, tags] = await Promise.all([
      fetchAuthor(post.author),
      fetchFeaturedImage(post.featured_media),
      fetchTags(post.tags || []),
    ]);

    // Ham HTML içeriği — kategori sınıflandırması ve dönüşüm için gerekli
    const rawHtml = post.content?.rendered || "";

    // Kategorileri çek
    const allCatNames = [];
    for (const catId of (post.categories || []).slice(0, 5)) {
      const cat = await fetchCategory(catId);
      allCatNames.push(cat.name);
    }

    let primaryCategory;
    const primaryWp = (allCatNames[0] || "").toLowerCase();

    if (primaryWp === "anasayfa") {
      // Birincil kategori "Anasayfa" ise her zaman içerik bazlı sınıflandır
      primaryCategory = classifyByContent(rawTitle, rawHtml);
      console.log(`    🔍 İçerik bazlı: ${primaryCategory}`);
    } else {
      // Gerçek bir WP kategorisi var; CATEGORY_MAP'ten çevir
      primaryCategory = mapCategory(allCatNames[0]);
      // Çeviri null döndürdüyse (bilinmeyen kategori) yine içerik bazlı
      if (!primaryCategory) {
        primaryCategory = classifyByContent(rawTitle, rawHtml);
        console.log(`    🔍 İçerik bazlı (bilinmeyen WP kat): ${primaryCategory}`);
      }
    }

    // Öne çıkan görseli indir
    let imagePath = null;
    if (featuredImageUrl) {
      imagePath = await downloadImage(featuredImageUrl);
    }

    // HTML → Markdown çevir
    const markdownContent = htmlToMarkdown(rawHtml);

    // Gövdeden yazar bilgilerini çıkar ve temizle
    const authorExtracted = extractAuthorFromMarkdown(markdownContent);

    // Yazar: WP API "Klemens" döndürdüyse gövdeden çıkarılanı kullan
    const finalAuthorName =
      wpAuthor.name !== "Klemens"
        ? wpAuthor.name
        : (authorExtracted.name || "Klemens");
    const finalAuthorIg    = authorExtracted.ig    || wpAuthor.ig || null;
    const finalAuthorEmail = authorExtracted.email || null;

    // İçerikteki görselleri indir ve URL'leri güncelle
    let finalContent = authorExtracted.cleaned;
    const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
    const inlineImgUrls = [];
    let m;
    while ((m = imgRegex.exec(authorExtracted.cleaned)) !== null) {
      inlineImgUrls.push({ full: m[0], alt: m[1], url: m[2] });
    }
    for (const { full, alt, url } of inlineImgUrls) {
      const localPath = await downloadImage(url);
      if (localPath) {
        finalContent = finalContent.replace(full, `![${alt}](${localPath})`);
      }
      await sleep(100);
    }

    // Tarih
    const date = post.date ? post.date.slice(0, 10) : new Date().toISOString().slice(0, 10);

    // Açıklama: excerpt'ten al, ig/mail/boş linklerden arındır
    const description = makeDescription(post.excerpt?.rendered || rawHtml);

    // Frontmatter
    const frontmatter = buildFrontmatter({
      title: rawTitle,
      description,
      author: finalAuthorName,
      authorIg: finalAuthorIg,
      authorEmail: finalAuthorEmail,
      date,
      category: primaryCategory,
      tags: tags.length > 0 ? tags : [primaryCategory],
      image: imagePath || "/yazilar/placeholder.jpg",
      readTime: calcReadTime(finalContent),
      slug,
    });

    const fileContent = `${frontmatter}\n\n${finalContent}\n`;
    fs.writeFileSync(outPath, fileContent, "utf8");
    console.log(`    ✅ ${finalAuthorName}${finalAuthorIg ? " " + finalAuthorIg : ""} → ${slug}.md\n`);
    return { slug, status: "ok" };
  } catch (err) {
    console.error(`    ❌ Hata: ${err.message}\n`);
    return { slug, status: "error", error: err.message };
  }
}

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  Klemens WP → Markdown İmporter");
  console.log("═══════════════════════════════════════════\n");

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });

  let posts;
  try {
    posts = await fetchAllPosts();
  } catch (err) {
    console.error(`❌ WordPress'e bağlanılamadı: ${err.message}`);
    process.exit(1);
  }

  if (posts.length === 0) {
    console.log("ℹ️  Hiç yayınlanmış yazı bulunamadı.");
    process.exit(0);
  }

  const results = { ok: 0, skipped: 0, error: 0 };
  for (let i = 0; i < posts.length; i++) {
    const result = await processPost(posts[i], i, posts.length);
    results[result.status]++;
    await sleep(200);
  }

  console.log("═══════════════════════════════════════════");
  console.log("  Özet");
  console.log("═══════════════════════════════════════════");
  console.log(`  ✅ Başarılı  : ${results.ok}`);
  console.log(`  ⏭️  Atlandı  : ${results.skipped}`);
  console.log(`  ❌ Hatalı   : ${results.error}`);
  console.log(`  📝 Toplam   : ${posts.length}`);
  console.log("═══════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("Beklenmeyen hata:", err);
  process.exit(1);
});
