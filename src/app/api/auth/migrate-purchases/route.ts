import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  // 1. Oturum kontrolü — gerçek kullanıcıyı al
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Admin client ile aynı email'e sahip başka kullanıcı ara
  const admin = createAdminClient();
  const {
    data: { users },
    error: listErr,
  } = await admin.auth.admin.listUsers();

  if (listErr) {
    return NextResponse.json(
      { error: "Kullanıcı listesi alınamadı" },
      { status: 500 }
    );
  }

  // Aynı email, farklı id
  const oldUser = users.find(
    (u) => u.email === user.email && u.id !== user.id
  );

  if (!oldUser) {
    return NextResponse.json({ migrated: 0 });
  }

  // 3. purchases tablosunda eski user_id → yeni user_id
  const { data, error: updateErr } = await admin
    .from("purchases")
    .update({ user_id: user.id })
    .eq("user_id", oldUser.id)
    .select("id");

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ migrated: data?.length ?? 0, from: oldUser.id });
}
