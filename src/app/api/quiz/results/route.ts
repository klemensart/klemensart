import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { resolveSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { score, badge, time_seconds, mode, display_name, quiz_slug = "ronesans-quiz" } = body;

  if (typeof score !== "number" || !badge) {
    return NextResponse.json({ error: "score and badge required" }, { status: 400 });
  }

  // Try to get authenticated user
  let userId: string | null = null;
  let userName = display_name || "Anonim";

  try {
    const supabase = await resolveSupabaseClient(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      const meta = (user.user_metadata ?? {}) as Record<string, string>;
      userName = display_name || meta.full_name || meta.name || "Anonim";
    }
  } catch {
    // Not authenticated — continue as anonymous
  }

  const admin = createAdminClient();

  // Üye kullanıcılar: aynı quiz için sadece en iyi skoru sakla (upsert)
  if (userId) {
    const { data: existing } = await admin
      .from("quiz_results")
      .select("id, score, time_seconds")
      .eq("user_id", userId)
      .eq("quiz_slug", quiz_slug)
      .maybeSingle();

    if (existing) {
      // Sadece skor daha yüksekse veya aynı skorla daha hızlıysa güncelle
      const isBetter =
        score > existing.score ||
        (score === existing.score &&
          time_seconds != null &&
          (existing.time_seconds == null || time_seconds < existing.time_seconds));

      if (!isBetter) {
        return NextResponse.json({ id: existing.id, updated: false });
      }

      const { error } = await admin
        .from("quiz_results")
        .update({ score, badge, time_seconds: time_seconds ?? null, mode: mode || "normal", display_name: userName })
        .eq("id", existing.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ id: existing.id, updated: true });
    }
  }

  const { data, error } = await admin
    .from("quiz_results")
    .insert({
      user_id: userId,
      display_name: userName,
      quiz_slug,
      score,
      badge,
      time_seconds: time_seconds ?? null,
      mode: mode || "normal",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "ronesans-quiz";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "10"), 50);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("quiz_results")
    .select("display_name, score, badge, mode, time_seconds, created_at")
    .eq("quiz_slug", slug)
    .order("score", { ascending: false })
    .order("time_seconds", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ results: data ?? [] });
}
