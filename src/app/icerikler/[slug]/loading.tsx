export default function KategoriLoading() {
  return (
    <main className="min-h-screen bg-warm-50 animate-pulse">
      {/* Category Hero */}
      <div className="bg-white pt-32 pb-16 px-6 border-b border-warm-100">
        <div className="max-w-6xl mx-auto">
          <div className="h-4 w-28 bg-warm-200 rounded mb-6" />
          <div className="h-8 w-40 bg-coral/20 rounded-full mb-5" />
          <div className="h-12 w-2/3 bg-warm-200 rounded-lg mb-4" />
          <div className="h-4 w-96 bg-warm-100 rounded mb-3" />
          <div className="h-3 w-32 bg-warm-100 rounded mb-8" />
          <div className="flex flex-wrap gap-3">
            {[90, 120, 100, 80].map((w, i) => (
              <div key={i} className="h-10 rounded-full bg-warm-200" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>

      {/* Articles grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-warm-100">
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
    </main>
  );
}
