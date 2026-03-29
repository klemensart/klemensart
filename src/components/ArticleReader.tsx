"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleLikeButton from "@/components/ArticleLikeButton";
import ArticleNewsletterCTA from "@/components/ArticleNewsletterCTA";
import type { ParsedArticle, ArticleMeta } from "@/lib/markdown";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ArticleReader({ article, relatedArticles = [] }: { article: ParsedArticle; relatedArticles?: ArticleMeta[] }) {
  const { meta, contentHtml } = article;
  const [darkMode, setDarkMode] = useState(false);
  const [readingMode, setReadingMode] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(shareUrl);
  const shareText = encodeURIComponent(meta.title);
  const [copied, setCopied] = useState(false);

  return (
    <div
      style={{ transition: "background-color 0.4s ease, color 0.4s ease" }}
      className={darkMode ? "bg-[#1a1a1a] text-[#f5f0eb] min-h-screen" : "bg-warm-50 text-warm-900 min-h-screen"}
    >
      {/* Navbar — hidden in reading mode */}
      <div
        style={{ transition: "opacity 0.35s ease, max-height 0.35s ease" }}
        className={readingMode ? "opacity-0 pointer-events-none overflow-hidden max-h-0" : "opacity-100 max-h-24"}
      >
        <Navbar />
      </div>

      <main className={readingMode ? "pt-16" : "pt-28"} style={{ transition: "padding-top 0.35s ease" }}>

        {/* Back link */}
        {!readingMode && (
          <div className="max-w-2xl mx-auto px-6 mb-10">
            <Link
              href="/icerikler"
              className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${darkMode ? "text-[#f5f0eb]/40 hover:text-[#FF6D60]" : "text-warm-900/35 hover:text-coral"}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Tüm Yazılara Dön
            </Link>
          </div>
        )}

        {/* Article header */}
        <header
          className="mx-auto px-6 mb-12"
          style={{ maxWidth: readingMode ? "600px" : "680px", transition: "max-width 0.35s ease" }}
        >
          {/* Category badge */}
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-coral/10 text-coral">
              {meta.category}
            </span>
          </div>

          {/* Title */}
          <h1
            className={`font-bold leading-tight mb-8 ${darkMode ? "text-[#f5f0eb]" : "text-warm-900"}`}
            style={{
              fontSize: "clamp(1.9rem, 4vw, 2.75rem)",
              lineHeight: 1.2,
            }}
          >
            {meta.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Author + date + time */}
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: "#FF6D60" }}
              >
                {meta.author.charAt(0)}
              </div>
              <div>
                <p className={`text-sm font-semibold ${darkMode ? "text-[#f5f0eb]" : "text-warm-900"}`}>
                  {meta.author}
                </p>
                {(meta.authorIg || meta.authorEmail) && (
                  <p className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                    {meta.authorIg && (
                      <a
                        href={`https://instagram.com/${meta.authorIg.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs font-normal transition-colors hover:text-coral ${darkMode ? "text-[#f5f0eb]/40" : "text-warm-900/35"}`}
                      >
                        {meta.authorIg}
                      </a>
                    )}
                    {meta.authorEmail && (
                      <a
                        href={`mailto:${meta.authorEmail}`}
                        className={`text-xs font-normal transition-colors hover:text-coral ${darkMode ? "text-[#f5f0eb]/40" : "text-warm-900/35"}`}
                      >
                        {meta.authorEmail}
                      </a>
                    )}
                  </p>
                )}
                <p className={`text-xs mt-0.5 ${darkMode ? "text-[#f5f0eb]/40" : "text-warm-900/40"}`}>
                  {formatDate(meta.date)} · {meta.readTime} okuma
                </p>
              </div>
            </div>

            {/* Mode buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReadingMode((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  readingMode
                    ? "bg-coral border-coral text-white"
                    : darkMode
                    ? "border-[#f5f0eb]/20 text-[#f5f0eb]/60 hover:border-[#f5f0eb]/40"
                    : "border-warm-200 text-warm-900/50 hover:border-warm-900/30"
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Okuma Modu
              </button>
              <button
                onClick={() => setDarkMode((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  darkMode
                    ? "bg-[#f5f0eb] border-[#f5f0eb] text-[#1a1a1a]"
                    : "border-warm-200 text-warm-900/50 hover:border-warm-900/30"
                }`}
              >
                {darkMode ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    Açık Mod
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    Gece Modu
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className={`mt-10 h-px ${darkMode ? "bg-[#f5f0eb]/10" : "bg-warm-200"}`} />
        </header>

        {/* Article body */}
        <article
          className="mx-auto px-6 mb-16"
          style={{ maxWidth: readingMode ? "600px" : "680px", transition: "max-width 0.35s ease" }}
        >
          {/* Spot / Lead paragraph */}
          {meta.description && (
            <p
              className={`spot-quote mb-8 ${darkMode ? "text-[#f5f0eb]/90" : "text-warm-900/90"}`}
              style={{
                fontSize: readingMode ? "23px" : "20px",
                lineHeight: 1.6,
                fontWeight: 500,
                fontStyle: "italic",
                borderLeft: "3px solid #FF6D60",
                paddingLeft: "1.25rem",
                transition: "font-size 0.35s ease",
              }}
            >
              {meta.description}
            </p>
          )}

          <div
            className={`prose-klemens ${darkMode ? "text-[#f5f0eb]/85" : "text-warm-900/80"}`}
            style={{ fontSize: readingMode ? "21px" : "18px", transition: "font-size 0.35s ease" }}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>

        {/* Tags */}
        <div
          className="mx-auto px-6 mb-10"
          style={{ maxWidth: readingMode ? "600px" : "680px", transition: "max-width 0.35s ease" }}
        >
          <div className={`h-px mb-8 ${darkMode ? "bg-[#f5f0eb]/10" : "bg-warm-200"}`} />
          <div className="flex flex-wrap gap-2">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border ${
                  darkMode
                    ? "border-[#f5f0eb]/15 text-[#f5f0eb]/50"
                    : "border-warm-200 text-warm-900/45"
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Like & Share */}
        <div
          className="mx-auto px-6 mb-16"
          style={{ maxWidth: readingMode ? "600px" : "680px", transition: "max-width 0.35s ease" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-semibold tracking-widest uppercase ${darkMode ? "text-[#f5f0eb]/30" : "text-warm-900/30"}`}>
              Paylaş
            </p>
            <ArticleLikeButton slug={meta.slug} darkMode={darkMode} />
          </div>
          <div className="flex items-center gap-3">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${shareText}%20${encodedUrl}`}
              target="_blank" rel="noopener noreferrer"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:border-coral hover:text-coral ${darkMode ? "border-[#f5f0eb]/15 text-[#f5f0eb]/40" : "border-warm-200 text-warm-900/35"}`}
              aria-label="WhatsApp'ta paylaş"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
            {/* X / Twitter */}
            <a
              href={`https://x.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
              target="_blank" rel="noopener noreferrer"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:border-coral hover:text-coral ${darkMode ? "border-[#f5f0eb]/15 text-[#f5f0eb]/40" : "border-warm-200 text-warm-900/35"}`}
              aria-label="X'te paylaş"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank" rel="noopener noreferrer"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:border-coral hover:text-coral ${darkMode ? "border-[#f5f0eb]/15 text-[#f5f0eb]/40" : "border-warm-200 text-warm-900/35"}`}
              aria-label="LinkedIn'de paylaş"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            {/* Mail */}
            <a
              href={`mailto:?subject=${shareText}&body=${shareText}%0A%0A${encodedUrl}`}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:border-coral hover:text-coral ${darkMode ? "border-[#f5f0eb]/15 text-[#f5f0eb]/40" : "border-warm-200 text-warm-900/35"}`}
              aria-label="E-posta ile paylaş"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
            {/* Linki Kopyala */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:border-coral hover:text-coral ${
                copied
                  ? "border-coral text-coral"
                  : darkMode ? "border-[#f5f0eb]/15 text-[#f5f0eb]/40" : "border-warm-200 text-warm-900/35"
              }`}
              aria-label="Linki kopyala"
            >
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Newsletter CTA */}
        {!readingMode && <ArticleNewsletterCTA darkMode={darkMode} />}

        {/* Related articles */}
        {!readingMode && relatedArticles.length > 0 && (
          <section className={`py-16 px-6 ${darkMode ? "bg-[#111111]" : "bg-white"}`}>
            <div className="max-w-4xl mx-auto">
              <p className={`text-xs font-semibold tracking-widest uppercase mb-8 ${darkMode ? "text-[#f5f0eb]/30" : "text-warm-900/30"}`}>
                İlgili Yazılar
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedArticles.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/icerikler/yazi/${r.slug}`}
                    className={`group block p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
                      darkMode
                        ? "border-[#f5f0eb]/10 hover:border-[#f5f0eb]/25 bg-[#1a1a1a]"
                        : "border-warm-100 hover:border-warm-200 hover:shadow-lg hover:shadow-warm-900/5 bg-warm-50"
                    }`}
                  >
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold bg-coral/10 text-coral mb-3">
                      {r.category}
                    </span>
                    <h3 className={`font-semibold text-sm leading-snug mb-2 group-hover:text-coral transition-colors ${darkMode ? "text-[#f5f0eb]" : "text-warm-900"}`}>
                      {r.title}
                    </h3>
                    <p className={`text-xs leading-relaxed mb-4 ${darkMode ? "text-[#f5f0eb]/45" : "text-warm-900/45"}`}>
                      {r.description}
                    </p>
                    <span className={`text-xs font-medium ${darkMode ? "text-[#f5f0eb]/30" : "text-warm-900/30"}`}>
                      {r.readTime} okuma
                    </span>
                  </Link>
                ))}
              </div>

              {/* Back CTA */}
              <div className="mt-12 text-center">
                <Link
                  href="/icerikler"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-coral text-coral text-sm font-semibold hover:bg-coral hover:text-white transition-all duration-200"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Tüm Yazılara Dön
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {!readingMode && (
        <div style={{ transition: "opacity 0.35s ease" }}>
          <Footer />
        </div>
      )}
    </div>
  );
}
