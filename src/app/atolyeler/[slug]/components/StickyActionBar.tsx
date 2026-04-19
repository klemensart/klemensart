import type { MarketplaceEvent } from "@/types/marketplace";

function fmtPrice(price: number) {
  return new Intl.NumberFormat("tr-TR").format(price);
}

function ExternalLinkIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function MessageIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function StickyActionBar({
  event,
  priceLabel,
  isKlemens,
  onContactClick,
}: {
  event: MarketplaceEvent;
  priceLabel: string;
  isKlemens: boolean;
  onContactClick: () => void;
}) {
  const ctaLabel = isKlemens ? "Satın Al" : "Kayıt Ol";

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white border-t border-warm-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            {/* Sol — başlık + fiyat */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-warm-900 truncate">{event.title}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-warm-900">{priceLabel}</span>
                {event.price > 0 && <span className="text-xs text-brand-warm">/ kişi</span>}
              </div>
            </div>

            {/* Sağ — butonlar */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onContactClick}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold border border-warm-300 text-warm-900 hover:bg-warm-50 transition-colors"
              >
                <MessageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Mesaj Gönder</span>
              </button>

              {event.organizer_url ? (
                <a
                  href={event.organizer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold bg-coral text-white hover:opacity-90 transition-opacity"
                >
                  {ctaLabel}
                  <ExternalLinkIcon />
                </a>
              ) : event.organizer_phone ? (
                <a
                  href={`tel:${event.organizer_phone}`}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold bg-coral text-white hover:opacity-90 transition-opacity"
                >
                  Ara &amp; {ctaLabel}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {/* Spacer */}
      <div className="h-20" />
    </>
  );
}
