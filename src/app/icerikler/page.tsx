import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllArticlesMetadata } from "@/lib/markdown";
import IceriklerClient from "@/components/IceriklerClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "İçerikler",
  description:
    "Sanat, kültür ve düşünce üzerine derinlemesine yazılar, röportajlar ve analizler.",
  alternates: { canonical: "/icerikler" },
  openGraph: {
    title: "İçerikler — Klemens",
    description:
      "Sanat, kültür ve düşünce üzerine derinlemesine yazılar, röportajlar ve analizler.",
    url: "https://klemensart.com/icerikler",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "İçerikler — Klemens",
    description:
      "Sanat, kültür ve düşünce üzerine derinlemesine yazılar, röportajlar ve analizler.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default async function IceriklerPage() {
  const articles = await getAllArticlesMetadata();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Klemens Art İçerikler",
    description:
      "Sanat, kültür ve düşünce üzerine derinlemesine yazılar, röportajlar ve analizler.",
    url: "https://klemensart.com/icerikler",
    publisher: {
      "@type": "Organization",
      name: "Klemens Art",
      url: "https://klemensart.com",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 20).map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://klemensart.com/icerikler/yazi/${a.slug}`,
        name: a.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "İçerikler", item: "https://klemensart.com/icerikler" },
    ],
  };

  return (
    <main className="min-h-screen bg-warm-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Statik başlık */}
      <section className="pt-32 pb-0 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-4">
            İçerikler
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-warm-900 leading-tight mb-6">
            Tüm yazılar
          </h1>
          <p className="text-lg text-warm-900/55 max-w-xl leading-relaxed">
            Sanat, kültür ve düşünce üzerine derinlemesine analizler, röportajlar ve kent hikayeleri.
          </p>
        </div>
      </section>

      {/* Filtre + grid — client component, searchParams ile çalışır */}
      <Suspense fallback={<div className="bg-white h-20" />}>
        <IceriklerClient articles={articles} />
      </Suspense>

    </main>
  );
}
