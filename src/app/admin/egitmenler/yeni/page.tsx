"use client";

import Link from "next/link";
import HostForm from "../[id]/HostForm";

export default function YeniEgitmenPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-warm-900/40 mb-6">
        <Link href="/admin/egitmenler" className="hover:text-coral transition-colors">
          Eğitmenler
        </Link>
        <span>/</span>
        <span className="text-warm-900/70">Yeni Eğitmen</span>
      </div>

      <h1 className="text-2xl font-bold text-warm-900 mb-8">Yeni Eğitmen</h1>

      <HostForm />
    </div>
  );
}
