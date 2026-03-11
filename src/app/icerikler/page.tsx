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
  },
  twitter: {
    card: "summary_large_image",
    title: "İçerikler — Klemens",
    description:
      "Sanat, kültür ve düşünce üzerine derinlemesine yazılar, röportajlar ve analizler.",
  },
};

export default async function IceriklerPage() {
  const articles = await getAllArticlesMetadata();

  return (
    <main className="min-h-screen bg-warm-50">

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
