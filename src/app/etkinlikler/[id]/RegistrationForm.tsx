"use client";

import { useState, useEffect } from "react";

type Props = {
  eventId: string;
  eventTitle: string;
  eventDate: string | null;
  eventVenue: string | null;
};

export default function RegistrationForm({ eventId, eventTitle, eventDate, eventVenue }: Props) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Login kontrolü — cookie'den user bilgisi varsa prefill
  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.user) {
            setName(json.user.name || "");
            setEmail(json.user.email || "");
            setUserId(json.user.id || null);
          }
        }
      } catch {
        // Not logged in — OK
      }
    }
    if (open) checkUser();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Ad ve email zorunludur.");
      return;
    }
    if (!kvkk) {
      setError("KVKK onayı zorunludur.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone, note, user_id: userId }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Bir hata oluştu.");
        setSending(false);
        return;
      }

      setDone(true);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setSending(false);
    }
  }

  const inputCls =
    "w-full text-sm text-warm-900 bg-white border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:border-coral/50 placeholder:text-warm-900/25";

  // Başarılı kayıt mesajı
  if (done) {
    const fmtDate = eventDate
      ? new Date(eventDate).toLocaleDateString("tr-TR", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
          hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul",
        })
      : null;

    return (
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-8 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-emerald-800">Kaydınız Alındı</h3>
        </div>
        <div className="space-y-1 text-sm text-emerald-700 mb-4">
          <p><strong>{eventTitle}</strong></p>
          {fmtDate && <p>{fmtDate}</p>}
          {eventVenue && <p>{eventVenue}</p>}
        </div>
        <p className="text-sm text-emerald-600">
          Etkinlik günü görüşmek üzere!
        </p>
      </div>
    );
  }

  // Buton (form kapalı)
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-3 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
      >
        Katılmak İstiyorum
      </button>
    );
  }

  // Kayıt formu
  return (
    <div className="bg-white rounded-2xl border border-warm-100 p-8 mt-4">
      <h3 className="text-lg font-bold text-warm-900 mb-1">Etkinlik Kaydı</h3>
      <p className="text-sm text-warm-900/50 mb-6">{eventTitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-warm-900/60 uppercase tracking-wide mb-1">
            Ad Soyad *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ad Soyad"
            className={inputCls}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-900/60 uppercase tracking-wide mb-1">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@email.com"
            className={inputCls}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-900/60 uppercase tracking-wide mb-1">
            Telefon <span className="font-normal text-warm-900/30">(opsiyonel)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(5XX) XXX XX XX"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-900/60 uppercase tracking-wide mb-1">
            Not <span className="font-normal text-warm-900/30">(opsiyonel)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Eklemek istediğiniz bir not var mı?"
            className={inputCls + " resize-none"}
          />
        </div>

        {/* KVKK */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={kvkk}
            onChange={(e) => setKvkk(e.target.checked)}
            className="w-4 h-4 accent-coral mt-0.5 flex-shrink-0"
          />
          <span className="text-xs text-warm-900/60 leading-relaxed">
            Kişisel verilerimin etkinlik ile ilgili bilgilendirme amaçlı kullanılmasını kabul ediyorum.
          </span>
        </label>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-3 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending ? "Kaydediliyor..." : "Kaydı Tamamla"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-6 py-3 bg-warm-100 text-warm-900/60 text-sm font-semibold rounded-xl hover:bg-warm-200 transition-colors"
          >
            Vazgeç
          </button>
        </div>
      </form>
    </div>
  );
}
