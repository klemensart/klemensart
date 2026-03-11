import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    // Stats
    const { data: stats } = await supabase
      .from("map_user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Badges
    const { data: badges } = await supabase
      .from("map_badges")
      .select("badge_type, badge_key, badge_name, stars_earned, earned_at")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false });

    // Recent visits (last 20)
    const { data: visits } = await supabase
      .from("map_visits")
      .select("place_slug, place_name, place_type, visited_at")
      .eq("user_id", user.id)
      .order("visited_at", { ascending: false })
      .limit(20);

    // Visited slugs (all unique)
    const { data: allVisits } = await supabase
      .from("map_visits")
      .select("place_slug")
      .eq("user_id", user.id);

    const visitedSlugs = [...new Set((allVisits || []).map((v: { place_slug: string }) => v.place_slug))];

    // Today's visits
    const today = new Date().toISOString().slice(0, 10);
    const { data: todayVisits } = await supabase
      .from("map_visits")
      .select("place_slug")
      .eq("user_id", user.id)
      .eq("visited_date", today);

    const todaySlugs = (todayVisits || []).map((v: { place_slug: string }) => v.place_slug);

    // User reviews
    const { data: reviews } = await supabase
      .from("map_reviews")
      .select("place_slug, place_name, rating, review_text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      stats: stats || {
        total_visits: 0,
        total_stars: 0,
        total_badges: 0,
        total_routes_completed: 0,
        rank_name: "Meraklı",
      },
      badges: badges || [],
      visits: visits || [],
      visitedSlugs,
      todaySlugs,
      reviews: reviews || [],
    });
  } catch (err) {
    console.error("[harita/stats]", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
