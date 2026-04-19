import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { InstagramIcon } from "@/lib/icons";
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
      `${person.name}'nın Klemens'te yazdığı yazıları keşfet.`,
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

  return (
    <>
      <Navbar solid />

      <main className="bg-cream min-h-screen">
        {/* ── Minimal hero ── */}
        <section className="max-w-2xl mx-auto px-6 pt-28 pb-6">
          <div className="flex items-center gap-4">
            {/* 64px avatar */}
            {person.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.avatar_url}
                alt={person.name}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-coral flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">
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

        {/* ── Yazı arşivi ── */}
        <section className="max-w-2xl mx-auto px-6 pt-8 pb-20">
          <p className="text-xs text-warm-900/30 mb-6">
            {articles.length} yazı
          </p>

          {articles.length === 0 ? (
            <p className="text-sm text-warm-900/40 text-center py-12">
              Henüz yazısı yok.
            </p>
          ) : (
            <div className="space-y-0">
              {articles.map((a, i) => (
                <Link
                  key={a.slug}
                  href={`/icerikler/yazi/${a.slug}`}
                  className="group flex gap-4 py-5 hover:bg-warm-50/50 -mx-3 px-3 rounded-lg transition-colors"
                  style={i > 0 ? { borderTop: "1px solid rgba(44,35,25,0.06)" } : undefined}
                >
                  {/* Cover thumbnail */}
                  {a.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.image}
                      alt={a.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  )}

                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    {/* Kategori + tarih */}
                    <div className="flex items-center gap-2 mb-1">
                      {a.category && (
                        <span className="text-[10px] font-semibold text-coral uppercase tracking-wide">
                          {CATEGORY_LABELS[a.category] ?? a.category}
                        </span>
                      )}
                      {a.date && (
                        <span className="text-[10px] text-warm-900/25">
                          {formatDate(a.date)}
                        </span>
                      )}
                    </div>

                    {/* Başlık */}
                    <h3 className="text-sm font-semibold text-warm-900 line-clamp-2 group-hover:text-coral transition-colors leading-snug">
                      {a.title}
                    </h3>

                    {/* Kısa açıklama */}
                    {a.description && (
                      <p className="text-xs text-warm-900/35 line-clamp-1 mt-1">
                        {a.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
