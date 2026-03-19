import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

export async function GET(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = Number(req.nextUrl.searchParams.get("days") || "30");
  const workshopId = req.nextUrl.searchParams.get("workshopId");
  const tab = req.nextUrl.searchParams.get("tab");

  const admin = createAdminClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // ─── Sayfa Ziyaretleri Tab ───
  if (tab === "pageviews") {
    const { data: pageViews } = await admin
      .from("user_events")
      .select("*")
      .eq("event_type", "page_view")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);

    const { data: pageLeaves } = await admin
      .from("user_events")
      .select("*")
      .eq("event_type", "page_leave")
      .gte("created_at", since)
      .limit(5000);

    const views = pageViews ?? [];
    const leaves = pageLeaves ?? [];

    // page_view_id → page_leave eşleştir
    const leaveMap = new Map<string, { duration_ms: number }>();
    for (const l of leaves) {
      const pvId = l.metadata?.page_view_id;
      if (pvId) leaveMap.set(pvId, { duration_ms: l.metadata.duration_ms ?? 0 });
    }

    // user_id → e-posta eşleştir
    const pvUserIds = new Set<string>();
    for (const v of views) {
      if (v.user_id) pvUserIds.add(v.user_id);
    }
    const pvUserEmails = new Map<string, string>();
    if (pvUserIds.size > 0) {
      const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
      for (const u of usersData?.users ?? []) {
        if (pvUserIds.has(u.id) && u.email) {
          pvUserEmails.set(u.id, u.email);
        }
      }
    }

    // Path bazlı agregasyon
    const pathStats = new Map<string, { views: number; uniqueIds: Set<string>; durations: number[] }>();
    for (const v of views) {
      const path = v.metadata?.path || "/";
      const pvId = v.metadata?.page_view_id;
      const uid = v.user_id || v.anonymous_id || "unknown";

      if (!pathStats.has(path)) {
        pathStats.set(path, { views: 0, uniqueIds: new Set(), durations: [] });
      }
      const stat = pathStats.get(path)!;
      stat.views++;
      stat.uniqueIds.add(uid);

      if (pvId && leaveMap.has(pvId)) {
        stat.durations.push(leaveMap.get(pvId)!.duration_ms);
      }
    }

    const topPages = [...pathStats.entries()]
      .map(([path, s]) => ({
        path,
        views: s.views,
        unique: s.uniqueIds.size,
        avg_duration_ms: s.durations.length > 0
          ? Math.round(s.durations.reduce((a, b) => a + b, 0) / s.durations.length)
          : null,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 50);

    // Toplam istatistikler
    const allUniqueIds = new Set<string>();
    for (const v of views) {
      allUniqueIds.add(v.user_id || v.anonymous_id || "unknown");
    }

    // Son 100 bireysel ziyaret
    const recentVisits = views.slice(0, 100).map((v) => {
      const pvId = v.metadata?.page_view_id;
      const leave = pvId ? leaveMap.get(pvId) : null;
      return {
        path: v.metadata?.path || "/",
        referrer: v.metadata?.referrer || null,
        user_id: v.user_id || v.anonymous_id || null,
        email: v.user_id ? pvUserEmails.get(v.user_id) || null : null,
        duration_ms: leave?.duration_ms ?? null,
        created_at: v.created_at,
      };
    });

    return NextResponse.json({
      totalViews: views.length,
      uniqueVisitors: allUniqueIds.size,
      topPages,
      recentVisits,
    });
  }

  let query = admin
    .from("user_events")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (workshopId) {
    query = query.eq("workshop_id", workshopId);
  }

  const { data: events } = await query;
  const allEvents = events ?? [];

  // Funnel counts
  const funnel = {
    workshop_view: 0,
    add_to_cart: 0,
    checkout_start: 0,
    checkout_complete: 0,
  };

  // Unique users per step (anonymous_id veya user_id)
  const uniqueSets: Record<string, Set<string>> = {
    workshop_view: new Set(),
    add_to_cart: new Set(),
    checkout_start: new Set(),
    checkout_complete: new Set(),
  };

  for (const e of allEvents) {
    const key = e.event_type as keyof typeof funnel;
    if (funnel[key] !== undefined) {
      funnel[key]++;
      const uid = e.user_id || e.anonymous_id || "unknown";
      uniqueSets[key].add(uid);
    }
  }

  const uniqueUsers = {
    workshop_view: uniqueSets.workshop_view.size,
    add_to_cart: uniqueSets.add_to_cart.size,
    checkout_start: uniqueSets.checkout_start.size,
    checkout_complete: uniqueSets.checkout_complete.size,
  };

  // workshop_id → title eşleştirmesi
  const workshopIds = new Set<string>();
  for (const e of allEvents) {
    if (e.workshop_id) workshopIds.add(e.workshop_id);
  }

  const workshopIdToTitle = new Map<string, string>();
  if (workshopIds.size > 0) {
    const { data: workshops } = await admin
      .from("workshops")
      .select("id, title")
      .in("id", [...workshopIds]);
    for (const w of workshops ?? []) {
      workshopIdToTitle.set(w.id, w.title);
    }
  }

  // user_id → e-posta eşleştirmesi
  const userIds = new Set<string>();
  for (const e of allEvents) {
    if (e.user_id) userIds.add(e.user_id);
  }

  const userIdToEmail = new Map<string, string>();
  if (userIds.size > 0) {
    const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of usersData?.users ?? []) {
      if (userIds.has(u.id) && u.email) {
        userIdToEmail.set(u.id, u.email);
      }
    }
  }

  // Son 50 kullanıcı yolculuğu
  const journeyMap = new Map<string, { id: string; events: typeof allEvents }>();
  for (const e of allEvents) {
    const uid = e.user_id || e.anonymous_id || "unknown";
    if (!journeyMap.has(uid)) {
      journeyMap.set(uid, { id: uid, events: [] });
    }
    journeyMap.get(uid)!.events.push(e);
  }

  const journeys = [...journeyMap.values()]
    .sort((a, b) => {
      const aTime = a.events[0]?.created_at ?? "";
      const bTime = b.events[0]?.created_at ?? "";
      return bTime.localeCompare(aTime);
    })
    .slice(0, 50)
    .map((j) => ({
      user_id: j.id,
      email: userIdToEmail.get(j.id) || null,
      steps: j.events
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((e) => ({
          event_type: e.event_type,
          workshop_slug: e.workshop_slug,
          workshop_title: (e.workshop_id && workshopIdToTitle.get(e.workshop_id)) || null,
          created_at: e.created_at,
        })),
    }));

  return NextResponse.json({ funnel, uniqueUsers, journeys });
}
