"use client";

import { useEffect } from "react";
import HostForm from "@/app/admin/egitmenler/[id]/HostForm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (person: any) => void;
};

export default function YeniHostModal({ open, onClose, onSuccess }: Props) {
  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-warm-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-warm-900">Yeni Eğitmen</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-warm-100 text-warm-900/40 hover:text-warm-900 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          <HostForm isModal onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}
