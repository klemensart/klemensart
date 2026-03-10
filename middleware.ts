import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { waitForDebugger } from "node:inspector";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Session'ı yenile (token süresi dolmuşsa refresh eder)
  const { data: { user } } = await supabase.auth.getUser();

  // /club/profil → giriş yapmamışsa yönlendir
  if (request.nextUrl.pathname.startsWith("/club/profil") && !user) {
    return NextResponse.redirect(new URL("/club/giris", request.url));
  }

  // Zaten giriş yapmışsa /club/giris'e girmesin
  if (request.nextUrl.pathname.startsWith("/club/giris") && user) {
    return NextResponse.redirect(new URL("/club/profil", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/club/:path*"],
};
