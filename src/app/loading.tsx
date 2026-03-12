export default function Loading() {
  return (
    <div className="min-h-screen bg-warm-50 animate-pulse">
      {/* Hero */}
      <div className="bg-white pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-4 w-32 bg-warm-200 rounded mb-6" />
          <div className="h-14 w-3/4 bg-warm-200 rounded-lg mb-4" />
          <div className="h-5 w-1/2 bg-warm-100 rounded" />
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-6 w-48 bg-warm-200 rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((j) => (
                <div key={j} className="bg-white rounded-2xl overflow-hidden border border-warm-100">
                  <div className="h-48 bg-warm-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-20 bg-warm-100 rounded" />
                    <div className="h-5 w-3/4 bg-warm-200 rounded" />
                    <div className="h-3 w-full bg-warm-100 rounded" />
                    <div className="h-3 w-2/3 bg-warm-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
