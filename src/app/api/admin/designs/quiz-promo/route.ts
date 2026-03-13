import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { generateQuizPromoDesignRows } from "@/lib/quiz-promo-story";

/**
 * POST — Rönesans Quiz tanıtımı için 3 Instagram Story tasarımı oluşturur.
 */
export async function POST() {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const rows = generateQuizPromoDesignRows(user.id);

  const { data: designs, error } = await admin
    .from("designs")
    .insert(rows)
    .select("id, name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    designs,
    message: `${designs.length} quiz promo story tasarımı oluşturuldu.`,
  });
}
