"use client";

import { useEffect, useState } from "react";

type Stats = {
  users: number;
  workshops: number;
  pendingEvents: number;
  purchases: number;
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
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
        <h1 className="text-2xl font-bold text-warm-900">Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
    </div>
  );
}
