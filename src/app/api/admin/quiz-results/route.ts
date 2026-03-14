import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

/**
 * DELETE — Tüm quiz skorlarını sıfırla (opsiyonel slug filtresi)
 * Query: ?slug=ronesans-quiz  (belirli quiz) veya boş (tümü)
 */
export async function DELETE(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  const admin = createAdminClient();

  let query = admin.from("quiz_results").delete();
  if (slug) {
    query = query.eq("quiz_slug", slug);
  } else {
    // Supabase delete requires a filter — gte on created_at to match all
    query = query.gte("created_at", "2000-01-01");
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: slug
      ? `"${slug}" skorları sıfırlandı.`
      : "Tüm quiz skorları sıfırlandı.",
  });
}
