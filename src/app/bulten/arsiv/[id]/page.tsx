import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import SignupCTA from "./SignupCTA";

type Params = { params: Promise<{ id: string }> };

async function getCampaign(id: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("campaigns")
    .select("id, subject, html_content, created_at, template_name")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) return { title: "Bülten Bulunamadı" };

  return {
    title: `${campaign.subject} — Klemens Art E-Bülten`,
    description: `Klemens Art e-bülten arşivi: ${campaign.subject}`,
    alternates: { canonical: `/bulten/arsiv/${id}` },
    openGraph: {
      title: `${campaign.subject} — Klemens Art`,
      description: `Klemens Art e-bülten arşivi: ${campaign.subject}`,
      url: `https://klemensart.com/bulten/arsiv/${id}`,
    },
  };
}

export default async function CampaignViewPage({ params }: Params) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "E-Bülten", item: "https://klemensart.com/bulten" },
      { "@type": "ListItem", position: 3, name: "Arşiv", item: "https://klemensart.com/bulten/arsiv" },
      { "@type": "ListItem", position: 4, name: campaign.subject, item: `https://klemensart.com/bulten/arsiv/${id}` },
    ],
  };

  const date = new Date(campaign.created_at);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="min-h-screen bg-warm-50">
        {/* Header */}
        <section className="py-12 px-6 bg-warm-900">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/bulten/arsiv"
              className="inline-flex items-center gap-1.5 text-white/50 text-sm hover:text-coral transition-colors mb-6"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Arşive Dön
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {campaign.subject}
            </h1>
            <p className="text-white/40 text-sm">
              {date.toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-10 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="border border-warm-200 rounded-2xl overflow-hidden bg-[#f7f5f2]">
              <iframe
                srcDoc={campaign.html_content}
                title={campaign.subject}
                className="w-full border-0"
                style={{ minHeight: 700 }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <SignupCTA />
      </main>
    </>
  );
}
