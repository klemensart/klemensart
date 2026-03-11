import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const admin = createAdminClient();

  // Extract bearer token (mobile app sends Authorization header)
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify token and get user
  const {
    data: { user },
    error: authError,
  } = await admin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch purchases joined with workshops
  const { data, error } = await admin
    .from("purchases")
    .select("id, workshop_id, single_video_id, purchased_at, expires_at, workshops(id, title)")
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten workshop title for easier mobile consumption
  const purchases = (data ?? []).map((p: any) => ({
    id: p.id,
    workshop_id: p.workshop_id,
    workshop_title: p.workshops?.title ?? "Bilinmeyen",
    purchased_at: p.purchased_at,
    expires_at: p.expires_at,
  }));

  return NextResponse.json({ purchases });
}
