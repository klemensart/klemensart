import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const placeSlug = url.searchParams.get("place_slug");
    if (!placeSlug) {
      return NextResponse.json({ error: "place_slug gerekli" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Get visible reviews
    const { data: reviews } = await supabase
      .from("map_reviews")
      .select("id, rating, review_text, user_display_name, created_at")
      .eq("place_slug", placeSlug)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(5);

    const items = reviews || [];
    const avg = items.length > 0
      ? items.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / items.length
      : 0;

    return NextResponse.json({
      avg: Math.round(avg * 10) / 10,
      count: items.length,
      items,
    });
  } catch (err) {
    console.error("[harita/reviews GET]", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const body = await req.json();
    const { place_slug, place_name, rating, review_text } = body as {
      place_slug: string;
      place_name: string;
      rating: number;
      review_text?: string;
    };

    if (!place_slug || !place_name || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Geçersiz parametreler" }, { status: 400 });
    }

    if (review_text && review_text.length > 280) {
      return NextResponse.json({ error: "Yorum en fazla 280 karakter olabilir" }, { status: 400 });
    }

    // Check user has 5+ stars
    const { data: stats } = await supabase
      .from("map_user_stats")
      .select("total_stars")
      .eq("user_id", user.id)
      .single();

    if (!stats || stats.total_stars < 5) {
      return NextResponse.json({ error: "Yorum yapmak için en az 5 yıldızınız olmalı" }, { status: 403 });
    }

    // Check user has visited this place
    const { data: visited } = await supabase
      .from("map_visits")
      .select("id")
      .eq("user_id", user.id)
      .eq("place_slug", place_slug)
      .limit(1);

    if (!visited || visited.length === 0) {
      return NextResponse.json({ error: "Bu mekana önce check-in yapmalısınız" }, { status: 403 });
    }

    // Display name from email
    const displayName = user.user_metadata?.full_name
      || user.email?.split("@")[0]
      || "Anonim";

    // Upsert review
    const { error } = await supabase
      .from("map_reviews")
      .upsert({
        user_id: user.id,
        place_slug,
        place_name,
        rating,
        review_text: review_text || null,
        user_display_name: displayName,
        is_visible: true,
      }, { onConflict: "user_id,place_slug" });

    if (error) {
      console.error("[harita/reviews POST]", error);
      return NextResponse.json({ error: "Yorum kaydedilemedi" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[harita/reviews POST]", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
