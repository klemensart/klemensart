import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { ID_TO_SLUG } from "@/lib/atolyeler-config";

export async function GET() {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workshops")
    .select("id, title, description, next_session_date, zoom_link, is_live")
    .order("title");

  if (error) {
    return NextResponse.json(
      { error: `Veritabanı hatası: ${error.message}` },
      { status: 500 }
    );
  }

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://klemensart.com";

  const workshops = (data ?? []).map((w) => ({
    ...w,
    slug: ID_TO_SLUG[w.id] || null,
    url: ID_TO_SLUG[w.id] ? `${BASE_URL}/atolyeler/${ID_TO_SLUG[w.id]}` : null,
  }));

  return NextResponse.json({ workshops });
}
