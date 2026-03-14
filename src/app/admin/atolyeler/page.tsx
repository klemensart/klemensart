import Link from "next/link";

export default function AdminAtolyelerPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
        <h1 className="text-2xl font-bold text-warm-900">Atölyeler</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          href="/admin/atolyeler/sunumlar"
          className="group bg-white rounded-2xl border border-warm-100 p-6 hover:border-warm-200 hover:shadow-lg hover:shadow-warm-900/[0.04] transition-all duration-200 no-underline"
        >
          <div className="inline-flex p-3 rounded-xl bg-amber-50 text-amber-700 mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-warm-900 mb-1">Sunumlar (PPTX)</h3>
          <p className="text-sm text-warm-900/50">10 haftalık PPTX sunumları oluştur ve indir</p>
        </Link>

        <Link
          href="/admin/atolyeler/materyaller"
          className="group bg-white rounded-2xl border border-warm-100 p-6 hover:border-warm-200 hover:shadow-lg hover:shadow-warm-900/[0.04] transition-all duration-200 no-underline"
        >
          <div className="inline-flex p-3 rounded-xl bg-sky-50 text-sky-700 mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M12 18v-6M9 15h6" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-warm-900 mb-1">Materyaller (PDF)</h3>
          <p className="text-sm text-warm-900/50">Haftalık PDF oluştur ve Loca&apos;ya yükle</p>
        </Link>
      </div>
    </div>
  );
}
