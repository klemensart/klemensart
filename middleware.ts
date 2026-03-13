import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Eski WordPress query parametrelerini yakala
  const postType = request.nextUrl.searchParams.get("post_type");
  if (postType === "post" && request.nextUrl.searchParams.has("p")) {
    return NextResponse.redirect(new URL("/icerikler", request.url), 301);
  }
  if (request.nextUrl.searchParams.has("page_id")) {
    return NextResponse.redirect(new URL("/", request.url), 301);
  }
  // WooCommerce sepet URL'leri (?add-to-cart=*)
  if (request.nextUrl.searchParams.has("add-to-cart")) {
    return NextResponse.redirect(new URL("/atolyeler", request.url), 301);
  }

  // Auth kontrolü yalnızca /club/* rotalarında çalışsın
  // Diğer sayfalarda Supabase auth çağrısı yapma — cache header'ını bozar
  if (!pathname.startsWith("/club")) {
    return NextResponse.next();
  }

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
  if (pathname.startsWith("/club/profil") && !user) {
    return NextResponse.redirect(new URL("/club/giris", request.url));
  }

  // Zaten giriş yapmışsa /club/giris'e girmesin
  if (pathname.startsWith("/club/giris") && user) {
    return NextResponse.redirect(new URL("/club/profil", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/club/:path*",
    // WordPress kalıntı query param'ları (?add-to-cart, ?post_type, ?page_id)
    "/",
  ],
};
