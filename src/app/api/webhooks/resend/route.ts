import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

type ResendEvent = {
  type: "email.opened" | "email.clicked" | "email.bounced" | "email.delivered" | string;
  data: {
    email_id: string;
    to: string[];
    created_at: string;
  };
};

async function updateLog(
  admin: ReturnType<typeof createAdminClient>,
  emailId: string,
  subscriberEmail: string,
  field: string,
  now: string,
  status: string,
) {
  // 1) Try matching by resend_email_id
  const { data: matched } = await admin
    .from("email_logs")
    .update({ [field]: now, status })
    .eq("resend_email_id", emailId)
    .select("id");

  if (matched && matched.length > 0) return;

  // 2) Fallback: match by subscriber_email, most recent log without this field set
  const { data: fallback } = await admin
    .from("email_logs")
    .select("id")
    .eq("subscriber_email", subscriberEmail)
    .is(field, null)
    .order("sent_at", { ascending: false })
    .limit(1);

  if (fallback && fallback.length > 0) {
    await admin
      .from("email_logs")
      .update({ [field]: now, status })
      .eq("id", fallback[0].id);
  }
}

export async function POST(req: NextRequest) {
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
      await updateLog(admin, emailId, to, "opened_at", now, "opened");
      break;

    case "email.clicked":
      await updateLog(admin, emailId, to, "clicked_at", now, "clicked");
      break;

    case "email.bounced":
      await updateLog(admin, emailId, to, "bounced_at", now, "bounced");
      // Bounce eden aboneyi pasif yap
      await admin
        .from("subscribers")
        .update({ is_active: false })
        .eq("email", to);
      break;
  }

  return NextResponse.json({ received: true });
}
