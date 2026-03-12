export default function EtkinlikDetayLoading() {
  return (
    <main className="min-h-screen bg-warm-50 animate-pulse">
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        {/* Back link */}
        <div className="h-4 w-20 bg-warm-200 rounded mb-8" />

        {/* Type badge */}
        <div className="h-7 w-24 bg-coral/20 rounded-full mb-5" />

        {/* Title */}
        <div className="h-10 w-full bg-warm-200 rounded-lg mb-3" />
        <div className="h-10 w-2/3 bg-warm-200 rounded-lg mb-6" />

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
          <div className="h-4 w-32 bg-warm-100 rounded" />
          <div className="h-4 w-28 bg-warm-100 rounded" />
          <div className="h-4 w-20 bg-warm-100 rounded" />
        </div>

        {/* Event image */}
        <div className="h-64 md:h-80 bg-warm-100 rounded-2xl mb-8" />

        {/* Description */}
        <div className="bg-white rounded-2xl border border-warm-100 p-8 mb-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-warm-100 rounded" style={{ width: `${80 + Math.random() * 20}%` }} />
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3">
          <div className="h-12 w-36 bg-warm-200 rounded-full" />
          <div className="h-12 w-36 bg-warm-100 rounded-full" />
        </div>
      </div>
    </main>
  );
}
