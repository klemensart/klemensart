const kesfetLinks = [
  { label: "Atölyeler",        href: "/atolyeler" },
  { label: "Testler ve Oyunlar", href: "#"        },
  { label: "E-bülten",         href: "#bulten"    },
  { label: "İçerikler",        href: "#"          },
  { label: "Etkinlikler",      href: "/etkinlikler" },
];
const kurumLinks = ["Hakkımızda", "Yaklaşım", "İletişim", "Gizlilik Politikası", "Kullanım Koşulları"];

const socials = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-warm-900 border-t border-white/5 pt-16 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-14">
          {/* Brand */}
          <div className="sm:col-span-2">
            <p className="text-xl font-bold text-white mb-4">klemens</p>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Sanat tarihini araç olarak kullanan, insani ve sıcak bir kültür ekosistemi.
              Kendinizi keşfetmek için en güzel kapı.
            </p>
            <div className="flex gap-3 mt-7">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:bg-coral hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Keşfet */}
          <div>
            <p className="text-white text-sm font-semibold mb-5">Keşfet</p>
            <ul className="space-y-3">
              {kesfetLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/40 text-sm hover:text-coral transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <p className="text-white text-sm font-semibold mb-5">Klemens</p>
            <ul className="space-y-3">
              {kurumLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/40 text-sm hover:text-coral transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-sm">© 2026 Klemens. Tüm hakları saklıdır.</p>
          <p className="text-white/15 text-xs">Sıcaklıkla yapıldı ✦</p>
        </div>
      </div>
    </footer>
  );
}
