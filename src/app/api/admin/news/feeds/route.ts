import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

// ── GET: Feed listesi ───────────────────────────────────────────────────────
export async function GET() {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("news_feeds")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ feeds: data ?? [] });
}

// ── POST: Yeni feed ekle ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, url, category } = body as {
    name?: string;
    url?: string;
    category?: string;
  };

  if (!name || !url) {
    return NextResponse.json({ error: "name and url required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("news_feeds")
    .insert({
      name,
      url,
      category: category ?? "diger",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id });
}
