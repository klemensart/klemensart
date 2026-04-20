import { Suspense } from "react";
import type { Metadata } from "next";
import BultenClient from "./BultenClient";

export const metadata: Metadata = {
  title: "E-Bülten — Klemens Art",
  description:
    "Her hafta kültür, sanat, sinema ve felsefe dünyasından kürate haberler, etkinlik duyuruları ve özel içerikler — doğrudan e-posta kutunuza.",
  keywords: [
    "klemens art e-bülten",
    "kültür sanat bülteni",
    "haftalık sanat haberleri",
    "sanat etkinlikleri bülten",
    "kültür bülteni abone",
  ],
  alternates: { canonical: "/bulten" },
  openGraph: {
    title: "E-Bülten — Klemens Art",
    description:
      "Her hafta kültür, sanat, sinema ve felsefe dünyasından kürate haberler — doğrudan e-posta kutunuza.",
    url: "https://klemensart.com/bulten",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Bülten — Klemens Art",
    description:
      "Her hafta kültür, sanat, sinema ve felsefe dünyasından kürate haberler — doğrudan e-posta kutunuza.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default async function BultenPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "E-Bülten — Klemens Art",
    description:
      "Her hafta kültür, sanat, sinema ve felsefe dünyasından kürate haberler.",
    url: "https://klemensart.com/bulten",
    publisher: {
      "@type": "Organization",
      name: "Klemens Art",
      url: "https://klemensart.com",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: "https://klemensart.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "E-Bülten",
        item: "https://klemensart.com/bulten",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense>
        <BultenClient />
      </Suspense>
    </>
  );
}
