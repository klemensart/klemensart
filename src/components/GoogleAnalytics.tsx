"use client";

import Script from "next/script";
import { useEffect } from "react";
import { hasConsent } from "@/lib/consent";

const GA_ID = "G-37W18THT4G";

export default function GoogleAnalytics() {
  useEffect(() => {
    function updateConsent() {
      const consent = hasConsent();
      if (consent === null) return; // henüz karar verilmedi — default (denied) korunur
      const status = consent ? "granted" : "denied";
      window.gtag?.("consent", "update", {
        analytics_storage: status,
        ad_storage: status,
      });
    }

    updateConsent();
    window.addEventListener("storage", updateConsent);
    window.addEventListener("consent-changed", updateConsent);
    return () => {
      window.removeEventListener("storage", updateConsent);
      window.removeEventListener("consent-changed", updateConsent);
    };
  }, []);

  return (
    <>
      {/* Consent Mode v2 — default denied, sonra kabul edilince granted */}
      <Script id="ga4-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
