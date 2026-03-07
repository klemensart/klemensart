import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi girin." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const trimmedEmail = email.trim().toLowerCase();

  // Check if already subscribed
  const { data: existing } = await admin
    .from("subscribers")
    .select("id, is_active")
    .eq("email", trimmedEmail)
    .maybeSingle();

  if (existing) {
    if (!existing.is_active) {
      // Reactivate
      await admin
        .from("subscribers")
        .update({ is_active: true })
        .eq("id", existing.id);
      return NextResponse.json({ message: "Tekrar hoş geldiniz! Aboneliğiniz yeniden aktif." });
    }
    return NextResponse.json({ message: "Zaten abonesiniz!" });
  }

  const { error } = await admin
    .from("subscribers")
    .insert({ email: trimmedEmail, name: name?.trim() || null });

  if (error) {
    return NextResponse.json(
      { error: `Bir hata oluştu: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Abone oldunuz!" });
}
