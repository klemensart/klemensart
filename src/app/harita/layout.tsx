import type { Metadata } from "next";
import { PLACES, ROUTES, TYPE_LABELS } from "@/lib/harita-data";

export const metadata: Metadata = {
  title: "Kültür Haritası",
  description:
    "Ankara'nın müze, galeri, tiyatro, konser salonu ve tarihi mekânlarını keşfedin. 90+ kültür noktası ve 13 tematik rota içeren interaktif kültür haritası.",
  alternates: { canonical: "/harita" },
  openGraph: {
    title: "Ankara Kültür & Sanat Haritası — Klemens",
    description:
      "90+ müze, galeri, tiyatro, konser salonu ve tarihi mekân. 13 tematik yürüyüş rotası.",
    url: "https://klemensart.com/harita",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ankara Kültür & Sanat Haritası",
    description:
      "90+ müze, galeri, tiyatro, konser salonu ve tarihi mekân. 13 tematik yürüyüş rotası.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default function HaritaLayout({ children }: { children: React.ReactNode }) {
  // ItemList JSON-LD — tüm kültür noktaları
  const placesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ankara Kültür ve Sanat Mekânları",
    description: "Ankara'daki müze, galeri, tiyatro, konser salonu ve tarihi mekânlar",
    numberOfItems: PLACES.length,
    itemListElement: PLACES.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristAttraction",
        name: p.name,
        description: p.desc,
        geo: {
          "@type": "GeoCoordinates",
          latitude: p.lat,
          longitude: p.lng,
        },
        additionalType: TYPE_LABELS[p.type],
      },
    })),
  };

  // TouristTrip JSON-LD — rotalar
  const routesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ankara Kültür Rotaları",
    description: "Ankara'da tematik kültür ve tarih yürüyüş rotaları",
    numberOfItems: ROUTES.length,
    itemListElement: ROUTES.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristTrip",
        name: r.title,
        description: r.desc,
        touristType: "Kültür ve Sanat",
        itinerary: {
          "@type": "ItemList",
          numberOfItems: r.stops.length,
          itemListElement: r.stops.map((s, j) => ({
            "@type": "ListItem",
            position: j + 1,
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
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "Kültür Haritası", item: "https://klemensart.com/harita" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placesJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(routesJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
      {/* Crawler-erişilebilir mekân ve rota listesi (görsel olarak gizli) */}
      <div
        aria-hidden="false"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        <h1>Ankara Kültür ve Sanat Haritası</h1>
        <h2>Ankara Kültür ve Sanat Mekânları</h2>
        <ul>
          {PLACES.map((p) => (
            <li key={p.name}>
              <strong>{p.name}</strong> ({TYPE_LABELS[p.type]}) — {p.desc}
            </li>
          ))}
        </ul>
        <h2>Kültür Rotaları</h2>
        {ROUTES.map((r) => (
          <div key={r.id}>
            <h3>{r.title}</h3>
            <p>{r.desc} — {r.duration}</p>
            <ol>
              {r.stops.map((s) => (
                <li key={s.name}>
                  <strong>{s.name}</strong>: {s.story}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </>
  );
}
