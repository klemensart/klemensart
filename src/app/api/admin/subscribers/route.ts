import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

async function checkAdmin() {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) return null;
  return user;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, count, error } = await admin
    .from("subscribers")
    .select("*", { count: "exact" })
    .order("subscribed_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: `Veritabanı hatası: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    subscribers: data ?? [],
    total: count ?? 0,
  });
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, is_active } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id gerekli." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("subscribers")
    .update({ is_active })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: `Güncelleme hatası: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id gerekli." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("subscribers").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: `Silme hatası: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
