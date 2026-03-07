import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendThankYouEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Klemens Art <info@klemensart.com>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error("[sendThankYouEmail] Resend hatasi:", error.message);
      return;
    }

    const admin = createAdminClient();
    await admin.from("email_logs").insert({
      resend_email_id: data?.id || null,
      subscriber_email: params.to,
      subject: params.subject,
    });
  } catch (err) {
    console.error("[sendThankYouEmail] Beklenmeyen hata:", err);
  }
}
