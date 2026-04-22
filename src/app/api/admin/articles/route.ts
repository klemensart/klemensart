import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { generateStoryDesignRow } from "@/lib/auto-story";

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
    .from("articles")
    .select("id, slug, title, author, category, status, date, image")
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data ?? [] });
}

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const body = await req.json();

  let image = body.image ?? "";

  // Dış kaynak görseli Supabase Storage'a yükle (CORS sorununu önler)
  if (image && !image.includes("supabase.co/")) {
    try {
      const imgRes = await fetch(image, {
        headers: { "User-Agent": "KlemensArt/1.0" },
        signal: AbortSignal.timeout(15_000),
      });
      if (imgRes.ok) {
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const ct = imgRes.headers.get("content-type") || "image/jpeg";
        const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
        const path = `article-covers/${body.slug}.${ext}`;
        const { error: upErr } = await admin.storage
          .from("email-assets")
          .upload(path, buffer, { contentType: ct, upsert: true });
        if (!upErr) {
          const { data: pub } = admin.storage.from("email-assets").getPublicUrl(path);
          image = pub.publicUrl;
        }
      }
    } catch {
      // Yükleme başarısız olursa orijinal URL'yi koru
    }
  }

  const row = {
    slug: body.slug,
    title: body.title,
    description: body.description ?? "",
    author: body.author ?? "",
    author_ig: body.author_ig || null,
    author_email: body.author_email || null,
    date: body.date || null,
    category: body.category ?? "",
    tags: body.tags ?? [],
    image,
    cover_caption: body.cover_caption || null,
    cover_video_url: body.cover_video_url || null,
    cover_video_duration: body.cover_video_duration ?? null,
    content: body.content ?? "",
    status: body.status ?? "draft",
    hero_overlay_enabled: body.hero_overlay_enabled ?? false,
  };

  const { data, error } = await admin
    .from("articles")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Otomatik Instagram Story tasarımı oluştur
  try {
    const storyRow = generateStoryDesignRow(
      {
        title: row.title,
        description: row.description,
        author: row.author,
        category: row.category,
        image: row.image,
      },
      user.id
    );
    await admin.from("designs").insert(storyRow);
  } catch {
    // Story oluşturma başarısız olursa yazı kaydını engelleme
    console.error("Auto-story generation failed for article:", data.id);
  }

  return NextResponse.json({ id: data.id });
}
