import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { slugify } from "@/lib/slugify";

export async function GET(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rawSlug = searchParams.get("slug");
  const excludeId = searchParams.get("excludeId");

  if (!rawSlug) {
    return NextResponse.json({ available: false, error: "slug parametresi gerekli" });
  }

  const slug = slugify(rawSlug);
  const admin = createAdminClient();

  let query = admin
    .from("marketplace_events")
    .select("id")
    .eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query.maybeSingle();

  if (data) {
    // Suggest alternative
    let suggestion = slug;
    for (let i = 2; i <= 10; i++) {
      const candidate = `${slug}-${i}`;
      const { data: check } = await admin
        .from("marketplace_events")
        .select("id")
        .eq("slug", candidate)
        .maybeSingle();
      if (!check) {
        suggestion = candidate;
        break;
      }
    }
    return NextResponse.json({ available: false, suggestion });
  }

  return NextResponse.json({ available: true });
}
