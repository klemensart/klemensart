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

  const { data: items } = await supabase
    .from("news_items")
    .select("title, summary, url, image_url, source_name, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const now = new Date().toUTCString();

  const rssItems = (items ?? [])
    .map((item) => {
      const link = item.url || "https://klemensart.com/haberler";
      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(item.summary || "")}</description>
      <pubDate>${item.published_at ? new Date(item.published_at).toUTCString() : now}</pubDate>
      <source url="https://klemensart.com/haberler">${escapeXml(item.source_name || "Klemens Art")}</source>${item.image_url ? `\n      <enclosure url="${escapeXml(item.image_url)}" type="image/jpeg" />` : ""}
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
