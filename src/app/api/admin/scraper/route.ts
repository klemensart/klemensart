import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-check";

/**
 * Admin panelinden scraper'ı tetiklemek için proxy endpoint.
 * CRON_SECRET'i browser'a vermeden server-side forward eder.
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Scraper endpoint'ini server-side çağır — CRON_SECRET sadece sunucuda
  const origin = req.nextUrl.origin;
  const res = await fetch(`${origin}/api/scraper`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
