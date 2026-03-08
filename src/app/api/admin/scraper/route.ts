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

  // Scraper endpoint'ini server-side çağır
  // Admin proxy zaten kullanıcıyı doğruladı, CRON_SECRET + cron header ile garanti et
  const origin = req.nextUrl.origin;
  const secret = process.env.CRON_SECRET;
  const headers: Record<string, string> = {};
  if (secret) {
    headers["Authorization"] = `Bearer ${secret}`;
  } else {
    // CRON_SECRET yoksa internal cron header ile tetikle (proxy admin-only)
    headers["x-vercel-cron"] = "1";
  }
  const res = await fetch(`${origin}/api/scraper`, { headers });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
