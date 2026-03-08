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
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    // Single campaign with full html_content
    const { data, error } = await admin
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Kampanya bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign: data });
  }

  // List last 50 campaigns (without html_content for performance)
  const { data, error } = await admin
    .from("campaigns")
    .select("id, created_at, subject, template_name, mode, sent_count")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: `Veritabanı hatası: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ campaigns: data ?? [] });
}
