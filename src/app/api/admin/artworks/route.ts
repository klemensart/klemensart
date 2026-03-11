import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const museum = searchParams.get("museum") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const admin = createAdminClient();
  let query = admin
    .from("artworks")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (museum) {
    query = query.eq("museum", museum);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: `Veritabanı hatası: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    artworks: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}

export async function DELETE(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id gerekli." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("artworks").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: `Silme hatası: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
