import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { slugify } from "@/lib/slugify";

type RouteContext = { params: Promise<{ id: string }> };

async function checkAuth() {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) return null;
  return user;
}

// ── GET: Tek host detay ───────────────────────────────────────────────────────
export async function GET(_req: NextRequest, ctx: RouteContext) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const admin = createAdminClient();

  const { data: person, error } = await admin
    .from("people")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !person) {
    return NextResponse.json({ error: "Kişi bulunamadı" }, { status: 404 });
  }

  // Get workshop count
  const { count } = await admin
    .from("marketplace_events")
    .select("id", { count: "exact", head: true })
    .eq("host_id", id)
    .eq("status", "active");

  return NextResponse.json({
    person: { ...person, workshop_count: count ?? 0 },
  });
}

// ── PATCH: Host güncelle ──────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();
  const admin = createAdminClient();

  // Validate name if provided
  if (body.name !== undefined && (!body.name || body.name.trim().length < 2)) {
    return NextResponse.json(
      { error: "Ad Soyad en az 2 karakter olmalı" },
      { status: 400 }
    );
  }

  // Slug uniqueness check if slug is being changed
  if (body.slug) {
    const newSlug = slugify(body.slug);
    const { data: existing } = await admin
      .from("people")
      .select("id")
      .eq("slug", newSlug)
      .neq("id", id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: `"${newSlug}" slug'ı zaten kullanılıyor` },
        { status: 409 }
      );
    }
    body.slug = newSlug;
  }

  // Handle phone in metadata
  if (body.phone !== undefined) {
    const { data: current } = await admin
      .from("people")
      .select("metadata")
      .eq("id", id)
      .single();
    body.metadata = { ...(current?.metadata || {}), phone: body.phone || null };
    delete body.phone;
  }

  // Remove workshop_count if accidentally sent
  delete body.workshop_count;

  const { data: person, error } = await admin
    .from("people")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ person });
}

// ── DELETE: Host sil ──────────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const admin = createAdminClient();

  // Check if host has workshops
  const { count } = await admin
    .from("marketplace_events")
    .select("id", { count: "exact", head: true })
    .eq("host_id", id);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `Bu host'un ${count} atölyesi var. Önce atölyeleri arşivle veya başka host'a taşı.`,
      },
      { status: 409 }
    );
  }

  const { error } = await admin.from("people").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
