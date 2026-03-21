import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const admin = createAdminClient();

  const { data: categories, error: catErr } = await admin
    .from("trivia_categories")
    .select("slug, title, description, icon_emoji, color")
    .eq("is_active", true)
    .order("created_at");

  if (catErr) return NextResponse.json({ error: catErr.message }, { status: 500 });

  // Get question counts per category
  const { data: counts, error: cntErr } = await admin
    .from("trivia_questions")
    .select("category_slug");

  if (cntErr) return NextResponse.json({ error: cntErr.message }, { status: 500 });

  const countMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    countMap[row.category_slug] = (countMap[row.category_slug] || 0) + 1;
  }

  const result = (categories ?? []).map((c) => ({
    ...c,
    question_count: countMap[c.slug] || 0,
  }));

  return NextResponse.json({ categories: result });
}
