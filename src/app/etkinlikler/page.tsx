import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import EtkinliklerClient from "./EtkinliklerClient";

export const metadata: Metadata = {
  title: "Kültür & Sanat Takvimi",
  description:
    "Ankara ve çevresindeki sergi, konser, tiyatro, söyleşi ve festival etkinliklerini keşfedin.",
  alternates: { canonical: "/etkinlikler" },
  openGraph: {
    title: "Kültür & Sanat Takvimi — Klemens",
    description:
      "Ankara ve çevresindeki sergi, konser, tiyatro, söyleşi ve festival etkinliklerini keşfedin.",
    url: "https://klemensart.com/etkinlikler",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kültür & Sanat Takvimi — Klemens",
    description:
      "Ankara ve çevresindeki sergi, konser, tiyatro, söyleşi ve festival etkinliklerini keşfedin.",
  },
};

export default async function EtkinliklerPage() {
  const supabase = createAdminClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date, venue")
    .eq("status", "approved")
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <EtkinliklerClient />
    </>
  );
}
