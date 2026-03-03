"use client";

import { useState } from "react";

export default function Bulten() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section id="bulten" className="py-24 px-6 bg-warm-900">
      <div className="max-w-3xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-coral/20 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-coral flex-shrink-0" />
          <span className="text-sm font-semibold text-coral">E-bülten</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
          Kültür dünyanızı<br />
          her hafta zenginleştirin
        </h2>

        <p className="text-white/55 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
          Sanat, sinema, felsefe ve psikoloji üzerine tematik içerikler, etkinlik duyuruları ve
          özel okuma listeleri — doğrudan e-posta kutunuza.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e-posta adresiniz"
              required
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-coral focus:bg-white/15 transition-all"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-coral text-white font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
            >
              Abone Ol
            </button>
          </form>
        ) : (
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 rounded-full text-white font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Harika! Sizi bültene ekledik.
          </div>
        )}

        <p className="mt-6 text-white/25 text-sm">
          İstediğiniz zaman aboneliğinizi iptal edebilirsiniz. Spam yok, söz.
        </p>
      </div>
    </section>
  );
}
