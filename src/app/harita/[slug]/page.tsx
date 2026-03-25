import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PLACES, TYPE_LABELS, ERA_LABELS, type PlaceType, type EraType } from "@/lib/harita-data";
import { placeSlug, findPlaceBySlug } from "@/lib/harita-gamification";
import { createAdminClient } from "@/lib/supabase-admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ───────── Types ───────── */

type Props = { params: Promise<{ slug: string }> };

type Review = {
  id: string;
  rating: number;
  review_text: string | null;
  user_display_name: string | null;
  created_at: string;
};

/* ───────── Constants ───────── */

const TYPE_BADGE: Record<PlaceType, string> = {
  müze: "bg-blue-100 text-blue-700",
  galeri: "bg-coral/10 text-coral",
  konser: "bg-purple-100 text-purple-700",
  tiyatro: "bg-emerald-100 text-emerald-700",
  tarihi: "bg-amber-100 text-amber-700",
  edebiyat: "bg-violet-100 text-violet-700",
  miras: "bg-stone-200 text-stone-700",
  doğa: "bg-green-100 text-green-700",
  gastronomi: "bg-orange-100 text-orange-700",
  mimari: "bg-stone-100 text-stone-600",
};

const ERA_BADGE: Record<EraType, string> = {
  paleolitik: "bg-stone-100 text-stone-600",
  hitit: "bg-orange-100 text-orange-700",
  frig: "bg-yellow-100 text-yellow-700",
  roma: "bg-red-100 text-red-700",
  selcuklu: "bg-blue-100 text-blue-700",
  osmanli: "bg-green-100 text-green-700",
  cumhuriyet: "bg-coral/10 text-coral",
};

/* ───────── Helpers ───────── */

function getAllSlugs() {
  const seen = new Set<string>();
  return PLACES.map((p) => {
    const s = placeSlug(p.name);
    if (seen.has(s)) return null;
    seen.add(s);
    return s;
  }).filter(Boolean) as string[];
}

async function getReviews(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("map_reviews")
    .select("id, rating, review_text, user_display_name, created_at")
    .eq("place_slug", slug)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(10);
  return (data ?? []) as Review[];
}

/* ───────── SSG ───────── */

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/* ───────── Metadata ───────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const place = findPlaceBySlug(slug);
  if (!place) return { title: "Mekan Bulunamadı" };

  const typeLabel = TYPE_LABELS[place.type];
  const title = `${place.name} — Ankara Kültür Haritası — Klemens`;
  const metaDesc = place.longDesc ? place.longDesc.slice(0, 155) + "…" : place.desc;
  const description = `${metaDesc} ${typeLabel} — Ankara kültür haritasında keşfet.`;

  // Dinamik OG image
  const ogImageUrl = `/api/og?${new URLSearchParams({ title: place.name, subtitle: place.desc, category: typeLabel })}`;

  // Era-bazlı zengin keywords
  const eraKeywords = place.era
    ? (Array.isArray(place.era) ? place.era : [place.era]).map((e) => ERA_LABELS[e])
    : [];
  const keywords = [
    place.name,
    typeLabel,
    `Ankara ${typeLabel.toLowerCase()}`,
    "Ankara",
    "kültür haritası",
    "gezilecek yerler",
    ...eraKeywords,
    ...(place.type === "müze" ? ["Ankara müzeleri"] : []),
    ...(place.type === "tarihi" || place.type === "miras" ? ["tarihi yerler Ankara"] : []),
    ...(place.type === "mimari" ? ["Ankara mimari", "tarihi yapılar"] : []),
    ...(place.type === "doğa" ? ["Ankara parkları", "doğa"] : []),
    ...(place.type === "gastronomi" ? ["Ankara yemek kültürü", "lezzetler"] : []),
  ];

  return {
    title: place.name,
    description,
    keywords,
    alternates: { canonical: `/harita/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://klemensart.com/harita/${slug}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${place.name} — ${typeLabel}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

/* ───────── Page ───────── */

