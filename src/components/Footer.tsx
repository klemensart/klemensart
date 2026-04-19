import { InstagramIcon, TwitterIcon, LinkedInIcon, YouTubeIcon } from "@/lib/icons";

const kesfetLinks = [
  { label: "Atölyeler",        href: "/atolyeler" },
  { label: "Testler ve Oyunlar", href: "#"        },
  { label: "Kültür Haritası",  href: "/harita"    },
  { label: "E-bülten",         href: "/bulten"    },
  { label: "İçerikler",        href: "#"          },
  { label: "Etkinlikler",      href: "/etkinlikler" },
];
const kurumLinks = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "SSS", href: "/sss" },
  { label: "İletişim", href: "mailto:info@klemensart.com" },
  { label: "Gizlilik Politikası", href: "/kvkk" },
  { label: "İade ve İptal", href: "/iade-ve-iptal" },
];

const socials = [
  { name: "Instagram",   href: "https://instagram.com/klemens.art",                icon: <InstagramIcon /> },
  { name: "Twitter / X", href: "https://x.com/KlemensArt",                         icon: <TwitterIcon /> },
  { name: "LinkedIn",    href: "https://www.linkedin.com/company/klemens-art",      icon: <LinkedInIcon /> },
  { name: "YouTube",     href: "https://www.youtube.com/@KlemensArt",               icon: <YouTubeIcon /> },
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
              Her eserin ardında bir hikaye, her hikayede sen varsın.
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
                <li key={link.label}>
                  <a href={link.href} className="text-white/40 text-sm hover:text-coral transition-colors">
                    {link.label}
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
