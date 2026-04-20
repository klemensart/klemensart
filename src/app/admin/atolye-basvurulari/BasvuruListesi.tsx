"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Application = {
  id: string;
  created_at: string;
  status: string;
  applicant_name: string;
  applicant_email: string;
  workshop_topic: string;
  contact_channel: string;
};

type StatusFilter = "all" | "pending" | "reviewing" | "approved" | "rejected";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Beklemede", bg: "bg-amber-100", text: "text-amber-800" },
  reviewing: { label: "İnceleniyor", bg: "bg-blue-100", text: "text-blue-800" },
  approved: { label: "Onaylı", bg: "bg-emerald-100", text: "text-emerald-800" },
  rejected: { label: "Reddedildi", bg: "bg-red-100", text: "text-red-700" },
};

export default function BasvuruListesi({ applications }: { applications: Application[] }) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c = { pending: 0, reviewing: 0, approved: 0, rejected: 0 };
    for (const app of applications) {
      if (app.status in c) c[app.status as keyof typeof c]++;
    }
    return c;
  }, [applications]);

  const filtered = useMemo(() => {
    let list = applications;
    if (filter !== "all") {
      list = list.filter((a) => a.status === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.applicant_name.toLowerCase().includes(q) ||
          a.applicant_email.toLowerCase().includes(q) ||
          a.workshop_topic.toLowerCase().includes(q),
      );
    }
    return list;
  }, [applications, filter, search]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Atölye Başvuruları</h1>
        <p className="text-sm text-warm-900/50 mt-1">
          Toplam {applications.length} başvuru · {counts.pending} beklemede
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-5 border-b border-warm-200 pb-px">
        <TabButton active={filter === "all"} onClick={() => setFilter("all")}>
          Tümü
        </TabButton>
        <TabButton active={filter === "pending"} onClick={() => setFilter("pending")} count={counts.pending}>
          Beklemede
        </TabButton>
        <TabButton active={filter === "reviewing"} onClick={() => setFilter("reviewing")} count={counts.reviewing}>
          İnceleniyor
        </TabButton>
        <TabButton active={filter === "approved"} onClick={() => setFilter("approved")} count={counts.approved}>
          Onaylı
        </TabButton>
        <TabButton active={filter === "rejected"} onClick={() => setFilter("rejected")} count={counts.rejected}>
          Reddedildi
        </TabButton>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Ad, e-posta veya atölye başlığına göre ara..."
        className="w-full max-w-md px-4 py-2.5 rounded-lg border border-warm-200 text-sm text-warm-900 placeholder:text-warm-900/30 focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors mb-6"
      />

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C857E" strokeWidth="1.5">
              <path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-warm-900/40 text-sm">
            {search ? "Aramanızla eşleşen başvuru bulunamadı." : "Henüz başvuru yok. İlk başvuru geldiğinde burada listelenecek."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-200">
                <th className="text-left py-3 px-3 font-semibold text-warm-900/50 text-xs uppercase tracking-wide">Ad</th>
                <th className="text-left py-3 px-3 font-semibold text-warm-900/50 text-xs uppercase tracking-wide">Atölye</th>
                <th className="text-left py-3 px-3 font-semibold text-warm-900/50 text-xs uppercase tracking-wide hidden md:table-cell">E-posta</th>
                <th className="text-left py-3 px-3 font-semibold text-warm-900/50 text-xs uppercase tracking-wide">Tarih</th>
                <th className="text-left py-3 px-3 font-semibold text-warm-900/50 text-xs uppercase tracking-wide">Durum</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-warm-100 hover:bg-warm-50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/admin/atolye-basvurulari/${app.id}`}
                >
                  <td className="py-3 px-3 font-medium text-warm-900">{app.applicant_name}</td>
                  <td className="py-3 px-3 text-warm-900/70 max-w-[200px] truncate">{app.workshop_topic}</td>
                  <td className="py-3 px-3 text-warm-900/50 hidden md:table-cell">{app.applicant_email}</td>
                  <td className="py-3 px-3 text-warm-900/50 whitespace-nowrap">{timeAgo(app.created_at)}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/admin/atolye-basvurulari/${app.id}`}
                      className="text-coral text-xs font-medium hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Detay →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium transition-colors relative ${
        active ? "text-coral" : "text-warm-900/40 hover:text-warm-900/70"
      }`}
    >
      {children}
      {typeof count === "number" && count > 0 && (
        <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-coral/10 text-coral" : "bg-warm-100 text-warm-900/40"}`}>
          {count}
        </span>
      )}
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-coral rounded-full" />}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, bg: "bg-warm-100", text: "text-warm-900/50" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
