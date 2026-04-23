import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { categories, getCategoryBySlug } from "@/lib/icerikler";
import { categoryStyles } from "@/lib/category-styles";
import { getAllArticlesMetadata } from "@/lib/markdown";
import ArticleCard from "@/components/ArticleCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const revalidate = 60;

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return { title: "Bulunamadı" };
  return {
    title: cat.title,
    description: cat.description,
    keywords: [cat.title, "sanat yazıları", "kültür makaleleri", "klemens art"],
    alternates: { canonical: `/icerikler/${slug}` },
    openGraph: {
      title: `${cat.title} — Klemens`,
      description: cat.description,
      url: `https://klemensart.com/icerikler/${slug}`,
      images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cat.title} — Klemens`,
      description: cat.description,
    },
  };
}

export default async function CategoryPage({

  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const allArticles = await getAllArticlesMetadata();
  const filtered = allArticles.filter((a) => a.category === category.title);
  const style = categoryStyles[slug] ?? categoryStyles["odak"];

  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-warm-50">

      {/* Category hero */}
      <section className="pt-32 pb-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">

          {/* Back link */}
          <Link
            href="/icerikler"
            className={`inline-flex items-center gap-2 text-sm font-medium text-warm-900/40 mb-8 transition-colors ${style.backHover}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Tüm İçerikler
          </Link>

          {/* Category badge */}
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${style.badgeClass}`}>
            {category.title}
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-warm-900 leading-tight mb-5">
            {category.title}
          </h1>
          <p className="text-lg text-warm-900/55 max-w-xl leading-relaxed mb-5">
            {category.description}
          </p>
          <p className="text-sm text-warm-900/30 font-medium">
            {filtered.length} yazı
          </p>

          {/* Other category links */}
          <div className="flex flex-wrap gap-3 mt-10">
            <Link
              href="/icerikler"
              className="px-5 py-2.5 bg-warm-50 text-warm-900/55 rounded-full text-sm font-semibold border border-warm-200 hover:bg-warm-100 transition-colors"
            >
              Tümü
            </Link>
            {categories
              .filter((c) => c.slug !== slug)
              .map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/icerikler/${cat.slug}`}
                  className="px-5 py-2.5 bg-warm-50 text-warm-900/55 rounded-full text-sm font-semibold border border-warm-200 hover:bg-warm-100 transition-colors"
                >
                  {cat.title}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((article, i) => (
                <ArticleCard key={article.slug} article={article} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-warm-900/30 text-lg">Bu kategoride henüz yazı yok.</p>
              <Link
                href="/icerikler"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-coral"
              >
                Tüm yazılara dön
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

    </main>
    <Footer />
    </>
  );
}
