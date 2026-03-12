export default function MakaleLoading() {
  return (
    <main className="min-h-screen bg-warm-50 animate-pulse">
      {/* Article header */}
      <div className="bg-white pt-32 pb-12 px-6 border-b border-warm-100">
        <div className="max-w-3xl mx-auto">
          <div className="h-4 w-28 bg-warm-200 rounded mb-6" />
          <div className="h-4 w-24 bg-coral/20 rounded-full mb-5" />
          <div className="h-10 w-full bg-warm-200 rounded-lg mb-3" />
          <div className="h-10 w-2/3 bg-warm-200 rounded-lg mb-6" />
          <div className="flex items-center gap-4">
            <div className="h-3 w-32 bg-warm-100 rounded" />
            <div className="h-3 w-24 bg-warm-100 rounded" />
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="h-72 md:h-96 bg-warm-100 rounded-2xl" />
      </div>

      {/* Article content */}
      <div className="max-w-3xl mx-auto px-6 pb-20 space-y-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full bg-warm-100 rounded" />
            <div className="h-4 w-11/12 bg-warm-100 rounded" />
            <div className="h-4 w-4/5 bg-warm-100 rounded" />
          </div>
        ))}
      </div>

      {/* Related articles */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="h-6 w-40 bg-warm-200 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-warm-100">
              <div className="h-32 bg-warm-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-warm-200 rounded" />
                <div className="h-3 w-full bg-warm-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
