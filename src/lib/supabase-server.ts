import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * Server-side Supabase client (cookie-based — web).
 * Kullan: Server Components ve Route Handlers'da.
 * Client bileşenlerinde KULLANMA — "next/headers" sadece sunucuda çalışır.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component'te set çağrısı — middleware halleder
          }
        },
      },
    }
  );
}

/**
 * Mobil client için Bearer token destekli Supabase client.
 * API route'larında: Authorization header varsa token client, yoksa cookie client kullan.
 */
export function createRequestSupabaseClient(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );
    return client;
  }
  // Fallback: cookie-based client (web)
  return null;
}

/**
 * Birleşik auth resolver: Bearer token varsa token client, yoksa cookie client.
 * Mobil + web route'larında tek fonksiyonla kullan.
 */
export async function resolveSupabaseClient(req: NextRequest) {
  const tokenClient = createRequestSupabaseClient(req);
  if (tokenClient) return tokenClient;
  return createServerSupabaseClient();
}
