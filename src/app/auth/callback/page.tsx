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
    let handled = false;

    const handle = async (event: string) => {
      if (handled) return;
      handled = true;

      if (event === "PASSWORD_RECOVERY") {
        router.replace("/auth/sifre-belirle");
      } else if (event === "SIGNED_IN") {
        try {
          await fetch("/api/auth/migrate-purchases", { method: "POST" });
        } catch {}
        router.replace("/club/profil");
      } else {
        router.replace("/club/giris");
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      handle(event);
    });

    // Fallback: event kaçarsa (race condition), 2sn sonra session kontrol et
    const timer = setTimeout(async () => {
      if (handled) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handle("SIGNED_IN");
      } else {
        handle("SIGNED_OUT");
      }
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-warm-50 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-coral border-t-transparent animate-spin" />
    </main>
  );
}
