"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AtolyeForm from "../AtolyeForm";
import AtolyeSosyalMedyaSection from "@/components/admin/AtolyeSosyalMedyaSection";

export default function DuzenleAtolyePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Fetch all events to find this one by ID
      const res = await fetch(`/api/admin/pazaryeri?status=active`);
      if (!res.ok) { router.push("/admin/pazaryeri"); return; }
      const data = await res.json();
      let event = (data.events ?? []).find((e: any) => e.id === params.id);

      // Try draft and archived if not found in active
      if (!event) {
        const draftRes = await fetch(`/api/admin/pazaryeri?status=draft`);
        const draftData = await draftRes.json();
        event = (draftData.events ?? []).find((e: any) => e.id === params.id);
      }
      if (!event) {
        const archRes = await fetch(`/api/admin/pazaryeri?status=archived`);
        const archData = await archRes.json();
        event = (archData.events ?? []).find((e: any) => e.id === params.id);
      }

      if (!event) {
        router.push("/admin/pazaryeri");
        return;
      }

      setEventData(event);
      setLoading(false);
    }
    load();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-warm-900/40 mb-6">
        <Link href="/admin/pazaryeri" className="hover:text-coral transition-colors">
          Pazaryeri
        </Link>
        <span>/</span>
        <span className="text-warm-900/70">{eventData?.title ?? "Düzenle"}</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-warm-900">Atölye Düzenle</h1>
        {eventData?.slug && (
          <a
            href={`/atolyeler/${eventData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-warm-900/40 hover:text-coral transition-colors"
          >
            Sayfayı görüntüle &rarr;
          </a>
        )}
      </div>

      <AtolyeForm mode="edit" initialData={eventData} />

      {/* Sosyal medya görselleri */}
      <AtolyeSosyalMedyaSection atolyeId={params.id} />
    </div>
  );
}
