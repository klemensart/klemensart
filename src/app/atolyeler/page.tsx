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
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanat Tarihi Atölyeleri — Klemens",
    description:
      "Canlı Zoom atölyeleri ve tekli oturumlar ile sanat tarihine derinlemesine dalış.",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <AtolyelerClient />
    </>
  );
}
