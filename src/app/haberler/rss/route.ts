import { createAdminClient } from "@/lib/supabase-admin";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = createAdminClient();

  // 1. Haberler (news_items)
  const { data: newsItems } = await supabase
    .from("news_items")
    .select("title, summary, url, image_url, source_name, published_at, slug")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(40);

  // 2. Kendi yazılarımız (articles) — published olanlar
  const { data: articles } = await supabase
    .from("articles")
    .select("title, description, image, author, date, slug")
    .eq("status", "published")
    .order("date", { ascending: false })
    .limit(20);

  const now = new Date().toUTCString();

  // Haberleri RSS item'a dönüştür
  type RssItem = { title: string; link: string; description: string; pubDate: string; source: string; image: string | null };

  const newsRss: RssItem[] = (newsItems ?? []).map((item) => ({
    title: item.title,
    link: `https://klemensart.com/haberler/${item.slug}`,
    description: item.summary || "",
    pubDate: item.published_at ? new Date(item.published_at).toUTCString() : now,
    source: item.source_name || "Klemens Art",
    image: item.image_url,
  }));

  // Yazıları RSS item'a dönüştür
  const articleRss: RssItem[] = (articles ?? []).map((item) => ({
    title: item.title,
    link: `https://klemensart.com/icerikler/yazi/${item.slug}`,
    description: item.description || "",
    pubDate: item.date ? new Date(item.date).toUTCString() : now,
    source: item.author || "Klemens Art",
    image: item.image,
  }));

  // Birleştir ve tarihe göre sırala
  const allItems = [...newsRss, ...articleRss]
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 50);

  const rssItems = allItems
    .map((item) => {
      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <source url="https://klemensart.com">${escapeXml(item.source)}</source>${item.image ? `\n      <enclosure url="${escapeXml(item.image)}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Klemens Art — Kültür Sanat Haberleri</title>
    <link>https://klemensart.com/haberler</link>
    <description>Türkiye ve dünyadan güncel kültür, sanat, sergi, müze, sinema ve edebiyat haberleri.</description>
    <language>tr</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://klemensart.com/haberler/rss" rel="self" type="application/rss+xml" />
    <image>
      <url>https://klemensart.com/logos/logo-wide-dark.PNG</url>
      <title>Klemens Art</title>
      <link>https://klemensart.com</link>
    </image>
${rssItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
