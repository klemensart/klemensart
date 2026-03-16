export default function HaberDetayLoading() {
  return (
    <main className="min-h-screen bg-warm-50 animate-pulse">
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        {/* Back link */}
        <div className="h-4 w-24 bg-warm-200 rounded mb-8" />

        {/* Source badge */}
        <div className="h-6 w-20 bg-warm-100 rounded-full mb-4" />

        {/* Title */}
        <div className="h-9 w-full bg-warm-200 rounded-lg mb-2" />
        <div className="h-9 w-3/4 bg-warm-200 rounded-lg mb-4" />

        {/* Date */}
        <div className="h-4 w-36 bg-warm-100 rounded mb-8" />

        {/* Image */}
        <div className="h-56 md:h-72 bg-warm-100 rounded-2xl mb-8" />

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-warm-100 p-8 mb-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-warm-100 rounded"
              style={{ width: `${75 + Math.random() * 25}%` }}
            />
          ))}
        </div>

        {/* CTA button */}
        <div className="h-12 w-52 bg-warm-200 rounded-full mb-12" />

        {/* Related */}
        <div className="h-6 w-32 bg-warm-200 rounded mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-warm-100 p-4 flex gap-3">
              <div className="w-16 h-16 bg-warm-100 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full bg-warm-100 rounded" />
                <div className="h-3 w-24 bg-warm-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
