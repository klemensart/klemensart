import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { slugify } from "@/lib/slugify";

async function checkAuth() {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) return null;
  return user;
}

// ── GET: Liste + counts ──────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "active";

  const [eventsRes, activeCount, draftCount, archivedCount] = await Promise.all([
    admin
      .from("marketplace_events")
      .select("*, host:people!host_id(id, name)")
      .eq("status", status)
      .order("event_date", { ascending: true }),
    admin.from("marketplace_events").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("marketplace_events").select("id", { count: "exact", head: true }).eq("status", "draft"),
    admin.from("marketplace_events").select("id", { count: "exact", head: true }).eq("status", "archived"),
  ]);

  return NextResponse.json({
    events: eventsRes.data ?? [],
    counts: {
      active: activeCount.count ?? 0,
      draft: draftCount.count ?? 0,
      archived: archivedCount.count ?? 0,
    },
  });
}

// ── POST: Yeni ekle ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, ...rest } = body as { title: string; [key: string]: unknown };

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = slugify(title);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("marketplace_events")
    .insert({ title, slug, ...rest })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}

// ── PATCH: Güncelle ──────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body as { id: string; [key: string]: unknown };

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // If title changed, regenerate slug
  if (typeof updates.title === "string") {
    updates.slug = slugify(updates.title as string);
  }
  updates.updated_at = new Date().toISOString();

  const admin = createAdminClient();
  const { error } = await admin.from("marketplace_events").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ── DELETE: Soft delete (archived) ───────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = (await req.json()) as { id: string };
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("marketplace_events")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
