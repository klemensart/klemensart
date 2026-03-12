export default function HakkimizdaLoading() {
  return (
    <main className="min-h-screen bg-warm-50 animate-pulse">
      {/* Hero */}
      <div className="bg-white pt-32 pb-16 px-6 border-b border-warm-100">
        <div className="max-w-6xl mx-auto">
          <div className="h-3 w-24 bg-coral/20 rounded mb-4" />
          <div className="h-12 w-2/3 bg-warm-200 rounded-lg mb-4" />
          <div className="h-4 w-96 bg-warm-100 rounded" />
        </div>
      </div>

      {/* Team visualization placeholder */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="relative h-[400px] md:h-[540px] bg-warm-100/50 rounded-3xl flex items-center justify-center">
          {/* Center circle */}
          <div className="w-28 h-28 bg-warm-200 rounded-full" />
          {/* Surrounding circles */}
          <div className="absolute top-16 left-1/4 w-20 h-20 bg-warm-200 rounded-full" />
          <div className="absolute top-20 right-1/4 w-20 h-20 bg-warm-200 rounded-full" />
          <div className="absolute bottom-24 left-1/3 w-20 h-20 bg-warm-200 rounded-full" />
          <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-warm-200 rounded-full" />
          <div className="absolute top-1/2 right-16 w-20 h-20 bg-warm-200 rounded-full" />
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="h-6 w-40 bg-warm-200 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-warm-100 p-6 space-y-3">
              <div className="h-5 w-3/4 bg-warm-200 rounded" />
              <div className="h-3 w-full bg-warm-100 rounded" />
              <div className="h-3 w-2/3 bg-warm-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
