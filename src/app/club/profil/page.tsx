"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  PlayIcon, LockIcon, ClockIcon, CalendarIcon, ChevronDownIcon,
  FilmIcon, BookIcon, ChartIcon, HeartIcon, SettingsIcon,
  VideoIcon, ArrowRightIcon, LogoutIcon, CloseIcon, DownloadIcon,
  MapPinIcon,
} from "@/lib/icons";
import { getRank, getNextRank, RANKS } from "@/lib/harita-gamification";

const BUNNY_LIB = "596471";

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
  pdf_url: string | null;
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
      className="fixed inset-0 z-[1000] bg-black/[0.88] flex items-center justify-center p-[clamp(16px,4vw,40px)]"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[900px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-white font-semibold text-[15px] leading-snug flex-1 pr-3">
            {title}
          </span>
          <button
            onClick={onClose}
            className="bg-white/12 rounded-lg p-1.5 cursor-pointer flex items-center justify-center shrink-0"
          >
            <CloseIcon size={18} className="text-white" />
          </button>
        </div>
        {/* 16:9 iframe */}
        <div className="relative pt-[56.25%] rounded-xl overflow-hidden bg-black">
          <iframe
            src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIB}/${bunnyId}?autoplay=true&preload=true`}
            className="absolute inset-0 w-full h-full border-none"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Badge ─── */
const badgeVariants = {
  default: "bg-brand-light text-brand-dark",
  live:    "bg-[#E8F5E9] text-[#2E7D32]",
  expires: "bg-[#FFF8E1] text-[#F57F17]",
  club:    "bg-brand-dark text-white",
} as const;

function Badge({ children, variant = "default" }: {
  children: React.ReactNode;
  variant?: "default" | "live" | "expires" | "club";
}) {
  return (
    <span className={`${badgeVariants[variant]} px-3 py-1 rounded-[20px] text-[11px] font-semibold tracking-[0.06em] inline-flex items-center gap-[5px]`}>
      {children}
    </span>
  );
}

/* ─── ProgressBar ─── */
function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-[3px] bg-brand-light rounded-sm overflow-hidden">
        <div
          className={`h-full rounded-sm transition-[width] duration-[600ms] ease-out ${pct === 100 ? "bg-[#4CAF50]" : "bg-coral"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-brand-warm whitespace-nowrap tabular-nums">
        {completed}/{total}
      </span>
    </div>
  );
}

