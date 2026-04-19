import Link from "next/link";
import type { PersonSummary } from "@/types/people";

function getInitials(name: string) {
  const words = name.split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ArticleAuthorByline({
  authorPerson,
  authorName,
  authorIg,
  authorEmail,
  date,
  readTime,
  darkMode,
}: {
  authorPerson?: PersonSummary | null;
  authorName: string;
  authorIg?: string;
  authorEmail?: string;
  date: string;
  readTime: string;
  darkMode: boolean;
}) {
  const textMuted = darkMode ? "text-[#f5f0eb]/40" : "text-warm-900/40";
  const textSub = darkMode ? "text-[#f5f0eb]/40" : "text-warm-900/35";

  // author_person varsa — people tablosundan zengin veri
  if (authorPerson) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link
          href={`/yazarlar/${authorPerson.slug}`}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center shrink-0 overflow-hidden">
            {authorPerson.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={authorPerson.avatar_url}
                alt={authorPerson.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-brand-warm font-bold text-xs">
                {getInitials(authorPerson.name)}
              </span>
            )}
          </div>
          <span className={`font-semibold group-hover:text-coral transition ${darkMode ? "text-[#f5f0eb]" : "text-warm-900"}`}>
            {authorPerson.name}
          </span>
        </Link>
        <span className={textMuted}>·</span>
        <time className={textMuted}>
          {formatDate(date)}
        </time>
        <span className={textMuted}>·</span>
        <span className={textMuted}>{readTime} okuma</span>
      </div>
    );
  }

  // Fallback — eski text alanları (author_id NULL)
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: "#FF6D60" }}
        >
          {authorName.charAt(0)}
        </div>
        <div>
          <p className={`text-sm font-semibold ${darkMode ? "text-[#f5f0eb]" : "text-warm-900"}`}>
            {authorName}
          </p>
          {(authorIg || authorEmail) && (
            <p className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
              {authorIg && (
                <a
                  href={`https://instagram.com/${authorIg.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs font-normal transition-colors hover:text-coral ${textSub}`}
                >
                  {authorIg}
                </a>
              )}
              {authorEmail && (
                <a
                  href={`mailto:${authorEmail}`}
                  className={`text-xs font-normal transition-colors hover:text-coral ${textSub}`}
                >
                  {authorEmail}
                </a>
              )}
            </p>
          )}
          <p className={`text-xs mt-0.5 ${textMuted}`}>
            {formatDate(date)} · {readTime} okuma
          </p>
        </div>
      </div>
    </div>
  );
}
