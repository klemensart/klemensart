"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterFormAeon from "@/components/NewsletterFormAeon";
import type { ParsedArticle, ArticleMeta } from "@/lib/markdown";
import ArticleAuthorByline from "@/app/icerikler/yazi/[slug]/components/ArticleAuthorByline";
import ArticleAuthorCard from "@/app/icerikler/yazi/[slug]/components/ArticleAuthorCard";
import type { OtherArticle } from "@/app/icerikler/yazi/[slug]/components/ArticleAuthorCard";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

/** Find the HTML split point at ~50% of closing </p> tags (minimum 4 paragraphs required) */
function getHtmlMidpoint(html: string): number {
  const closingTagRegex = /<\/p>/gi;
  const positions: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = closingTagRegex.exec(html)) !== null) {
    positions.push(match.index + match[0].length);
  }
  if (positions.length < 4) return -1;
  const midIndex = Math.floor(positions.length / 2);
  return positions[midIndex];
}

export default function ArticleReader({ article, relatedArticles = [], authorOtherArticles = [] }: { article: ParsedArticle; relatedArticles?: ArticleMeta[]; authorOtherArticles?: OtherArticle[] }) {
  const { meta, contentHtml } = article;
  const [darkMode, setDarkMode] = useState(false);
  const [readingMode, setReadingMode] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(shareUrl);
  const shareText = encodeURIComponent(meta.title);
  const [copied, setCopied] = useState(false);

  // Akıllı drop cap: sadece harfle başlayan ilk paragraflarda
  useEffect(() => {
    const proseDiv = document.querySelector(".prose-klemens");
    if (!proseDiv) return;
    const firstP = proseDiv.querySelector(":scope > p:first-child");
    if (!firstP) return;
    const text = firstP.textContent?.trim() || "";
    const firstChar = text[0];
    if (firstChar && /^[a-zA-ZçğıöşüÇĞIİÖŞÜâîûÂÎÛ]$/.test(firstChar)) {
      firstP.classList.add("drop-cap-enabled");
    } else {
      firstP.classList.remove("drop-cap-enabled");
    }
  }, [contentHtml, readingMode]);

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

        {/* Cover image — full-bleed (overlay veya hibrit) */}
        {meta.image && !readingMode && (
          <>
            <div className="relative w-full h-[260px] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
              <Image
                src={meta.image}
                alt={meta.title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
                {...(meta.image.includes("sgabkrzzzszfqrtgkord")
                  ? {}
                  : { unoptimized: true }
                )}
              />

              {/* Aeon stili overlay — toggle açık + lg: ekran */}
              {meta.hero_overlay_enabled && (
                <>
                  <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
                  <div className="hidden lg:block absolute inset-x-0 bottom-0 px-6 lg:pb-16">
                    <div className="max-w-[1100px] mx-auto">
                      {meta.category && (
                        <div className="mb-4">
                          <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-medium">
                            {meta.category}
                          </span>
                        </div>
                      )}
                      <h1 className="font-newsreader text-white font-extrabold text-3xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tighter mb-4 max-w-4xl" style={{ fontVariationSettings: '"opsz" 36' }}>
                        {meta.title}
                      </h1>
                      {meta.description && (
                        <p className="text-white/90 text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl">
                          {meta.description}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {meta.cover_caption && (
              <div
                className="mx-auto px-6 mt-2"
                style={{ maxWidth: "720px" }}
              >
                <p className={`text-xs italic leading-relaxed ${darkMode ? "text-[#f5f0eb]/40" : "text-brand-warm"}`}>
                  {meta.cover_caption}
                </p>
              </div>
            )}
          </>
        )}

        {/* Article header */}
        <header
          className={`mx-auto px-6 mb-12 ${meta.image ? "mt-6 lg:mt-8" : ""}`}
          style={{ maxWidth: readingMode ? "600px" : "720px", transition: "max-width 0.35s ease" }}
        >
          {/* Category badge — overlay açıkken lg:'de gizle (overlay içinde var) */}
          <div className={`mb-6 ${meta.hero_overlay_enabled ? "lg:hidden" : ""}`}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-coral/10 text-coral">
              {meta.category}
            </span>
          </div>

          {/* Title — overlay açıkken lg:'de gizle (overlay içinde var) */}
          <h1
            className={`font-newsreader font-extrabold tracking-tighter mb-8 ${darkMode ? "text-[#f5f0eb]" : "text-warm-900"} ${meta.hero_overlay_enabled ? "lg:hidden" : ""}`}
            style={{
              fontSize: "clamp(1.9rem, 4vw, 2.75rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              fontVariationSettings: '"opsz" 36',
            }}
          >
            {meta.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Author byline */}
            <ArticleAuthorByline
              authorPerson={meta.author_person}
              authorName={meta.author}
              authorIg={meta.authorIg}
              authorEmail={meta.authorEmail}
              date={meta.date}
              readTime={meta.readTime}
              slug={meta.slug}
              darkMode={darkMode}
            />

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
          style={{ maxWidth: readingMode ? "600px" : "720px", transition: "max-width 0.35s ease" }}
        >
          {/* Spot / Lead paragraph — overlay açıkken lg:'de gizle */}
          {meta.description && (
            <p
              className={`spot-quote mb-8 ${darkMode ? "text-[#f5f0eb]/90" : "text-warm-900/90"} ${meta.hero_overlay_enabled ? "lg:hidden" : ""}`}
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

          {(() => {
            const midpoint = getHtmlMidpoint(contentHtml);
            if (midpoint === -1) {
              return (
                <>
                  <div
                    className={`prose-klemens ${darkMode ? "text-[#f5f0eb]/85" : "text-warm-900/80"}`}
                    style={{ fontSize: readingMode ? "21px" : "19px", transition: "font-size 0.35s ease" }}
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                  <div className="mt-12">
                    <NewsletterFormAeon source="article-end" compact />
                  </div>
                </>
              );
            }
            const firstHalf = contentHtml.slice(0, midpoint);
            const secondHalf = contentHtml.slice(midpoint);
            return (
              <>
                <div
                  className={`prose-klemens ${darkMode ? "text-[#f5f0eb]/85" : "text-warm-900/80"}`}
                  style={{ fontSize: readingMode ? "21px" : "19px", transition: "font-size 0.35s ease" }}
                  dangerouslySetInnerHTML={{ __html: firstHalf }}
                />
                <div className="my-10">
                  <NewsletterFormAeon source="article-inline" compact />
                </div>
                <div
                  className={`prose-klemens ${darkMode ? "text-[#f5f0eb]/85" : "text-warm-900/80"}`}
                  style={{ fontSize: readingMode ? "21px" : "19px", transition: "font-size 0.35s ease" }}
                  dangerouslySetInnerHTML={{ __html: secondHalf }}
                />
              </>
            );
          })()}
        </article>

        {/* Author Card */}
        {meta.author_person && (
          <ArticleAuthorCard
            author={meta.author_person}
            otherArticles={authorOtherArticles}
            darkMode={darkMode}
          />
        )}

        {/* Tags */}
        <div
          className="mx-auto px-6 mb-10"
          style={{ maxWidth: readingMode ? "600px" : "720px", transition: "max-width 0.35s ease" }}
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

        {/* Share */}
        <div
          className="mx-auto px-6 mb-16"
          style={{ maxWidth: readingMode ? "600px" : "720px", transition: "max-width 0.35s ease" }}
        >
          <p className={`text-xs font-semibold tracking-widest uppercase mb-4 ${darkMode ? "text-[#f5f0eb]/30" : "text-warm-900/30"}`}>
            Paylaş
          </p>
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
