import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from "@/lib/marketplace-emails";

async function checkAdmin() {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) return null;
  return user;
}

// ── GET: Tek başvurunun tüm verisi ──────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checkAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("marketplace_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// ── PATCH: Durum güncelle (onay/red/inceleme) ────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checkAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, admin_note, send_email } = body as {
    status?: string;
    admin_note?: string;
    send_email?: boolean;
  };

  if (!status || !["pending", "reviewing", "approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "Geçerli bir durum belirtin: pending, reviewing, approved, rejected" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Mevcut başvuruyu al (email göndermek için)
  const { data: existing, error: fetchError } = await admin
    .from("marketplace_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Başvuru bulunamadı" }, { status: 404 });
  }

  // Güncelleme
  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "approved" || status === "rejected") {
    updatePayload.reviewed_at = new Date().toISOString();
    updatePayload.reviewed_by = user.id;
  }

  if (admin_note !== undefined) {
    updatePayload.admin_note = admin_note;
  }

  const { error: updateError } = await admin
    .from("marketplace_applications")
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Email gönder (send_email flag'i true ise veya default true)
  const shouldSendEmail = send_email !== false;

  if (shouldSendEmail && (status === "approved" || status === "rejected")) {
    const emailData = {
      applicant_name: existing.applicant_name,
      applicant_email: existing.applicant_email,
      workshop_topic: existing.workshop_topic,
      whatsapp_number: existing.whatsapp_number ?? null,
      proposed_dates: existing.proposed_dates ?? null,
    };

    if (status === "approved") {
      sendApplicationApprovedEmail(emailData).catch((err) =>
        console.error("[admin/atolye-basvurulari] Onay email hatası:", err),
      );
    } else {
      sendApplicationRejectedEmail(emailData).catch((err) =>
        console.error("[admin/atolye-basvurulari] Red email hatası:", err),
      );
    }
  }

  return NextResponse.json({ success: true, status });
}

// ── DELETE: Başvuruyu kalıcı olarak sil ──────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checkAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin
    .from("marketplace_applications")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
