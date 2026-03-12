import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import EtkinliklerClient from "./EtkinliklerClient";

export const metadata: Metadata = {
  title: "Kültür & Sanat Takvimi",
  description:
    "Ankara ve çevresindeki sergi, konser, tiyatro, söyleşi ve festival etkinliklerini keşfedin.",
  keywords: [
    "Ankara etkinlikler",
    "Ankara sergileri",
    "Ankara konser",
    "Ankara tiyatro",
    "kültür sanat takvimi",
    "Ankara festival",
    "sanat etkinlikleri",
    "söyleşi etkinlik",
  ],
  alternates: { canonical: "/etkinlikler" },
  openGraph: {
    title: "Kültür & Sanat Takvimi — Klemens",
    description:
      "Ankara ve çevresindeki sergi, konser, tiyatro, söyleşi ve festival etkinliklerini keşfedin.",
    url: "https://klemensart.com/etkinlikler",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kültür & Sanat Takvimi — Klemens",
    description:
      "Ankara ve çevresindeki sergi, konser, tiyatro, söyleşi ve festival etkinliklerini keşfedin.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default async function EtkinliklerPage() {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date, venue")
    .eq("status", "approved")
    .gte("event_date", now)
    .order("event_date", { ascending: true })
    .limit(20);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ankara Kültür & Sanat Takvimi",
    description:
      "Ankara ve çevresindeki sergi, konser, tiyatro, söyleşi ve festival etkinlikleri.",
    url: "https://klemensart.com/etkinlikler",
    publisher: {
      "@type": "Organization",
      name: "Klemens Art",
      url: "https://klemensart.com",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: (events ?? []).length,
      itemListElement: (events ?? []).map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Event",
          name: e.title,
          url: `https://klemensart.com/etkinlikler/${e.id}`,
          startDate: e.event_date ?? undefined,
          location: {
            "@type": "Place",
            name: e.venue ?? "Ankara",
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
      { "@type": "ListItem", position: 2, name: "Etkinlikler", item: "https://klemensart.com/etkinlikler" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <EtkinliklerClient />
    </>
  );
}
