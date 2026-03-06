import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase-admin";

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
    { url: `${BASE_URL}/club/giris`, changeFrequency: "monthly", priority: 0.4 },
  ];

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

  return [...staticPages, ...articlePages];
}
