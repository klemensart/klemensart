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

  const admin = createAdminClient();

  // Get all payment_intents (abandoned checkouts)
  let intentQuery = admin.from("payment_intents").select("user_id, workshop_id");
  if (workshopId) {
    intentQuery = intentQuery.eq("workshop_id", workshopId);
  }
  const { data: intents, error: intentError } = await intentQuery;

  if (intentError) {
    return NextResponse.json(
      { error: `Veritabanı hatası: ${intentError.message}` },
      { status: 500 }
    );
  }

  if (!intents || intents.length === 0) {
    return NextResponse.json({ count: 0, userIds: [] });
  }

  // Get completed purchases to exclude
  let purchaseQuery = admin.from("purchases").select("user_id, workshop_id");
  if (workshopId) {
    purchaseQuery = purchaseQuery.eq("workshop_id", workshopId);
  }
  const { data: purchases } = await purchaseQuery;

  // Build set of user_ids who completed purchase (per workshop)
  const completedSet = new Set(
    (purchases ?? []).map((p) => `${p.user_id}:${p.workshop_id}`)
  );

  // Filter: intent exists but no matching purchase
  const abandonedUserIds = [
    ...new Set(
      intents
        .filter((i) => !completedSet.has(`${i.user_id}:${i.workshop_id}`))
        .map((i) => i.user_id)
    ),
  ];

  return NextResponse.json({ count: abandonedUserIds.length, userIds: abandonedUserIds });
}
