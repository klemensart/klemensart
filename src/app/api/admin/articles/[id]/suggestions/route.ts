import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin, getAdminRole } from "@/lib/admin-check";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const status = req.nextUrl.searchParams.get("status");
  const admin = createAdminClient();

  let query = admin
    .from("article_suggestions")
    .select("*")
    .eq("article_id", id)
    .order("created_at", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestions: data });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const role = await getAdminRole(user.id);
  const body = await req.json();

  if (!body.original_text || !body.suggested_text) {
    return NextResponse.json(
      { error: "original_text ve suggested_text gerekli" },
      { status: 400 }
    );
  }

  // Kullanıcı adını admins tablosundan al
  const adminClient = createAdminClient();
  const { data: adminRow } = await adminClient
    .from("admins")
    .select("name")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data, error } = await adminClient
    .from("article_suggestions")
    .insert({
      article_id: id,
      original_text: body.original_text,
      suggested_text: body.suggested_text,
      context_before: body.context_before ?? "",
      context_after: body.context_after ?? "",
      created_by: user.id,
      created_by_name: adminRow?.name ?? user.email ?? "",
      created_by_role: role ?? "editor",
      note: body.note ?? "",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestion: data }, { status: 201 });
}
