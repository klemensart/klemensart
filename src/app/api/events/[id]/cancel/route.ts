import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id: eventId } = await ctx.params;
  const { token } = (await req.json()) as { token?: string };

  if (!token) {
    return NextResponse.json({ error: "Token gerekli." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Token ile kayıt bul
  const { data: reg, error: findErr } = await admin
    .from("event_registrations")
    .select("id,status,event_id")
    .eq("confirmation_token", token)
    .eq("event_id", eventId)
    .maybeSingle();

  if (findErr || !reg) {
    return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
  }

  if (reg.status === "cancelled") {
    return NextResponse.json({ error: "Bu kayıt zaten iptal edilmiş." }, { status: 400 });
  }

  const { error: updateErr } = await admin
    .from("event_registrations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", reg.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
