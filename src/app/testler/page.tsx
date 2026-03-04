import Link from "next/link";

// ─── Section 1: Zihin & Psikoloji Testleri ───────────────────────────────────

type PsikolTest = {
  title: string;
  description: string;
  href?: string;
  gradient: string;
  iconBg: string;
  icon: React.ReactNode;
};

const psikoloji: PsikolTest[] = [
  {
    title: "Görsel Algı Testi",
    description: "Sanat eserlerine bakış açınızı keşfedin.",
    href: "/testler/gorsel-algi",
    gradient: "from-amber-50 to-orange-50/60",
    iconBg: "bg-amber-100 text-amber-700",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Sanat Kişilik Testi",
    description: "Hangi sanat akımı sizin ruhunuzu yansıtıyor?",
    gradient: "from-rose-50 to-pink-50/60",
    iconBg: "bg-rose-100 text-rose-600",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: "Estetik Tercih Analizi",
    description: "Renk ve kompozisyon tercihleriniz ne söylüyor?",
    gradient: "from-violet-50 to-purple-50/60",
    iconBg: "bg-violet-100 text-violet-600",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
];

// ─── Section 2: Sanat & Dikkat Oyunları ──────────────────────────────────────

type Oyun = {
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  icon: React.ReactNode;
};

const oyunlar: Oyun[] = [
  {
    title: "Tabloyu Tahmin Et",
    description: "Hangi sanatçının eseri?",
    gradient: "from-sky-50 to-blue-50/60",
    iconBg: "bg-sky-100 text-sky-600",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
  },
  {
    title: "Detay Avcısı",
    description: "Tablodaki gizli detayları bulun.",
    gradient: "from-emerald-50 to-teal-50/60",
    iconBg: "bg-emerald-100 text-emerald-600",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    title: "Dönem Eşleştirme",
    description: "Eseri doğru döneme yerleştirin.",
    gradient: "from-amber-50 to-yellow-50/60",
    iconBg: "bg-amber-100 text-amber-600",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
      </svg>
    ),
  },
];

// ─── Card components ──────────────────────────────────────────────────────────

function ActiveCard({ t }: { t: PsikolTest & { href: string } }) {
  return (
    <Link
      href={t.href}
      className={`group relative flex flex-col p-7 rounded-3xl bg-gradient-to-br ${t.gradient} border border-warm-200/60 hover:border-warm-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-warm-900/[0.07] transition-all duration-300 no-underline`}
    >
      <div className={`inline-flex p-3 rounded-2xl mb-5 self-start ${t.iconBg}`}>
        {t.icon}
      </div>

      <span className="text-[10px] font-bold tracking-widest uppercase text-coral mb-2">
        Aktif
      </span>
      <h3 className="text-lg font-bold text-warm-900 mb-2">{t.title}</h3>
      <p className="text-sm text-warm-900/60 leading-relaxed flex-1">{t.description}</p>

      <div className="mt-5 flex items-center gap-1.5 text-coral text-sm font-semibold opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
        <span>Başla</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function YakindaCard({ title, description, gradient, iconBg, icon }: { title: string; description: string; gradient: string; iconBg: string; icon: React.ReactNode }) {
  return (
    <div className={`relative flex flex-col p-7 rounded-3xl bg-gradient-to-br ${gradient} border border-warm-200/40`}>
      <div className={`inline-flex p-3 rounded-2xl mb-5 self-start opacity-40 ${iconBg}`}>
        {icon}
      </div>

      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-warm-900/35 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-warm-900/25" />
        Yakında
      </span>
      <h3 className="text-lg font-bold text-warm-900/40 mb-2">{title}</h3>
      <p className="text-sm text-warm-900/30 leading-relaxed flex-1">{description}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TestlerPage() {
  return (
    <main className="min-h-screen bg-warm-50">

      {/* ── Page header ── */}
      <section className="pt-32 pb-16 px-6 bg-white border-b border-warm-100">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-coral/10 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            <span className="text-xs font-semibold text-coral tracking-wide">Testler & Oyunlar</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight mb-4">
            Kendinizi keşfedin,<br />eğlenerek öğrenin.
          </h1>
          <p className="text-lg text-warm-900/55 max-w-xl leading-relaxed">
            İç dünyanız ile sanat zevkleriniz arasındaki bağı keşfedin. Sanat bilginizi eğlenceli oyunlarla test edin.
          </p>
        </div>
      </section>

      {/* ── Bölüm 1: Zihin & Psikoloji Testleri ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-3">
              Bölüm 1
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-3">
              Zihin & Psikoloji Testleri
            </h2>
            <p className="text-warm-900/55 text-base max-w-lg">
              İç dünyanız ile sanat zevkleriniz arasındaki bağı keşfedin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {psikoloji.map((t) =>
              t.href ? (
                <ActiveCard key={t.title} t={t as PsikolTest & { href: string }} />
              ) : (
                <YakindaCard key={t.title} {...t} />
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Bölüm 2: Sanat & Dikkat Oyunları ── */}
      <section className="py-20 px-6 bg-white border-t border-warm-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-3">
              Bölüm 2
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-3">
              Sanat & Dikkat Oyunları
            </h2>
            <p className="text-warm-900/55 text-base max-w-lg">
              Eğlenceli oyunlarla sanat bilginizi test edin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {oyunlar.map((o) => (
              <YakindaCard key={o.title} {...o} />
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
