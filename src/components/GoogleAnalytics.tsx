"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { hasConsent } from "@/lib/consent";

const GA_ID = "G-37W18THT4G";

export default function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = () => setAllowed(hasConsent() === true);
    check();
    // Cross-tab consent changes
    window.addEventListener("storage", check);
    // Same-tab consent changes (custom event fired by consent UI)
    window.addEventListener("consent-changed", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("consent-changed", check);
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
