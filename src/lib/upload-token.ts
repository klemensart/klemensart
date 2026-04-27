import { createAdminClient } from "@/lib/supabase-admin";

export type TokenValidationResult =
  | { status: "ready"; application: TokenApplication }
  | { status: "submitted"; applicant_name: string; workshop_topic: string; submitted_at: string }
  | { status: "expired" }
  | { status: "not_approved" }
  | { status: "not_found" };

export type TokenApplication = {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  workshop_topic: string;
  workshop_description: string;
  contact_channel: string;
  contact_channel_detail: string;
  whatsapp_number: string | null;
  proposed_dates: string | null;
};

export async function validateUploadToken(token: string): Promise<TokenValidationResult> {
  // UUID format check
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return { status: "not_found" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("marketplace_applications")
    .select(
      "id, applicant_name, applicant_email, applicant_phone, workshop_topic, workshop_description, contact_channel, contact_channel_detail, whatsapp_number, proposed_dates, status, upload_token_expires_at, materials_submitted_at",
    )
    .eq("upload_token", token)
    .single();

  if (error || !data) {
    return { status: "not_found" };
  }

  if (data.upload_token_expires_at && new Date(data.upload_token_expires_at) < new Date()) {
    return { status: "expired" };
  }

  if (data.status !== "approved") {
    return { status: "not_approved" };
  }

  if (data.materials_submitted_at) {
    return {
      status: "submitted",
      applicant_name: data.applicant_name,
      workshop_topic: data.workshop_topic,
      submitted_at: data.materials_submitted_at,
    };
  }

  return {
    status: "ready",
    application: {
      id: data.id,
      applicant_name: data.applicant_name,
      applicant_email: data.applicant_email,
      applicant_phone: data.applicant_phone,
      workshop_topic: data.workshop_topic,
      workshop_description: data.workshop_description,
      contact_channel: data.contact_channel,
      contact_channel_detail: data.contact_channel_detail,
      whatsapp_number: data.whatsapp_number,
      proposed_dates: data.proposed_dates,
    },
  };
}
