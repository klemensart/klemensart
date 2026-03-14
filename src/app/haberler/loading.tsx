export default function HaberlerLoading() {
  return (
    <main className="min-h-screen bg-warm-50 animate-pulse">
      {/* Hero */}
      <div className="bg-white pt-32 pb-12 px-6 border-b border-warm-100">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-3 w-16 bg-coral/20 rounded mx-auto mb-4" />
          <div className="h-12 w-2/3 bg-warm-200 rounded-lg mx-auto mb-4" />
          <div className="h-4 w-48 bg-warm-100 rounded mx-auto" />
        </div>
      </div>

      {/* News items */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-warm-100 p-5 flex gap-4"
          >
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-24 h-24 bg-warm-100 rounded-xl" />
            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-3 w-20 bg-warm-200 rounded" />
                <div className="h-3 w-16 bg-warm-100 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-warm-200 rounded" />
              <div className="h-3 w-full bg-warm-100 rounded" />
              <div className="h-3 w-2/3 bg-warm-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
