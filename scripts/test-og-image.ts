import * as cheerio from "cheerio";

async function test() {
  const url = "https://sanatatak.com/modern_%C3%A7a%C4%9Fda%C5%9F/banksynin-maskesi-dustu-mu/";
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
    signal: AbortSignal.timeout(8000),
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // OG image
  const og = $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content") || null;
  console.log("OG image:", og);

  // Fallback selectors
  const selectors = ["article img", ".entry-content img", ".post-content img", "main img", ".content img"];
  for (const sel of selectors) {
    const el = $(sel).first();
    const src = el.attr("src") || el.attr("data-src");
    console.log(`${sel} -> ${src || "YOK"}`);
  }

  // Tum img etiketleri (logo/icon/avatar haric)
  console.log("\nTum content img etiketleri:");
  $("img").each((_i, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    const isSkip = src.includes("logo") || src.includes("icon") || src.includes("avatar") || src.includes("data:image") || src === "";
    if (isSkip) return;
    console.log("  ", src.substring(0, 150));
  });
}
test();
