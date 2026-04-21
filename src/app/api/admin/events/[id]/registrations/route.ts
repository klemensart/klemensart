import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

type Ctx = { params: Promise<{ id: string }> };

// GET: Kayıt listesi
export async function GET(req: NextRequest, ctx: Ctx) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await ctx.params;
  const admin = createAdminClient();

  const [eventRes, regsRes] = await Promise.all([
    admin.from("events").select("id,title,event_date,venue,capacity,slug").eq("id", eventId).single(),
    admin
      .from("event_registrations")
      .select("id,name,email,phone,note,status,registered_at,cancelled_at")
      .eq("event_id", eventId)
      .order("registered_at", { ascending: true }),
  ]);

  if (eventRes.error) {
    return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 404 });
  }

  const regs = regsRes.data ?? [];
  const confirmed = regs.filter((r) => r.status === "confirmed").length;
  const cancelled = regs.filter((r) => r.status === "cancelled").length;

  return NextResponse.json({
    event: eventRes.data,
    registrations: regs,
    counts: { total: regs.length, confirmed, cancelled },
  });
}

// PATCH: Kayıt iptal et (admin)
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await ctx.params;
  const { registrationId, action } = (await req.json()) as {
    registrationId: string;
    action: "cancel" | "confirm";
  };

  if (!registrationId) {
    return NextResponse.json({ error: "registrationId gerekli" }, { status: 400 });
  }

  const admin = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (action === "cancel") {
    updates.status = "cancelled";
    updates.cancelled_at = new Date().toISOString();
  } else if (action === "confirm") {
    updates.status = "confirmed";
    updates.cancelled_at = null;
  }

  const { error } = await admin
    .from("event_registrations")
    .update(updates)
    .eq("id", registrationId)
    .eq("event_id", eventId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
