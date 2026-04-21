"use client";

import { useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "sergi_promo_dismissed";

/**
 * Thin client wrapper — only handles dismiss localStorage logic.
 * Banner content is rendered server-side via children.
 */
export default function SergiPromoDismiss({ children }: { children: ReactNode }) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(STORAGE_KEY)) {
      setDismissed(true);
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  // Before mount: render children (server HTML visible, no flash)
  // After mount: if dismissed, hide
  if (mounted && dismissed) return null;

  return (
    <div className="relative">
      {children}
      {/* Dismiss button — only interactive after hydration */}
      <button
        onClick={handleDismiss}
        aria-label="Kapat"
        className="absolute top-22 md:top-26 right-4 z-20 text-white/50 hover:text-white transition-colors cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M5 5l10 10M15 5L5 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
