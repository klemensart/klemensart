/**
 * wp-fetch-content.js
 * Boş body'li .md dosyalarını klemensart.com'dan çekerek doldurur.
 * Kullanım:
 *   node scripts/wp-fetch-content.js          → sadece ilk boş dosyayı test eder (dry-run)
 *   node scripts/wp-fetch-content.js --all    → tüm boş dosyaları günceller
 *   node scripts/wp-fetch-content.js --slug <slug> → tek bir slug'ı günceller
 */

const fs   = require("fs");
const path = require("path");
const matter = require("gray-matter");
const TurndownService = require("turndown");
const cheerio = require("cheerio");

const CONTENT_DIR = path.join(process.cwd(), "src/content/icerikler");
const BASE_URL    = "https://klemensart.com";
const DRY_RUN     = !process.argv.includes("--all") && !process.argv.includes("--slug");
const SINGLE_SLUG = (() => {
  const i = process.argv.indexOf("--slug");
  return i !== -1 ? process.argv[i + 1] : null;
})();

// ── Turndown yapılandırması ───────────────────────────────────────────────────
const td = new TurndownService({
  headingStyle:   "atx",
  hr:             "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

// Gereksiz elementleri yoksay
td.remove([
  "script", "style", "nav", "header", "footer",
  "aside", ".sharedaddy", ".share-this", ".post-navigation",
  ".comments-area", ".wp-block-separator",
]);

// ── WordPress artifaktlarını temizle ─────────────────────────────────────────
function cleanWordPress(html) {
  return html
    // Shortcode'ları sil ([vc_row], [vc_column], [vc_column_text] vb.)
    .replace(/\[\/?\w[\w\s="']*\]/g, "")
    // Inline style attr'larını sil
    .replace(/\s*style="[^"]*"/gi, "")
    // class attr'larını sil
    .replace(/\s*class="[^"]*"/gi, "")
    // WP data attr'larını sil
    .replace(/\s*data-[\w-]+="[^"]*"/gi, "")
    // Boş <p> ve <div> taglarını kaldır
    .replace(/<(p|div)[^>]*>\s*<\/\1>/gi, "")
    // &nbsp; → normal boşluk
    .replace(/&nbsp;/gi, " ")
    // ​ (zero-width space) temizle
    .replace(/\u200b/g, "");
}

// ── DOM: post footer'ını kes (paylaş + bülten) ───────────────────────────────
function removePostFooter($, el) {
  // "BU YAZIYI PAYLAŞ" veya "Klemens Art Bülten" başlığından itibaren sil
  const cutMarkers = ["BU YAZIYI PAYLAŞ", "PAYLAŞ", "Klemens Art Bülten", "Bültene abone"];
  el.find("h1,h2,h3,h4,h5,hr").each((_, node) => {
    const text = $(node).text().trim().toUpperCase();
    if (cutMarkers.some(m => text.includes(m.toUpperCase()))) {
      // Bu node ve tüm sonraki kardeşleri sil
      $(node).nextAll().remove();
      $(node).remove();
    }
  });
  // Son <hr> varsa onu da temizle
  el.find("hr").last().remove();
}

// ── DOM: Nitro placeholder görsellerini sil ───────────────────────────────────
function removeNitroImages($, el) {
  el.find("img").each((_, img) => {
    const src = $(img).attr("src") || "";
    if (src.startsWith("data:image/svg+xml;nitro-") || src.startsWith("data:image/svg+xml;base64")) {
      $(img).remove();
    }
  });
}

// ── Markdown sonrası temizlik ─────────────────────────────────────────────────
function cleanMarkdown(md) {
  return md
    // 3'ten fazla ardışık boş satırı 2'ye indir
    .replace(/\n{4,}/g, "\n\n\n")
    // Satır başı ve sonundaki gereksiz boşlukları temizle
    .split("\n").map(l => l.trimEnd()).join("\n")
    // Dosya başı/sonu whitespace
    .trim();
}

// ── Ana içeriği bul ───────────────────────────────────────────────────────────
function extractContent($) {
  // Klemens WordPress teması: FlowNews + WPBakery
  // Öncelik sırası
  const selectors = [
    ".post-text",          // FlowNews: asıl post gövdesi
    ".text-content",       // alternatif alias
    "article .entry-content",
    ".entry-content",
    ".post-content",
    ".wpb-content-wrapper",
    "article",
    "main",
  ];
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 100) {
      // İçeriden gereksiz bölümleri temizle
      el.find([
        // Okuma modu / gece modu araç çubuğu
        "#klemens-toolbar-wrapper", "#zen-modu-tetikleyici", "#gece-modu-tetikleyici",
        "#reading-mode-toggle", ".reading-mode-toggle", ".night-mode-toggle",
        // Sosyal paylaşım
        ".social-post", ".sharedaddy", "[class*='share']",
        // Yazı navigasyonu (önceki/sonraki yazı)
        ".navigation-post", ".nav-links", ".post-navigation",
        // Reklam kutuları
        ".flownews_advertisement_content_banner", "[class*='advertisement']",
        // Yorum alanı
        ".comments-area",
        // WPBakery sütun ayırıcılar
        ".vc_separator", ".wp-block-separator",
      ].join(", ")).remove();

      // Yazar kutusu: sadece e-posta / Instagram içeren kısa <p> veya ilk wpb_text_column
      // Genellikle form: "İsim Soyisim @handle mail@domain"
      el.find(".wpb_text_column").each((i, el2) => {
        const text = $(el2).text().trim();
        // Kısa + mail içeriyor → yazar kutusu
        if (text.length < 120 && /@|\bmail\b/i.test(text)) {
          $(el2).remove();
        }
      });

      return el;
    }
  }
  return null;
}

// ── Tek dosyayı işle ─────────────────────────────────────────────────────────
async function processSlug(slug, filePath, dryRun = false) {
  const url = `${BASE_URL}/${slug}`;
  console.log(`\n📥  Fetching: ${url}`);

  let html;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensImporter/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error(`  ✗ HTTP ${res.status} — atlanıyor`);
      return false;
    }
    html = await res.text();
  } catch (err) {
    console.error(`  ✗ Fetch hatası: ${err.message}`);
    return false;
  }

  const $ = cheerio.load(html);
  const contentEl = extractContent($);

  if (!contentEl) {
    console.error("  ✗ İçerik alanı bulunamadı");
    return false;
  }

  // Gereksiz iç elementleri çıkar
  contentEl.find("script, style, .sharedaddy, .share-this, .post-navigation, .wp-block-buttons, .wp-block-separator, .comments-area, [class*='share'], [class*='related']").remove();

  // Post footer'ını kes (paylaş + bülten bölümleri)
  removePostFooter($, contentEl);

  // Nitro placeholder görsellerini kaldır
  removeNitroImages($, contentEl);

  const rawHtml   = cleanWordPress(contentEl.html() || "");
  const markdown  = cleanMarkdown(td.turndown(rawHtml));

  if (markdown.length < 100) {
    console.error(`  ✗ Çekilen içerik çok kısa (${markdown.length} karakter) — atlanıyor`);
    return false;
  }

  console.log(`  ✓ ${markdown.length} karakter markdown elde edildi`);

  if (dryRun) {
    console.log("\n─── DRY-RUN ÖNIZLEME (ilk 1500 karakter) ─────────────────────────────");
    console.log(markdown.slice(0, 1500));
    if (markdown.length > 1500) console.log(`\n  ... (+${markdown.length - 1500} karakter daha)`);
    console.log("───────────────────────────────────────────────────────────────────────\n");
    console.log("  → Dosya YAZILMADI (dry-run). Tümünü güncellemek için: node scripts/wp-fetch-content.js --all");
    return true;
  }

  // Dosyayı güncelle: frontmatter koru, body'yi değiştir
  const raw             = fs.readFileSync(filePath, "utf8");
  const { data }        = matter(raw);
  const newContent      = matter.stringify(markdown + "\n", data);
  fs.writeFileSync(filePath, newContent, "utf8");
  console.log(`  ✓ Yazıldı: ${filePath}`);
  return true;
}

// ── Boş dosyaları bul ────────────────────────────────────────────────────────
function findEmptyFiles() {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith(".md"))
    .map(f => {
      const fp  = path.join(CONTENT_DIR, f);
      const raw = fs.readFileSync(fp, "utf8");
      const { data, content } = matter(raw);
      return { file: f, filePath: fp, slug: data.slug || f.replace(".md", ""), bodyLen: content.trim().length };
    })
    .filter(x => x.bodyLen < 50);
}

