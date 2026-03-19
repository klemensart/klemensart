import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MODERN10-${code}`;
}

/**
 * POST /api/coupon — Generate a coupon for quiz high scorers
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { quiz_slug, workshop_slug, user_id, user_email, score } = body as {
    quiz_slug: string;
    workshop_slug: string;
    user_id?: string;
    user_email?: string;
    score: number;
  };

  if (!quiz_slug || !workshop_slug || typeof score !== "number") {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  // Score threshold: 8+ (max 2 mistakes out of 10)
  if (score < 8) {
    return NextResponse.json({ error: "Yetersiz puan" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Quiz sonucunu doğrula — sahte skor göndermeyi engelle
  const verifyQuery = admin
    .from("quiz_results")
    .select("id")
    .eq("quiz_slug", quiz_slug)
    .eq("score", score);

  if (user_id) verifyQuery.eq("user_id", user_id);
  else if (user_email) verifyQuery.eq("user_email", user_email);

  const { data: verified } = await verifyQuery.limit(1).maybeSingle();
  if (!verified) {
    return NextResponse.json({ error: "Quiz sonucu doğrulanamadı" }, { status: 403 });
  }

  // Check if user already has an active coupon for this quiz+workshop
  if (user_id || user_email) {
    const query = admin
      .from("quiz_coupons")
      .select("code, expires_at, used")
      .eq("quiz_slug", quiz_slug)
      .eq("workshop_slug", workshop_slug)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString());

    if (user_id) {
      query.eq("user_id", user_id);
    } else if (user_email) {
      query.eq("user_email", user_email);
    }

    const { data: existing } = await query.maybeSingle();
    if (existing) {
      return NextResponse.json({ code: existing.code, expires_at: existing.expires_at });
    }
  }

  // Generate unique code
  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: clash } = await admin
      .from("quiz_coupons")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!clash) break;
    code = generateCode();
    attempts++;
  }

  // 30 days expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { error } = await admin.from("quiz_coupons").insert({
    code,
    user_id: user_id || null,
    user_email: user_email || null,
    quiz_slug,
    workshop_slug,
    discount_percent: 10,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code, expires_at: expiresAt.toISOString() });
}

/**
 * GET /api/coupon?code=MODERN10-XXXX&workshop=modern-sanat-atolyesi
 * Validate a coupon code
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  const workshop = req.nextUrl.searchParams.get("workshop");

  if (!code || !workshop) {
    return NextResponse.json({ valid: false, error: "Kod ve atölye gerekli" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("quiz_coupons")
    .select("id, code, discount_percent, workshop_slug, used, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ valid: false, error: "Geçersiz kod" });
  }

  if (data.used) {
    return NextResponse.json({ valid: false, error: "Bu kod daha önce kullanılmış" });
  }

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "Bu kodun süresi dolmuş" });
  }

  if (data.workshop_slug !== workshop) {
    return NextResponse.json({ valid: false, error: "Bu kod bu atölye için geçerli değil" });
  }

  return NextResponse.json({
    valid: true,
    discount_percent: data.discount_percent,
    code: data.code,
  });
}
