import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { generateUniqueSlug } from "@/lib/slugify";
import { notifyGoogleIndex } from "@/lib/google-indexing";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (status !== "published" && status !== "draft") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("articles")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Yazı yayınlandığında haber akışına otomatik ekle
  if (status === "published") {
    const { data: article } = await admin
      .from("articles")
      .select("title, description, slug, image, date")
      .eq("id", id)
      .single();

    if (article) {
      const guid = `klemens-article-${id}`;
      // Zaten eklenmişse tekrar ekleme
      const { data: existing } = await admin
        .from("news_items")
        .select("id")
        .eq("guid", guid)
        .maybeSingle();

      if (!existing) {
        const publishedAt = article.date || new Date().toISOString();
        const newsSlug = await generateUniqueSlug(article.title, publishedAt, admin);
        await admin.from("news_items").insert({
          guid,
          title: article.title,
          summary: article.description || null,
          url: `https://klemensart.com/icerikler/yazi/${article.slug}`,
          image_url: article.image || null,
          source_name: "Klemens",
          status: "new",
          is_manual: true,
          published_at: publishedAt,
          slug: newsSlug,
        });
      }
    }
  }

  // Yayınlandığında Google'a anında bildir
  if (status === "published") {
    const { data: art } = await admin
      .from("articles")
      .select("slug")
      .eq("id", id)
      .single();
    if (art?.slug) {
      notifyGoogleIndex(`https://klemensart.com/icerikler/yazi/${art.slug}`);
    }
  }

  return NextResponse.json({ ok: true });
}
