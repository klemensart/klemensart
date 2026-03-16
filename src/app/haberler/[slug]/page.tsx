import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type NewsRow = {
  id: string;
  title: string;
  summary: string | null;
  url: string | null;
  image_url: string | null;
  source_name: string | null;
  published_at: string | null;
  slug: string;
};

type Props = { params: Promise<{ slug: string }> };

async function getNewsBySlug(slug: string): Promise<NewsRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("news_items")
    .select("id, title, summary, url, image_url, source_name, published_at, slug")
    .eq("slug", slug)
    .in("status", ["published", "archived"])
    .maybeSingle();

  return (data as NewsRow) ?? null;
}

async function getRelatedNews(currentId: string): Promise<NewsRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("news_items")
    .select("id, title, summary, url, image_url, source_name, published_at, slug")
    .in("status", ["published", "archived"])
    .neq("id", currentId)
    .order("published_at", { ascending: false })
    .limit(4);

  return (data as NewsRow[]) ?? [];
}

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("news_items")
    .select("slug")
    .in("status", ["published", "archived"])
    .order("published_at", { ascending: false })
    .limit(100);

  return (data ?? []).map((item) => ({ slug: item.slug }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) return { title: "Haber Bulunamadı" };

  const description = news.summary
    ? news.summary.slice(0, 160)
    : `${news.title} — Klemens Art kültür sanat haberleri`;

  return {
    title: news.title,
    description,
    keywords: [
      "kültür sanat haberleri",
      "sanat haberleri",
      news.source_name ?? "kültür haberleri",
    ],
    alternates: { canonical: `/haberler/${slug}` },
    openGraph: {
      title: news.title,
      description,
      url: `https://klemensart.com/haberler/${slug}`,
      ...(news.image_url && {
        images: [{ url: news.image_url, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description,
      ...(news.image_url && { images: [news.image_url] }),
    },
  };
}

function fmtFullDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShortDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function HaberDetayPage({ params }: Props) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) notFound();

  const related = await getRelatedNews(news.id);

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.summary ?? news.title,
    url: `https://klemensart.com/haberler/${slug}`,
    datePublished: news.published_at ?? undefined,
    ...(news.image_url && { image: news.image_url }),
    author: {
      "@type": "Organization",
      name: news.source_name ?? "Klemens Art",
    },
    publisher: {
      "@type": "Organization",
      name: "Klemens Art",
      url: "https://klemensart.com",
      logo: {
        "@type": "ImageObject",
        url: "https://klemensart.com/logos/logo-wide-dark.PNG",
      },
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
        name: "Haberler",
        item: "https://klemensart.com/haberler",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: news.title,
        item: `https://klemensart.com/haberler/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="bg-warm-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">

          {/* Back link */}
          <Link
            href="/haberler"
            className="inline-flex items-center gap-2 text-sm font-medium text-warm-900/40 mb-8 hover:text-coral transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Tüm Haberler
          </Link>

          {/* Source badge */}
          {news.source_name && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-warm-100 text-warm-900/60 mb-4">
              {news.source_name}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-warm-900 leading-tight mb-4">
            {news.title}
          </h1>

          {/* Date */}
          {news.published_at && (
            <p className="text-sm text-warm-900/45 mb-8">
              {fmtFullDate(news.published_at)}
            </p>
          )}

          {/* Image */}
          {news.image_url && (
            <div className="rounded-2xl overflow-hidden mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Summary */}
          {news.summary && (
            <div className="bg-white rounded-2xl border border-warm-100 p-8 mb-8">
              <p className="text-warm-900 text-base leading-relaxed whitespace-pre-line">
                {news.summary}
              </p>
            </div>
          )}

          {/* CTA */}
          {news.url && (
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity mb-12"
            >
              Yazının Tamamını Oku
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}

          {/* Related news */}
          {related.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-6">
                Diğer Haberler
              </h2>
              <div className="space-y-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/haberler/${item.slug}`}
                    className="block bg-white rounded-xl border border-warm-100 p-4 hover:border-warm-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex gap-3 items-start">
                      {item.image_url && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-warm-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-warm-900 group-hover:text-coral transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-warm-900/40 mt-1">
                          {fmtShortDate(item.published_at)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-warm-900/20 group-hover:text-coral transition-colors"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
