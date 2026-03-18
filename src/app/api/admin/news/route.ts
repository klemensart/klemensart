import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { generateUniqueSlug } from "@/lib/slugify";
import * as cheerio from "cheerio";

// ── GET: Haber listesi + sayaçlar ───────────────────────────────────────────
export async function GET(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "new";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Yayınlananları newsletter_order'a göre sırala, diğerlerini published_at'e göre
  const orderColumn = status === "published" ? "newsletter_order" : "published_at";
  const orderAsc = status === "published";

  const [itemsRes, newCount, publishedCount, dismissedCount] = await Promise.all([
    admin
      .from("news_items")
      .select("*")
      .eq("status", status)
      .order(orderColumn, { ascending: orderAsc })
      .range(offset, offset + limit - 1),
    admin.from("news_items").select("id", { count: "exact", head: true }).eq("status", "new"),
    admin.from("news_items").select("id", { count: "exact", head: true }).eq("status", "published"),
    admin.from("news_items").select("id", { count: "exact", head: true }).eq("status", "dismissed"),
  ]);

  return NextResponse.json({
    items: itemsRes.data ?? [],
    counts: {
      new: newCount.count ?? 0,
      published: publishedCount.count ?? 0,
      dismissed: dismissedCount.count ?? 0,
    },
    page,
  });
}

// ── POST: Manuel haber ekle ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, summary, url, image_url, source_name } = body as {
    title?: string;
    summary?: string;
    url?: string;
    image_url?: string;
    source_name?: string;
  };

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const guid = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const publishedAt = new Date().toISOString();
  const slug = await generateUniqueSlug(title, publishedAt, admin);

  // Görsel yoksa ve URL varsa otomatik OG image çek
  let finalImage = image_url ?? null;
  if (!finalImage && url) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; KlemensArt/1.0)" },
        signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();
      const $ = cheerio.load(html);
      finalImage =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        $('meta[property="og:image:url"]').attr("content") ||
        null;
    } catch { /* görselsiz devam et */ }
  }

  const { data, error } = await admin
    .from("news_items")
    .insert({
      guid,
      title,
      summary: summary ?? null,
      url: url ?? null,
      image_url: finalImage,
      source_name: source_name ?? "Klemens",
      status: "new",
      is_manual: true,
      published_at: publishedAt,
      slug,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id });
}
