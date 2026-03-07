import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Resend webhook event types we care about
type ResendEvent = {
  type: "email.opened" | "email.clicked" | "email.bounced" | "email.delivered" | string;
  data: {
    email_id: string;
    to: string[];
    created_at: string;
  };
};

export async function POST(req: NextRequest) {
  // Verify webhook signature (optional but recommended)
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (webhookSecret) {
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing headers" }, { status: 401 });
    }
  }

  const event: ResendEvent = await req.json();
  const admin = createAdminClient();
  const emailId = event.data?.email_id;
  const to = event.data?.to?.[0];

  if (!emailId || !to) {
    return NextResponse.json({ received: true });
  }

  const now = new Date().toISOString();

  switch (event.type) {
    case "email.opened":
      await admin
        .from("email_logs")
        .update({ opened_at: now, status: "opened" })
        .eq("resend_email_id", emailId);
      break;

    case "email.clicked":
      await admin
        .from("email_logs")
        .update({ clicked_at: now, status: "clicked" })
        .eq("resend_email_id", emailId);
      break;

    case "email.bounced":
      await admin
        .from("email_logs")
        .update({ bounced_at: now, status: "bounced" })
        .eq("resend_email_id", emailId);
      // Otomatik olarak bounce eden aboneyi pasif yap
      await admin
        .from("subscribers")
        .update({ is_active: false })
        .eq("email", to);
      break;
  }

  return NextResponse.json({ received: true });
}
