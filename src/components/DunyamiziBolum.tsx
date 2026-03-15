"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Desktop SVG map — only loaded on md+ screens (brings framer-motion)
const DunyamiziDesktop = dynamic(() => import("@/components/DunyamiziDesktop"), {
  ssr: false,
  loading: () => null,
});

type NodeDef = {
  label: string;
  desc: string;
  href: string;
  isHub?: boolean;
};

const nodes: NodeDef[] = [
  { label: "Atölyeler", desc: "Uzman rehberliğinde küçük gruplarla Zoom atölyeleri", href: "/atolyeler" },
  { label: "Testler & Oyunlar", desc: "İç dünyanızla sanat zevklerinizi buluşturun", href: "/testler" },
  { label: "E-bülten", desc: "Kültür ve sanat dünyasından haftalık seçkiler", href: "#bulten" },
  { label: "İçerikler", desc: "Yazılar, analizler ve röportajlar — tüm kategoriler", href: "/icerikler", isHub: true },
  { label: "Odak", desc: "Bir eseri, dönemi ya da fikri derinlemesine inceleyin", href: "/icerikler/odak" },
  { label: "Kültür & Sanat", desc: "Sanat tarihi, eleştiri ve güncel sergi incelemeleri", href: "/icerikler/kultur-sanat" },
  { label: "İlham Verenler", desc: "Yaratıcı insanlarla kısa ama derin röportajlar", href: "/icerikler/ilham-verenler" },
  { label: "Kent & Yaşam", desc: "Şehrin kültürel nabzını tutuyoruz", href: "/icerikler/kent-yasam" },
  { label: "Etkinlikler", desc: "Yaklaşan atölye, seminer ve program takvimi", href: "#etkinlikler" },
  { label: "Hakkımızda", desc: "Klemens'in yaklaşımı, felsefesi ve ekip", href: "#manifesto" },
];

const CARD_COLORS = [
  { badge: "bg-coral/10 text-coral",    ring: "hover:border-coral/30"    },
  { badge: "bg-amber-50 text-amber-700", ring: "hover:border-amber-200"  },
  { badge: "bg-sky-50 text-sky-700",     ring: "hover:border-sky-200"    },
  { badge: "bg-coral/10 text-coral",    ring: "hover:border-coral/30"    },
  { badge: "bg-coral/10 text-coral",    ring: "hover:border-coral/30"    },
  { badge: "bg-amber-50 text-amber-700", ring: "hover:border-amber-200"  },
  { badge: "bg-sky-50 text-sky-700",     ring: "hover:border-sky-200"    },
  { badge: "bg-emerald-50 text-emerald-700", ring: "hover:border-emerald-200" },
  { badge: "bg-emerald-50 text-emerald-700", ring: "hover:border-emerald-200" },
  { badge: "bg-warm-100 text-warm-900/70",   ring: "hover:border-warm-300"   },
];

export default function DunyamiziBolum() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <section id="dunyamiz" className="hidden md:block py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-4">Site Haritası</p>
          <h2 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight mb-4">
            Dünyamızı Keşfet
          </h2>
          <p className="text-warm-900/55 text-lg max-w-lg mx-auto leading-relaxed">
            Klemens evreninde kaybolun — her kavram yeni bir kapı açar.
          </p>
        </div>

        {/* Desktop: Interactive SVG synapse map (framer-motion only loaded here) */}
        {isDesktop && <DunyamiziDesktop />}

        {/* Mobile: Lightweight card grid — no framer-motion */}
        {!isDesktop && (
          <div className="grid grid-cols-2 gap-3">
            {nodes.map((node, i) => {
              const colors = CARD_COLORS[i];
              const isPage = node.href.startsWith("/");
              const inner = (
                <>
                  <span className={`self-start px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3 ${colors.badge}`}>
                    {node.isHub ? "Merkez" : "Keşfet"}
                  </span>
                  <p className="text-warm-900 font-semibold text-sm leading-snug mb-1.5 line-clamp-2">
                    {node.label}
                  </p>
                  <p className="text-warm-900/50 text-xs leading-relaxed flex-1 line-clamp-2">
                    {node.desc}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-coral">
                    <span>Keşfet</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </>
              );
              const cls = `flex flex-col p-4 rounded-2xl bg-warm-50 border border-warm-100 ${colors.ring} hover:-translate-y-0.5 hover:shadow-md hover:shadow-warm-900/[0.05] transition-all duration-200`;
              return isPage
                ? <Link key={node.label} href={node.href} className={cls}>{inner}</Link>
                : <a key={node.label} href={node.href} className={cls}>{inner}</a>;
            })}
          </div>
        )}
      </div>
    </section>
  );
}
