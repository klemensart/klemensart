import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { InstagramIcon } from "@/lib/icons";
import {
  getPersonBySlug,
  getHosts,
  getHostUpcomingEvents,
  getHostPastEvents,
} from "@/lib/people";

type Props = { params: Promise<{ slug: string }> };

const CATEGORY_LABELS: Record<string, string> = {
  resim: "Resim",
  seramik: "Seramik",
  fotograf: "Fotoğraf",
  muzik: "Müzik",
  heykel: "Heykel",
  dijital: "Dijital Sanat",
  yazarlik: "Yazarlık",
  dans: "Dans",
  tiyatro: "Tiyatro",
  diger: "Diğer",
  "sanat-tarihi": "Sanat Tarihi",
  sinema: "Sinema",
};

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

  const allEvents = [...upcoming, ...past];

  return (
    <>
      <Navbar solid />

      <main className="bg-cream min-h-screen">
        {/* ── Minimal hero ── */}
        <section className="max-w-2xl mx-auto px-6 pt-28 pb-6">
          <div className="flex items-center gap-4">
            {/* 64px avatar — rounded-xl kare */}
            {person.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.avatar_url}
                alt={person.name}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-warm-100 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-warm font-bold text-xl">
                  {getInitials(person.name)}
                </span>
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-warm-900 truncate">
                {person.name}
              </h1>
              {person.short_bio && (
                <p className="text-sm text-warm-900/50 leading-relaxed line-clamp-2">
                  {person.short_bio}
                </p>
              )}
              {person.instagram && (
                <a
                  href={`https://instagram.com/${person.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-xs text-warm-900/30 hover:text-coral transition-colors"
                >
                  <InstagramIcon size={12} />
                  @{person.instagram.replace(/^@/, "")}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── Ayraç ── */}
        <div className="max-w-2xl mx-auto px-6">
          <div className="border-t border-warm-200" />
        </div>

        {/* ── Atölye arşivi ── */}
        <section className="max-w-2xl mx-auto px-6 pt-8 pb-20">
          <p className="text-xs text-warm-900/30 mb-6">
            {allEvents.length} atölye
          </p>

          {allEvents.length === 0 ? (
            <p className="text-sm text-warm-900/40 text-center py-12">
              Henüz atölyesi yok.
            </p>
          ) : (
            <div className="space-y-0">
              {/* Yaklaşan atölyeler */}
              {upcoming.map((ev, i) => (
                <Link
                  key={ev.id}
                  href={ev.detail_slug ? `/atolyeler/${ev.detail_slug}` : `/atolyeler/${ev.slug}`}
                  className="group flex gap-4 py-5 hover:bg-warm-50/50 -mx-3 px-3 rounded-lg transition-colors"
                  style={i > 0 ? { borderTop: "1px solid rgba(44,35,25,0.06)" } : undefined}
                >
                  {/* Atölye görseli */}
                  {ev.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ev.image_url}
                      alt={ev.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  )}

                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    {/* Kategori + tarih */}
                    <div className="flex items-center gap-2 mb-1">
                      {ev.category && (
                        <span className="text-[10px] font-semibold text-coral uppercase tracking-wide">
                          {CATEGORY_LABELS[ev.category] ?? ev.category}
                        </span>
                      )}
                      {ev.event_date && (
                        <span className="text-[10px] text-warm-900/25">
                          {formatDate(ev.event_date)}
                        </span>
                      )}
                    </div>

                    {/* Başlık */}
                    <h3 className="text-sm font-semibold text-warm-900 line-clamp-2 group-hover:text-coral transition-colors leading-snug">
                      {ev.title}
                    </h3>

                    {/* Konum + fiyat */}
                    <p className="text-xs text-warm-900/35 mt-1">
                      {ev.district ? `${ev.district}, ${ev.city}` : ev.city}
                      {" · "}
                      {formatPrice(ev.price)}
                    </p>
                  </div>
                </Link>
              ))}

              {/* Geçmiş atölyeler */}
              {past.length > 0 && (
                <>
                  {upcoming.length > 0 && (
                    <div className="pt-6 pb-2">
                      <div className="border-t border-warm-200" />
                    </div>
                  )}
                  <h2 className="text-lg text-brand-warm font-medium mb-2">
                    Geçmiş Atölyeler
                  </h2>
                  {past.map((ev, i) => (
                    <Link
                      key={ev.id}
                      href={ev.detail_slug ? `/atolyeler/${ev.detail_slug}` : `/atolyeler/${ev.slug}`}
                      className="group flex gap-4 py-5 opacity-60 hover:bg-warm-50/50 -mx-3 px-3 rounded-lg transition-colors"
                      style={i > 0 ? { borderTop: "1px solid rgba(44,35,25,0.06)" } : undefined}
                    >
                      {ev.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ev.image_url}
                          alt={ev.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          loading="lazy"
                        />
                      )}

                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          {ev.category && (
                            <span className="text-[10px] font-semibold text-coral uppercase tracking-wide">
                              {CATEGORY_LABELS[ev.category] ?? ev.category}
                            </span>
                          )}
                          {ev.event_date && (
                            <span className="text-[10px] text-warm-900/25">
                              {formatDate(ev.event_date)}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-semibold text-warm-900 line-clamp-2 group-hover:text-coral transition-colors leading-snug">
                          {ev.title}
                        </h3>

                        <p className="text-xs text-warm-900/35 mt-1">
                          {ev.district ? `${ev.district}, ${ev.city}` : ev.city}
                          {" · "}
                          {formatPrice(ev.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Sorumluluk notu */}
          <div className="mt-10">
            <div className="max-w-2xl bg-coral/5 border border-coral/10 rounded-xl p-5">
              <p className="text-xs text-warm-900/50 leading-relaxed">
                {person.name}, Klemens platformunda bağımsız bir düzenleyicidir.
                Atölyelerinin yürütülmesi, ödeme süreci ve iade koşulları
                doğrudan düzenleyicinin sorumluluğundadır. Klemens, atölyeyi
                listeleyen ve duyuran platformdur.
              </p>
            </div>
          </div>

          {/* Hakkında — en altta */}
          {person.bio && (
            <div className="mt-10 max-w-2xl">
              <h2 className="text-lg text-brand-warm font-medium mb-3">
                Hakkında
              </h2>
              <p className="text-sm text-warm-900/50 leading-relaxed whitespace-pre-line">
                {person.bio}
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
