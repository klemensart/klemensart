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

function CTAButtonMobile({ event }: { event: MarketplaceEvent }) {
  const cls = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm bg-coral transition-opacity hover:opacity-90";

  if (event.organizer_url) {
    return (
      <a href={event.organizer_url} target="_blank" rel="noopener noreferrer" className={cls}>
        Kayıt Ol
        <ExternalLinkIcon />
      </a>
    );
  }
  if (event.organizer_phone) {
    return (
      <a href={`tel:${event.organizer_phone}`} className={cls}>
        Ara &amp; Kayıt Ol
      </a>
    );
  }
  return null;
}

export default function MobileStickyBar({
  event,
  priceLabel,
}: {
  event: MarketplaceEvent;
  priceLabel: string;
}) {
  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-white border-t border-warm-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-brand-warm truncate">{event.title}</div>
              <span className="text-lg font-bold text-warm-900">{priceLabel}</span>
            </div>
            <div className="flex-shrink-0">
              <CTAButtonMobile event={event} />
            </div>
          </div>
        </div>
      </div>
      {/* Mobile bar spacer */}
      <div className="md:hidden h-16" />
    </>
  );
}
