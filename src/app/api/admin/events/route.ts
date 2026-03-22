import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

// ── GET: Etkinlik listesi + sayıları (service-role ile RLS bypass) ──────────
export async function GET(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";

  // Paralel: etkinlikleri çek + her status için count
  const [eventsRes, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    admin
      .from("events")
      .select("*")
      .eq("status", status)
      .order("event_date", { ascending: true }),
    admin.from("events").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("events").select("id", { count: "exact", head: true }).eq("status", "approved"),
    admin.from("events").select("id", { count: "exact", head: true }).eq("status", "rejected"),
  ]);

  return NextResponse.json({
    events: eventsRes.data ?? [],
    counts: {
      pending: pendingCount.count ?? 0,
      approved: approvedCount.count ?? 0,
      rejected: rejectedCount.count ?? 0,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  const body = await req.json();
  const { id, action, ai_comment } = body as {
    id: string;
    action?: "approve" | "reject" | "pending";
    ai_comment?: string;
  };

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // 3. Build update payload
  const updates: Record<string, unknown> = {};
  if (action === "approve") {
    updates.status = "approved";
    updates.verification_note = null;
  } else if (action === "reject") updates.status = "rejected";
  else if (action === "pending") updates.status = "pending";
  if (ai_comment !== undefined) updates.ai_comment = ai_comment;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // 4. Write via service-role client (bypasses RLS)
  const admin = createAdminClient();
  const { error } = await admin.from("events").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
