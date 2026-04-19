import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { InstagramIcon, TwitterIcon, LinkedInIcon } from "@/lib/icons";
import {
  getPersonBySlug,
  getAuthors,
  getAuthorArticles,
} from "@/lib/people";

type Props = { params: Promise<{ slug: string }> };

const CATEGORY_LABELS: Record<string, string> = {
  "sanat-tarihi": "Sanat Tarihi",
  sinema: "Sinema",
  muzik: "Müzik",
  edebiyat: "Edebiyat",
  fotograf: "Fotoğraf",
  mimari: "Mimari",
  felsefe: "Felsefe",
  tarih: "Tarih",
  diger: "Diğer",
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

export async function generateStaticParams() {
  const authors = await getAuthors();
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const person = await getPersonBySlug(slug);
  if (!person || !person.is_author) return {};
  return {
    title: `${person.name} — Klemens Yazarları`,
    description:
      person.short_bio ||
      `Klemens'te yazan ${person.name}'nın profili ve yazıları.`,
    openGraph: person.avatar_url
      ? { images: [{ url: person.avatar_url }] }
      : undefined,
  };
}

export default async function YazarDetayPage({ params }: Props) {
  const { slug } = await params;
  const person = await getPersonBySlug(slug);
  if (!person || !person.is_author) notFound();

  const articles = await getAuthorArticles(person.id);

  const hasSocials =
    person.instagram || person.twitter || person.linkedin || person.website;

  return (
    <>
      <Navbar solid />

      <main className="bg-cream min-h-screen">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-28 pb-10">
          <div className="flex flex-col items-center text-center">
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

          {/* Articles */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-warm-900">Yazılar</h2>
              <span className="text-sm text-warm-900/40">
                {articles.length} yazı
              </span>
            </div>
            {articles.length === 0 ? (
              <p className="text-sm text-warm-900/40">Henüz yazısı yok.</p>
            ) : (
              <div className="space-y-4">
                {articles.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/icerikler/yazi/${a.slug}`}
                    className="flex gap-4 bg-white rounded-xl border border-warm-100 p-4 hover:border-coral/30 hover:shadow-sm transition-all group"
                  >
                    {a.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.image}
                        alt={a.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {a.category && (
                          <span className="text-[10px] font-semibold text-coral uppercase tracking-wide">
                            {CATEGORY_LABELS[a.category] ?? a.category}
                          </span>
                        )}
                        {a.date && (
                          <span className="text-[10px] text-warm-900/30">
                            {formatDate(a.date)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-warm-900 line-clamp-2 group-hover:text-coral transition-colors">
                        {a.title}
                      </h3>
                      {a.description && (
                        <p className="text-xs text-warm-900/40 line-clamp-2 mt-1 leading-relaxed">
                          {a.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
