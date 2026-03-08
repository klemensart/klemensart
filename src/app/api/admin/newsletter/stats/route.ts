import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

export async function GET() {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get all email logs (paginate to avoid Supabase 1000-row default limit)
  type LogRow = {
    subscriber_email: string;
    subject: string;
    sent_at: string;
    opened_at: string | null;
    clicked_at: string | null;
    bounced_at: string | null;
    status: string | null;
  };
  const allLogs: LogRow[] = [];
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: page } = await admin
      .from("email_logs")
      .select("subscriber_email, subject, sent_at, opened_at, clicked_at, bounced_at, status")
      .order("sent_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (page && page.length > 0) {
      allLogs.push(...page);
      from += pageSize;
      hasMore = page.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  // Get active subscribers
  const { data: subs } = await admin
    .from("subscribers")
    .select("email")
    .eq("is_active", true);

  const activeEmails = new Set((subs ?? []).map((s) => s.email));

  // Per-campaign stats (group by subject)
  const campaignMap = new Map<string, {
    subject: string;
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
    lastSent: string;
  }>();

  for (const log of allLogs) {
    const key = log.subject;
    const existing = campaignMap.get(key);
    if (!existing) {
      campaignMap.set(key, {
        subject: key,
        sent: 1,
        opened: log.opened_at ? 1 : 0,
        clicked: log.clicked_at ? 1 : 0,
        bounced: log.bounced_at ? 1 : 0,
        lastSent: log.sent_at,
      });
    } else {
      existing.sent++;
      if (log.opened_at) existing.opened++;
      if (log.clicked_at) existing.clicked++;
      if (log.bounced_at) existing.bounced++;
    }
  }

  const campaigns = Array.from(campaignMap.values())
    .sort((a, b) => new Date(b.lastSent).getTime() - new Date(a.lastSent).getTime());

  // Subscriber engagement: who opened in last N days
  const now = Date.now();
  const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();

  const recentOpeners = new Set(
    allLogs
      .filter((l) => l.opened_at && l.sent_at >= sixtyDaysAgo)
      .map((l) => l.subscriber_email)
  );

  // Inactive = active subscribers who haven't opened anything in 60 days
  // (either never received or never opened)
  const inactiveSubscribers = [...activeEmails].filter((email) => !recentOpeners.has(email));

  return NextResponse.json({
    campaigns,
    totalActive: activeEmails.size,
    openedLast60Days: recentOpeners.size,
    inactiveLast60Days: inactiveSubscribers.length,
    inactiveEmails: inactiveSubscribers,
  });
}
