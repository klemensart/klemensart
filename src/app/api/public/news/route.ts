import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// ── GET: Public haber API — yayınlanmış haberler ────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30", 10), 100);
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  const [itemsRes, countRes] = await Promise.all([
    supabase
      .from("news_items")
      .select("id, title, summary, url, image_url, source_name, published_at, slug")
      .in("status", ["published", "archived"])
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1),
    supabase
      .from("news_items")
      .select("id", { count: "exact", head: true })
      .in("status", ["published", "archived"]),
  ]);

  return NextResponse.json({
    items: itemsRes.data ?? [],
    total: countRes.count ?? 0,
    page,
    limit,
  });
}
