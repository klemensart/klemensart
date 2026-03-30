import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// GET: returns like counts for articles
// ?slugs=slug1,slug2  → specific slugs
// ?top=6              → top N slugs by like count
export async function GET(req: NextRequest) {
  const admin = createAdminClient();
  const slugsParam = req.nextUrl.searchParams.get("slugs");
  const topParam = req.nextUrl.searchParams.get("top");

  // Fetch all likes and count per slug
  const { data: allLikes } = await admin
    .from("article_likes")
    .select("article_slug");

  const likeCounts: Record<string, number> = {};
  if (allLikes) {
    for (const row of allLikes) {
      likeCounts[row.article_slug] = (likeCounts[row.article_slug] || 0) + 1;
    }
  }

  if (slugsParam) {
    const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const result: Record<string, { likes: number }> = {};
    for (const slug of slugs) {
      result[slug] = { likes: likeCounts[slug] || 0 };
    }
    return NextResponse.json(result);
  }

  if (topParam) {
    const n = Math.min(parseInt(topParam) || 6, 20);
    const sorted = Object.entries(likeCounts)
      .map(([slug, likes]) => ({ slug, likes }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, n);
    return NextResponse.json(sorted);
  }

  return NextResponse.json(likeCounts);
}
