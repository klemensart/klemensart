import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import type { EventRow } from "@/types/event";
import EtkinliklerClient from "./EtkinliklerClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ankara Kültür & Sanat Takvimi",
  description:
    "Ankara'daki sergi, konser, tiyatro, söyleşi ve festival etkinliklerini keşfedin. Başkentin güncel kültür-sanat rehberi.",
  keywords: [
    "Ankara kültür sanat takvimi",
    "Ankara etkinlikler",
    "Ankara sergileri",
    "Ankara konser",
    "Ankara tiyatro",
    "Ankara festival",
    "Ankara sanat etkinlikleri",
    "Ankara söyleşi",
    "başkent etkinlik rehberi",
  ],
  alternates: { canonical: "/etkinlikler" },
  openGraph: {
    title: "Ankara Kültür & Sanat Takvimi — Klemens",
    description:
      "Ankara'daki sergi, konser, tiyatro, söyleşi ve festival etkinliklerini keşfedin. Başkentin güncel kültür-sanat rehberi.",
    url: "https://klemensart.com/etkinlikler",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ankara Kültür & Sanat Takvimi — Klemens",
    description:
      "Ankara'daki sergi, konser, tiyatro, söyleşi ve festival etkinliklerini keşfedin. Başkentin güncel kültür-sanat rehberi.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default async function EtkinliklerPage() {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("events")
    .select("id,title,description,ai_comment,event_type,venue,address,event_date,source_url,source_name,price_info,is_klemens_event,image_url")
    .eq("status", "approved")
    .gte("event_date", now)
    .order("event_date", { ascending: true });

  const events = (data ?? []) as EventRow[];

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
      numberOfItems: events.length,
      itemListElement: events.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Event",
          name: e.title,
          url: `https://klemensart.com/etkinlikler/${e.id}`,
          startDate: e.event_date ?? undefined,
          image: e.image_url || "https://klemensart.com/logos/logo-wide-dark.PNG",
          location: {
            "@type": "Place",
            name: e.venue ?? "Ankara",
            address: {
              "@type": "PostalAddress",
              streetAddress: e.address ?? e.venue ?? "Ankara",
              addressLocality: "Ankara",
              addressCountry: "TR",
            },
          },
          organizer: {
            "@type": "Organization",
            name: e.source_name ?? "Klemens Art",
            url: "https://klemensart.com",
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
      <Navbar />
      <EtkinliklerClient initialEvents={events} />
      <Footer />
    </>
  );
}
