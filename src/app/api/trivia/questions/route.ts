import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "10"), 50);
  const difficulty = req.nextUrl.searchParams.get("difficulty");

  if (!category) {
    return NextResponse.json({ error: "category parameter required" }, { status: 400 });
  }

  const admin = createAdminClient();

  let query = admin
    .from("trivia_questions")
    .select("id, question, image_url, options, correct_answer, fun_fact, difficulty")
    .eq("category_slug", category);

  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Shuffle server-side and take `limit`
  const shuffled = (data ?? [])
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);

  return NextResponse.json({ questions: shuffled });
}
