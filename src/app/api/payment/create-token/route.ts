import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomBytes } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  // Kullanıcı oturum kontrolü
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const { workshopId, amount, workshopTitle } = await req.json();

  if (!workshopId || !amount || !workshopTitle) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  const merchant_id = process.env.PAYTR_MERCHANT_ID!;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY!;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT!;

  // Kullanıcı IP'si
  const user_ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // merchant_oid: KLM + timestamp + 4 rastgele alfanumerik karakter
  const random4 = randomBytes(2).toString("hex").toUpperCase(); // örn: AB12
  const merchant_oid = `KLM${Date.now()}${random4}`;

  const email = user.email;
  const payment_amount = String(amount); // kuruş cinsinden

  // Sepet: [[ürün adı, birim fiyat (TL string), adet]]
  const basketArr = [[workshopTitle, (amount / 100).toFixed(2), 1]];
  const user_basket = Buffer.from(JSON.stringify(basketArr)).toString("base64");

  const no_installment = "0";
  const max_installment = "12";
  const currency = "TL";
  const test_mode = "1"; // Canlıya geçince "0" yap

  const merchant_ok_url = "https://klemensart.com/club/odeme/basarili";
  const merchant_fail_url = "https://klemensart.com/club/odeme/basarisiz";

  // PayTR hash
  const hashStr =
    merchant_id +
    user_ip +
    merchant_oid +
    email +
    payment_amount +
    user_basket +
    no_installment +
    max_installment +
    currency +
    test_mode;

  const paytr_token = createHmac("sha256", merchant_key + merchant_salt)
    .update(hashStr)
    .digest("base64");

  const params = new URLSearchParams({
    merchant_id,
    user_ip,
    merchant_oid,
    email,
    payment_amount,
    paytr_token,
    user_basket,
    debug_on: "1",
    no_installment,
    max_installment,
    user_name: user.user_metadata?.full_name || email,
    user_address: "Türkiye",
    user_phone: "05000000000",
    merchant_ok_url,
    merchant_fail_url,
    timeout_limit: "30",
    currency,
    test_mode,
    lang: "tr",
  });

  const paytrRes = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = (await paytrRes.json()) as { status: string; token?: string; reason?: string };

  if (data.status !== "success") {
    console.error("PayTR token hatası:", data.reason);
    return NextResponse.json(
      { error: data.reason || "Ödeme başlatılamadı" },
      { status: 400 }
    );
  }

  // merchant_oid → workshopId eşlemesini sakla (callback'te kullanılacak)
  const admin = createAdminClient();
  await admin.from("payment_intents").insert({
    merchant_oid,
    workshop_id: workshopId,
    user_id: user.id,
  });

  return NextResponse.json({ token: data.token, merchant_oid });
}
