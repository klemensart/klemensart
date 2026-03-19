import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  campaignWeekSlug,
  weekSlugToRange,
  weekSlugToLabel,
  extractEmailBody,
  stripHtmlTags,
} from "@/lib/bulten-helpers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ───────── Types ───────── */

type Props = { params: Promise<{ slug: string }> };

/* ───────── Data ───────── */

async function getCampaignBySlug(slug: string) {
  const range = weekSlugToRange(slug);
  if (!range) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("campaigns")
    .select("id, subject, html_content, created_at, template_name")
    .eq("is_public", true)
    .eq("template_name", "HaberlerBulteni")
    .gte("created_at", range.start)
    .lt("created_at", range.end)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

async function getAdjacentWeeks(currentDate: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("campaigns")
    .select("id, subject, created_at")
    .eq("is_public", true)
    .eq("template_name", "HaberlerBulteni")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!data) return { prev: null, next: null };

  const sorted = data.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const idx = sorted.findIndex((c) => c.created_at === currentDate);
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}

/* ───────── Metadata ───────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return { title: "Bülten Bulunamadı" };

  const plainText = stripHtmlTags(campaign.html_content);
  const description = plainText.slice(0, 155) + "…";
  const weekLabel = weekSlugToLabel(slug);
  const title = `${campaign.subject} — ${weekLabel}`;

  return {
    title: campaign.subject,
    description,
    keywords: [
      "Ankara kültür sanat haberleri",
      "haftalık kültür bülteni",
      "kültür sanat gündemi",
      weekLabel,
      "Klemens Art",
    ],
    alternates: { canonical: `/bulten/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://klemensart.com/bulten/${slug}`,
      type: "article",
      publishedTime: campaign.created_at,
      images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ───────── Page ───────── */

export default async function HaftalikBultenPage({ params }: Props) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) notFound();

  const bodyHtml = extractEmailBody(campaign.html_content);
  const date = new Date(campaign.created_at);
  const formattedDate = date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { prev, next } = await getAdjacentWeeks(campaign.created_at);

  /* ─── JSON-LD ─── */
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: campaign.subject,
    datePublished: campaign.created_at,
    publisher: {
      "@type": "Organization",
      name: "Klemens Art",
      url: "https://klemensart.com",
      logo: {
        "@type": "ImageObject",
        url: "https://klemensart.com/logos/logo-wide-dark.PNG",
      },
    },
    mainEntityOfPage: `https://klemensart.com/bulten/${slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "E-Bülten", item: "https://klemensart.com/bulten" },
      {
        "@type": "ListItem",
        position: 3,
        name: campaign.subject,
        item: `https://klemensart.com/bulten/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
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
            href="/bulten/arsiv"
            className="inline-flex items-center gap-2 text-sm font-medium text-warm-900/40 mb-8 hover:text-coral transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            E-Bülten Arşivi
          </Link>

          {/* Header */}
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-coral/10 text-coral mb-3">
              Haftalık Bülten
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-warm-900 leading-tight mb-2">
              {campaign.subject}
            </h1>
            <p className="text-sm text-warm-900/50">{formattedDate}</p>
          </div>

          {/* Newsletter content — real HTML, not iframe */}
          <article className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  .newsletter-body { padding: 24px; }
                  .newsletter-body table { width: 100% !important; max-width: 100% !important; }
                  .newsletter-body td { word-break: break-word; }
                  .newsletter-body img { max-width: 100%; height: auto; border-radius: 8px; }
                  .newsletter-body a { color: #FF6D60; }
                  .newsletter-body p, .newsletter-body td, .newsletter-body span {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  }
                  @media (max-width: 640px) {
                    .newsletter-body { padding: 16px; }
                    .newsletter-body table { font-size: 14px !important; }
                  }
                `,
              }}
            />
            <div
              className="newsletter-body"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </article>

          {/* Prev / Next navigation */}
          {(prev || next) && (
            <div className="flex items-center justify-between mt-8 gap-4">
              {prev ? (
                <Link
                  href={`/bulten/${campaignWeekSlug(prev.created_at)}`}
                  className="flex items-center gap-2 text-sm text-warm-900/50 hover:text-coral transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Önceki Sayı
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/bulten/${campaignWeekSlug(next.created_at)}`}
                  className="flex items-center gap-2 text-sm text-warm-900/50 hover:text-coral transition-colors"
                >
                  Sonraki Sayı
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div />
              )}
            </div>
          )}

          {/* Signup CTA */}
          <div className="mt-12 bg-warm-900 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              Her hafta kültür-sanat gündeminiz e-postanızda
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Haftalık bültenimize abone olun, hiçbir gelişmeyi kaçırmayın.
            </p>
            <Link
              href="/bulten"
              className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Abone Ol
            </Link>
          </div>

          {/* All issues link */}
          <div className="text-center mt-8">
            <Link
              href="/bulten/arsiv"
              className="text-coral font-semibold text-sm hover:underline"
            >
              Tüm Sayılar &rarr;
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
