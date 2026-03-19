"use client";

import { hasConsent } from "./consent";

const ANON_KEY = "ka_anon_id";

function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  if (!hasConsent()) return "";

  let id = localStorage.getItem(ANON_KEY);
  if (id) return id;

  // cookie'den dene
  const match = document.cookie.match(new RegExp(`(?:^|; )${ANON_KEY}=([^;]*)`));
  if (match) {
    id = decodeURIComponent(match[1]);
    localStorage.setItem(ANON_KEY, id);
    return id;
  }

  // Yeni oluştur
  id = crypto.randomUUID();
  localStorage.setItem(ANON_KEY, id);
  // 1 yıl cookie
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${ANON_KEY}=${encodeURIComponent(id)}; path=/; expires=${expires}; SameSite=Lax`;
  return id;
}

export function trackPageView(path: string, referrer?: string): string | null {
  if (!hasConsent()) return null;

  const pageViewId = crypto.randomUUID();
  try {
    const body = {
      event_type: "page_view",
      anonymous_id: getAnonymousId(),
      metadata: { page_view_id: pageViewId, path, referrer: referrer || null },
    };

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // sessizce yut
  }
  return pageViewId;
}

export function trackPageLeave(
  pageViewId: string,
  path: string,
  durationMs: number,
): void {
  if (!hasConsent()) return;
  if (durationMs < 500) return; // bounce noise filtrele

  const body = JSON.stringify({
    event_type: "page_leave",
    anonymous_id: getAnonymousId(),
    metadata: { page_view_id: pageViewId, path, duration_ms: Math.round(durationMs) },
  });

  // sendBeacon tercih — sayfa kapanırken güvenilir
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/track",
      new Blob([body], { type: "application/json" }),
    );
  } else {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

export function trackEvent(
  eventType: string,
  data?: {
    workshopId?: string;
    workshopSlug?: string;
    metadata?: Record<string, unknown>;
  },
) {
  if (!hasConsent()) return;

  try {
    const body = {
      event_type: eventType,
      anonymous_id: getAnonymousId(),
      workshop_id: data?.workshopId,
      workshop_slug: data?.workshopSlug,
      metadata: data?.metadata,
    };

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // sessizce yut
  }
}
