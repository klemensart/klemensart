import Link from "next/link";

const services = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    label: "Canlı · Zoom",
    title: "Atölyeler",
    description:
      "Sanat tarihi, sinema, felsefe ve psikoloji alanlarında uzman rehberliğinde küçük gruplarla derinlemesine keşif seansları.",
    accent: "text-coral bg-coral/10",
    href: "/atolyeler",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    label: "İnteraktif",
    title: "Testler & Oyunlar",
    description:
      "İç dünyanız ile sanat zevkleriniz arasındaki bağı keşfedin. Kişisel reçeteler ve önerilerle dolu bir yolculuk.",
    accent: "text-amber-600 bg-amber-50",
    href: "/testler",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "Haftalık",
    title: "E-bülten",
    description:
      "Özenle hazırlanmış tematik bültenler. Sanat, kültür ve düşünce dünyasından seçkiler her hafta e-posta kutunuza gelir.",
    accent: "text-sky-600 bg-sky-50",
    href: "#bulten",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    label: "Editöryal",
    title: "İçerikler",
    description:
      "Sinema, sanat tarihi ve felsefe üzerine insani, erişilebilir yazılar. Bilmek için değil, hissetmek ve anlamak için.",
    accent: "text-emerald-600 bg-emerald-50",
    href: "/icerikler",
  },
];

export default function Hizmetler() {
  return (
    <section id="hizmetler" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-4">
            Ne Sunuyoruz?
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight">
            Kültürle bağ kurmanın<br />dört yolu
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group relative flex flex-col p-8 rounded-3xl bg-warm-50 border border-warm-100 hover:border-warm-300/60 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-warm-900/[0.06] transition-all duration-300 no-underline"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-2xl mb-6 self-start ${s.accent}`}>
                {s.icon}
              </div>

              {/* Label */}
              <span className="text-xs font-semibold text-warm-900/40 uppercase tracking-widest mb-3">
                {s.label}
              </span>

              {/* Title */}
              <h3 className="text-xl font-bold text-warm-900 mb-3">{s.title}</h3>

              {/* Description */}
              <p className="text-sm text-warm-900/60 leading-relaxed flex-1">{s.description}</p>

              {/* Hover arrow */}
              <div className="mt-6 flex items-center gap-1.5 text-coral text-sm font-semibold opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
                <span>Keşfet</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
