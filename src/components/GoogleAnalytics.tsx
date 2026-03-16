"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { hasConsent } from "@/lib/consent";

const GA_ID = "G-37W18THT4G";

export default function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Check on mount and whenever consent changes (storage event)
    const check = () => setAllowed(hasConsent() === true);
    check();
    window.addEventListener("storage", check);
    // Also listen for same-tab consent changes
    const interval = setInterval(check, 1000);
    return () => {
      window.removeEventListener("storage", check);
      clearInterval(interval);
    };
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
