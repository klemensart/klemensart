export default function AtolyeDetayLoading() {
  return (
    <main className="min-h-screen bg-cream animate-pulse">
      {/* Header */}
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-4 w-28 bg-warm-200 rounded mb-6" />
          <div className="h-10 w-3/4 bg-warm-200 rounded-lg mb-4" />
          <div className="h-10 w-1/2 bg-warm-200 rounded-lg mb-6" />
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-24 bg-coral/20 rounded-full" />
            <div className="h-8 w-32 bg-warm-200 rounded-full" />
          </div>
          <div className="h-64 md:h-80 bg-warm-100 rounded-2xl mb-12" />

          {/* Description */}
          <div className="space-y-3 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-warm-100 rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
            ))}
          </div>

          {/* Sessions */}
          <div className="h-6 w-32 bg-warm-200 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-warm-100 p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-5 w-48 bg-warm-200 rounded mb-2" />
                    <div className="h-3 w-32 bg-warm-100 rounded" />
                  </div>
                  <div className="h-8 w-20 bg-warm-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
