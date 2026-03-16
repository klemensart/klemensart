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

  const admin = createAdminClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

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
          created_at: e.created_at,
        })),
    }));

  return NextResponse.json({ funnel, uniqueUsers, journeys });
}
