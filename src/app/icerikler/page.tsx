import type { Metadata } from "next";
import { getAllArticlesMetadata } from "@/lib/markdown";
import IceriklerFilter from "@/components/IceriklerFilter";
import ArticleCard from "@/components/ArticleCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sanat Yazıları ve Kültür Analizleri | Klemens Art",
  description:
    "Sanat tarihi, felsefe ve kültür üzerine özgün yazılar. Rönesans'tan çağdaş sanata, mitolojiden sinemaya — her hafta yeni içerik.",
  keywords: [
    "sanat yazıları",
    "kültür sanat makaleleri",
    "sanat tarihi",
    "kültür analizi",
    "sanat eleştirisi",
    "düşünce yazıları",
    "sanat haberleri",
    "sergi incelemeleri",
  ],
  alternates: { canonical: "/icerikler" },
  openGraph: {
    title: "Sanat Yazıları ve Kültür Analizleri | Klemens Art",
    description:
      "Sanat tarihi, felsefe ve kültür üzerine özgün yazılar. Rönesans'tan çağdaş sanata, mitolojiden sinemaya — her hafta yeni içerik.",
    url: "https://klemensart.com/icerikler",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanat Yazıları ve Kültür Analizleri | Klemens Art",
    description:
      "Sanat tarihi, felsefe ve kültür üzerine özgün yazılar. Rönesans'tan çağdaş sanata, mitolojiden sinemaya — her hafta yeni içerik.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

type Props = {
  searchParams: Promise<{ kategori?: string }>;
};

export default async function IceriklerPage({ searchParams }: Props) {
  const { kategori } = await searchParams;
  const articles = await getAllArticlesMetadata();

  const filteredArticles = kategori
    ? articles.filter((a) => a.category === kategori)
    : articles;

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
    <>
    <Navbar />
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

      {/* Filtre pills — client component, Link href ile */}
      <IceriklerFilter aktifKategori={kategori ?? ""} />

      {/* Articles grid — server rendered */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {filteredArticles.length === 0 ? (
            <p className="text-warm-900/40 text-sm text-center py-16">
              Bu kategoride henüz yazı bulunmuyor.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map((article, i) => (
                <ArticleCard key={article.slug} article={article} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </section>

    </main>
    <Footer />
    </>
  );
}
