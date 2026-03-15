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
  const search = req.nextUrl.searchParams.get("search")?.toLowerCase() ?? "";
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");

  // Fetch all users (Supabase auth admin API has no search filter)
  const { data: listData, error } = await admin.auth.admin.listUsers({
    page,
    perPage: 50,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const raw = listData as unknown as { users: Record<string, unknown>[]; total?: number };
  let users = raw.users ?? [];
  const total = raw.total ?? users.length;

  // Client-side search filter
  if (search) {
    users = users.filter((u) => {
      const email = (u.email as string || "").toLowerCase();
      const name = ((u.user_metadata as Record<string, unknown>)?.full_name as string || "").toLowerCase();
      return email.includes(search) || name.includes(search);
    });
  }

  // Fetch admin roles for all users in batch
  const userIds = users.map((u) => u.id as string);
  const { data: adminRows } = await admin
    .from("admins")
    .select("user_id, role")
    .in("user_id", userIds);

  const roleMap = new Map<string, string>();
  for (const row of adminRows ?? []) {
    roleMap.set(row.user_id, row.role ?? "admin");
  }

  // Fetch purchase counts per user
  const { data: purchaseRows } = await admin
    .from("purchases")
    .select("user_id")
    .in("user_id", userIds);

  const purchaseCountMap = new Map<string, number>();
  for (const row of purchaseRows ?? []) {
    purchaseCountMap.set(row.user_id, (purchaseCountMap.get(row.user_id) ?? 0) + 1);
  }

  const mapped = users.map((u) => {
    const meta = (u.user_metadata as Record<string, unknown>) ?? {};
    return {
      id: u.id,
      email: u.email ?? "",
      name: (meta.full_name as string) ?? (meta.name as string) ?? "",
      avatar: (meta.avatar_url as string) ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      role: roleMap.get(u.id as string) ?? null,
      purchase_count: purchaseCountMap.get(u.id as string) ?? 0,
    };
  });

  return NextResponse.json({ users: mapped, total });
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
  const { action } = body;

  if (action === "assign_workshop") {
    const { user_id, workshop_id, expires_at } = body;
    const { error } = await admin.from("purchases").insert({
      user_id,
      workshop_id,
      expires_at: expires_at || null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "assign_video") {
    const { user_id, single_video_id, expires_at } = body;
    const { error } = await admin.from("purchases").insert({
      user_id,
      single_video_id,
      expires_at: expires_at || null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "set_role") {
    const { user_id, role } = body;
    // admins tablosu email NOT NULL — auth'dan çek
    const { data: targetUser } = await admin.auth.admin.getUserById(user_id);
    const email = targetUser?.user?.email ?? null;
    if (!email) {
      return NextResponse.json({ error: "Kullanıcının e-posta adresi bulunamadı" }, { status: 400 });
    }
    const { error } = await admin
      .from("admins")
      .upsert({ user_id, role, email }, { onConflict: "user_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "remove_role") {
    const { user_id } = body;
    const { error } = await admin
      .from("admins")
      .delete()
      .eq("user_id", user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
