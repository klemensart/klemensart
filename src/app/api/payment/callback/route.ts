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

  const supabase = createAdminClient();

  // merchant_oid'e karşılık gelen workshop_id ve user_id'yi payment_intents'ten al
  const { data: intent, error: intentErr } = await supabase
    .from("payment_intents")
    .select("workshop_id, user_id")
    .eq("merchant_oid", merchant_oid)
    .single();

  if (intentErr || !intent) {
    console.error("payment_intent bulunamadı:", merchant_oid, intentErr);
    return new NextResponse("FAILED", { status: 404 });
  }

  // expires_at = şimdi + 6 ay
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  const { error: insertErr } = await supabase.from("purchases").insert({
    user_id: intent.user_id,
    workshop_id: intent.workshop_id,
    purchased_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  if (insertErr) {
    console.error("Satın alma kaydedilemedi:", insertErr);
    return new NextResponse("FAILED", { status: 500 });
  }

  // Kullanılan intent'i sil
  await supabase.from("payment_intents").delete().eq("merchant_oid", merchant_oid);

  console.log(`✅ Ödeme kaydedildi: ${merchant_oid} → workshop ${intent.workshop_id}`);
  return new NextResponse("OK");
}
