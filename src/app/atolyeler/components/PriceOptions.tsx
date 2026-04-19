type Option = { label: string; price: number; note?: string };

export default function PriceOptions({ options }: { options: Option[] }) {
  return (
    <div className="rounded-xl overflow-hidden border border-warm-100">
      <div className="bg-warm-900 text-white px-5 py-3 text-sm font-semibold">
        Katılım Seçenekleri
      </div>
      <div className="divide-y divide-warm-100">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 bg-white">
            <div>
              <p className="text-sm font-semibold text-warm-900">{opt.label}</p>
              {opt.note && <p className="text-xs text-warm-900/50 mt-0.5">{opt.note}</p>}
            </div>
            <span className="text-coral font-bold text-lg">{opt.price} TL</span>
          </div>
        ))}
      </div>
    </div>
  );
}
