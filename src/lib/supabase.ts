import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client-side Supabase client.
 * Kullan: "use client" bileşenlerinde (Navbar, GirisPage, ProfilPage…)
 *
 * PKCE flow: magic link / OAuth → ?code= ile callback'e gelir,
 * server-side route handler (auth/callback/route.ts) kodu session'a çevirir.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { flowType: "pkce" },
  });
}
