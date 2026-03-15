"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminRole } from "@/components/admin/AdminRoleContext";
import Link from "next/link";

type Stats = {
  users: number;
  workshops: number;
  pendingEvents: number;
  purchases: number;
  pendingNews: number;
};

const CARDS = [
  {
    key: "users" as const,
    label: "Toplam Kullanıcı",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "workshops" as const,
    label: "Aktif Atölye",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    key: "pendingEvents" as const,
    label: "Bekleyen Etkinlik",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: "purchases" as const,
    label: "Toplam Satın Alma",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    key: "pendingNews" as const,
    label: "Bekleyen Haber",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
      </svg>
    ),
  },
];

type ActionState = "idle" | "loading" | "success" | "error";
type ActionResult = { state: ActionState; message: string };

const EDITOR_SHORTCUTS = [
  {
    href: "/admin/icerikler",
    label: "İçerikler",
    description: "Yazıları düzenle ve yayınla",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    href: "/admin/haberler",
    label: "Haberler",
    description: "Haberleri yönet ve düzenle",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
      </svg>
    ),
  },
  {
    href: "/admin/arsiv",
    label: "Eser Arşivi",
    description: "Eserleri görüntüle ve düzenle",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
];

export default function AdminDashboardPage() {
  const role = useAdminRole();
  const isEditor = role === "editor";

  const [stats, setStats] = useState<Stats | null>(null);
  const [scraper, setScraper] = useState<ActionResult>({ state: "idle", message: "" });
  const [curate, setCurate] = useState<ActionResult>({ state: "idle", message: "" });
  const [rssFetch, setRssFetch] = useState<ActionResult>({ state: "idle", message: "" });

  useEffect(() => {
    if (!isEditor) {
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});
    }
  }, [isEditor]);

  const runAction = useCallback(async (
    endpoint: string,
    setter: (v: ActionResult) => void,
  ) => {
    setter({ state: "loading", message: "" });
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setter({ state: "error", message: data.error ?? "Hata oluştu" });
      } else {
        setter({ state: "success", message: data.message ?? JSON.stringify(data) });
      }
    } catch (e) {
      setter({ state: "error", message: (e as Error).message });
    }
  }, []);

  if (isEditor) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <p className="text-xs text-warm-900/40 mb-1">Editör Paneli</p>
          <h1 className="text-2xl font-bold text-warm-900">Hoş geldiniz</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl">
          {EDITOR_SHORTCUTS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-2xl border border-warm-100 p-6 flex flex-col gap-4 hover:border-coral/30 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-coral/10 text-coral flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-warm-900">{item.label}</p>
                <p className="text-xs text-warm-900/45 mt-1">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
        <h1 className="text-2xl font-bold text-warm-900">Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
        {CARDS.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-2xl border border-warm-100 p-6 flex flex-col gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-coral/10 text-coral flex items-center justify-center">
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-warm-900/50 mb-1">{card.label}</p>
              {stats ? (
                <p className="text-3xl font-bold text-warm-900">
                  {stats[card.key]}
                </p>
              ) : (
                <div className="h-9 w-16 bg-warm-100 rounded-lg animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-warm-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
          {/* Scraper */}
          <div className="bg-white rounded-2xl border border-warm-100 p-5">
            <p className="text-sm font-semibold text-warm-900 mb-1">Etkinlik Scraper</p>
            <p className="text-xs text-warm-900/45 mb-4">Ankara etkinliklerini tara ve güncelle</p>
            <button
              onClick={() => runAction("/api/admin/scraper", setScraper)}
              disabled={scraper.state === "loading"}
              className="px-4 py-2 bg-warm-900 text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {scraper.state === "loading" ? "Çalışıyor..." : "Başlat"}
            </button>
            {scraper.state === "success" && (
              <p className="text-xs text-emerald-600 mt-3">{scraper.message}</p>
            )}
            {scraper.state === "error" && (
              <p className="text-xs text-red-500 mt-3">{scraper.message}</p>
            )}
          </div>

          {/* Curate */}
          <div className="bg-white rounded-2xl border border-warm-100 p-5">
            <p className="text-sm font-semibold text-warm-900 mb-1">Haber Kürasyon</p>
            <p className="text-xs text-warm-900/45 mb-4">RSS kaynaklarından AI ile içerik üret</p>
            <button
              onClick={() => runAction("/api/admin/curate", setCurate)}
              disabled={curate.state === "loading"}
              className="px-4 py-2 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {curate.state === "loading" ? "Çalışıyor..." : "Kürasyon Başlat"}
            </button>
            {curate.state === "success" && (
              <p className="text-xs text-emerald-600 mt-3">{curate.message}</p>
            )}
            {curate.state === "error" && (
              <p className="text-xs text-red-500 mt-3">{curate.message}</p>
            )}
          </div>

          {/* RSS Fetch */}
          <div className="bg-white rounded-2xl border border-warm-100 p-5">
            <p className="text-sm font-semibold text-warm-900 mb-1">RSS Çekici</p>
            <p className="text-xs text-warm-900/45 mb-4">Haber kaynaklarından RSS çek</p>
            <button
              onClick={() => runAction("/api/admin/news/fetch", setRssFetch)}
              disabled={rssFetch.state === "loading"}
              className="px-4 py-2 bg-warm-900 text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {rssFetch.state === "loading" ? "Çalışıyor..." : "RSS Çek"}
            </button>
            {rssFetch.state === "success" && (
              <p className="text-xs text-emerald-600 mt-3">{rssFetch.message}</p>
            )}
            {rssFetch.state === "error" && (
              <p className="text-xs text-red-500 mt-3">{rssFetch.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
