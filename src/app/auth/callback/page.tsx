"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

/**
 * Implicit flow callback sayfası.
 * Google OAuth sonrası Supabase bu sayfaya #access_token=... hash'iyle yönlendirir.
 * createBrowserClient (detectSessionInUrl: true) hash'i otomatik işler,
 * SIGNED_IN eventi ateşlendiğinde /club/profil'e yönlendiririz.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        // Satın alma taşıma — başarısız olsa bile profil'e yönlendir
        try {
          await fetch("/api/auth/migrate-purchases", { method: "POST" });
        } catch {}
        router.replace("/club/profil");
      } else if (event === "SIGNED_OUT") {
        router.replace("/club/giris");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-warm-50 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-coral border-t-transparent animate-spin" />
    </main>
  );
}
