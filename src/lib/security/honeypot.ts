import { NextResponse } from "next/server";

/**
 * If a bot filled the honeypot field, return a fake success response.
 * Returns null if the request is legitimate (field empty or missing).
 */
export function checkHoneypot(body: Record<string, unknown>): NextResponse | null {
  if (body.website) {
    // Bot filled the hidden field — return fake success so it doesn't retry
    return NextResponse.json({ message: "Abone oldunuz!" });
  }
  return null;
}
