import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { CookieOptions } from "@supabase/ssr";

/**
 * PKCE callback — server-side kod değişimi.
 *
 * Akış:
 *   1. Kullanıcı magic link'e / Google OAuth'a tıklar
 *   2. Supabase doğrulama yapar ve ?code=xxx ile buraya yönlendirir
 *   3. Bu handler kodu session'a çevirir (cookie set eder)
 *   4. /club/profil veya /auth/sifre-belirle'ye redirect
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/club/profil";

  console.log("[auth/callback] origin:", origin, "code:", code ? "YES" : "NO");

  if (code) {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log(
      "[auth/callback] request cookies:",
      allCookies.map((c) => c.name)
    );

    // Cookie'leri ayrı bir listede tut — redirect response'a açıkça eklemek için
    const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet) => {
            console.log(
              "[auth/callback] setAll called, cookies:",
              toSet.map((c) => c.name)
            );
            pendingCookies.push(...toSet);
            try {
              toSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (e) {
              console.error("[auth/callback] cookieStore.set error:", e);
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] exchangeCodeForSession FAILED:", error.message, error.status);
    } else {
      console.log("[auth/callback] exchangeCodeForSession SUCCESS, pendingCookies:", pendingCookies.length);

      // Şifre sıfırlama ise özel sayfaya yönlendir
      const type = searchParams.get("type");
      const redirectUrl =
        type === "recovery"
          ? `${origin}/auth/sifre-belirle`
          : `${origin}${next}`;

      const response = NextResponse.redirect(redirectUrl);

      // Session cookie'lerini redirect response'a açıkça ekle
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

      console.log("[auth/callback] redirecting to:", redirectUrl);

      // Satın alma taşıma (anonim → üye)
      try {
        await fetch(`${origin}/api/auth/migrate-purchases`, {
          method: "POST",
          headers: { Cookie: cookieStore.toString() },
        });
      } catch {
        // Başarısız olsa bile devam et
      }

      return response;
    }
  } else {
    console.error("[auth/callback] NO code in URL, searchParams:", Object.fromEntries(searchParams));
  }

  // Kod yoksa veya hata varsa → giriş sayfasına
  console.log("[auth/callback] falling back to /club/giris");
  return NextResponse.redirect(`${origin}/club/giris`);
}
