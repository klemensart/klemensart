"use client";

import { useState } from "react";

type Props = {
  title: string;
  priceLabel: string;
  buyUrl?: string;
  forSale: boolean;
};

function XIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function ContactModal({ open, onClose, workshopTitle }: { open: boolean; onClose: () => void; workshopTitle: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"ok" | "err" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/contact/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, workshopTitle, workshopSlug: "", organizerEmail: "kerem.hun@klemensart.com" }),
      });
      setResult(res.ok ? "ok" : "err");
      if (res.ok) setTimeout(() => { onClose(); setForm({ name: "", email: "", phone: "", message: "" }); setResult(null); }, 2000);
    } catch { setResult("err"); } finally { setSending(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors">
          <XIcon />
        </button>
        <h3 className="text-xl font-bold mb-1 text-[#2D2926]">Soru Sor</h3>
        <p className="text-sm mb-6 text-[#8C857E]">{workshopTitle} hakkında merak ettiklerinizi sorun.</p>

        {result === "ok" ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-coral/10">
              <svg className="w-7 h-7 text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-semibold text-[#2D2926]">Mesajınız iletildi!</p>
            <p className="text-sm mt-1 text-[#8C857E]">En kısa sürede dönüş yapılacaktır.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#2D2926]">İsim *</label>
              <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors" placeholder="Adınız Soyadınız" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#2D2926]">E-posta *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors" placeholder="ornek@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#2D2926]">Mesajınız *</label>
              <textarea required rows={4} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors resize-none" placeholder="Sorunuzu veya mesajınızı yazın..." />
            </div>
            {result === "err" && <p className="text-sm text-red-500">Bir hata oluştu. Lütfen tekrar deneyin.</p>}
            <button type="submit" disabled={sending} className="w-full py-3 rounded-full text-white font-semibold text-sm bg-coral transition-opacity disabled:opacity-50">
              {sending ? "Gönderiliyor..." : "Gönder"}
            </button>
            <a href="https://wa.me/905327645310?text=Merhaba%2C%20atölye%20hakkında%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-full border-2 text-sm font-semibold transition-colors hover:bg-green-50" style={{ borderColor: "#25D366", color: "#25D366" }}>
              <WhatsAppIcon /> WhatsApp ile Yaz
            </a>
          </form>
        )}
      </div>
    </div>
  );
}

export default function StickyWorkshopBar({ title, priceLabel, buyUrl, forSale }: Props) {
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      <ContactModal open={showContact} onClose={() => setShowContact(false)} workshopTitle={title} />
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] bg-white" style={{ borderColor: "#F5F0EB" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="hidden sm:block min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-[#2D2926]">{title}</p>
              <p className="text-sm font-semibold text-coral">{priceLabel}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <button onClick={() => setShowContact(true)} className="px-4 py-2.5 rounded-full text-sm font-semibold border-2 border-[#2D2926] text-[#2D2926] transition-colors hover:bg-neutral-50 flex-1 sm:flex-initial">
                Mesaj Gönder
              </button>
              {forSale && buyUrl ? (
                <a href={buyUrl} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-white text-sm font-semibold bg-coral transition-opacity hover:opacity-90 flex-1 sm:flex-initial">
                  Satın Al
                </a>
              ) : (
                <a href="https://wa.me/905327645310?text=Merhaba%2C%20atölye%20hakkında%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-white text-sm font-semibold bg-coral transition-opacity hover:opacity-90 flex-1 sm:flex-initial">
                  İletişim
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="h-16" />
    </>
  );
}
