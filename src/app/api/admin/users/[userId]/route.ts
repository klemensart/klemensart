import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const admin = createAdminClient();

  // Fetch user from auth
  const { data: authData, error: authError } =
    await admin.auth.admin.getUserById(userId);
  if (authError || !authData?.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const authUser = authData.user;

  // Fetch purchases with workshop/video details
  const { data: purchases } = await admin
    .from("purchases")
    .select(`
      id,
      workshop_id,
      single_video_id,
      purchased_at,
      expires_at,
      workshops ( id, title ),
      single_videos ( id, title )
    `)
    .eq("user_id", userId)
    .order("purchased_at", { ascending: false });

  // Fetch admin role
  const { data: adminRow } = await admin
    .from("admins")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  const meta = (authUser.user_metadata as Record<string, unknown>) ?? {};

  return NextResponse.json({
    user: {
      id: authUser.id,
      email: authUser.email ?? "",
      name: (meta.full_name as string) ?? (meta.name as string) ?? "",
      avatar: (meta.avatar_url as string) ?? "",
      created_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at ?? null,
    },
    purchases: (purchases ?? []).map((p) => ({
      id: p.id,
      workshop_id: p.workshop_id,
      single_video_id: p.single_video_id,
      purchased_at: p.purchased_at,
      expires_at: p.expires_at,
      title:
        (p.workshops as unknown as { title: string } | null)?.title ??
        (p.single_videos as unknown as { title: string } | null)?.title ??
        "Bilinmeyen",
      type: p.workshop_id ? "workshop" : "video",
    })),
    role: adminRow?.role ?? null,
  });
}
