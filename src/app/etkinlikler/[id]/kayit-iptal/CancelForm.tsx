"use client";

import { useState } from "react";

type Props = {
  token: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  registrationName: string;
};

export default function CancelForm({
  token,
  eventId,
  eventTitle,
  eventDate,
  eventVenue,
  registrationName,
}: Props) {
  const [cancelled, setCancelled] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setCancelling(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Bir hata oluştu.");
        setCancelling(false);
        return;
      }

      setCancelled(true);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setCancelling(false);
    }
  }

  if (cancelled) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b6560" strokeWidth="2" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-warm-900 mb-4">
          Kaydınız İptal Edildi
        </h1>
        <p className="text-warm-900/60 mb-2">
          <strong>{eventTitle}</strong> etkinliği için kaydınız başarıyla iptal edildi.
        </p>
        <p className="text-sm text-warm-900/40">
          Fikrinizi değiştirirseniz etkinlik sayfasından tekrar kayıt olabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-warm-900 mb-6">
        Kaydınızı iptal etmek istediğinize emin misiniz?
      </h1>

      <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-8 text-left">
        <p className="text-sm text-warm-900/50 mb-1">Katılımcı</p>
        <p className="text-base font-semibold text-warm-900 mb-4">{registrationName}</p>

        <p className="text-sm text-warm-900/50 mb-1">Etkinlik</p>
        <p className="text-base font-semibold text-warm-900">{eventTitle}</p>
        {eventDate && <p className="text-sm text-warm-900/60 mt-1">{eventDate}</p>}
        {eventVenue && <p className="text-sm text-warm-900/60">{eventVenue}</p>}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="px-6 py-3 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {cancelling ? "İptal ediliyor..." : "Evet, Kaydımı İptal Et"}
        </button>
        <a
          href="/etkinlikler"
          className="px-6 py-3 bg-warm-100 text-warm-900/60 text-sm font-semibold rounded-xl hover:bg-warm-200 transition-colors"
        >
          Vazgeç
        </a>
      </div>
    </div>
  );
}
