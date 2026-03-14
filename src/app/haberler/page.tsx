import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import HaberlerClient from "./HaberlerClient";

export const metadata: Metadata = {
  title: "Kültür Sanat Haberleri",
  description:
    "Türkiye ve dünyadan güncel kültür, sanat, sergi, müze, sinema ve edebiyat haberleri.",
  keywords: [
    "kültür sanat haberleri",
    "sanat haberleri",
    "sergi haberleri",
    "Türkiye kültür haberleri",
    "güncel sanat",
    "müze haberleri",
    "sinema haberleri",
  ],
  alternates: { canonical: "/haberler" },
  openGraph: {
    title: "Kültür Sanat Haberleri — Klemens",
    description:
      "Türkiye ve dünyadan güncel kültür, sanat, sergi, müze, sinema ve edebiyat haberleri.",
    url: "https://klemensart.com/haberler",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kültür Sanat Haberleri — Klemens",
    description:
      "Türkiye ve dünyadan güncel kültür, sanat, sergi, müze, sinema ve edebiyat haberleri.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default async function HaberlerPage() {
  const supabase = createAdminClient();
  const { data: items } = await supabase
    .from("news_items")
    .select("id, title, summary, url, image_url, source_name, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(20);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Kültür Sanat Haberleri",
    description:
      "Türkiye ve dünyadan güncel kültür, sanat, sergi, müze, sinema ve edebiyat haberleri.",
    url: "https://klemensart.com/haberler",
    publisher: {
      "@type": "Organization",
      name: "Klemens Art",
      url: "https://klemensart.com",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: (items ?? []).length,
      itemListElement: (items ?? []).map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "NewsArticle",
          headline: item.title,
          url: item.url ?? `https://klemensart.com/haberler`,
          datePublished: item.published_at ?? undefined,
          publisher: {
            "@type": "Organization",
            name: item.source_name ?? "Klemens Art",
          },
        },
      })),
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
      <HaberlerClient />
    </>
  );
}
