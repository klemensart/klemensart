"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const EXPIRE = new Date("2026-05-17T23:59:59+03:00").getTime();
const STORAGE_KEY = "sergi_promo_dismissed";

export default function SergiPromoBanner() {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const now = Date.now();
    if (now > EXPIRE) return; // expired — stay hidden
    if (localStorage.getItem(STORAGE_KEY)) return; // user dismissed

    const diff = Math.ceil((EXPIRE - now) / 86_400_000);
    setDaysLeft(diff);
    setDismissed(false);
  }, []);

  if (dismissed) return null;

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  return (
    <section className="relative pt-20 md:pt-24 overflow-hidden">
      {/* Background image + overlay */}
      <div className="absolute inset-0">
        <Image
          src="/sergi/en-sessiz-zaman/afrodisias-2.webp"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Kapat"
        className="absolute top-22 md:top-26 right-4 z-20 text-white/50 hover:text-white transition-colors cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M5 5l10 10M15 5L5 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-5 gap-10 md:gap-16 items-center">
        {/* Left — text (3 cols) */}
        <div className="md:col-span-3">
          <span
            className="block mb-3"
            style={{
              color: "#FF6D60",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            KLEMENS SANAL SERGİ
          </span>

          <h2
            className="text-white text-3xl md:text-5xl font-bold leading-tight mb-2"
            style={{ fontFamily: "var(--font-playfair), serif", fontStyle: "italic" }}
          >
            En Sessiz Zaman
          </h2>

          <p className="text-white/60 text-base md:text-lg mb-4">Theo Atay</p>

          <p className="text-white/45 text-sm md:text-base leading-relaxed mb-6 max-w-lg">
            Anadolu&apos;nun antik kentlerinde zamana direnen ta&#351;lar&#305;n
            sessiz tan&#305;kl&#305;&#287;&#305;. 21 foto&#287;raf, 7 antik kent
            &mdash; dijital bir sergi deneyimi.
          </p>

          {/* Countdown badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm mb-6">
            <span className="inline-block w-2 h-2 rounded-full bg-coral animate-pulse" />
            Son {daysLeft} g&uuml;n
          </div>

          <div>
            <a
              href="/sergi/en-sessiz-zaman"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              Sergiyi Ziyaret Et
              <span className="text-base">&rarr;</span>
            </a>
          </div>
        </div>

        {/* Right — decorative photo (2 cols, desktop only) */}
        <div className="hidden md:flex md:col-span-2 justify-center">
          <div
            className="relative rounded-2xl overflow-hidden border border-white/10"
            style={{ boxShadow: "0 0 80px rgba(255,109,96,0.1)" }}
          >
            <Image
              src="/sergi/en-sessiz-zaman/sagalassos-1.webp"
              alt="Sagalassos antik kenti — Theo Atay"
              width={420}
              height={560}
              className="block object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
