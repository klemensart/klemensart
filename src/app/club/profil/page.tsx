"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const BUNNY_LIB = "596471";

/* ─── Brand ─── */
const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark:  "#2D2926",
  warm:  "#8C857E",
  light: "#F5F0EB",
};

/* ─── Icons ─── */
const I = {
  play:     (c = B.coral, s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><polygon points="6,3 20,12 6,21" /></svg>,
  lock:     (c = B.warm,  s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  clock:    (c = B.warm,  s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  calendar: (c = B.warm,  s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  chevron:  (c = B.warm,  s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
  film:     (c = B.warm,  s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" /></svg>,
  book:     (c = B.warm,  s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  chart:    (c = B.warm,  s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  heart:    (c = B.warm,  s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  settings: (c = B.warm,  s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  video:    (c = B.warm,  s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>,
  arrow:    (c = "#fff",  s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  logout:   (c = B.warm,  s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  close:    (c = "#fff",  s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  download: (c = B.warm,  s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
};

/* ─── DB Types ─── */
type DbWorkshop = {
  id: string;
  title: string;
  description: string | null;
  total_sessions: number;
  is_live: boolean;
  zoom_link: string | null;
  next_session_date: string | null;
};
type DbSession = {
  workshop_id: string;
  session_number: number;
  title: string;
  bunny_video_id: string | null;
  duration: string | null;
  is_published: boolean;
  pdf_url: string | null;
  session_date: string | null;
  zoom_url: string | null;
  status: string | null; // 'upcoming' | 'live' | 'completed'
};
type DbSingleVideo = {
  id: string;
  title: string;
  description: string | null;
  bunny_video_id: string;
  duration: string | null;
};
type WorkshopItem = {
  workshopId: string;
  expiresAt: string | null;
  ws: DbWorkshop;
  sessions: DbSession[];
};
type VideoItem = {
  videoId: string;
  expiresAt: string | null;
  vid: DbSingleVideo;
};

/* ─── Helpers ─── */
function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}
function formatExpiry(dateStr: string) {
  return (
    new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric", month: "long", year: "numeric",
    }) + "'e kadar"
  );
}
function isWithinOneHour(sessionDate: string | null): boolean {
  if (!sessionDate) return false;
  const diff = new Date(sessionDate).getTime() - Date.now();
  return diff > 0 && diff <= 60 * 60 * 1000;
}

/* ─── Video Modal ─── */
function VideoModal({ bunnyId, title, onClose }: { bunnyId: string; title: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(16px, 4vw, 40px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 900 }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 15, lineHeight: 1.4, flex: 1, paddingRight: 12 }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8,
              padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {I.close("#fff", 18)}
          </button>
        </div>
        {/* 16:9 iframe */}
        <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#000" }}>
          <iframe
            src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIB}/${bunnyId}?autoplay=true&preload=true`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Badge ─── */
function Badge({ children, variant = "default" }: {
  children: React.ReactNode;
  variant?: "default" | "live" | "expires" | "club";
}) {
  const s: Record<string, React.CSSProperties> = {
    default: { background: B.light,    color: B.dark    },
    live:    { background: "#E8F5E9",  color: "#2E7D32" },
    expires: { background: "#FFF8E1",  color: "#F57F17" },
    club:    { background: B.dark,     color: "#fff"    },
  };
  return (
    <span style={{
      ...s[variant], padding: "4px 12px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      {children}
    </span>
  );
}

/* ─── ProgressBar ─── */
function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
      <div style={{ flex: 1, height: 3, background: B.light, borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: pct === 100 ? "#4CAF50" : B.coral,
          borderRadius: 2, transition: "width 0.6s ease",
        }} />
      </div>
      <span style={{ fontSize: 11, color: B.warm, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
        {completed}/{total}
      </span>
    </div>
  );
}

/* ─── PDF Button ─── */
function PdfButton({ url }: { url: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "4px 9px", borderRadius: 7, border: "none",
        background: hovered ? `${B.coral}18` : B.light,
        color: hovered ? B.coral : B.warm,
        fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
        cursor: "pointer", textDecoration: "none", flexShrink: 0,
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {I.download(hovered ? B.coral : B.warm, 12)} PDF
    </a>
  );
}

/* ─── Session List ─── */
function SessionList({
  sessions, isLive, nextSession, zoomLink, onPlay,
}: {
  sessions: DbSession[];
  isLive: boolean;
  nextSession: string | null;
  zoomLink: string | null;
  onPlay: (bunnyId: string, title: string) => void;
}) {
  // Find next upcoming or live session for banner
  const bannerSession = sessions.find(s => s.status === "live") ??
    sessions.find(s => s.status === "upcoming" && s.session_date);

  const bannerDate = bannerSession?.session_date ?? nextSession;
  const bannerZoom = bannerSession?.zoom_url ?? zoomLink;
  const showBanner = isLive && bannerDate;

  return (
    <div style={{ marginTop: 12 }}>
      {/* Pulsing dot keyframe */}
      <style>{`@keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

      {/* Next live session banner */}
      {showBanner && (
        <div style={{
          padding: "14px 16px", background: "#F1F8E9", borderRadius: 12, marginBottom: 14,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          border: "1px solid #C5E1A5", flexWrap: "wrap", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {I.calendar("#2E7D32", 16)}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#2E7D32", letterSpacing: "0.04em" }}>
                {bannerSession?.status === "live" ? "CANLI OTURUM" : "SONRAKİ CANLI OTURUM"}
              </div>
              <div style={{ fontSize: 14, color: B.dark, marginTop: 2 }}>
                {new Date(bannerDate).toLocaleString("tr-TR", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </div>
            </div>
          </div>
          {bannerZoom && (
            <a
              href={bannerZoom}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#2E7D32", color: "#fff", border: "none",
                borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                textDecoration: "none",
              }}
            >
              Katıl {I.arrow("#fff", 13)}
            </a>
          )}
        </div>
      )}

      {/* Session rows */}
      {sessions.map((s) => {
        const isUpcoming = s.status === "upcoming";
        const isLiveSession = s.status === "live";
        const isCompleted = s.status === "completed";
        const hasStatus = isUpcoming || isLiveSession || isCompleted;
        const sessionZoom = s.zoom_url ?? zoomLink;

        // For upcoming/live: no video click
        // For completed with is_published: video click (same as before)
        // For null status: original behavior
        const canPlayVideo = hasStatus
          ? isCompleted && s.is_published && !!s.bunny_video_id
          : s.is_published && !!s.bunny_video_id;

        const rowOpacity = isUpcoming ? 0.7 : (hasStatus ? 1 : (s.is_published ? 1 : 0.45));
        const rowBg = isLiveSession ? "#F1F8E9" : (canPlayVideo || isUpcoming ? B.cream : "transparent");

        return (
          <div
            key={s.session_number}
            onClick={() => canPlayVideo && onPlay(s.bunny_video_id!, s.title)}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
              background: rowBg, borderRadius: 10, marginBottom: 4,
              cursor: canPlayVideo ? "pointer" : "default",
              opacity: rowOpacity,
            }}
          >
            {/* Icon box */}
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: isLiveSession ? "#2E7D32"
                : isUpcoming ? B.light
                : (isCompleted && s.is_published) ? B.coral
                : s.is_published ? B.coral : B.light,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isUpcoming
                ? I.calendar(B.warm, 12)
                : isLiveSession
                  ? I.play("#fff", 12)
                  : s.is_published ? I.play("#fff", 12) : I.lock(B.warm, 12)
              }
            </div>

            {/* Title + subtitle */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: B.dark, display: "flex", alignItems: "center", gap: 6 }}>
                {s.title}
                {isLiveSession && (
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", background: "#4CAF50",
                    display: "inline-block", flexShrink: 0,
                    animation: "livePulse 1.5s ease-in-out infinite",
                  }} />
                )}
              </div>
              <div style={{ fontSize: 12, color: B.warm, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                {(isUpcoming || isLiveSession) && s.session_date ? (
                  <>
                    {I.calendar(B.warm, 11)}{" "}
                    {new Date(s.session_date).toLocaleString("tr-TR", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </>
                ) : (
                  <>{I.clock(B.warm, 11)} {s.duration ?? "—"}</>
                )}
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {/* PDF for completed/published */}
              {s.pdf_url && (isCompleted || (!hasStatus && s.is_published)) && <PdfButton url={s.pdf_url} />}

              {isLiveSession && sessionZoom ? (
                <a
                  href={sessionZoom}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "#2E7D32", color: "#fff", border: "none",
                    borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    textDecoration: "none",
                  }}
                >
                  Katıl {I.arrow("#fff", 11)}
                </a>
              ) : isUpcoming ? (
                isWithinOneHour(s.session_date) && sessionZoom ? (
                  <a
                    href={sessionZoom}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: "#2E7D32", color: "#fff", border: "none",
                      borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 600,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                      textDecoration: "none",
                    }}
                  >
                    Katıl {I.arrow("#fff", 10)}
                  </a>
                ) : (
                  <span style={{ fontSize: 11, color: B.warm, fontStyle: "italic" }}>Yakında</span>
                )
              ) : (isCompleted && s.is_published && s.bunny_video_id) || (!hasStatus && s.is_published && s.bunny_video_id) ? (
                <span style={{ fontSize: 12, color: B.coral, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>İzle {I.arrow(B.coral, 12)}</span>
              ) : !hasStatus ? (
                <span style={{ fontSize: 11, color: B.warm, fontStyle: "italic" }}>Yakında</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Loca loading skeleton ─── */
function LocaSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[1, 2].map((k) => (
        <div key={k} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: B.light }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ height: 14, background: B.light, borderRadius: 6, width: "65%" }} />
              <div style={{ height: 3, background: B.light, borderRadius: 2 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Tabs ─── */
type TabId = "loca" | "tests" | "favorites" | "settings";
const TABS: { id: TabId; label: string; icon: (active: boolean) => React.ReactElement }[] = [
  { id: "loca",      label: "Loca",           icon: (a) => I.film(    a ? B.coral : B.warm, 16) },
  { id: "tests",     label: "Test Geçmişi",   icon: (a) => I.chart(   a ? B.coral : B.warm, 16) },
  { id: "favorites", label: "Favori Yazılar", icon: (a) => I.heart(   a ? B.coral : B.warm, 16) },
  { id: "settings",  label: "Hesap",          icon: (a) => I.settings(a ? B.coral : B.warm, 16) },
];

/* ═══════════════════════════════════
   Page
═══════════════════════════════════ */
export default function ProfilPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [user,             setUser]             = useState<User | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [signing,          setSigning]          = useState(false);
  const [activeTab,        setActiveTab]        = useState<TabId>("loca");
  const [expandedWorkshop, setExpandedWorkshop] = useState<string | null>(null);

  // Loca data
  const [workshops,   setWorkshops]   = useState<WorkshopItem[]>([]);
  const [videos,      setVideos]      = useState<VideoItem[]>([]);
  const [locaLoading, setLocaLoading] = useState(false);

  // Video player
  const [playingVideo, setPlayingVideo] = useState<{ bunnyId: string; title: string } | null>(null);

  /* ─── Auth ─── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      if (!u) {
        router.replace("/club/giris");
      } else {
        setUser(u);
        setLoading(false);
      }
    });
  }, []);

  /* ─── Fetch Loca ─── */
  const fetchLoca = useCallback(async (userId: string) => {
    setLocaLoading(true);
    const sb  = createClient();
    const now = new Date().toISOString();

    // 1. Workshop purchases
    const { data: wRaw } = await sb
      .from("purchases")
      .select(`
        workshop_id,
        expires_at,
        workshops (
          id, title, description, total_sessions,
          is_live, zoom_link, next_session_date
        )
      `)
      .eq("user_id", userId)
      .not("workshop_id", "is", null)
      .or(`expires_at.gt.${now},expires_at.is.null`);

    // 2. Single video purchases
    const { data: vRaw } = await sb
      .from("purchases")
      .select(`
        single_video_id,
        expires_at,
        single_videos (
          id, title, description, bunny_video_id, duration
        )
      `)
      .eq("user_id", userId)
      .not("single_video_id", "is", null)
      .or(`expires_at.gt.${now},expires_at.is.null`);

    // 3. Sessions for purchased workshops
    const wsIds = (wRaw ?? [])
      .map((p: Record<string, unknown>) => p.workshop_id as string)
      .filter(Boolean);

    let allSessions: DbSession[] = [];
    if (wsIds.length > 0) {
      const { data: sRaw } = await sb
        .from("workshop_sessions")
        .select("workshop_id, session_number, title, bunny_video_id, duration, is_published, pdf_url, session_date, zoom_url, status")
        .in("workshop_id", wsIds)
        .order("session_number", { ascending: true });
      allSessions = (sRaw ?? []) as DbSession[];
    }

    // Build final arrays
    const wsItems: WorkshopItem[] = (wRaw ?? [])
      .filter((p: Record<string, unknown>) => p.workshops)
      .map((p: Record<string, unknown>) => ({
        workshopId: p.workshop_id as string,
        expiresAt:  p.expires_at  as string | null,
        ws:         p.workshops   as DbWorkshop,
        sessions:   allSessions.filter(s => s.workshop_id === (p.workshop_id as string)),
      }));

    const vidItems: VideoItem[] = (vRaw ?? [])
      .filter((p: Record<string, unknown>) => p.single_videos)
      .map((p: Record<string, unknown>) => ({
        videoId:  p.single_video_id as string,
        expiresAt: p.expires_at     as string | null,
        vid:       p.single_videos  as DbSingleVideo,
      }));

    setWorkshops(wsItems);
    setVideos(vidItems);
    setLocaLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchLoca(user.id);
  }, [user, fetchLoca]);

  /* ─── Sign out ─── */
  const handleSignOut = async () => {
    setSigning(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  /* ─── Guards ─── */
  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: B.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="w-8 h-8 rounded-full border-2 border-coral border-t-transparent animate-spin" />
      </main>
    );
  }
  if (!user) return null;

  const initials  = getInitials(user.email ?? "KL");
  const joinedAt  = new Date(user.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });
  const isGoogle  = user.app_metadata?.provider === "google";
  const publishedCount = workshops.reduce((a, w) => a + w.sessions.filter(s => s.is_published).length, 0);
  const totalWatchable = publishedCount + videos.length;

  return (
    <div style={{ background: B.cream, minHeight: "100vh" }}>

      {/* Video player modal */}
      {playingVideo && (
        <VideoModal
          bunnyId={playingVideo.bunnyId}
          title={playingVideo.title}
          onClose={() => setPlayingVideo(null)}
        />
      )}

      {/* Profile header */}
      <div style={{ padding: "80px clamp(20px,5vw,60px) 0" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
            <div style={{
              width: 68, height: 68, borderRadius: "50%", flexShrink: 0,
              background: B.coral, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 600, letterSpacing: "0.02em",
            }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize: 14, color: B.warm, margin: "0 0 6px" }}>{user.email}</p>
              <Badge variant="club">KLEMENS CLUB</Badge>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${B.light}`, overflowX: "auto" }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setExpandedWorkshop(null); }}
                  style={{
                    padding: "14px 20px", border: "none",
                    borderBottom: active ? `2px solid ${B.coral}` : "2px solid transparent",
                    background: "transparent", fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? B.coral : B.warm,
                    cursor: "pointer", whiteSpace: "nowrap",
                    display: "flex", alignItems: "center", gap: 7,
                  }}
                >
                  {tab.icon(active)} {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: "32px clamp(20px,5vw,60px) 80px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>

          {/* ══ LOCA ══ */}
          {activeTab === "loca" && (
            <div>
              {locaLoading ? (
                <LocaSkeleton />
              ) : workshops.length === 0 && videos.length === 0 ? (
                /* Empty state */
                <div style={{ textAlign: "center", padding: "60px 0", color: B.warm }}>
                  {I.film(B.light, 48)}
                  <p style={{ fontSize: 15, margin: "16px 0 4px", color: B.dark }}>Henüz içeriğin bulunmuyor.</p>
                  <p style={{ fontSize: 13 }}>Atölyelere göz atmak ister misin?</p>
                  <Link
                    href="/atolyeler"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      marginTop: 20, padding: "11px 22px",
                      background: B.coral, color: "#fff",
                      borderRadius: 10, fontSize: 13, fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Atölyelere Bak {I.arrow("#fff", 13)}
                  </Link>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 36 }}>
                    {[
                      { label: "Atölye",            value: workshops.length, icon: I.book(B.coral, 20)  },
                      { label: "Tekil Video",        value: videos.length,   icon: I.video(B.coral, 20) },
                      { label: "Toplam İzlenebilir", value: totalWatchable,  icon: I.play(B.coral, 18)  },
                    ].map((s, idx) => (
                      <div key={idx} style={{
                        background: "#fff", borderRadius: 14, padding: "20px 16px",
                        textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                      }}>
                        <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}>{s.icon}</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: B.dark, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: B.warm, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Workshops */}
                  {workshops.length > 0 && (
                    <>
                      <h3 style={{ fontSize: 11, fontWeight: 600, color: B.warm, letterSpacing: "0.1em", margin: "0 0 12px" }}>
                        ATÖLYELERİM
                      </h3>
                      {workshops.map(({ workshopId, expiresAt, ws, sessions }) => {
                        const published = sessions.filter(s => s.is_published).length;
                        const expanded  = expandedWorkshop === workshopId;
                        return (
                          <div key={workshopId} style={{
                            background: "#fff", borderRadius: 14, marginBottom: 10,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                            border: expanded ? `1.5px solid ${B.coral}22` : "1.5px solid transparent",
                            transition: "all 0.25s ease",
                          }}>
                            <div
                              onClick={() => setExpandedWorkshop(expanded ? null : workshopId)}
                              style={{ padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
                            >
                              <div style={{
                                width: 44, height: 44, minWidth: 44, borderRadius: 12,
                                background: B.light, display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                {I.film(B.coral, 20)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
                                  {ws.is_live && (
                                    <Badge variant="live">
                                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4CAF50", display: "inline-block" }} />
                                      Canlı
                                    </Badge>
                                  )}
                                  {expiresAt && (
                                    <Badge variant="expires">{formatExpiry(expiresAt)}</Badge>
                                  )}
                                </div>
                                <h4 style={{ fontSize: 15, fontWeight: 600, color: B.dark, margin: "0 0 2px", fontFamily: "Georgia, serif" }}>
                                  {ws.title}
                                </h4>
                                <ProgressBar completed={published} total={ws.total_sessions} />
                              </div>
                              <div style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease", flexShrink: 0 }}>
                                {I.chevron(B.warm, 18)}
                              </div>
                            </div>

                            {expanded && (
                              <div style={{ padding: "0 20px 18px" }}>
                                <div style={{ height: 1, background: B.light, marginBottom: 12 }} />
                                <SessionList
                                  sessions={sessions}
                                  isLive={ws.is_live}
                                  nextSession={ws.next_session_date}
                                  zoomLink={ws.zoom_link}
                                  onPlay={(bunnyId, title) => setPlayingVideo({ bunnyId, title })}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Single videos */}
                  {videos.length > 0 && (
                    <>
                      <h3 style={{ fontSize: 11, fontWeight: 600, color: B.warm, letterSpacing: "0.1em", margin: "28px 0 12px" }}>
                        TEKİL VİDEOLARIM
                      </h3>
                      {videos.map(({ videoId, expiresAt, vid }) => (
                        <div
                          key={videoId}
                          onClick={() => setPlayingVideo({ bunnyId: vid.bunny_video_id, title: vid.title })}
                          style={{
                            background: "#fff", borderRadius: 12, padding: "14px 18px", marginBottom: 8,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                            display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                          }}
                        >
                          <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: 10, background: B.light, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {I.video(B.coral, 18)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: B.dark, margin: 0, fontFamily: "Georgia, serif" }}>{vid.title}</h4>
                            <div style={{ display: "flex", gap: 14, fontSize: 12, color: B.warm, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                              {vid.duration && <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{I.clock(B.warm, 11)} {vid.duration}</span>}
                              {expiresAt    && <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{I.calendar(B.warm, 11)} {formatExpiry(expiresAt)}</span>}
                            </div>
                          </div>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: B.coral, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {I.play("#fff", 12)}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══ TEST GEÇMİŞİ ══ */}
          {activeTab === "tests" && (
            <div style={{ textAlign: "center", padding: "60px 0", color: B.warm }}>
              {I.chart(B.light, 48)}
              <p style={{ fontSize: 15, fontWeight: 600, color: B.dark, marginTop: 16 }}>Test Geçmişi</p>
              <p style={{ fontSize: 13 }}>Çözdüğün testler ve karakter analizlerin burada görünecek.</p>
              <p style={{ fontSize: 12, fontStyle: "italic", marginTop: 8 }}>Yakında</p>
            </div>
          )}

          {/* ══ FAVORİ YAZILAR ══ */}
          {activeTab === "favorites" && (
            <div style={{ textAlign: "center", padding: "60px 0", color: B.warm }}>
              {I.heart(B.light, 48)}
              <p style={{ fontSize: 15, fontWeight: 600, color: B.dark, marginTop: 16 }}>Favori Yazılar</p>
              <p style={{ fontSize: 13 }}>Beğendiğin ve kaydettiğin içerikler burada listelenecek.</p>
              <p style={{ fontSize: 12, fontStyle: "italic", marginTop: 8 }}>Yakında</p>
            </div>
          )}

          {/* ══ HESAP ══ */}
          {activeTab === "settings" && (
            <div>
              <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", marginBottom: 16 }}>
                <h3 style={{ fontSize: 11, fontWeight: 600, color: B.warm, letterSpacing: "0.1em", margin: "0 0 16px" }}>HESAP BİLGİLERİ</h3>
                {[
                  {
                    label: "E-posta",
                    value: user.email ?? "—",
                    extra: <Badge variant={user.email_confirmed_at ? "live" : "default"}>{user.email_confirmed_at ? "Doğrulandı" : "Doğrulanmadı"}</Badge>,
                  },
                  { label: "Giriş Yöntemi", value: isGoogle ? "Google" : "E-posta & Şifre", extra: undefined },
                  { label: "Üyelik Tarihi", value: joinedAt, extra: undefined },
                ].map((row, i, arr) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "13px 0",
                    borderBottom: i < arr.length - 1 ? `1px solid ${B.light}` : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: B.warm }}>{row.label}</div>
                      <div style={{ fontSize: 14, color: B.dark, fontWeight: 500, marginTop: 2 }}>{row.value}</div>
                    </div>
                    {row.extra}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Link
                  href="/icerikler"
                  style={{
                    flex: 1, padding: "13px 0", background: B.dark, color: "#fff",
                    borderRadius: 12, fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    textDecoration: "none",
                  }}
                >
                  Yazıları Keşfet {I.arrow("#fff", 13)}
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signing}
                  style={{
                    flex: 1, padding: "13px 0", background: "#fff", color: B.warm,
                    border: `1px solid ${B.light}`, borderRadius: 12, fontSize: 13, fontWeight: 500,
                    cursor: signing ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    opacity: signing ? 0.6 : 1,
                  }}
                >
                  {I.logout(B.warm, 14)} {signing ? "Çıkış yapılıyor..." : "Çıkış Yap"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
