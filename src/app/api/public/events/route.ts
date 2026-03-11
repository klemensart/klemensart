import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const admin = createAdminClient();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // sergi, konser, tiyatro, etc.
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

  let query = admin
    .from("events")
    .select("id, title, description, event_type, venue, event_date, end_date, price_info, image_url, source_url, ai_comment")
    .eq("status", "approved")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(limit);

  if (type) {
    query = query.eq("event_type", type);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}
