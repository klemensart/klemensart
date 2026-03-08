import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import { categories } from "@/lib/icerikler";
import { SLUG_TO_ATOLYE } from "@/lib/atolyeler-config";

const BASE_URL = "https://klemensart.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/icerikler`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/atolyeler`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/etkinlikler`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/harita`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/testler`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/hakkimizda`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/testler/gorsel-algi`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/oyun/sanat-tahmini`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/sergi/yalnizlik`, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/icerikler/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Workshop detail pages
  const workshopPages: MetadataRoute.Sitemap = Object.keys(SLUG_TO_ATOLYE).map(
    (slug) => ({
      url: `${BASE_URL}/atolyeler/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  // Dynamic article pages from Supabase
  const supabase = createAdminClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, date")
    .eq("status", "published")
    .order("date", { ascending: false });

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/icerikler/yazi/${a.slug}`,
    lastModified: a.date ? new Date(a.date) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic event detail pages from Supabase
  const { data: events } = await supabase
    .from("events")
    .select("id, event_date")
    .eq("status", "approved")
    .order("event_date", { ascending: false });

  const eventPages: MetadataRoute.Sitemap = (events ?? []).map((e) => ({
    url: `${BASE_URL}/etkinlikler/${e.id}`,
    lastModified: e.event_date ? new Date(e.event_date) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...workshopPages,
    ...articlePages,
    ...eventPages,
  ];
}
