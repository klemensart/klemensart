import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase-admin";
import { render } from "@react-email/render";
import AtolyeTesekkur from "@/emails/AtolyeTesekkur";
import { sendThankYouEmail } from "@/lib/send-thank-you";

export async function POST(req: NextRequest) {
  try {
    // 1) Form verisi
    const formData = await req.formData();

    const merchant_oid = formData.get("merchant_oid") as string;
    const status = formData.get("status") as string;
    const total_amount = formData.get("total_amount") as string;
    const hash = formData.get("hash") as string;

    // 2) Env kontrol
    const merchant_key = process.env.PAYTR_MERCHANT_KEY;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchant_key || !merchant_salt) {
      console.error("[PayTR Callback] ENV EKSİK!", {
        hasKey: !!merchant_key,
        hasSalt: !!merchant_salt,
      });
      return new NextResponse("OK");
    }

    // 3) Hash doğrulama
    const hashInput = merchant_oid + merchant_salt + status + total_amount;
    const expectedHash = createHmac("sha256", merchant_key)
      .update(hashInput)
      .digest("base64");

    if (hash !== expectedHash) {
      console.error("[PayTR Callback] HASH UYUŞMUYOR — callback reddedildi", {
        merchant_oid,
        status,
      });
      return new NextResponse("OK");
    }

    // 4) Başarısız ödeme
    if (status !== "success") {
      console.log("[PayTR Callback] Başarısız ödeme:", { merchant_oid, status });
      return new NextResponse("OK");
    }

    const supabase = createAdminClient();

    // 5) payment_intents lookup
    const { data: intent, error: intentErr } = await supabase
      .from("payment_intents")
      .select("workshop_id, user_id, phone")
      .eq("merchant_oid", merchant_oid)
      .single();

    if (intentErr || !intent) {
      console.error("[PayTR Callback] INTENT BULUNAMADI:", {
        merchant_oid,
        error: intentErr,
      });
      return new NextResponse("OK");
    }

    // 6) purchases INSERT
    // Sinema kulübü workshop ID'leri
    const SINEMA_KLUBU_IDS = [
      "a1e2f3d4-5b6c-4d7e-8f9a-0b1c2d3e4f5a", // sinema-klubu-tekli
      "b2f3a4e5-6c7d-4e8f-9a0b-1c2d3e4f5a6b", // sinema-klubu-tekli-ogrenci
      "c3a4b5f6-7d8e-4f9a-0b1c-2d3e4f5a6b7c", // sinema-klubu-yillik
      "d4b5c6a7-8e9f-4a0b-1c2d-3e4f5a6b7c8d", // sinema-klubu-yillik-ogrenci
    ];
    // Yıllık sinema kulübü paketleri 12 ay, diğerleri 6 ay
    const YILLIK_WORKSHOP_IDS = [
      "c3a4b5f6-7d8e-4f9a-0b1c-2d3e4f5a6b7c", // sinema-klubu-yillik
      "d4b5c6a7-8e9f-4a0b-1c2d-3e4f5a6b7c8d", // sinema-klubu-yillik-ogrenci
    ];
    const expiryMonths = YILLIK_WORKSHOP_IDS.includes(intent.workshop_id) ? 12 : 6;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + expiryMonths);

    const purchaseData: Record<string, unknown> = {
      user_id: intent.user_id,
      workshop_id: intent.workshop_id,
      purchased_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    };
    if (intent.phone) purchaseData.phone = intent.phone;

    const { error: insertErr } = await supabase.from("purchases").insert(purchaseData);

    if (insertErr) {
      console.error("[PayTR Callback] PURCHASE INSERT HATASI:", insertErr);
      return new NextResponse("OK");
    }

    // 6a) checkout_complete event
    await supabase.from("user_events").insert({
      event_type: "checkout_complete",
      user_id: intent.user_id,
      workshop_id: intent.workshop_id,
      metadata: { merchant_oid, amount: Number(total_amount) },
    });

    // 6b) Telefon bilgisini kullanıcı meta verisine kaydet + Teşekkür e-postası
    try {
      if (intent.phone) {
        await supabase.auth.admin.updateUserById(intent.user_id, {
          user_metadata: { phone: intent.phone },
        });
      }

      const { data: userData } = await supabase.auth.admin.getUserById(intent.user_id);
      const userName = userData?.user?.user_metadata?.full_name || userData?.user?.email || "Sanat Sever";

      const { data: workshop } = await supabase
        .from("workshops")
        .select("title")
        .eq("id", intent.workshop_id)
        .single();

      const workshopTitle = workshop?.title || "Atolye";

      const isSinemaKlubu = SINEMA_KLUBU_IDS.includes(intent.workshop_id);
      const whatsappLink = isSinemaKlubu
        ? process.env.SINEMA_KLUBU_WHATSAPP_LINK
        : undefined;

      const html = await render(AtolyeTesekkur({ name: userName, workshopTitle, whatsappLink }));
      await sendThankYouEmail({
        to: userData?.user?.email || "",
        subject: "Atölye Satın Alma Onayı — Klemens Art",
        html,
      });
    } catch (err) {
      console.error("[PayTR Callback] Tesekkur maili gonderilemedi:", err);
    }

    // 7) intent temizle
    await supabase
      .from("payment_intents")
      .delete()
      .eq("merchant_oid", merchant_oid);

    return new NextResponse("OK");
  } catch (err) {
    console.error("[PayTR Callback] BEKLENMEYEN HATA:", err);
    return new NextResponse("OK");
  }
}
