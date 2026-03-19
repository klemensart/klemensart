import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

const ALLOWED_EVENTS = new Set([
  "workshop_view",
  "add_to_cart",
  "checkout_start",
  "checkout_complete",
  "page_view",
  "page_leave",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, anonymous_id, workshop_id, workshop_slug, metadata } = body;

    if (!event_type || !ALLOWED_EVENTS.has(event_type)) {
      return NextResponse.json({ ok: true });
    }

    const supabase = createAdminClient();

    await supabase.from("user_events").insert({
      event_type,
      anonymous_id: anonymous_id || null,
      workshop_id: workshop_id || null,
      workshop_slug: workshop_slug || null,
      metadata: metadata || {},
    });
  } catch {
    // her durumda ok
  }

  return NextResponse.json({ ok: true });
}
