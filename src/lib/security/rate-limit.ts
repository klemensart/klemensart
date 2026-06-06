import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

function createRateLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    prefix: "subscribe",
  });
}

let _limiter: Ratelimit | null | undefined;

function getLimiter() {
  if (_limiter === undefined) {
    _limiter = createRateLimiter();
  }
  return _limiter;
}

/**
 * Rate-limit by client IP. Returns { success, remaining } or null if limiter is unavailable.
 * Fail-open: if Upstash is down or unconfigured, returns null (allow request).
 */
export async function checkRateLimit(ip: string): Promise<{ success: boolean; remaining: number } | null> {
  const limiter = getLimiter();
  if (!limiter) return null;

  try {
    const result = await limiter.limit(ip);
    return { success: result.success, remaining: result.remaining };
  } catch (err) {
    console.error("[RateLimit] Upstash error:", err);
    // Fail-open
    return null;
  }
}

/**
 * Extract client IP from a NextRequest, respecting common proxy headers.
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
