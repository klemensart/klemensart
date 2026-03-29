"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function ArticleLikeButton({
  slug,
  darkMode,
}: {
  slug: string;
  darkMode: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Auth durumunu kontrol et
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  // Beğeni durumunu yükle
  const fetchLikeState = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/like?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setLiked(data.liked);
      }
    } catch {
      // Sessizce geç
    }
  }, [slug]);

  useEffect(() => {
    fetchLikeState();
  }, [fetchLikeState]);

  const handleLike = async () => {
    if (!userId) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 4000);
      return;
    }

    setLoading(true);
    // Optimistic update
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const res = await fetch("/api/articles/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.count);
      }
    } catch {
      // Revert on error
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
          liked
            ? "border-coral/40 bg-coral/10 text-coral"
            : darkMode
              ? "border-[#f5f0eb]/15 text-[#f5f0eb]/40 hover:border-coral hover:text-coral"
              : "border-warm-200 text-warm-900/35 hover:border-coral hover:text-coral"
        } disabled:opacity-50`}
        aria-label={liked ? "Beğeniyi geri al" : "Beğen"}
      >
        {/* Heart icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${liked ? "scale-110" : "group-hover:scale-110"}`}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {count > 0 && (
          <span className="text-xs font-semibold tabular-nums">{count}</span>
        )}
      </button>

      {/* Tooltip — giriş yapmamış kullanıcılar için */}
      {showTooltip && (
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 rounded-xl text-xs whitespace-nowrap shadow-lg z-50 ${
            darkMode
              ? "bg-[#2a2a2a] border border-[#f5f0eb]/15 text-[#f5f0eb]/80"
              : "bg-white border border-warm-200 text-warm-900/70 shadow-warm-900/10"
          }`}
        >
          <p className="font-medium mb-1">Beğenmek için giriş yapın</p>
          <Link
            href="/club/giris"
            className="text-coral font-semibold hover:underline underline-offset-2"
          >
            Loca&apos;ya katılın &rarr;
          </Link>
          {/* Arrow */}
          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 -mt-1.5 ${
              darkMode
                ? "bg-[#2a2a2a] border-r border-b border-[#f5f0eb]/15"
                : "bg-white border-r border-b border-warm-200"
            }`}
          />
        </div>
      )}
    </div>
  );
}
