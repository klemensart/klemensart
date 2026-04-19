import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    },
  );
}

// GET: kullanıcı bu yazıyı kaydetmiş mi
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const supabase = await getAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ bookmarked: false });

  const admin = createAdminClient();
  const { data } = await admin
    .from("article_bookmarks")
    .select("id")
    .eq("article_slug", slug)
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ bookmarked: !!data });
}

// POST: toggle bookmark
export async function POST(req: NextRequest) {
  const supabase = await getAuthClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("article_bookmarks")
    .select("id")
    .eq("article_slug", slug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await admin.from("article_bookmarks").delete().eq("id", existing.id);
  } else {
    await admin.from("article_bookmarks").insert({
      article_slug: slug,
      user_id: user.id,
    });
  }

  return NextResponse.json({ bookmarked: !existing });
}
