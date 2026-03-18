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
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const perPage = 20;
  const search = url.searchParams.get("q")?.trim() ?? "";

  // Fetch purchases with workshop/video joins
  let query = admin
    .from("purchases")
    .select(
      `
      id,
      user_id,
      workshop_id,
      single_video_id,
      purchased_at,
      expires_at,
      phone,
      workshops ( id, title ),
      single_videos ( id, title )
    `,
      { count: "exact" }
    )
    .order("purchased_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  // If search, we'll filter after fetch (need user emails)
  const { data: purchases, count } = await query;

  if (!purchases) {
    return NextResponse.json({ purchases: [], total: 0 });
  }

  // Collect unique user_ids to resolve emails/names
  const userIds = [...new Set(purchases.map((p) => p.user_id))];
  const userMap = new Map<
    string,
    { email: string; name: string }
  >();

  // Fetch user info in batches
  for (const uid of userIds) {
    const { data } = await admin.auth.admin.getUserById(uid);
    if (data?.user) {
      const meta = (data.user.user_metadata as Record<string, unknown>) ?? {};
      userMap.set(uid, {
        email: data.user.email ?? "",
        name:
          (meta.full_name as string) ??
          (meta.name as string) ??
          "",
      });
    }
  }

  const rows = purchases.map((p) => {
    const u = userMap.get(p.user_id) ?? { email: "", name: "" };
    return {
      id: p.id,
      user_id: p.user_id,
      user_email: u.email,
      user_name: u.name,
      user_phone: (p as Record<string, unknown>).phone as string || "",
      workshop_id: p.workshop_id,
      single_video_id: p.single_video_id,
      title:
        (p.workshops as unknown as { title: string } | null)?.title ??
        (p.single_videos as unknown as { title: string } | null)?.title ??
        "Bilinmeyen",
      type: p.workshop_id ? "workshop" : ("video" as const),
      purchased_at: p.purchased_at,
      expires_at: p.expires_at,
    };
  });

  // Client-side search filter (email or name or title)
  const filtered = search
    ? rows.filter(
        (r) =>
          r.user_email.toLowerCase().includes(search.toLowerCase()) ||
          r.user_name.toLowerCase().includes(search.toLowerCase()) ||
          r.title.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  return NextResponse.json({ purchases: filtered, total: count ?? 0 });
}
