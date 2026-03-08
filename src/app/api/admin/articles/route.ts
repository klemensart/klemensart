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
