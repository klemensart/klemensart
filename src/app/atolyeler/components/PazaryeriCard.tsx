import Link from "next/link";
import DateBadge from "./DateBadge";

type Props = {
  slug: string;
  title: string;
  category: string;
  city: string;
  district: string | null;
  price: number;
  image_url: string | null;
  event_date: string | null;
  is_featured: boolean;
  href?: string;
  badge?: string;
  duration_note?: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  resim: "Resim",
  seramik: "Seramik",
  fotograf: "Fotoğraf",
  muzik: "Müzik",
  heykel: "Heykel",
  dijital: "Dijital Sanat",
  yazarlik: "Yazarlık",
  dans: "Dans",
  tiyatro: "Tiyatro",
  diger: "Diğer",
  "sanat-tarihi": "Sanat Tarihi",
  sinema: "Sinema",
};

function formatPrice(price: number): string {
  if (price === 0) return "Ücretsiz";
  return price.toLocaleString("tr-TR") + " TL";
}

export default function PazaryeriCard({
  slug, title, category, city, district, price, image_url, event_date, is_featured, href, badge, duration_note,
}: Props) {
  const linkHref = href ?? `/atolyeler/${slug}`;
  const isOnline = city === "Online";

  return (
    <Link href={linkHref} className="group block">
      <article className="relative aspect-[16/9] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
        {/* Image */}
        {image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image_url}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-warm-200 to-warm-300 flex items-center justify-center">
            <span className="text-warm-900/20 text-4xl">🎨</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Top left — category + badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/20 backdrop-blur-sm text-white rounded-full uppercase tracking-wide">
            {CATEGORY_LABELS[category] ?? category}
          </span>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-coral text-white rounded-full uppercase tracking-wide">
              {badge}
            </span>
          )}
          {is_featured && !badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-coral text-white rounded-full uppercase tracking-wide">
              Öne Çıkan
            </span>
          )}
        </div>

        {/* Top right — date badge */}
        {event_date && (
          <div className="absolute top-3 right-3">
            <DateBadge date={event_date} />
          </div>
        )}

        {/* Bottom — title + location & price */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-base font-bold text-white line-clamp-2 mb-1 group-hover:text-coral transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1 text-xs text-white/70">
              {isOnline ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  Online · Zoom
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {district ? `${district}, ${city}` : city}
                </>
              )}
            </p>
            {price === 0 ? (
              <span className="text-xs font-semibold text-emerald-400">Ücretsiz</span>
            ) : (
              <span className="text-sm font-bold text-white">{formatPrice(price)}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
