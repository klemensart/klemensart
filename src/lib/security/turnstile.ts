const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string | undefined, ip: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Development mode or missing config — skip verification
  if (!secret || process.env.NODE_ENV === "development") return true;

  if (!token) return false;

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip && { remoteip: ip }),
      }),
    });

    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("[Turnstile] Verification failed:", err);
    // Fail-open: don't block users if Turnstile is down
    return true;
  }
}
