import type { Metadata } from "next";
import { SLUG_TO_ATOLYE } from "@/lib/atolyeler-config";
import AtolyelerClient from "./AtolyelerClient";

export const metadata: Metadata = {
  title: "Atölyeler",
  description:
    "Canlı Zoom atölyeleri ve tekli oturumlar ile sanat tarihine derinlemesine dalış. Sanat Tarihinde Duygular, Modern Sanat, Rönesans ve daha fazlası.",
  alternates: { canonical: "/atolyeler" },
  openGraph: {
    title: "Sanat Tarihi Atölyeleri — Klemens",
    description:
      "Canlı Zoom atölyeleri ve tekli oturumlar ile sanat tarihine derinlemesine dalış.",
    url: "https://klemensart.com/atolyeler",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanat Tarihi Atölyeleri — Klemens",
    description:
      "Canlı Zoom atölyeleri ve tekli oturumlar ile sanat tarihine derinlemesine dalış.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default function AtolyelerPage() {
  const workshops = Object.entries(SLUG_TO_ATOLYE);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Klemens Art Sanat Tarihi Atölyeleri",
    description:
      "Canlı Zoom atölyeleri ve tekli oturumlar ile sanat tarihine derinlemesine dalış.",
    url: "https://klemensart.com/atolyeler",
    publisher: {
      "@type": "Organization",
      name: "Klemens Art",
      url: "https://klemensart.com",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: workshops.length,
      itemListElement: workshops.map(([slug, cfg], i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Course",
          name: slug.replace(/-/g, " "),
          url: `https://klemensart.com/atolyeler/${slug}`,
          provider: { "@type": "Organization", name: "Klemens Art" },
          ...(cfg.price > 0 && {
            offers: {
              "@type": "Offer",
              price: cfg.price / 100,
              priceCurrency: "TRY",
              availability: cfg.forSale
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
            },
          }),
        },
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "Atölyeler", item: "https://klemensart.com/atolyeler" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AtolyelerClient />
    </>
  );
}
