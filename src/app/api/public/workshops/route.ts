import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ID_TO_SLUG, SLUG_TO_ATOLYE, formatPrice } from "@/lib/atolyeler-config";

export async function GET() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("workshops")
    .select("id, title, description, total_sessions, is_live, next_session_date")
    .order("title");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const workshops = (data ?? []).map((w) => {
    const slug = ID_TO_SLUG[w.id] || null;
    const config = slug ? SLUG_TO_ATOLYE[slug] : null;
    return {
      ...w,
      slug,
      price: config ? formatPrice(config.price) : null,
      for_sale: config?.forSale ?? false,
      image: config?.imgSquare ?? null,
    };
  });

  return NextResponse.json({ workshops });
}
