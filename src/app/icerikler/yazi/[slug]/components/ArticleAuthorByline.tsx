import Link from "next/link";
import type { PersonSummary } from "@/types/people";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function MailIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
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
  const textMuted = darkMode ? "text-[#f5f0eb]/40" : "text-brand-warm";
  const dotColor = darkMode ? "text-[#f5f0eb]/20" : "text-brand-warm/50";
  const iconHover = darkMode ? "text-[#f5f0eb]/40 hover:text-coral" : "text-brand-warm hover:text-coral";
  const textSub = darkMode ? "text-[#f5f0eb]/40" : "text-warm-900/35";

  // author_person varsa — people tablosundan zengin veri
  if (authorPerson) {
    const ig = authorPerson.instagram;
    // PersonSummary'de email yok, fallback olarak authorEmail kullan
    const email = authorEmail;
    const hasSocial = ig || email;

    return (
      <div className={`flex items-center gap-3 text-sm ${textMuted} flex-wrap`}>
        <Link
          href={`/yazarlar/${authorPerson.slug}`}
          className={`font-medium hover:text-coral transition ${darkMode ? "text-[#f5f0eb]" : "text-warm-900"}`}
        >
          {authorPerson.name}
        </Link>
        <span className={dotColor}>·</span>
        <time>{formatDate(date)}</time>
        {readTime && (
          <>
            <span className={dotColor}>·</span>
            <span>{readTime} okuma</span>
          </>
        )}
        {hasSocial && (
          <>
            <span className={dotColor}>·</span>
            <div className="flex items-center gap-2">
              {ig && (
                <a
                  href={`https://instagram.com/${ig.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${iconHover} transition`}
                  aria-label={`${authorPerson.name} Instagram`}
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className={`${iconHover} transition`}
                  aria-label={`${authorPerson.name} e-posta`}
                >
                  <MailIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Fallback — eski text alanları (author_id NULL)
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-4">
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
          <p className={`text-xs mt-0.5 ${darkMode ? "text-[#f5f0eb]/40" : "text-warm-900/40"}`}>
            {formatDate(date)} · {readTime} okuma
          </p>
        </div>
      </div>
    </div>
  );
}
