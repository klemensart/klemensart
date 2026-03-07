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

  const workshopId = req.nextUrl.searchParams.get("workshopId");
  if (!workshopId) {
    return NextResponse.json({ error: "workshopId gerekli." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: purchases, error } = await admin
    .from("purchases")
    .select("user_id")
    .eq("workshop_id", workshopId);

  if (error) {
    return NextResponse.json(
      { error: `Veritabanı hatası: ${error.message}` },
      { status: 500 }
    );
  }

  const uniqueUserIds = new Set((purchases ?? []).map((p) => p.user_id));

  return NextResponse.json({ count: uniqueUserIds.size });
}
