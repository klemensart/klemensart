import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// ── GET: Token doğrula, başvuru bilgilerini döndür ──────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  // UUID format kontrolü
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return NextResponse.json(
      { error: "Geçersiz bağlantı" },
      { status: 404 },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("marketplace_applications")
    .select(
      "id, applicant_name, applicant_email, applicant_phone, workshop_topic, workshop_description, contact_channel, contact_channel_detail, whatsapp_number, proposed_dates, status, upload_token_expires_at, materials_submitted_at",
    )
    .eq("upload_token", token)
    .single();

  // Token bulunamadı
  if (error || !data) {
    return NextResponse.json(
      { error: "Geçersiz bağlantı" },
      { status: 404 },
    );
  }

  // Süre doldu mu?
  if (
    data.upload_token_expires_at &&
    new Date(data.upload_token_expires_at) < new Date()
  ) {
    return NextResponse.json(
      { error: "Bağlantı süresi doldu. Lütfen info@klemensart.com adresinden iletişime geçin." },
      { status: 410 },
    );
  }

  // Başvuru onaylı mı?
  if (data.status !== "approved") {
    return NextResponse.json(
      { error: "Başvuru henüz onaylanmadı" },
      { status: 403 },
    );
  }

  // Materyaller zaten gönderilmiş mi?
  if (data.materials_submitted_at) {
    return NextResponse.json({
      status: "submitted",
      applicant_name: data.applicant_name,
      workshop_topic: data.workshop_topic,
      submitted_at: data.materials_submitted_at,
      message:
        "Materyallerinizi daha önce gönderdiniz. Güncellemek için info@klemensart.com adresinden iletişime geçin.",
    });
  }

  // Başarılı — güvenli alanları döndür
  return NextResponse.json({
    status: "ready",
    application: {
      id: data.id,
      applicant_name: data.applicant_name,
      workshop_topic: data.workshop_topic,
      workshop_description: data.workshop_description,
      contact_channel: data.contact_channel,
      contact_channel_detail: data.contact_channel_detail,
      whatsapp_number: data.whatsapp_number,
      proposed_dates: data.proposed_dates,
      applicant_phone: data.applicant_phone,
      applicant_email: data.applicant_email,
    },
  });
}
