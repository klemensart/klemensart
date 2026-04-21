"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Registration = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  note: string | null;
  status: string;
  registered_at: string;
  cancelled_at: string | null;
};

type EventInfo = {
  id: string;
  title: string;
  event_date: string | null;
  venue: string | null;
  capacity: number | null;
  slug: string | null;
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function KayitlarPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [regs, setRegs] = useState<Registration[]>([]);
  const [counts, setCounts] = useState({ total: 0, confirmed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/admin/events/${id}/registrations`);
    if (!res.ok) return;
    const json = await res.json();
    setEvent(json.event);
    setRegs(json.registrations);
    setCounts(json.counts);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAction(regId: string, action: "cancel" | "confirm") {
    setActioning((p) => ({ ...p, [regId]: true }));
    await fetch(`/api/admin/events/${id}/registrations`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId: regId, action }),
    });
    setActioning((p) => ({ ...p, [regId]: false }));
    fetchData();
  }

  function downloadCSV() {
    const BOM = "\uFEFF";
    const header = "Ad,Email,Telefon,Not,Durum,Kayıt Tarihi\n";
    const rows = regs.map((r) =>
      [
        `"${r.name}"`,
        r.email,
        r.phone || "",
        `"${(r.note || "").replace(/"/g, '""')}"`,
        r.status === "confirmed" ? "Onaylı" : "İptal",
        fmt(r.registered_at),
      ].join(",")
    ).join("\n");

    const blob = new Blob([BOM + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kayitlar-${event?.slug || id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/etkinlikler"
          className="text-xs text-warm-900/40 hover:text-coral transition-colors"
        >
          ← Etkinlik Yönetimi
        </Link>
        <h1 className="text-2xl font-bold text-warm-900 mt-2">
          Kayıt Listesi
        </h1>
        {event && (
          <p className="text-sm text-warm-900/50 mt-1">
            {event.title} — {fmt(event.event_date)} — {event.venue || ""}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="bg-white rounded-xl border border-warm-100 px-5 py-3">
          <p className="text-2xl font-bold text-warm-900">{counts.confirmed}</p>
          <p className="text-xs text-warm-900/50">Onaylı Kayıt</p>
        </div>
        <div className="bg-white rounded-xl border border-warm-100 px-5 py-3">
          <p className="text-2xl font-bold text-red-500">{counts.cancelled}</p>
          <p className="text-xs text-warm-900/50">İptal</p>
        </div>
        {event?.capacity && (
          <div className="bg-white rounded-xl border border-warm-100 px-5 py-3">
            <p className="text-2xl font-bold text-warm-900">
              {counts.confirmed}/{event.capacity}
            </p>
            <p className="text-xs text-warm-900/50">Kapasite</p>
          </div>
        )}
        <div className="ml-auto flex items-center">
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-900 text-sm font-semibold rounded-xl transition-colors"
          >
            CSV İndir
          </button>
        </div>
      </div>

      {/* Table */}
      {regs.length === 0 ? (
        <div className="text-center py-20 text-warm-900/35">
          <p>Henüz kayıt yok.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-warm-900/50 uppercase">#</th>
                <th className="px-5 py-3 text-xs font-semibold text-warm-900/50 uppercase">Ad</th>
                <th className="px-5 py-3 text-xs font-semibold text-warm-900/50 uppercase">Email</th>
                <th className="px-5 py-3 text-xs font-semibold text-warm-900/50 uppercase">Telefon</th>
                <th className="px-5 py-3 text-xs font-semibold text-warm-900/50 uppercase">Not</th>
                <th className="px-5 py-3 text-xs font-semibold text-warm-900/50 uppercase">Kayıt</th>
                <th className="px-5 py-3 text-xs font-semibold text-warm-900/50 uppercase">Durum</th>
                <th className="px-5 py-3 text-xs font-semibold text-warm-900/50 uppercase">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {regs.map((r, i) => (
                <tr key={r.id} className="border-b border-warm-50 hover:bg-warm-50/50">
                  <td className="px-5 py-3 text-warm-900/40">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-warm-900">{r.name}</td>
                  <td className="px-5 py-3 text-warm-900/70">{r.email}</td>
                  <td className="px-5 py-3 text-warm-900/70">{r.phone || "—"}</td>
                  <td className="px-5 py-3 text-warm-900/50 max-w-[200px] truncate">{r.note || "—"}</td>
                  <td className="px-5 py-3 text-warm-900/50 whitespace-nowrap">{fmt(r.registered_at)}</td>
                  <td className="px-5 py-3">
                    {r.status === "confirmed" ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                        Onaylı
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                        İptal
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {r.status === "confirmed" ? (
                      <button
                        onClick={() => handleAction(r.id, "cancel")}
                        disabled={actioning[r.id]}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold disabled:opacity-50"
                      >
                        İptal Et
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(r.id, "confirm")}
                        disabled={actioning[r.id]}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold disabled:opacity-50"
                      >
                        Geri Al
                      </button>
                    )}
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
