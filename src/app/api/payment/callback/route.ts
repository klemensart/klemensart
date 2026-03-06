import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  console.log("[PayTR Callback] ========== CALLBACK BAŞLADI ==========");

  // 1) Form verisi
  const formData = await req.formData();

  const merchant_oid = formData.get("merchant_oid") as string;
  const status = formData.get("status") as string;
  const total_amount = formData.get("total_amount") as string;
  const hash = formData.get("hash") as string;
  const email = formData.get("email") as string;

  console.log("[PayTR Callback] Gelen veriler:", {
    merchant_oid,
    status,
    total_amount,
    hash: hash ? `${hash.slice(0, 10)}...` : "YOK",
    email,
  });

  // 2) Env kontrol
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

  if (!merchant_key || !merchant_salt) {
    console.error("[PayTR Callback] ENV EKSİK!", {
      hasKey: !!merchant_key,
      hasSalt: !!merchant_salt,
    });
    return new NextResponse("FAILED", { status: 500 });
  }

  // 3) Hash doğrulama
  const hashInput = merchant_oid + merchant_salt + status + total_amount;
  const expectedHash = createHmac("sha256", merchant_key)
    .update(hashInput)
    .digest("base64");

  console.log("[PayTR Callback] Hash kontrolü:", {
    hashInput: `${hashInput.slice(0, 30)}...`,
    expectedHash: `${expectedHash.slice(0, 10)}...`,
    receivedHash: hash ? `${hash.slice(0, 10)}...` : "YOK",
    match: hash === expectedHash,
  });

  if (hash !== expectedHash) {
    console.error("[PayTR Callback] HASH UYUŞMUYOR — callback reddedildi");
    return new NextResponse("FAILED", { status: 400 });
  }

  // 4) Başarısız ödeme
  if (status !== "success") {
    console.log("[PayTR Callback] Ödeme başarısız, status:", status);
    return new NextResponse("OK");
  }

  console.log("[PayTR Callback] Ödeme başarılı, purchases'a yazılıyor...");

  const supabase = createAdminClient();

  // 5) payment_intents lookup
  const { data: intent, error: intentErr } = await supabase
    .from("payment_intents")
    .select("workshop_id, user_id")
    .eq("merchant_oid", merchant_oid)
    .single();

  console.log("[PayTR Callback] Intent lookup:", {
    merchant_oid,
    found: !!intent,
    intent,
    error: intentErr?.message ?? null,
  });

  if (intentErr || !intent) {
    console.error("[PayTR Callback] INTENT BULUNAMADI — purchases'a yazılamıyor");
    return new NextResponse("FAILED", { status: 404 });
  }

  // 6) purchases INSERT
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  const purchaseData = {
    user_id: intent.user_id,
    workshop_id: intent.workshop_id,
    purchased_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  console.log("[PayTR Callback] Purchase INSERT verisi:", purchaseData);

  const { error: insertErr } = await supabase.from("purchases").insert(purchaseData);

  if (insertErr) {
    console.error("[PayTR Callback] PURCHASE INSERT HATASI:", insertErr);
    return new NextResponse("FAILED", { status: 500 });
  }

  // 7) intent temizle
  const { error: deleteErr } = await supabase
    .from("payment_intents")
    .delete()
    .eq("merchant_oid", merchant_oid);

  if (deleteErr) {
    console.warn("[PayTR Callback] Intent silinemedi (kritik değil):", deleteErr.message);
  }

  console.log(`[PayTR Callback] ✅ BAŞARILI — ${merchant_oid} → workshop ${intent.workshop_id}, user ${intent.user_id}`);
  console.log("[PayTR Callback] ========== CALLBACK BİTTİ ==========");
  return new NextResponse("OK");
}
