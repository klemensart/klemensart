"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export type Announcement = {
  id: string;
  title: string;
  link_url: string | null;
  link_text: string | null;
  badge_text: string | null;
  pages: string[];
};

const BAR_HEIGHT = 40;
const ROTATE_INTERVAL = 5000;

function setBarOffset(h: number) {
  document.documentElement.style.setProperty("--announcement-bar-h", `${h}px`);
}

/**
 * Client wrapper — receives server-fetched announcements (or fetches client-side via `page` prop),
 * handles localStorage dismiss check, carousel, and close button.
 */
export default function AnnouncementBarClient({
  announcements: initial,
  page,
}: {
  announcements?: Announcement[];
  page?: string;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initial ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(!!initial && initial.length > 0);
  const [closing, setClosing] = useState(false);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If data was passed from server, filter dismissed on mount
  useEffect(() => {
    if (initial && initial.length > 0) {
      const active = initial.filter(
        (a) => !localStorage.getItem(`dismissed_announcement_${a.id}`)
      );
      if (active.length === 0) {
        setVisible(false);
        return;
      }
      setAnnouncements(active);
      setBarOffset(BAR_HEIGHT);
      return;
    }

    // Fallback: client-side fetch (used when embedded in client components)
    if (!page) return;
    const supabase = createClient();
    supabase
      .from("announcements")
      .select("id, title, link_url, link_text, badge_text, pages")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .contains("pages", [page])
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const active = data.filter(
          (a) => !localStorage.getItem(`dismissed_announcement_${a.id}`)
        ) as Announcement[];
        if (active.length === 0) return;
        setAnnouncements(active);
        setVisible(true);
        setBarOffset(BAR_HEIGHT);
      });
  }, [initial, page]);

  // Carousel rotation
  useEffect(() => {
    if (announcements.length <= 1) return;

    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
        setFading(false);
      }, 300);
    }, ROTATE_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [announcements.length]);

  const dismiss = useCallback(() => {
    for (const a of announcements) {
      localStorage.setItem(`dismissed_announcement_${a.id}`, "1");
    }
    setClosing(true);
    setBarOffset(0);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => setVisible(false), 300);
  }, [announcements]);

  if (!visible || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] overflow-hidden transition-all duration-300 ease-in-out"
      style={{ height: closing ? 0 : BAR_HEIGHT }}
    >
      <div
        className="bg-coral text-white text-sm font-medium flex items-center justify-center gap-3 px-10 relative"
        style={{ height: BAR_HEIGHT }}
      >
        {/* Dots indicator */}
        {announcements.length > 1 && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1">
            {announcements.map((_, i) => (
              <span
                key={i}
                className={`inline-block w-1.5 h-1.5 rounded-full transition-opacity duration-300 ${
                  i === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        <span
          className={`text-center transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
        >
          <span className="live-pulse inline-block w-1.5 h-1.5 rounded-full bg-green-300 mr-2 align-middle" />
          {current.title}
          {current.link_url && (
            <>
              {" "}
              <Link
                href={current.link_url}
                className="underline font-semibold hover:text-white/90 transition-colors"
              >
                {current.link_text || "Detaylar"}
              </Link>
            </>
          )}
        </span>

        <button
          onClick={dismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          aria-label="Duyuruyu kapat"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Aktif duyurulardan, verilen slug'a eşleşen badge_text döner.
 * Atölye kartlarında "Yeni" badge göstermek için kullanılır.
 */
export function useAnnouncementBadges(page: string) {
  const [badges, setBadges] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("announcements")
      .select("link_url, badge_text")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .contains("pages", [page])
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        for (const a of data) {
          if (a.link_url && a.badge_text) {
            const match = a.link_url.match(/\/atolyeler\/([^/?#]+)/);
            if (match) map[match[1]] = a.badge_text;
          }
        }
        setBadges(map);
      });
  }, [page]);

  return badges;
}
