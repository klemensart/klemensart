const stats = [
  { num: "200+", label: "Atölye Mezunu" },
  { num: "12", label: "Aktif Program" },
  { num: "5K+", label: "Bülten Okuru" },
];

const tags = [
  { label: "Sanat", pos: "top-6 right-6", style: "bg-white shadow-md text-warm-900" },
  { label: "Sinema", pos: "bottom-16 -right-3", style: "bg-coral text-white shadow-md" },
  { label: "Felsefe", pos: "bottom-10 left-6", style: "bg-warm-200 text-warm-900" },
  { label: "Psikoloji", pos: "top-16 -left-3", style: "bg-white shadow-md text-warm-900" },
];

export default function Manifesto() {
  return (
    <section id="manifesto" className="py-24 px-6 bg-warm-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left — decorative orb */}
        <div className="relative flex items-center justify-center order-2 lg:order-1">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80">
            {/* Outer ring — spins slowly */}
            <div className="spin-slow absolute inset-0 rounded-full border-2 border-dashed border-coral/20" />
            {/* Mid ring */}
            <div className="absolute inset-8 rounded-full border border-coral/15" />
            {/* Inner fill */}
            <div className="absolute inset-16 rounded-full bg-coral/8" />

            {/* Center mark */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-7xl font-bold text-coral leading-none select-none">K</span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-warm-900/40 uppercase mt-1">
                klemens
              </span>
            </div>

            {/* Floating discipline tags */}
            {tags.map((t) => (
              <span
                key={t.label}
                className={`absolute ${t.pos} px-4 py-1.5 rounded-full text-sm font-semibold ${t.style}`}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — text */}
        <div className="order-1 lg:order-2">
          <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-6">Biz Kimiz?</p>

          <h2 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight mb-8">
            Sanat, bir araç.<br />
            <span className="text-coral">Siz</span>, asıl mesele.
          </h2>

          <div className="space-y-5 text-warm-900/65 leading-relaxed">
            <p className="text-lg">
              Klemens, sanat tarihini bilgi aktarımı için değil, kişisel keşif için bir araç olarak
              kullanır. Sinema, felsefe ve psikoloji prizmasından geçen her içerik, sizi akademik
              kaygılardan uzak bir anlam yolculuğuna davet eder.
            </p>
            <p>
              Burada &ldquo;doğru cevabı bilmek&rdquo; değil, kendi sorunuzu bulmak önemlidir.
              Eserler, dönemler, akımlar — hepsi yalnızca daha iyi sorular sorabilmeniz için birer
              basamak.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-10 pt-10 border-t border-warm-200 grid grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.num}>
                <p className="text-3xl font-bold text-coral">{s.num}</p>
                <p className="text-sm text-warm-900/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