/* ─── PDF Button ─── */
function PdfButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 px-[9px] py-1 rounded-[7px] bg-brand-light text-brand-warm text-[11px] font-semibold tracking-[0.04em] no-underline shrink-0 transition-[background,color] duration-150 hover:bg-coral/[0.09] hover:text-coral"
    >
      <DownloadIcon size={12} /> PDF
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
  const bannerSession = sessions.find(s => s.status === "live") ??
    sessions.find(s => s.status === "upcoming" && s.session_date);

  const bannerDate = bannerSession?.session_date ?? nextSession;
  const bannerZoom = bannerSession?.zoom_url ?? zoomLink;
  const showBanner = isLive && bannerDate;

  return (
    <div className="mt-3">
      {/* Next live session banner */}
      {showBanner && (
        <div className="p-3.5 bg-[#F1F8E9] rounded-xl mb-3.5 flex justify-between items-center border border-[#C5E1A5] flex-wrap gap-2.5">
          <div className="flex items-center gap-2.5">
            <CalendarIcon size={16} className="text-[#2E7D32]" />
            <div>
              <div className="text-[11px] font-semibold text-[#2E7D32] tracking-[0.04em]">
                {bannerSession?.status === "live" ? "CANLI OTURUM" : "SONRAKİ CANLI OTURUM"}
              </div>
              <div className="text-sm text-brand-dark mt-0.5">
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
              className="bg-[#2E7D32] text-white rounded-[10px] px-[18px] py-[9px] text-[13px] font-semibold flex items-center gap-1.5 no-underline"
            >
              Katıl <ArrowRightIcon size={13} className="text-white" />
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

        const canPlayVideo = hasStatus
          ? isCompleted && s.is_published && !!s.bunny_video_id
          : s.is_published && !!s.bunny_video_id;

        const rowOpacity = isUpcoming ? 0.7 : (hasStatus ? 1 : (s.is_published ? 1 : 0.45));
        const rowBg = isLiveSession ? "bg-[#F1F8E9]" : (canPlayVideo || isUpcoming ? "bg-cream" : "bg-transparent");

        return (
          <div
            key={s.session_number}
            onClick={() => canPlayVideo && onPlay(s.bunny_video_id!, s.title)}
            className={`flex items-center gap-3 px-3.5 py-[11px] rounded-[10px] mb-1 ${rowBg} ${canPlayVideo ? "cursor-pointer" : "cursor-default"}`}
            style={{ opacity: rowOpacity }}
          >
            {/* Icon box */}
            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
              isLiveSession ? "bg-[#2E7D32]"
                : isUpcoming ? "bg-brand-light"
                : s.is_published ? "bg-coral" : "bg-brand-light"
            }`}>
              {isUpcoming
                ? <CalendarIcon size={12} className="text-brand-warm" />
                : isLiveSession
                  ? <PlayIcon size={12} className="text-white" />
                  : s.is_published ? <PlayIcon size={12} className="text-white" /> : <LockIcon size={12} className="text-brand-warm" />
              }
            </div>

            {/* Title + subtitle */}
            <div className="flex-1">
              <div className="text-sm font-medium text-brand-dark flex items-center gap-1.5">
                {s.title}
                {isLiveSession && (
                  <span className="w-2 h-2 rounded-full bg-[#4CAF50] inline-block shrink-0 live-pulse" />
                )}
              </div>
              <div className="text-xs text-brand-warm flex items-center gap-1 mt-0.5">
                {(isUpcoming || isLiveSession) && s.session_date ? (
                  <>
                    <CalendarIcon size={11} className="text-brand-warm" />{" "}
                    {new Date(s.session_date).toLocaleString("tr-TR", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </>
                ) : (
                  <><ClockIcon size={11} className="text-brand-warm" /> {s.duration ?? "—"}</>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1.5 shrink-0">
              {s.pdf_url && (isCompleted || (!hasStatus && s.is_published)) && <PdfButton url={s.pdf_url} />}

              {isLiveSession && sessionZoom ? (
                <a
                  href={sessionZoom}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#2E7D32] text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1 no-underline"
                >
                  Katıl <ArrowRightIcon size={11} className="text-white" />
                </a>
              ) : isUpcoming ? (
                isWithinOneHour(s.session_date) && sessionZoom ? (
                  <a
                    href={sessionZoom}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#2E7D32] text-white rounded-lg px-3 py-[5px] text-[11px] font-semibold flex items-center gap-1 no-underline"
                  >
                    Katıl <ArrowRightIcon size={10} className="text-white" />
                  </a>
                ) : (
                  <span className="text-[11px] text-brand-warm italic">Yakında</span>
                )
              ) : (isCompleted && s.is_published && s.bunny_video_id) || (!hasStatus && s.is_published && s.bunny_video_id) ? (
                <span className="text-xs text-coral font-semibold flex items-center gap-1">İzle <ArrowRightIcon size={12} className="text-coral" /></span>
              ) : !hasStatus ? (
                <span className="text-[11px] text-brand-warm italic">Yakında</span>
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
    <div className="flex flex-col gap-3">
      {[1, 2].map((k) => (
        <div key={k} className="bg-white rounded-[14px] px-5 py-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <div className="flex gap-3.5 items-center">
            <div className="w-11 h-11 rounded-xl bg-brand-light" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3.5 bg-brand-light rounded-md w-[65%]" />
              <div className="h-[3px] bg-brand-light rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Tabs ─── */
type TabId = "loca" | "tests" | "favorites" | "discoveries" | "settings";
const TABS: { id: TabId; label: string; icon: (active: boolean) => React.ReactElement }[] = [
  { id: "loca",        label: "Loca",           icon: (a) => <FilmIcon     size={16} className={a ? "text-coral" : "text-brand-warm"} /> },
  { id: "tests",       label: "Test Geçmişi",   icon: (a) => <ChartIcon    size={16} className={a ? "text-coral" : "text-brand-warm"} /> },
  { id: "favorites",   label: "Favori Yazılar", icon: (a) => <HeartIcon    size={16} className={a ? "text-coral" : "text-brand-warm"} /> },
  { id: "discoveries", label: "Keşiflerim",     icon: (a) => <MapPinIcon   size={16} className={a ? "text-coral" : "text-brand-warm"} /> },
  { id: "settings",    label: "Hesap",          icon: (a) => <SettingsIcon size={16} className={a ? "text-coral" : "text-brand-warm"} /> },
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

  // Keşiflerim data
  type GamStats = { total_visits: number; total_stars: number; total_badges: number; total_routes_completed: number; rank_name: string };
  type GamBadge = { badge_type: string; badge_key: string; badge_name: string; stars_earned: number; earned_at: string };
  type GamVisit = { place_slug: string; place_name: string; place_type: string; visited_at: string };
  type GamReview = { place_slug: string; place_name: string; rating: number; review_text: string | null; created_at: string };
  const [gamStats, setGamStats] = useState<GamStats | null>(null);
  const [gamBadges, setGamBadges] = useState<GamBadge[]>([]);
  const [gamVisits, setGamVisits] = useState<GamVisit[]>([]);
  const [gamReviews, setGamReviews] = useState<GamReview[]>([]);
  const [gamLoading, setGamLoading] = useState(false);

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
          id, title, description, bunny_video_id, duration, pdf_url
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

  const fetchGam = useCallback(async () => {
    setGamLoading(true);
    try {
      const res = await fetch("/api/harita/stats");
      if (res.ok) {
        const data = await res.json();
        setGamStats(data.stats);
        setGamBadges(data.badges || []);
        setGamVisits(data.visits || []);
        setGamReviews(data.reviews || []);
      }
    } catch { /* ignore */ }
    setGamLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchLoca(user.id);
  }, [user, fetchLoca]);

  useEffect(() => {
    if (user && activeTab === "discoveries") fetchGam();
  }, [user, activeTab, fetchGam]);

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
      <main className="min-h-screen bg-cream flex items-center justify-center">
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
    <div className="bg-cream min-h-screen">

      {/* Video player modal */}
      {playingVideo && (
        <VideoModal
          bunnyId={playingVideo.bunnyId}
          title={playingVideo.title}
          onClose={() => setPlayingVideo(null)}
        />
      )}

      {/* Profile header */}
      <div className="pt-20 px-[clamp(20px,5vw,60px)]">
        <div className="max-w-[780px] mx-auto">

          <div className="flex items-center gap-5 mb-9">
            <div className="w-[68px] h-[68px] rounded-full shrink-0 bg-coral text-white flex items-center justify-center text-2xl font-semibold tracking-[0.02em]">
              {initials}
            </div>
            <div>
              <p className="text-sm text-brand-warm mb-1.5">{user.email}</p>
              <Badge variant="club">KLEMENS CLUB</Badge>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-brand-light overflow-x-auto">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setExpandedWorkshop(null); }}
                  className={`px-5 py-3.5 border-b-2 bg-transparent text-[13px] cursor-pointer whitespace-nowrap flex items-center gap-[7px] ${
                    active
                      ? "border-coral font-semibold text-coral"
                      : "border-transparent font-normal text-brand-warm"
                  }`}
                >
                  {tab.icon(active)} {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="pt-8 px-[clamp(20px,5vw,60px)] pb-20">
        <div className="max-w-[780px] mx-auto">

          {/* ══ LOCA ══ */}
          {activeTab === "loca" && (
            <div>
              {locaLoading ? (
                <LocaSkeleton />
              ) : workshops.length === 0 && videos.length === 0 ? (
                /* Empty state */
                <div className="text-center py-[60px] text-brand-warm">
                  <FilmIcon size={48} className="text-brand-light mx-auto" />
                  <p className="text-[15px] mt-4 mb-1 text-brand-dark">Henüz içeriğin bulunmuyor.</p>
                  <p className="text-[13px]">Atölyelere göz atmak ister misin?</p>
                  <Link
                    href="/atolyeler"
                    className="inline-flex items-center gap-1.5 mt-5 px-[22px] py-[11px] bg-coral text-white rounded-[10px] text-[13px] font-semibold no-underline"
                  >
                    Atölyelere Bak <ArrowRightIcon size={13} className="text-white" />
                  </Link>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-9">
                    {[
                      { label: "Atölye",            value: workshops.length, icon: <BookIcon  size={20} className="text-coral" /> },
                      { label: "Tekil Video",        value: videos.length,   icon: <VideoIcon size={20} className="text-coral" /> },
                      { label: "Toplam İzlenebilir", value: totalWatchable,  icon: <PlayIcon  size={18} className="text-coral" /> },
                    ].map((s, idx) => (
                      <div key={idx} className="bg-white rounded-[14px] px-4 py-5 text-center shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                        <div className="mb-1.5 flex justify-center">{s.icon}</div>
                        <div className="text-[28px] font-bold text-brand-dark tabular-nums">{s.value}</div>
                        <div className="text-xs text-brand-warm mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Workshops */}
                  {workshops.length > 0 && (
                    <>
                      <h3 className="text-[11px] font-semibold text-brand-warm tracking-widest mb-3">
                        ATÖLYELERİM
                      </h3>
                      {workshops.map(({ workshopId, expiresAt, ws, sessions }) => {
                        const published = sessions.filter(s => s.is_published).length;
                        const expanded  = expandedWorkshop === workshopId;
                        return (
                          <div key={workshopId} className={`bg-white rounded-[14px] mb-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-[250ms] ${
                            expanded ? "border-[1.5px] border-coral/[0.13]" : "border-[1.5px] border-transparent"
                          }`}>
                            <div
                              onClick={() => setExpandedWorkshop(expanded ? null : workshopId)}
                              className="px-5 py-[18px] cursor-pointer flex items-center gap-3.5"
                            >
                              <div className="w-11 h-11 min-w-[44px] rounded-xl bg-brand-light flex items-center justify-center">
                                <FilmIcon size={20} className="text-coral" />
                              </div>
                              <div className="flex-1">
                                <div className="flex gap-1.5 mb-[5px] flex-wrap">
                                  {ws.is_live && (
                                    <Badge variant="live">
                                      <span className="w-[5px] h-[5px] rounded-full bg-[#4CAF50] inline-block" />
                                      Canlı
                                    </Badge>
                                  )}
                                  {expiresAt && (
                                    <Badge variant="expires">{formatExpiry(expiresAt)}</Badge>
                                  )}
                                </div>
                                <h4 className="text-[15px] font-semibold text-brand-dark mb-0.5 font-serif">
                                  {ws.title}
                                </h4>
                                <ProgressBar completed={published} total={ws.total_sessions} />
                              </div>
                              <div className={`shrink-0 transition-transform duration-[250ms] ${expanded ? "rotate-180" : "rotate-0"}`}>
                                <ChevronDownIcon size={18} className="text-brand-warm" />
                              </div>
                            </div>

                            {expanded && (
                              <div className="px-5 pb-[18px]">
                                <div className="h-px bg-brand-light mb-3" />
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
                      <h3 className="text-[11px] font-semibold text-brand-warm tracking-widest mt-7 mb-3">
                        TEKİL VİDEOLARIM
                      </h3>
                      {videos.map(({ videoId, expiresAt, vid }) => (
                        <div
                          key={videoId}
                          onClick={() => setPlayingVideo({ bunnyId: vid.bunny_video_id, title: vid.title })}
                          className="bg-white rounded-xl px-[18px] py-3.5 mb-2 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex items-center gap-3.5 cursor-pointer"
                        >
                          <div className="w-10 h-10 min-w-[40px] rounded-[10px] bg-brand-light flex items-center justify-center">
                            <VideoIcon size={18} className="text-coral" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-brand-dark font-serif">{vid.title}</h4>
                            <div className="flex gap-3.5 text-xs text-brand-warm mt-1 items-center flex-wrap">
                              {vid.duration && <span className="flex items-center gap-1"><ClockIcon size={11} className="text-brand-warm" /> {vid.duration}</span>}
                              {expiresAt    && <span className="flex items-center gap-1"><CalendarIcon size={11} className="text-brand-warm" /> {formatExpiry(expiresAt)}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {vid.pdf_url && <PdfButton url={vid.pdf_url} />}
                            <div className="w-9 h-9 rounded-[10px] bg-coral flex items-center justify-center">
                              <PlayIcon size={12} className="text-white" />
                            </div>
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
            <div className="text-center py-[60px] text-brand-warm">
              <ChartIcon size={48} className="text-brand-light mx-auto" />
              <p className="text-[15px] font-semibold text-brand-dark mt-4">Test Geçmişi</p>
              <p className="text-[13px]">Çözdüğün testler ve karakter analizlerin burada görünecek.</p>
              <p className="text-xs italic mt-2">Yakında</p>
            </div>
          )}

          {/* ══ FAVORİ YAZILAR ══ */}
          {activeTab === "favorites" && (
            <div className="text-center py-[60px] text-brand-warm">
              <HeartIcon size={48} className="text-brand-light mx-auto" />
              <p className="text-[15px] font-semibold text-brand-dark mt-4">Favori Yazılar</p>
              <p className="text-[13px]">Beğendiğin ve kaydettiğin içerikler burada listelenecek.</p>
              <p className="text-xs italic mt-2">Yakında</p>
            </div>
          )}

          {/* ══ KEŞİFLERİM ══ */}
          {activeTab === "discoveries" && (
            <div>
              {gamLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-coral border-t-transparent animate-spin mx-auto" />
                </div>
              ) : !gamStats || gamStats.total_visits === 0 ? (
                <div className="text-center py-[60px] text-brand-warm">
                  <MapPinIcon size={48} className="text-brand-light mx-auto" />
                  <p className="text-[15px] font-semibold text-brand-dark mt-4">Henüz keşif yok</p>
                  <p className="text-[13px]">Haritadaki mekanlara check-in yaparak rozet kazanabilirsin!</p>
                  <Link
                    href="/harita"
                    className="inline-flex items-center gap-1.5 mt-5 px-[22px] py-[11px] bg-coral text-white rounded-[10px] text-[13px] font-semibold no-underline"
                  >
                    Haritaya Git <ArrowRightIcon size={13} className="text-white" />
                  </Link>
                </div>
              ) : (() => {
                const rank = getRank(gamStats.total_stars);
                const nextRank = getNextRank(gamStats.total_stars);
                const progressPct = nextRank
                  ? ((gamStats.total_stars - rank.minStars) / (nextRank.minStars - rank.minStars)) * 100
                  : 100;
                return (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {[
                        { label: "Ziyaret", value: gamStats.total_visits, icon: "📍" },
                        { label: "Yıldız", value: gamStats.total_stars, icon: "⭐" },
                        { label: "Rozet", value: gamStats.total_badges, icon: "🏅" },
                        { label: "Rota", value: gamStats.total_routes_completed, icon: "🗺️" },
                      ].map((s, i) => (
                        <div key={i} className="bg-white rounded-[14px] px-4 py-5 text-center shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                          <div className="text-2xl mb-1">{s.icon}</div>
                          <div className="text-[28px] font-bold text-brand-dark tabular-nums">{s.value}</div>
                          <div className="text-xs text-brand-warm mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Rank */}
                    <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{rank.icon}</span>
                        <div>
                          <div className="text-[17px] font-bold text-brand-dark">{rank.name}</div>
                          <div className="text-xs text-brand-warm">
                            {nextRank
                              ? `Sonraki: ${nextRank.icon} ${nextRank.name} (${nextRank.minStars - gamStats.total_stars} ⭐ kaldı)`
                              : "En yüksek ünvan!"}
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-brand-light rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-coral transition-[width] duration-500"
                          style={{ width: `${Math.min(progressPct, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5 text-[10px] text-brand-warm">
                        <span>{rank.icon} {rank.minStars}</span>
                        {nextRank && <span>{nextRank.icon} {nextRank.minStars}</span>}
                      </div>
                    </div>

                    {/* Badges */}
                    {gamBadges.length > 0 && (
                      <>
                        <h3 className="text-[11px] font-semibold text-brand-warm tracking-widest mb-3">
                          ROZETLERİM
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                          {gamBadges.map((b) => {
                            const typeIcons: Record<string, string> = {
                              visit: "📍", route_complete: "🗺️", category: "🎯", milestone: "🏆",
                            };
                            return (
                              <div key={b.badge_key} className="bg-white rounded-xl px-3.5 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{typeIcons[b.badge_type] || "🏅"}</span>
                                  <span className="text-xs font-semibold text-brand-dark truncate">{b.badge_name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-brand-warm">
                                    +{b.stars_earned} ⭐
                                  </span>
                                  <span className="text-[10px] text-brand-warm">
                                    {new Date(b.earned_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* Recent visits */}
                    {gamVisits.length > 0 && (
                      <>
                        <h3 className="text-[11px] font-semibold text-brand-warm tracking-widest mb-3">
                          SON ZİYARETLER
                        </h3>
                        <div className="bg-white rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] mb-6 overflow-hidden">
                          {gamVisits.slice(0, 10).map((v, i) => (
                            <div key={`${v.place_slug}-${i}`} className={`flex items-center gap-3 px-4 py-3 ${i < gamVisits.length - 1 && i < 9 ? "border-b border-brand-light" : ""}`}>
                              <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                                <MapPinIcon size={14} className="text-coral" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-brand-dark truncate">{v.place_name}</div>
                                <div className="text-[11px] text-brand-warm">{v.place_type}</div>
                              </div>
                              <span className="text-[11px] text-brand-warm shrink-0">
                                {new Date(v.visited_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Reviews */}
                    {gamReviews.length > 0 && (
                      <>
                        <h3 className="text-[11px] font-semibold text-brand-warm tracking-widest mb-3">
                          YORUMLARIM
                        </h3>
                        <div className="flex flex-col gap-2.5 mb-6">
                          {gamReviews.map((r) => (
                            <div key={r.place_slug} className="bg-white rounded-xl px-4 py-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-brand-dark">{r.place_name}</span>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} style={{ color: s <= r.rating ? "#FFB300" : "#ddd", fontSize: 12 }}>★</span>
                                  ))}
                                </div>
                              </div>
                              {r.review_text && (
                                <p className="text-xs text-brand-warm leading-relaxed m-0">{r.review_text}</p>
                              )}
                              <div className="text-[10px] text-brand-warm mt-1">
                                {new Date(r.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* ══ HESAP ══ */}
          {activeTab === "settings" && (
            <div>
              <div className="bg-white rounded-[14px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] mb-4">
                <h3 className="text-[11px] font-semibold text-brand-warm tracking-widest mb-4">HESAP BİLGİLERİ</h3>
                {[
                  {
                    label: "E-posta",
                    value: user.email ?? "—",
                    extra: <Badge variant={user.email_confirmed_at ? "live" : "default"}>{user.email_confirmed_at ? "Doğrulandı" : "Doğrulanmadı"}</Badge>,
                  },
                  { label: "Giriş Yöntemi", value: isGoogle ? "Google" : "E-posta & Şifre", extra: undefined },
                  { label: "Üyelik Tarihi", value: joinedAt, extra: undefined },
                ].map((row, i, arr) => (
                  <div key={i} className={`flex justify-between items-center py-[13px] ${
                    i < arr.length - 1 ? "border-b border-brand-light" : ""
                  }`}>
                    <div>
                      <div className="text-xs text-brand-warm">{row.label}</div>
                      <div className="text-sm text-brand-dark font-medium mt-0.5">{row.value}</div>
                    </div>
                    {row.extra}
                  </div>
                ))}
              </div>

              <div className="flex gap-2.5">
                <Link
                  href="/icerikler"
                  className="flex-1 py-[13px] bg-brand-dark text-white rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 no-underline"
                >
                  Yazıları Keşfet <ArrowRightIcon size={13} className="text-white" />
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signing}
                  className={`flex-1 py-[13px] bg-white text-brand-warm border border-brand-light rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 ${
                    signing ? "cursor-not-allowed opacity-60" : "cursor-pointer opacity-100"
                  }`}
                >
                  <LogoutIcon size={14} className="text-brand-warm" /> {signing ? "Çıkış yapılıyor..." : "Çıkış Yap"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
