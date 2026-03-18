import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-check";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = (await req.json()) as { url?: string };
  if (!url?.trim()) {
    return NextResponse.json({ image_url: null });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    // 1. OG / Twitter meta
    let image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[property="og:image:url"]').attr("content") ||
      null;

    // 2. Fallback: makale içindeki ilk büyük görsel
    if (!image) {
      const selectors = ["article img", ".entry-content img", ".post-content img", "main img", ".content img"];
      for (const sel of selectors) {
        const src = $(sel).first().attr("src") || $(sel).first().attr("data-src");
        if (src && !src.includes("logo") && !src.includes("icon") && !src.includes("avatar")) {
          image = src.startsWith("http") ? src : new URL(src, url).href;
          break;
        }
      }
    }

    return NextResponse.json({ image_url: image });
  } catch {
    return NextResponse.json({ image_url: null });
  }
}
