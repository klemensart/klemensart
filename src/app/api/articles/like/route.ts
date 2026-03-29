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

// GET: beğeni sayısı + kullanıcı beğenmiş mi
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const admin = createAdminClient();

  const { count } = await admin
    .from("article_likes")
    .select("*", { count: "exact", head: true })
    .eq("article_slug", slug);

  // Kullanıcı giriş yapmışsa kendi beğenisini kontrol et
  let liked = false;
  try {
    const supabase = await getAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await admin
        .from("article_likes")
        .select("id")
        .eq("article_slug", slug)
        .eq("user_id", user.id)
        .maybeSingle();
      liked = !!data;
    }
  } catch {
    // Giriş yapmamış — sorun değil
  }

  return NextResponse.json({ count: count ?? 0, liked });
}

// POST: toggle like
export async function POST(req: NextRequest) {
  const supabase = await getAuthClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const admin = createAdminClient();

  // Mevcut beğeni var mı?
  const { data: existing } = await admin
    .from("article_likes")
    .select("id")
    .eq("article_slug", slug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Beğeniyi geri al
    await admin.from("article_likes").delete().eq("id", existing.id);
  } else {
    // Beğen
    await admin.from("article_likes").insert({
      article_slug: slug,
      user_id: user.id,
    });
  }

  // Güncel sayıyı döndür
  const { count } = await admin
    .from("article_likes")
    .select("*", { count: "exact", head: true })
    .eq("article_slug", slug);

  return NextResponse.json({ liked: !existing, count: count ?? 0 });
}
