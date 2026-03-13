import { NextRequest, NextResponse } from "next/server";
import { resolveSupabaseClient } from "@/lib/supabase-server";
import {
  placeSlug, haversineDistance, findPlaceBySlug, getRank,
  checkRouteCompletion, checkCategoryBadges, checkMilestones,
  CHECK_IN_RADIUS, BADGE_DEFS,
} from "@/lib/harita-gamification";

export async function POST(req: NextRequest) {
  try {
    const supabase = await resolveSupabaseClient(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const body = await req.json();
    const { place_slug: reqSlug, user_lat, user_lng, place_name, place_lat, place_lng, place_type, route_id } = body as {
      place_slug: string;
      user_lat: number;
      user_lng: number;
      place_name?: string;
      place_lat?: number;
      place_lng?: number;
      place_type?: string;
      route_id?: number;
    };

    if (!reqSlug || user_lat == null || user_lng == null) {
      return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
    }

    // Try to find in PLACES first, fall back to provided data (route stops)
    const knownPlace = findPlaceBySlug(reqSlug);
    const pName = knownPlace?.name ?? place_name ?? reqSlug;
    const pLat = knownPlace?.lat ?? place_lat;
    const pLng = knownPlace?.lng ?? place_lng;
    const pType = knownPlace?.type ?? place_type ?? "rota";

    if (pLat == null || pLng == null) {
      return NextResponse.json({ error: "Mekan koordinatları bulunamadı" }, { status: 404 });
    }

    // GPS distance check
    const dist = haversineDistance(user_lat, user_lng, pLat, pLng);
    if (dist > CHECK_IN_RADIUS) {
      return NextResponse.json({
        error: "Mekana yaklaşın",
        distance: Math.round(dist),
      }, { status: 400 });
    }

    // Check daily duplicate
    const today = new Date().toISOString().slice(0, 10);
    const slug = placeSlug(pName);
    const { data: existing } = await supabase
      .from("map_visits")
      .select("id")
      .eq("user_id", user.id)
      .eq("place_slug", slug)
      .eq("visited_date", today)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Bugün zaten ziyaret ettiniz", already: true }, { status: 409 });
    }

    // Insert visit
    await supabase.from("map_visits").insert({
      user_id: user.id,
      place_slug: slug,
      place_name: pName,
      place_type: pType,
      route_id: route_id ?? null,
      lat: pLat,
      lng: pLng,
      visited_date: today,
    });

    // Gather all visited slugs for this user
    const { data: allVisits } = await supabase
      .from("map_visits")
      .select("place_slug")
      .eq("user_id", user.id);

    const visitedSlugs = new Set((allVisits || []).map((v: { place_slug: string }) => v.place_slug));
    const totalVisits = visitedSlugs.size;

    // Get existing badges
    const { data: existingBadges } = await supabase
      .from("map_badges")
      .select("badge_key")
      .eq("user_id", user.id);
    const existingKeys = new Set((existingBadges || []).map((b: { badge_key: string }) => b.badge_key));

    // Check new badges
    let starsEarned = BADGE_DEFS.visit.stars; // 1 star for visit
    const newBadges: { badge_type: string; badge_key: string; badge_name: string; stars_earned: number }[] = [];

    // Visit badge
    const visitBadgeKey = `visit_${slug}`;
    if (!existingKeys.has(visitBadgeKey)) {
      newBadges.push({
        badge_type: "visit",
        badge_key: visitBadgeKey,
        badge_name: pName,
        stars_earned: BADGE_DEFS.visit.stars,
      });
    }

    // Route completion
    const completedRoutes = checkRouteCompletion(visitedSlugs);
    for (const r of completedRoutes) {
      if (!existingKeys.has(r.badgeKey)) {
        newBadges.push({
          badge_type: "route_complete",
          badge_key: r.badgeKey,
          badge_name: r.routeTitle,
          stars_earned: BADGE_DEFS.route_complete.stars,
        });
        starsEarned += BADGE_DEFS.route_complete.stars;
      }
    }

    // Category badges
    const categoryBadges = checkCategoryBadges(visitedSlugs);
    for (const c of categoryBadges) {
      if (!existingKeys.has(c.badgeKey)) {
        newBadges.push({
          badge_type: "category",
          badge_key: c.badgeKey,
          badge_name: c.badgeName,
          stars_earned: BADGE_DEFS.category.stars,
        });
        starsEarned += BADGE_DEFS.category.stars;
      }
    }

    // Milestones
    const milestones = checkMilestones(totalVisits);
    for (const m of milestones) {
      if (!existingKeys.has(m.badgeKey)) {
        newBadges.push({
          badge_type: "milestone",
          badge_key: m.badgeKey,
          badge_name: `${m.milestone} Ziyaret`,
          stars_earned: m.stars,
        });
        starsEarned += m.stars;
      }
    }

    // Insert new badges
    if (newBadges.length > 0) {
      await supabase.from("map_badges").insert(
        newBadges.map((b) => ({ user_id: user.id, ...b })),
      );
    }

    // Upsert user stats
    const { data: currentStats } = await supabase
      .from("map_user_stats")
      .select("total_stars")
      .eq("user_id", user.id)
      .single();

    const prevStars = currentStats?.total_stars ?? 0;
    const totalStars = prevStars + starsEarned;
    const rank = getRank(totalStars);
    const totalBadges = (existingKeys.size) + newBadges.length;
    const routesCompleted = completedRoutes.length;

    await supabase.from("map_user_stats").upsert({
      user_id: user.id,
      total_visits: totalVisits,
      total_stars: totalStars,
      total_badges: totalBadges,
      total_routes_completed: routesCompleted,
      rank_name: rank.name,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      stars_earned: starsEarned,
      new_badges: newBadges.map((b) => ({
        type: b.badge_type,
        name: b.badge_name,
        stars: b.stars_earned,
      })),
      total_stars: totalStars,
      rank: rank.name,
      rank_icon: rank.icon,
      route_completed: completedRoutes.filter(r => !existingKeys.has(r.badgeKey)).length > 0,
    });
  } catch (err) {
    console.error("[check-in]", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
