import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin, getAdminRole } from "@/lib/admin-check";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; suggestionId: string }> }
) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { suggestionId } = await params;
  const body = await req.json();

  if (!body.status || !["accepted", "rejected"].includes(body.status)) {
    return NextResponse.json(
      { error: "status 'accepted' veya 'rejected' olmalı" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("article_suggestions")
    .update({
      status: body.status,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", suggestionId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestion: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; suggestionId: string }> }
) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { suggestionId } = await params;
  const admin = createAdminClient();

  // Sadece oluşturan kişi veya admin silebilir
  const { data: suggestion } = await admin
    .from("article_suggestions")
    .select("created_by")
    .eq("id", suggestionId)
    .maybeSingle();

  if (!suggestion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const role = await getAdminRole(user.id);
  if (suggestion.created_by !== user.id && role !== "admin") {
    return NextResponse.json(
      { error: "Silme yetkisi yok" },
      { status: 403 }
    );
  }

  const { error } = await admin
    .from("article_suggestions")
    .delete()
    .eq("id", suggestionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
