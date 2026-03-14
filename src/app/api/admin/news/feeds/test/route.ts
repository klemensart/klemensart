import { NextRequest, NextResponse } from "next/server";
import RSSParser from "rss-parser";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-check";

const parser = new RSSParser({
  timeout: 15_000,
  headers: { "User-Agent": "KlemensArt/1.0 (+https://klemensart.com)" },
});

// ── POST: Feed URL test et → önizleme ──────────────────────────────────────
export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { url } = body as { url?: string };

  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  try {
    const feed = await parser.parseURL(url);
    const preview = (feed.items ?? []).slice(0, 5).map((item) => ({
      title: item.title ?? "Başlıksız",
      link: item.link ?? null,
      pubDate: item.isoDate || item.pubDate || null,
    }));

    return NextResponse.json({
      success: true,
      feedTitle: feed.title ?? null,
      itemCount: feed.items?.length ?? 0,
      preview,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 422 }
    );
  }
}
