import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

export async function GET() {
  // Auth check
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Paralel sorgular
  const [usersRes, workshopsRes, pendingRes, purchasesRes, pendingNewsRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1, page: 1 }),
    admin
      .from("workshops")
      .select("id", { count: "exact", head: true }),
    admin
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("purchases")
      .select("id", { count: "exact", head: true }),
    admin
      .from("news_items")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  // auth.admin.listUsers total'i response'un total alanında döner
  const totalUsers =
    (usersRes.data as unknown as { users: unknown[]; total?: number })?.total ??
    usersRes.data?.users?.length ??
    0;

  return NextResponse.json({
    users: totalUsers,
    workshops: workshopsRes.count ?? 0,
    pendingEvents: pendingRes.count ?? 0,
    purchases: purchasesRes.count ?? 0,
    pendingNews: pendingNewsRes.count ?? 0,
  });
}
