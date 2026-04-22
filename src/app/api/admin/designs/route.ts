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

  const admin = createAdminClient();
  const { searchParams } = new URL(req.url);
  const linkedEntityId = searchParams.get("linked_entity_id");

  let query = admin
    .from("designs")
    .select("id, name, platform, width, height, thumbnail_url, is_template, updated_at, created_at")
    .order("updated_at", { ascending: false });

  if (linkedEntityId) {
    query = query.eq("linked_entity_id", linkedEntityId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ designs: data ?? [] });
}

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const body = await req.json();

  const row = {
    name: body.name || "İsimsiz Tasarım",
    platform: body.platform || "instagram-post",
    width: body.width || 1080,
    height: body.height || 1080,
    canvas_data: body.canvas_data || {},
    thumbnail_url: body.thumbnail_url || null,
    is_template: body.is_template || false,
    created_by: user.id,
  };

  const { data, error } = await admin
    .from("designs")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
