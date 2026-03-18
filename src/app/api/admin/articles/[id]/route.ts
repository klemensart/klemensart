import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin, getAdminRole } from "@/lib/admin-check";

export async function GET(
  _req: NextRequest,
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
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ article: data });
}

export async function PUT(
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
  const admin = createAdminClient();
  const body = await req.json();

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
    image: body.image ?? "",
    content: body.content ?? "",
    status: body.status ?? "draft",
  };

  const { error } = await admin
    .from("articles")
    .update(row)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Yazı published ise news_items'a da senkronize et
  if (row.status === "published" && row.slug) {
    const guid = `klemens-article-${id}`;
    const { data: existing } = await admin
      .from("news_items")
      .select("id")
      .eq("guid", guid)
      .maybeSingle();

    if (!existing) {
      await admin.from("news_items").insert({
        guid,
        title: row.title,
        summary: row.description || null,
        url: `https://klemensart.com/icerikler/yazi/${row.slug}`,
        image_url: row.image || null,
        source_name: "Klemens",
        status: "published",
        is_manual: true,
        published_at: row.date || new Date().toISOString(),
        slug: row.slug,
      });
    } else {
      // Mevcut kaydı güncelle (başlık/açıklama değişmiş olabilir)
      await admin.from("news_items").update({
        title: row.title,
        summary: row.description || null,
        url: `https://klemensart.com/icerikler/yazi/${row.slug}`,
        image_url: row.image || null,
      }).eq("guid", guid);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only role='admin' can delete articles
  const role = await getAdminRole(user.id);
  if (role !== "admin") {
    return NextResponse.json(
      { error: "Silme yetkisi sadece admin rolüne aittir" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("articles").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
