import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/harita-data";
import { routeSlug, findRouteBySlug, placeSlug, findPlaceBySlug } from "@/lib/harita-gamification";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ───────── Types ───────── */

type Props = { params: Promise<{ slug: string }> };

/* ───────── SSG ───────── */

export async function generateStaticParams() {
  const seen = new Set<string>();
  return ROUTES.map((r) => {
    const s = routeSlug(r.title);
    if (seen.has(s)) return null;
    seen.add(s);
    return { slug: s };
  }).filter(Boolean) as { slug: string }[];
}

/* ───────── Metadata ───────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = findRouteBySlug(slug);
  if (!route) return { title: "Rota Bulunamadı" };

  const title = `${route.title} — Ankara Kültür Rotası — Klemens`;
  const description = `${route.desc} ${route.stops.length} durak, ${route.duration}. Ankara kültür rotasını haritada keşfet.`;
  const ogImageUrl = `/api/og?${new URLSearchParams({ title: route.title, subtitle: route.desc, category: "Kültür Rotası" })}`;

  return {
    title: route.title,
    description,
    keywords: [
      route.title,
      "Ankara kültür rotası",
      "Ankara yürüyüş rotası",
      "gezilecek yerler",
      "tematik rota",
      ...route.stops.map((s) => s.name),
    ],
    alternates: { canonical: `/harita/rotalar/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://klemensart.com/harita/rotalar/${slug}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: route.title }],
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

export default async function RotaDetayPage({ params }: Props) {
  const { slug } = await params;
  const route = findRouteBySlug(slug);
  if (!route) notFound();

  /* ─── JSON-LD ─── */
  const tripJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: route.title,
    description: route.desc,
    touristType: "Kültür ve Sanat",
    itinerary: {
      "@type": "ItemList",
      numberOfItems: route.stops.length,
      itemListElement: route.stops.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Place",
          name: s.name,
          description: s.story,
          geo: {
            "@type": "GeoCoordinates",
            latitude: s.lat,
            longitude: s.lng,
          },
        },
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "Kültür Haritası", item: "https://klemensart.com/harita" },
      { "@type": "ListItem", position: 3, name: route.title, item: `https://klemensart.com/harita/rotalar/${slug}` },
    ],
  };

  // Related routes: other routes, take 4
  const related = ROUTES.filter((r) => r.id !== route.id).slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tripJsonLd) }}
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

          {/* Route badge */}
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-coral/10 text-coral">
            Kültür Rotası
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight mb-4">
            <span className="mr-3">{route.icon}</span>
            {route.title}
          </h1>

          {/* Duration + stops count */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-warm-900/55 mb-8">
            <span>{route.duration}</span>
            <span>{route.stops.length} durak</span>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-warm-100 p-8 mb-8">
            <p className="text-warm-900 text-base leading-relaxed">
              {route.desc}
            </p>
          </div>

          {/* Stops */}
          <h2 className="text-lg font-bold text-warm-900 mb-4">Rota Durakları</h2>
          <div className="space-y-4 mb-10">
            {route.stops.map((stop, i) => {
              const stopPlace = findPlaceBySlug(placeSlug(stop.name));
              return (
                <div key={i} className="bg-white rounded-xl border border-warm-100 p-6 relative">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: route.color }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      {stopPlace ? (
                        <Link href={`/harita/${placeSlug(stop.name)}`} className="text-base font-bold text-warm-900 hover:text-coral transition-colors">
                          {stop.name}
                        </Link>
                      ) : (
                        <h3 className="text-base font-bold text-warm-900">{stop.name}</h3>
                      )}
                      <p className="text-sm text-warm-900/60 leading-relaxed mt-1">
                        {stop.story}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <Link
            href="/harita"
            className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity mb-12"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Haritada Bu Rotayı Keşfet
          </Link>

          {/* Related routes */}
          {related.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-warm-900 mb-4">
                Diğer Kültür Rotaları
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((rr) => {
                  const rrSlug = routeSlug(rr.title);
                  return (
                    <Link
                      key={rr.id}
                      href={`/harita/rotalar/${rrSlug}`}
                      className="bg-white rounded-xl border border-warm-100 p-5 hover:border-coral/30 hover:shadow-sm transition-all"
                    >
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2 bg-coral/10 text-coral">
                        Kültür Rotası
                      </span>
                      <h3 className="text-sm font-bold text-warm-900 mb-1">
                        <span className="mr-1.5">{rr.icon}</span>
                        {rr.title}
                      </h3>
                      <p className="text-xs text-warm-900/50 line-clamp-2">{rr.desc}</p>
                      <p className="text-xs text-warm-900/30 mt-1">{rr.duration} &middot; {rr.stops.length} durak</p>
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