// ── Ana akış ─────────────────────────────────────────────────────────────────
(async () => {
  const empty = findEmptyFiles();
  console.log(`\n🔍  Boş dosya sayısı: ${empty.length}`);

  if (SINGLE_SLUG) {
    const target = empty.find(x => x.slug === SINGLE_SLUG);
    if (!target) {
      console.error(`  ✗ "${SINGLE_SLUG}" slug'ı boş dosyalar arasında bulunamadı.`);
      process.exit(1);
    }
    await processSlug(target.slug, target.filePath, false);
    return;
  }

  if (DRY_RUN) {
    // Sadece ilk dosyayla test
    const first = empty[0];
    console.log(`\n🧪  TEST — "${first.slug}" (dry-run, dosya yazılmayacak)`);
    await processSlug(first.slug, first.filePath, true);
    return;
  }

  // --all: tüm boş dosyaları sırayla işle
  let ok = 0, fail = 0;
  for (const item of empty) {
    const success = await processSlug(item.slug, item.filePath, false);
    if (success) ok++; else fail++;
    // Rate-limit: sunucuyu yormamak için küçük bekleme
    await new Promise(r => setTimeout(r, 800));
  }
  console.log(`\n✅  Tamamlandı: ${ok} başarılı, ${fail} başarısız`);
})();
