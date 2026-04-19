import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllAuthorsWithStats } from "@/lib/people";

export const metadata: Metadata = {
  title: "Yazarlar",
  description:
    "Klemens'in editöryal evrenini birlikte yazdığımız kalemler.",
};

function getInitials(name: string) {
  const words = name.split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default async function YazarlarPage() {
  const authors = await getAllAuthorsWithStats();
  const totalArticles = authors.reduce((s, a) => s + a.articleCount, 0);

  return (
    <>
      <Navbar solid />

      <main className="bg-cream min-h-screen">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-28 pb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-warm-900 mb-3">
            Yazarlar
          </h1>
          <p className="text-brand-warm text-[15px] max-w-lg mx-auto leading-relaxed">
            Klemens&apos;in editöryal evrenini birlikte yazdığımız kalemler.
          </p>
          <p className="mt-4 text-sm text-warm-900/40">
            {authors.length} yazar · {totalArticles} yazı
          </p>
        </section>

        {/* Grid */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <Link
                key={author.id}
                href={`/yazarlar/${author.slug}`}
                className="group block"
              >
                <article className="bg-white rounded-2xl border border-warm-100 p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    {author.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={author.avatar_url}
                        alt={author.name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-coral flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {getInitials(author.name)}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-warm-900 truncate group-hover:text-coral transition-colors">
                        {author.name}
                      </h2>
                      {author.short_bio && (
                        <p className="text-sm text-warm-900/50 line-clamp-2 leading-snug mt-0.5">
                          {author.short_bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expertise chips */}
                  {author.expertise && author.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {author.expertise.map((e) => (
                        <span
                          key={e}
                          className="px-2 py-0.5 text-[11px] font-medium bg-warm-100 text-warm-900/60 rounded-full"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-warm-900/40">
                      {author.articleCount} yazı
                    </p>
                    {author.hasRecent && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-coral/10 text-coral rounded-full">
                        Yeni yazı
                      </span>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
