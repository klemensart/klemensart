"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type PersonWithCount = {
  id: string;
  slug: string;
  name: string;
  avatar_url: string | null;
  short_bio: string | null;
  expertise: string[];
  workshop_count: number;
};

function getInitials(name: string) {
  const words = name.split(/\s+/);
  if (words.length === 1) return words[0][0]?.toUpperCase() ?? "?";
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function HostlarListesi() {
  const [people, setPeople] = useState<PersonWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/people?is_host=true")
      .then((r) => r.json())
      .then((d) => setPeople(d.people ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return people;
    const q = search.toLowerCase();
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.expertise ?? []).some((e) => e.toLowerCase().includes(q))
    );
  }, [people, search]);

  const totalWorkshops = people.reduce((s, p) => s + p.workshop_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Eğitmenler</h1>
          <p className="text-sm text-warm-900/50 mt-1">
            Toplam {people.length} host · {totalWorkshops} aktif atölye
          </p>
        </div>
        <Link
          href="/admin/egitmenler/yeni"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-coral text-white text-sm font-medium rounded-xl hover:bg-coral/90 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni Eğitmen
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-900/30"
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="İsim, slug veya uzmanlık ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-warm-900/40 text-sm">
          {search ? "Aramanızla eşleşen eğitmen bulunamadı." : "Henüz eğitmen eklenmemiş."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/admin/egitmenler/${p.id}`}
              className="group bg-white border border-warm-100 rounded-2xl p-5 hover:border-coral/30 hover:shadow-sm transition-all"
            >
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-3">
                {p.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.avatar_url}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-warm-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-warm-900/40 font-bold text-sm">
                      {getInitials(p.name)}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-warm-900 truncate group-hover:text-coral transition-colors">
                    {p.name}
                  </h3>
                  {p.short_bio && (
                    <p className="text-xs text-warm-900/40 line-clamp-1">
                      {p.short_bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-warm-900/30">
                  {p.workshop_count} atölye
                </span>
                {p.expertise && p.expertise.length > 0 && (
                  <span className="text-[10px] font-medium text-coral/80 bg-coral/5 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                    {p.expertise[0]}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