export default async function MekanDetayPage({ params }: Props) {
  const { slug } = await params;
  const place = findPlaceBySlug(slug);
  if (!place) notFound();

  const reviews = await getReviews(slug);
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  const typeLabel = TYPE_LABELS[place.type];
  const badge = TYPE_BADGE[place.type] ?? "bg-warm-100 text-warm-900/50";

  // Related places: same type, exclude self, shuffle & take 6
  const related = PLACES.filter(
    (p) => p.type === place.type && p.name !== place.name,
  )
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  /* ─── JSON-LD ─── */
  const attractionJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: place.name,
    description: place.longDesc || place.desc,
    image: `https://klemensart.com/api/og?${new URLSearchParams({ title: place.name, subtitle: place.desc, category: typeLabel })}`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: place.lat,
      longitude: place.lng,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ankara",
      addressCountry: "TR",
    },
    additionalType: typeLabel,
    isAccessibleForFree: true,
    ...(reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "Kültür Haritası", item: "https://klemensart.com/harita" },
      { "@type": "ListItem", position: 3, name: place.name, item: `https://klemensart.com/harita/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(attractionJsonLd) }}
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
            href="/harita"
            className="inline-flex items-center gap-2 text-sm font-medium text-warm-900/40 mb-8 hover:text-coral transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Kültür Haritası
          </Link>

          {/* Category badge */}
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${badge}`}>
            {typeLabel}
          </span>

          {/* Era badges */}
          {place.era && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(Array.isArray(place.era) ? place.era : [place.era]).map((era) => (
                <span key={era} className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${ERA_BADGE[era]}`}>
                  {ERA_LABELS[era]}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight mb-6">
            {place.name}
          </h1>

          {/* Location + Practical Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-warm-900/55 mb-8">
            <span className="inline-flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Ankara
            </span>
            {place.hours && (
              <span className="inline-flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {place.hours}
              </span>
            )}
            {place.admission && (
              <span className="inline-flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                {place.admission}
              </span>
            )}
          </div>

          {/* Image */}
          {place.image && (
            <div className="rounded-2xl overflow-hidden border border-warm-100 mb-8">
              <img
                src={place.image}
                alt={`${place.name} — bilgi görseli`}
                className="w-full h-auto"
                loading="eager"
              />
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl border border-warm-100 p-8 mb-8">
            {place.longDesc ? (
              <div className="space-y-4">
                {place.longDesc.split("\n\n").map((para, i) => (
                  <p key={i} className="text-warm-900 text-base leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-warm-900 text-base leading-relaxed">
                {place.desc}
              </p>
            )}
          </div>

          {/* Fun Facts */}
          {place.funFacts && place.funFacts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <h2 className="text-base font-bold text-amber-900">Biliyor Musun?</h2>
              </div>
              <ol className="space-y-2">
                {place.funFacts.map((fact, i) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-900/80 leading-relaxed">
                    <span className="font-bold text-amber-600 flex-shrink-0">{i + 1}.</span>
                    {fact}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tips */}
          {place.tips && place.tips.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📌</span>
                <h2 className="text-base font-bold text-blue-900">Ziyaretçi İpuçları</h2>
              </div>
              <ul className="space-y-1.5">
                {place.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-blue-900/80 leading-relaxed">
                    <span className="text-blue-400 flex-shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(avgRating) ? "#FFB300" : "none"}
                    stroke="#FFB300"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-warm-900">{avgRating}</span>
              <span className="text-sm text-warm-900/50">({reviews.length} değerlendirme)</span>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="space-y-4 mb-10">
              <h2 className="text-lg font-bold text-warm-900">Kullanıcı Yorumları</h2>
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-xl border border-warm-100 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-warm-900">
                      {r.user_display_name ?? "Anonim"}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={star <= r.rating ? "#FFB300" : "none"}
                          stroke="#FFB300"
                          strokeWidth="2"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {r.review_text && (
                    <p className="text-sm text-warm-900/70 leading-relaxed">{r.review_text}</p>
                  )}
                  <p className="text-xs text-warm-900/30 mt-2">
                    {new Date(r.created_at).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* CTA — Haritada Keşfet */}
          <Link
            href="/harita"
            className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity mb-12"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Haritada Keşfet
          </Link>

          {/* Related places */}
          {related.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-warm-900 mb-4">
                Aynı Kategoriden Mekanlar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((rp) => {
                  const rpSlug = placeSlug(rp.name);
                  return (
                    <Link
                      key={rpSlug}
                      href={`/harita/${rpSlug}`}
                      className="bg-white rounded-xl border border-warm-100 p-5 hover:border-coral/30 hover:shadow-sm transition-all"
                    >
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2 ${TYPE_BADGE[rp.type] ?? "bg-warm-100 text-warm-900/50"}`}>
                        {TYPE_LABELS[rp.type]}
                      </span>
                      <h3 className="text-sm font-bold text-warm-900 mb-1">{rp.name}</h3>
                      <p className="text-xs text-warm-900/50 line-clamp-2">{rp.desc}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
