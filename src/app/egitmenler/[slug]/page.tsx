import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { InstagramIcon, TwitterIcon, LinkedInIcon } from "@/lib/icons";
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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(p: number) {
  if (p === 0) return "Ücretsiz";
  return p.toLocaleString("tr-TR") + " TL";
}

export async function generateStaticParams() {
  const hosts = await getHosts();
  return hosts.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const person = await getPersonBySlug(slug);
  if (!person || !person.is_host) return {};
  return {
    title: `${person.name} — Klemens Eğitmenleri`,
    description:
      person.short_bio ||
      `Klemens'te atölye düzenleyen eğitmen ${person.name}'nın profili.`,
    openGraph: person.avatar_url
      ? { images: [{ url: person.avatar_url }] }
      : undefined,
  };
}

export default async function EgitmenDetayPage({ params }: Props) {
  const { slug } = await params;
  const person = await getPersonBySlug(slug);
  if (!person || !person.is_host) notFound();

  const [upcoming, past] = await Promise.all([
    getHostUpcomingEvents(person.id),
    getHostPastEvents(person.id),
  ]);

  const hasSocials =
    person.instagram || person.twitter || person.linkedin || person.website;

  return (
    <>
      <Navbar solid />

      <main className="bg-cream min-h-screen">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-28 pb-10">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            {person.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.avatar_url}
                alt={person.name}
                className="w-40 h-40 rounded-full object-cover mb-5"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-coral flex items-center justify-center mb-5">
                <span className="text-white font-bold text-5xl">
                  {getInitials(person.name)}
                </span>
              </div>
            )}

            {/* Verified badge */}
            {person.is_verified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-coral/10 text-coral rounded-full mb-3">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Klemens Onaylı
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl font-extrabold text-warm-900 mb-2">
              {person.name}
            </h1>

            {person.short_bio && (
              <p className="text-brand-warm italic text-[15px] max-w-md leading-relaxed">
                {person.short_bio}
              </p>
            )}

            {/* Social links */}
            {hasSocials && (
              <div className="flex items-center gap-3 mt-4">
                {person.instagram && (
                  <a
                    href={`https://instagram.com/${person.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-warm-100 flex items-center justify-center text-warm-900/40 hover:bg-coral hover:text-white transition-all"
                  >
                    <InstagramIcon size={15} />
                  </a>
                )}
                {person.twitter && (
                  <a
                    href={`https://x.com/${person.twitter.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-warm-100 flex items-center justify-center text-warm-900/40 hover:bg-coral hover:text-white transition-all"
                  >
                    <TwitterIcon size={15} />
                  </a>
                )}
                {person.linkedin && (
                  <a
                    href={person.linkedin.startsWith("http") ? person.linkedin : `https://linkedin.com/in/${person.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-warm-100 flex items-center justify-center text-warm-900/40 hover:bg-coral hover:text-white transition-all"
                  >
                    <LinkedInIcon size={15} />
                  </a>
                )}
                {person.website && (
                  <a
                    href={person.website.startsWith("http") ? person.website : `https://${person.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-warm-100 flex items-center justify-center text-warm-900/40 hover:bg-coral hover:text-white transition-all text-xs font-bold"
                  >
                    W
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 pb-20 space-y-12">
          {/* Bio */}
          {person.bio && (
            <section>
              <h2 className="text-lg font-bold text-warm-900 mb-3">
                Hakkında
              </h2>
              <p className="text-warm-900/70 leading-relaxed whitespace-pre-line">
                {person.bio}
              </p>
            </section>
          )}

          {/* Expertise */}
          {person.expertise && person.expertise.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-warm-900 mb-3">
                Uzmanlık Alanları
              </h2>
              <div className="flex flex-wrap gap-2">
                {person.expertise.map((e) => (
                  <span
                    key={e}
                    className="px-3 py-1 text-sm font-medium bg-warm-100 text-warm-900/60 rounded-full"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming events */}
          <section>
            <h2 className="text-lg font-bold text-warm-900 mb-4">
              Yaklaşan Atölyeler
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-warm-900/40">
                Şu an aktif atölyesi yok.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((ev) => (
                  <Link
                    key={ev.id}
                    href={ev.detail_slug ? `/atolyeler/${ev.detail_slug}` : `/atolyeler/${ev.slug}`}
                    className="flex items-center justify-between gap-4 bg-white rounded-xl border border-warm-100 p-4 hover:border-coral/30 hover:shadow-sm transition-all group"
                  >
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-warm-900 truncate group-hover:text-coral transition-colors">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-warm-900/40 mt-0.5">
                        {ev.event_date ? formatDate(ev.event_date) : "Tarih belirtilmemiş"}
                        {" · "}
                        {ev.city}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-warm-900 flex-shrink-0">
                      {formatPrice(ev.price)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Past events */}
          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-warm-900 mb-4">
                Geçmiş Atölyeler
              </h2>
              <div className="space-y-2">
                {past.map((ev) => (
                  <Link
                    key={ev.id}
                    href={ev.detail_slug ? `/atolyeler/${ev.detail_slug}` : `/atolyeler/${ev.slug}`}
                    className="flex items-center justify-between gap-4 bg-white/50 rounded-xl border border-warm-100 p-4 hover:bg-white transition-all group"
                  >
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-warm-900/50 truncate group-hover:text-warm-900/70 transition-colors">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-warm-900/30 mt-0.5">
                        {ev.event_date ? formatDate(ev.event_date) : ""} · {ev.city}
                      </p>
                    </div>
                    <span className="text-xs text-warm-900/30 flex-shrink-0">
                      {formatPrice(ev.price)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Disclaimer — only for non-klemens hosts */}
          {person.slug !== "klemens" && (
            <section className="bg-warm-50 border border-warm-200 rounded-xl p-5">
              <p className="text-xs text-warm-900/50 leading-relaxed">
                {person.name}, Klemens platformunda bağımsız bir
                düzenleyicidir. Atölyelerinin yürütülmesi, ödeme süreci ve iade
                koşulları doğrudan eğitmenin sorumluluğundadır. Klemens,
                atölyeyi listeleyen ve duyuran platformdur.
              </p>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
