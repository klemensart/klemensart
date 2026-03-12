export default function EtkinliklerLoading() {
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

      {/* Filter pills */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-center gap-2">
          {[60, 80, 70, 90, 100, 75, 85].map((w, i) => (
            <div key={i} className="h-9 rounded-full bg-warm-200" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Event items */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-warm-100 p-6 flex gap-5">
            {/* Date box */}
            <div className="flex-shrink-0 w-16 h-16 bg-warm-100 rounded-xl" />
            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-coral/20 rounded" />
              <div className="h-5 w-3/4 bg-warm-200 rounded" />
              <div className="flex gap-4">
                <div className="h-3 w-28 bg-warm-100 rounded" />
                <div className="h-3 w-20 bg-warm-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
