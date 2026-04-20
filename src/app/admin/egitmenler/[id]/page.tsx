"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import HostForm from "./HostForm";

type PersonFull = {
  id: string;
  name: string;
  slug: string;
  avatar_url: string | null;
  short_bio: string | null;
  bio: string | null;
  expertise: string[];
  email: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  website: string | null;
  metadata: { phone?: string | null };
  workshop_count: number;
};

type Workshop = {
  id: string;
  slug: string;
  title: string;
  category: string;
  event_date: string | null;
  status: string;
};

export default function HostDetayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [person, setPerson] = useState<PersonFull | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/people/${params.id}`);
      if (!res.ok) {
        router.push("/admin/egitmenler");
        return;
      }
      const data = await res.json();
      setPerson(data.person);
      setLoading(false);
    }
    load();
  }, [params.id, router]);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/admin/people/${params.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/egitmenler");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Silme hatası");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!person) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-warm-900/40 mb-6">
        <Link href="/admin/egitmenler" className="hover:text-coral transition-colors">
          Eğitmenler
        </Link>
        <span>/</span>
        <span className="text-warm-900/70">{person.name}</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-warm-900">Eğitmen Düzenle</h1>
        <a
          href={`/egitmenler/${person.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-warm-900/40 hover:text-coral transition-colors"
        >
          Profili görüntüle &rarr;
        </a>
      </div>

      {/* Form */}
      <HostForm initialData={person} />

      {/* Workshops section */}
      {person.workshop_count > 0 && (
        <div className="mt-12 pt-8 border-t border-warm-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-warm-900">
              Atölyeler ({person.workshop_count})
            </h2>
            <Link
              href={`/admin/pazaryeri`}
              className="text-xs text-coral hover:underline"
            >
              Pazaryeri&apos;nde görüntüle
            </Link>
          </div>
          <p className="text-sm text-warm-900/40">
            Bu eğitmenin {person.workshop_count} atölyesi Pazaryeri sayfasından yönetilebilir.
          </p>
        </div>
      )}

      {/* Danger zone */}
      <div className="mt-12 pt-8 border-t border-red-100">
        <h2 className="text-sm font-semibold text-red-600 mb-3">Tehlikeli Bölge</h2>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={person.workshop_count > 0}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title={person.workshop_count > 0 ? `Bu host'un ${person.workshop_count} atölyesi var, önce onları taşı` : undefined}
          >
            Eğitmeni Sil
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? "Siliniyor..." : "Evet, Sil"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm text-warm-900/50 hover:text-warm-900 transition-colors"
            >
              İptal
            </button>
          </div>
        )}
        {person.workshop_count > 0 && (
          <p className="text-xs text-warm-900/40 mt-2">
            Bu host&apos;un {person.workshop_count} atölyesi var. Önce atölyeleri arşivle veya başka host&apos;a taşı.
          </p>
        )}
      </div>
    </div>
  );
}
