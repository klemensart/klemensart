import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi girin." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const trimmedEmail = email.trim().toLowerCase();

  const { error } = await admin
    .from("subscribers")
    .update({ is_active: false })
    .eq("email", trimmedEmail);

  if (error) {
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Aboneliğiniz iptal edildi." });
}
