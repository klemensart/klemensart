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

  // Google News sitemap: son 48 saatteki haberler
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: items } = await supabase
    .from("news_items")
    .select("slug, title, published_at")
    .in("status", ["published", "archived"])
    .gte("published_at", twoDaysAgo)
    .order("published_at", { ascending: false });

  const entries = (items ?? [])
    .map((item) => {
      const pubDate = item.published_at
        ? new Date(item.published_at).toISOString()
        : new Date().toISOString();

      return `  <url>
    <loc>https://klemensart.com/haberler/${escapeXml(item.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Klemens Art</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(item.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
