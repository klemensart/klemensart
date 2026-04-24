import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationForm from "./RegistrationForm";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  ai_comment: string | null;
  event_type: string | null;
  venue: string | null;
  address: string | null;
  event_date: string | null;
  end_date: string | null;
  source_url: string | null;
  source_name: string | null;
  price_info: string | null;
  image_url: string | null;
  is_klemens_event: boolean;
  registration_enabled: boolean;
  slug: string | null;
};

type Props = { params: Promise<{ id: string }> };

async function getEvent(id: string): Promise<EventRow | null> {
  const supabase = createAdminClient();
  const cols = "id,title,description,ai_comment,event_type,venue,address,event_date,end_date,source_url,source_name,price_info,image_url,is_klemens_event,registration_enabled,slug";

  // UUID formatında mı kontrol et
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isUuid) {
    const { data, error } = await supabase
      .from("events")
      .select(cols)
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle();
    if (!error && data) return data as EventRow;
  }

  // Slug ile dene
  const { data, error } = await supabase
    .from("events")
    .select(cols)
    .eq("slug", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) return null;
  return data as EventRow;
}

function fmtShortDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: "Etkinlik Bulunamadı" };

  const typeLabel = TYPE_LABELS[event.event_type ?? ""] ?? "";
  const datePart = fmtShortDate(event.event_date);
  const venuePart = event.venue ?? "Ankara";

  // SEO title: "Etkinlik Adı — Mekan | Tarih — Klemens"
  const seoTitle = [event.title, venuePart, datePart].filter(Boolean).join(" — ");

  // Description: olay açıklaması veya zengin fallback
  const rawDesc = event.description || event.ai_comment || "";
  const description = rawDesc
    ? rawDesc.slice(0, 155) + (rawDesc.length > 155 ? "…" : "")
    : [typeLabel, `"${event.title}"`, venuePart && `${venuePart}'da`, datePart, event.price_info].filter(Boolean).join(" · ");

  return {
    title: seoTitle,
    description,
    keywords: [
      event.title,
      typeLabel || "etkinlik",
      venuePart,
      "ankara etkinlik",
      "kültür sanat etkinlik",
      datePart ? `${typeLabel || "etkinlik"} ${datePart}` : "",
    ].filter(Boolean),
    alternates: { canonical: `/etkinlikler/${id}` },
    openGraph: {
      title: seoTitle,
      description,
      ...(event.image_url && {
        images: [{ url: event.image_url, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      ...(event.image_url && { images: [event.image_url] }),
    },
  };
}

const TYPE_LABELS: Record<string, string> = {
  sergi: "Sergi",
  konser: "Konser",
  tiyatro: "Tiyatro",
  soylesi: "Söyleşi",
  panel: "Panel",
  festival: "Festival",
  "film-festivali": "Film Festivali",
  performans: "Performans",
  opera: "Opera",
  bale: "Bale",
  atolye: "Atölye",
};

const TYPE_COLORS: Record<string, string> = {
  sergi:            "bg-coral/10 text-coral",
  konser:           "bg-amber-100 text-amber-700",
  tiyatro:          "bg-violet-100 text-violet-700",
  soylesi:          "bg-emerald-100 text-emerald-700",
  panel:            "bg-cyan-100 text-cyan-700",
  festival:         "bg-sky-100 text-sky-700",
  "film-festivali": "bg-rose-100 text-rose-700",
  performans:       "bg-fuchsia-100 text-fuchsia-700",
  opera:            "bg-red-100 text-red-700",
  bale:             "bg-pink-100 text-pink-700",
  atolye:           "bg-teal-100 text-teal-700",
};

function fmtFullDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

export default async function EtkinlikDetayPage({ params }: Props) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const type = event.event_type ?? "";
  const badge = TYPE_COLORS[type] ?? "bg-warm-100 text-warm-900/50";
  const label = TYPE_LABELS[type] ?? type;

  const description = event.description || event.ai_comment || event.title;

  const eventJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description,
    eventStatus: "https://schema.org/EventScheduled",
    startDate: event.event_date ?? undefined,
    endDate: event.end_date ?? event.event_date ?? undefined,
    image: event.image_url || "https://klemensart.com/logos/logo-wide-dark.PNG",
    location: {
      "@type": "Place",
      name: event.venue ?? "Ankara",
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address ?? event.venue ?? "Ankara",
        addressLocality: "Ankara",
        addressCountry: "TR",
      },
    },
    organizer: {
      "@type": "Organization",
      name: event.source_name ?? "Klemens Art",
      url: event.source_url ?? "https://klemensart.com",
    },
    performer: {
      "@type": "Organization",
      name: event.source_name ?? "Klemens Art",
    },
    offers: {
      "@type": "Offer",
      price: parseFloat((event.price_info ?? "").replace(/[^0-9.,]/g, "").replace(",", ".")) || 0,
      priceCurrency: "TRY",
      availability: "https://schema.org/InStock",
      validFrom: event.event_date ?? new Date().toISOString().slice(0, 10),
      url: event.source_url ?? `https://klemensart.com/etkinlikler/${event.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <Navbar />
      <main className="bg-warm-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">

          {/* Back link */}
          <Link
            href="/etkinlikler"
            className="inline-flex items-center gap-2 text-sm font-medium text-warm-900/40 mb-8 hover:text-coral transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Tüm Etkinlikler
          </Link>

          {/* Badge */}
          {label && (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${badge}`}>
              {label}
            </span>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight mb-6">
            {event.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-warm-900/55 mb-8">
            {event.venue && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {event.venue}
              </span>
            )}
            {event.event_date && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {fmtFullDate(event.event_date)}
              </span>
            )}
            {event.price_info && (
              <span className="font-semibold text-coral">{event.price_info}</span>
            )}
          </div>

          {/* Image */}
          {event.image_url && (
            <div className="rounded-2xl overflow-hidden mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="bg-white rounded-2xl border border-warm-100 p-8 mb-6">
              <p className="text-warm-900 text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {/* AI Comment */}
          {event.ai_comment && (
            <div className="bg-warm-50 border-l-3 border-coral rounded-xl p-6 mb-8" style={{ borderLeft: "3px solid #FF6D60" }}>
              <p className="text-xs font-semibold text-coral uppercase tracking-wider mb-2">
                Klemens Notu
              </p>
              <p className="text-warm-900/70 text-sm leading-relaxed italic">
                {event.ai_comment}
              </p>
            </div>
          )}

          {/* Address */}
          {event.address && (
            <p className="text-sm text-warm-900/45 mb-6">
              <span className="font-semibold text-warm-900/60">Adres:</span> {event.address}
            </p>
          )}

          {/* CTA */}
          <div className="flex gap-3 flex-wrap">
            {event.is_klemens_event && event.registration_enabled ? (
              <RegistrationForm
                eventId={event.id}
                eventTitle={event.title}
                eventDate={event.event_date}
                eventVenue={event.venue}
              />
            ) : event.is_klemens_event && !event.registration_enabled ? null : event.source_url ? (
              <a
                href={event.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                Kaynağa Git
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            ) : null}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
