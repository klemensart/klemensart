import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { generateStoryDesignRow } from "@/lib/auto-story";

/**
 * POST { article_id }
 * Belirtilen yazı için otomatik Instagram Story tasarımı oluşturur.
 */
export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const articleId = body.article_id;

  if (!articleId) {
    return NextResponse.json({ error: "article_id gerekli" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Yazıyı getir
  const { data: article, error: articleError } = await admin
    .from("articles")
    .select("id, title, description, author, category, image")
    .eq("id", articleId)
    .single();

  if (articleError || !article) {
    return NextResponse.json({ error: "Yazı bulunamadı" }, { status: 404 });
  }

  // Story tasarımını oluştur
  const designRow = generateStoryDesignRow(article, user.id);

  const { data: design, error: designError } = await admin
    .from("designs")
    .insert(designRow)
    .select("id")
    .single();

  if (designError) {
    return NextResponse.json({ error: designError.message }, { status: 500 });
  }

  return NextResponse.json({
    design_id: design.id,
    message: `"${article.title}" için story tasarımı oluşturuldu.`,
  });
}
