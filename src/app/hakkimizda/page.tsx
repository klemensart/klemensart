import type { Metadata } from "next";
import { getAllArticlesMetadata } from "@/lib/markdown";
import HakkimizdaClient from "@/components/HakkimizdaClient";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Klemens ekibini tanıyın. Sanat, kültür ve düşünce dünyasına birbirine bağlı zihinlerle yaklaşan bir kolektif.",
  alternates: { canonical: "/hakkimizda" },
  openGraph: {
    title: "Hakkımızda — Klemens",
    description:
      "Sanat, kültür ve düşünce dünyasına birbirine bağlı zihinlerle yaklaşan bir kolektif.",
    url: "https://klemensart.com/hakkimizda",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hakkımızda — Klemens",
    description:
      "Sanat, kültür ve düşünce dünyasına birbirine bağlı zihinlerle yaklaşan bir kolektif.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default async function HakkimizdaPage() {
  const articles = await getAllArticlesMetadata();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "Hakkımızda", item: "https://klemensart.com/hakkimizda" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <HakkimizdaClient articles={articles} />
    </>
  );
}
