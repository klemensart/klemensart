"use client";

import Link from "next/link";
import AtolyeForm from "../AtolyeForm";

export default function YeniAtolyePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-warm-900/40 mb-6">
        <Link href="/admin/pazaryeri" className="hover:text-coral transition-colors">
          Pazaryeri
        </Link>
        <span>/</span>
        <span className="text-warm-900/70">Yeni Atölye</span>
      </div>

      <h1 className="text-2xl font-bold text-warm-900 mb-8">Yeni Atölye</h1>

      <AtolyeForm mode="create" />
    </div>
  );
}
