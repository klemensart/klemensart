"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView, trackPageLeave } from "@/lib/track";
import { hasConsent } from "@/lib/consent";

const EXCLUDED_PREFIXES = ["/admin", "/api", "/auth"];

function isExcluded(path: string): boolean {
  return EXCLUDED_PREFIXES.some((p) => path.startsWith(p));
}

export default function PageTracker() {
  const pathname = usePathname();
  const pageViewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const hiddenTimeRef = useRef<number>(0);
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (isExcluded(pathname) || !hasConsent()) return;

    // Yeni sayfa girişi
    pageViewIdRef.current = trackPageView(pathname, document.referrer);
    startTimeRef.current = Date.now();
    hiddenTimeRef.current = 0;
    hiddenAtRef.current = document.hidden ? Date.now() : null;

    function getActiveDuration(): number {
      let hidden = hiddenTimeRef.current;
      if (hiddenAtRef.current !== null) {
        hidden += Date.now() - hiddenAtRef.current;
      }
      return Date.now() - startTimeRef.current - hidden;
    }

    function sendLeave() {
      if (!pageViewIdRef.current) return;
      const duration = getActiveDuration();
      trackPageLeave(pageViewIdRef.current, pathname, duration);
      pageViewIdRef.current = null;
    }

    function handleVisibility() {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
      } else {
        if (hiddenAtRef.current !== null) {
          hiddenTimeRef.current += Date.now() - hiddenAtRef.current;
          hiddenAtRef.current = null;
        }
      }
    }

    function handleBeforeUnload() {
      sendLeave();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Route değişiminde çıkış gönder
      sendLeave();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);

  return null;
}
