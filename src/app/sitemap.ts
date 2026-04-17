import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import { categories } from "@/lib/icerikler";
import { SLUG_TO_ATOLYE } from "@/lib/atolyeler-config";
import { PLACES, ROUTES } from "@/lib/harita-data";
import { placeSlug, routeSlug } from "@/lib/harita-gamification";
import { campaignWeekSlug } from "@/lib/bulten-helpers";

const BASE_URL = "https://klemensart.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const supabase = createAdminClient();

  // Son içerik tarihlerini çek — statik sayfaların lastModified'ı için
  const [{ data: latestArticle }, { data: latestEvent }, { data: publicCampaigns }] = await Promise.all([
    supabase.from("articles").select("date").eq("status", "published").order("date", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("events").select("event_date").eq("status", "approved").order("event_date", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("campaigns").select("id, created_at, template_name").eq("is_public", true).order("created_at", { ascending: false }),
  ]);

  const lastArticleDate = latestArticle?.date ? new Date(latestArticle.date) : now;
  const lastEventDate = latestEvent?.event_date ? new Date(latestEvent.event_date) : now;
  const lastCampaignDate = publicCampaigns?.[0]?.created_at ? new Date(publicCampaigns[0].created_at) : now;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/icerikler`, lastModified: lastArticleDate, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/atolyeler`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/etkinlikler`, lastModified: lastEventDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/harita`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/testler`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/hakkimizda`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/sss`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/iade-ve-iptal`, lastModified: new Date("2026-03-10"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/kvkk`, lastModified: new Date("2026-03-01"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/testler/gorsel-algi`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    // oyun/sanat-tahmini henüz yayında değil — sitemap'ten çıkarıldı
    { url: `${BASE_URL}/sergi/en-sessiz-zaman`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/testler/ronesans-quiz`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/testler/modern-sanat-quiz`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/atolyeler/sinema-klubu`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/rehber`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/rehber/bodrum`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/bulten`, lastModified: lastCampaignDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/bulten/arsiv`, lastModified: lastCampaignDate, changeFrequency: "weekly", priority: 0.6 },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/icerikler/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Workshop detail pages (sinema-klubu alt slug'ları hariç — onlar redirect veriyor)
  const workshopPages: MetadataRoute.Sitemap = Object.keys(SLUG_TO_ATOLYE)
    .filter((slug) => !slug.startsWith("sinema-klubu"))
    .map((slug) => ({
      url: `${BASE_URL}/atolyeler/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Dynamic article pages from Supabase
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


  // Public campaign (newsletter archive) pages
  // HaberlerBulteni → SEO-friendly /bulten/[slug], diğerleri → /bulten/arsiv/[id]
  const campaignPages: MetadataRoute.Sitemap = (publicCampaigns ?? []).map((c) => {
    const isWeekly = c.template_name === "HaberlerBulteni";
    return {
      url: isWeekly
        ? `${BASE_URL}/bulten/${campaignWeekSlug(c.created_at)}`
        : `${BASE_URL}/bulten/arsiv/${c.id}`,
      lastModified: c.created_at ? new Date(c.created_at) : undefined,
      changeFrequency: isWeekly ? ("weekly" as const) : ("monthly" as const),
      priority: isWeekly ? 0.6 : 0.5,
    };
  });

  // Kültür Haritası mekan sayfaları
  const seenSlugs = new Set<string>();
  const placePages: MetadataRoute.Sitemap = PLACES
    .map((p) => {
      const s = placeSlug(p.name);
      if (seenSlugs.has(s)) return null;
      seenSlugs.add(s);
      return {
        url: `${BASE_URL}/harita/${s}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  // Kültür Haritası rota sayfaları
  const seenRouteSlugs = new Set<string>();
  const routePages: MetadataRoute.Sitemap = ROUTES
    .map((r) => {
      const s = routeSlug(r.title);
      if (seenRouteSlugs.has(s)) return null;
      seenRouteSlugs.add(s);
      return {
        url: `${BASE_URL}/harita/rotalar/${s}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  return [
    ...staticPages,
    ...categoryPages,
    ...workshopPages,
    ...articlePages,
    ...eventPages,
    ...campaignPages,
    ...placePages,
    ...routePages,
  ];
}
