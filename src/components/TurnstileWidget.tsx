"use client";

import { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>
      ) => string;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface Props {
  onVerify: (token: string) => void;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_ID = "cf-turnstile-script";

export default function TurnstileWidget({ onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      callback: (token: string) => onVerify(token),
    });
  }, [onVerify]);

  useEffect(() => {
    // No site key configured — skip entirely (dev mode)
    if (!SITE_KEY) {
      onVerify("dev-bypass");
      return;
    }

    // Script already loaded
    if (window.turnstile) {
      setReady(true);
      return;
    }

    // Already loading
    if (document.getElementById(SCRIPT_ID)) {
      window.onTurnstileLoad = () => setReady(true);
      return;
    }

    // Load the script
    window.onTurnstileLoad = () => setReady(true);

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    script.async = true;
    document.head.appendChild(script);

    // Fallback: if script doesn't load within 5s, bypass
    const fallback = setTimeout(() => {
      if (!window.turnstile) onVerify("timeout-bypass");
    }, 5000);

    return () => clearTimeout(fallback);
  }, [onVerify]);

  useEffect(() => {
    if (ready) renderWidget();

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [ready, renderWidget]);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} />;
}
