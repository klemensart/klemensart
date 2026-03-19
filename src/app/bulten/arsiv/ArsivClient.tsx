"use client";

import Link from "next/link";

type Campaign = {
  id: string;
  subject: string;
  template_name: string | null;
  created_at: string;
  weekSlug?: string | null;
};

export default function ArsivClient({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <main className="min-h-screen bg-warm-50">
      {/* Header */}
      <section className="py-16 md:py-20 px-6 bg-warm-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-coral/20 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-coral flex-shrink-0" />
            <span className="text-sm font-semibold text-coral">Arşiv</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            E-Bülten Arşivi
          </h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto">
            Geçmiş bültenlerimize göz atın ve kaçırdığınız içerikleri keşfedin.
          </p>
        </div>
      </section>

      {/* List */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {campaigns.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-warm-500 text-lg">Henüz yayınlanmış bülten yok.</p>
              <Link href="/bulten" className="text-coral font-semibold text-sm mt-4 inline-block hover:underline">
                Abone olun, ilk bültende buluşalım &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => {
                const date = new Date(c.created_at);
                const href = c.weekSlug
                  ? `/bulten/${c.weekSlug}`
                  : `/bulten/arsiv/${c.id}`;
                return (
                  <Link
                    key={c.id}
                    href={href}
                    className="flex items-center gap-4 border border-warm-200 bg-white rounded-xl px-6 py-4 hover:border-coral/40 hover:shadow-sm transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-semibold text-warm-900 group-hover:text-coral transition-colors truncate">
                        {c.subject}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-warm-500">
                          {date.toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        {c.template_name && c.template_name !== "SerbestMetin" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-coral/10 text-coral">
                            {c.template_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-warm-400 group-hover:text-coral transition-colors shrink-0"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/bulten"
              className="text-coral font-semibold text-sm hover:underline"
            >
              &larr; E-Bülten Sayfasına Dön
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
