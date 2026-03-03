import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const merchant_oid = formData.get("merchant_oid") as string;
  const status = formData.get("status") as string;
  const total_amount = formData.get("total_amount") as string;
  const hash = formData.get("hash") as string;
  const email = formData.get("email") as string;

  const merchant_key = process.env.PAYTR_MERCHANT_KEY!;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT!;

  // Hash doğrulama
  const expectedHash = createHmac("sha256", merchant_key)
    .update(merchant_oid + merchant_salt + status + total_amount)
    .digest("base64");

  if (hash !== expectedHash) {
    console.error("PayTR hash uyuşmuyor!", { hash, expectedHash });
    return new NextResponse("FAILED", { status: 400 });
  }

  // Yalnızca başarılı ödemeleri kaydet
  if (status !== "success") {
    return new NextResponse("OK");
  }

  // merchant_oid'den workshopId'yi çıkar
  // Format: {workshopId_32char_no_hyphens}-{timestamp}
  const workshopShort = merchant_oid.split("-")[0]; // ilk 32 char
  const workshopId =
    workshopShort.replace(
      /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
      "$1-$2-$3-$4-$5"
    );

  const supabase = createAdminClient();

  // Kullanıcıyı email'e göre bul
  const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) {
    console.error("Kullanıcı listesi alınamadı:", userErr);
    return new NextResponse("FAILED", { status: 500 });
  }

  const user = users.users.find((u) => u.email === email);
  if (!user) {
    console.error("Kullanıcı bulunamadı:", email);
    return new NextResponse("FAILED", { status: 404 });
  }

  // expires_at = şimdi + 6 ay
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  const { error: insertErr } = await supabase.from("purchases").insert({
    user_id: user.id,
    workshop_id: workshopId,
    purchased_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  if (insertErr) {
    console.error("Satın alma kaydedilemedi:", insertErr);
    return new NextResponse("FAILED", { status: 500 });
  }

  console.log(`✅ Ödeme kaydedildi: ${email} → workshop ${workshopId}`);
  return new NextResponse("OK");
}
