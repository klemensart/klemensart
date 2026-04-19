import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PazaryeriCard from "@/app/atolyeler/components/PazaryeriCard";
import { InstagramIcon } from "@/lib/icons";
import {
  getPersonBySlug,
  getHosts,
  getHostUpcomingEvents,
  getHostPastEvents,
} from "@/lib/people";

type Props = { params: Promise<{ slug: string }> };

function getInitials(name: string) {
  const words = name.split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export async function generateStaticParams() {
  const hosts = await getHosts();
  return hosts.filter((h) => h.slug !== "klemens").map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "klemens") return {};
  const person = await getPersonBySlug(slug);
  if (!person || !person.is_host) return {};
  return {
    title: `${person.name} — Klemens'te Atölye Düzenliyor`,
    description:
      person.short_bio ||
      `${person.name}'nın Klemens'te düzenlediği atölyeleri keşfet.`,
    openGraph: person.avatar_url
      ? { images: [{ url: person.avatar_url }] }
      : undefined,
  };
}

export default async function EgitmenDetayPage({ params }: Props) {
  const { slug } = await params;

  if (slug === "klemens") {
    redirect("/atolyeler");
  }

  const person = await getPersonBySlug(slug);
  if (!person || !person.is_host) notFound();

  const [upcoming, past] = await Promise.all([
    getHostUpcomingEvents(person.id),
    getHostPastEvents(person.id),
  ]);

  return (
    <>
      <Navbar solid />

      <main className="bg-cream min-h-screen">
        {/* ── Compact hero ── */}
        <section className="max-w-4xl mx-auto px-6 pt-28 pb-8">
          <div className="flex items-center gap-5">
            {/* 96px avatar */}
            {person.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.avatar_url}
                alt={person.name}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-coral flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-3xl">
                  {getInitials(person.name)}
                </span>
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-warm-900 truncate">
                  {person.name}
                </h1>
                {person.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-coral/10 text-coral rounded-full flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Onaylı
                  </span>
                )}
              </div>

              {person.short_bio && (
                <p className="text-brand-warm text-sm leading-relaxed line-clamp-2">
                  {person.short_bio}
                </p>
              )}

              {/* Social — sadece Instagram (compact) */}
              {person.instagram && (
                <a
                  href={`https://instagram.com/${person.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-xs text-warm-900/40 hover:text-coral transition-colors"
                >
                  <InstagramIcon size={13} />
                  @{person.instagram.replace(/^@/, "")}
                </a>
              )}
            </div>
          </div>

          {/* Expertise chips — sadece dolu ise */}
          {person.expertise && person.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5">
              {person.expertise.map((e) => (
                <span
                  key={e}
                  className="px-2.5 py-0.5 text-[11px] font-medium bg-warm-100 text-warm-900/50 rounded-full"
                >
                  {e}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ── Atölye kartları ── */}
        <div className="max-w-4xl mx-auto px-6 pb-20 space-y-12">
          {/* Yaklaşan */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-warm-900 mb-4">
                Yaklaşan Atölyeler
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {upcoming.map((ev) => (
                  <PazaryeriCard
                    key={ev.id}
                    slug={ev.slug}
                    title={ev.title}
                    category={ev.category}
                    city={ev.city}
                    district={ev.district}
                    price={ev.price}
                    image_url={ev.image_url}
                    event_date={ev.event_date}
                    is_featured={ev.is_featured}
                    href={ev.detail_slug ? `/atolyeler/${ev.detail_slug}` : `/atolyeler/${ev.slug}`}
                    badge={ev.is_klemens ? "Klemens" : undefined}
                    duration_note={ev.duration_note}
                    organizer_name={ev.organizer_name}
                    organizer_logo_url={ev.organizer_logo_url}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Geçmiş */}
          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-warm-900 mb-4">
                Geçmiş Atölyeler
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {past.map((ev) => (
                  <div key={ev.id} className="opacity-50 grayscale-[30%]">
                    <PazaryeriCard
                      slug={ev.slug}
                      title={ev.title}
                      category={ev.category}
                      city={ev.city}
                      district={ev.district}
                      price={ev.price}
                      image_url={ev.image_url}
                      event_date={ev.event_date}
                      is_featured={ev.is_featured}
                      href={ev.detail_slug ? `/atolyeler/${ev.detail_slug}` : `/atolyeler/${ev.slug}`}
                      duration_note={ev.duration_note}
                      organizer_name={ev.organizer_name}
                      organizer_logo_url={ev.organizer_logo_url}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Atölye yoksa */}
          {upcoming.length === 0 && past.length === 0 && (
            <p className="text-sm text-warm-900/40 text-center py-12">
              Henüz atölyesi yok.
            </p>
          )}

          {/* Disclaimer */}
          <section className="bg-coral/5 border border-coral/10 rounded-xl p-5">
            <p className="text-xs text-warm-900/50 leading-relaxed">
              {person.name}, Klemens platformunda bağımsız bir düzenleyicidir.
              Atölyelerinin yürütülmesi, ödeme süreci ve iade koşulları
              doğrudan düzenleyicinin sorumluluğundadır. Klemens, atölyeyi
              listeleyen ve duyuran platformdur.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
