import SynapseWrapper from "@/components/SynapseWrapper";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-warm-50">
      {/* Animated background blobs — GPU accelerated */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
        <div className="blob-a absolute -top-32 -right-24 w-[640px] h-[640px] rounded-full bg-coral/[0.07]" />
        <div className="blob-b absolute -bottom-16 -left-16 w-[520px] h-[520px] rounded-full bg-coral/[0.06]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-warm-200/30" />
      </div>

      {/* Synapse network — only loaded on desktop, zero JS on mobile */}
      <SynapseWrapper />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="max-w-3xl lg:w-1/2">
          {/* Eyebrow tag */}
          <div className="fade-up inline-flex items-center gap-2 px-4 py-2 bg-coral/10 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-coral flex-shrink-0" />
            <span className="text-sm font-semibold text-coral">Kültür &amp; Sanat Ekosistemi</span>
          </div>

          {/* Headline */}
          <h1 className="fade-up-1 text-5xl sm:text-6xl lg:text-[4.5rem] font-bold leading-[1.08] tracking-tight text-warm-900">
            Türkiye&apos;nin<br />
            <span className="text-coral">kültür</span><br />
            rehberi.
          </h1>

          {/* Subtitle */}
          <p className="fade-up-2 mt-8 text-lg sm:text-xl text-warm-900/60 max-w-2xl leading-relaxed">
            Etkinlik takviminden sanat tarihi yazılarına, atölye ve workshop&apos;lardan interaktif kültür haritasına. Kültür-sanat dünyasını tek yerden keşfedin.
          </p>

          {/* CTAs */}
          <div className="fade-up-3 mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="/atolyeler"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-coral text-white font-semibold rounded-full hover:opacity-90 hover:shadow-lg hover:shadow-coral/20 active:scale-95 transition-all duration-200"
            >
              Keşfetmeye Başla
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#manifesto"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-warm-900 font-semibold rounded-full border border-warm-200 hover:border-warm-900/30 hover:shadow-md transition-all duration-200"
            >
              Biz Kimiz?
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="bounce-slow absolute bottom-8 left-1/2 flex flex-col items-center gap-1.5 text-warm-900/30">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Kaydır</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
