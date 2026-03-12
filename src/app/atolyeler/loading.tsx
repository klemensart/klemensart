export default function AtolyelerLoading() {
  return (
    <main className="min-h-screen bg-warm-50/30 animate-pulse">
      {/* Hero */}
      <div className="bg-white pt-32 pb-16 px-6 border-b border-warm-100">
        <div className="max-w-6xl mx-auto">
          <div className="h-3 w-24 bg-coral/20 rounded mb-4" />
          <div className="h-12 w-2/3 bg-warm-200 rounded-lg mb-4" />
          <div className="h-4 w-96 bg-warm-100 rounded" />
        </div>
      </div>

      {/* Workshop series */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="h-6 w-40 bg-warm-200 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-warm-100">
              <div className="h-56 bg-warm-100" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-24 bg-coral/20 rounded" />
                <div className="h-6 w-3/4 bg-warm-200 rounded" />
                <div className="h-3 w-full bg-warm-100 rounded" />
                <div className="h-3 w-2/3 bg-warm-100 rounded" />
                <div className="flex justify-between items-center pt-3">
                  <div className="h-5 w-20 bg-warm-200 rounded" />
                  <div className="h-9 w-28 bg-warm-200 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
