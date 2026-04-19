import Link from "next/link";
import type { PersonSummary } from "@/types/people";

function getInitials(name: string) {
  const words = name.split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function ChevronRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export type OtherArticle = {
  slug: string;
  title: string;
  image: string | null;
  category: string;
};

export default function ArticleAuthorCard({
  author,
  otherArticles,
  darkMode,
}: {
  author: PersonSummary;
  otherArticles: OtherArticle[];
  darkMode: boolean;
}) {
  const bgCard = darkMode ? "bg-[#222]" : "bg-warm-50";
  const borderColor = darkMode ? "border-[#f5f0eb]/10" : "border-warm-200";
  const textPrimary = darkMode ? "text-[#f5f0eb]" : "text-warm-900";
  const textMuted = darkMode ? "text-[#f5f0eb]/40" : "text-brand-warm";
  const hoverBg = darkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-warm-100";

  return (
    <aside
      className="mx-auto px-6"
      style={{ maxWidth: "720px" }}
    >
      <div className={`mt-16 pt-12 border-t ${borderColor}`}>
        <div className={`rounded-2xl ${bgCard} p-8`}>
          {/* Üst: Avatar + isim + bio */}
          <div className="flex items-start gap-4 mb-6">
            <Link href={`/yazarlar/${author.slug}`} className="shrink-0">
              <div className="w-16 h-16 rounded-xl bg-warm-100 flex items-center justify-center overflow-hidden hover:opacity-80 transition">
                {author.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-brand-warm font-bold text-lg">
                    {getInitials(author.name)}
                  </span>
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <div className={`text-xs uppercase tracking-wider ${textMuted} mb-1`}>
                Yazar
              </div>
              <Link href={`/yazarlar/${author.slug}`}>
                <h3 className={`text-xl font-bold ${textPrimary} hover:text-coral transition`}>
                  {author.name}
                </h3>
              </Link>
              {author.short_bio && (
                <p className={`text-sm ${textMuted} mt-2 leading-relaxed`}>
                  {author.short_bio}
                </p>
              )}
            </div>
          </div>

          {/* Diğer yazılar */}
          {otherArticles.length > 0 && (
            <div className={`border-t ${borderColor} pt-6`}>
              <div className={`text-xs uppercase tracking-wider ${textMuted} mb-4`}>
                {author.name}&apos;den diğer yazılar
              </div>

              <div className="space-y-3">
                {otherArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/icerikler/yazi/${article.slug}`}
                    className={`flex items-start gap-4 group -mx-2 px-2 py-2 rounded-lg ${hoverBg} transition`}
                  >
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-warm-100 shrink-0">
                      {article.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-wider text-coral/80 mb-0.5">
                        {article.category}
                      </div>
                      <div className={`text-sm font-medium ${textPrimary} group-hover:text-coral transition line-clamp-2`}>
                        {article.title}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href={`/yazarlar/${author.slug}`}
                className="inline-flex items-center gap-1 mt-5 text-sm text-coral font-medium hover:underline"
              >
                {author.name}&apos;in tüm yazılarını gör
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
