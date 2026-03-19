import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import { campaignWeekSlug } from "@/lib/bulten-helpers";
import ArsivClient from "./ArsivClient";

export const metadata: Metadata = {
  title: "E-Bülten Arşivi — Klemens Art",
  description:
    "Klemens Art e-bültenlerinin tamamına göz atın. Geçmiş sayılarımızda kültür, sanat ve düşünce dünyasından öne çıkan içerikleri keşfedin.",
  alternates: { canonical: "/bulten/arsiv" },
  openGraph: {
    title: "E-Bülten Arşivi — Klemens Art",
    description:
      "Klemens Art e-bültenlerinin tamamına göz atın.",
    url: "https://klemensart.com/bulten/arsiv",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
};

export default async function ArsivPage() {
  const supabase = createAdminClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, subject, template_name, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

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
        name: "E-Bülten",
        item: "https://klemensart.com/bulten",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Arşiv",
        item: "https://klemensart.com/bulten/arsiv",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ArsivClient
        campaigns={(campaigns ?? []).map((c) => ({
          ...c,
          weekSlug:
            c.template_name === "HaberlerBulteni"
              ? campaignWeekSlug(c.created_at)
              : null,
        }))}
      />
    </>
  );
}
