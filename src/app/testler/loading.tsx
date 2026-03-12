export default function TestlerLoading() {
  return (
    <main className="min-h-screen bg-warm-50 animate-pulse">
      {/* Hero */}
      <div className="bg-white pt-32 pb-16 px-6 border-b border-warm-100">
        <div className="max-w-6xl mx-auto">
          <div className="h-6 w-32 bg-warm-200 rounded-full mb-5" />
          <div className="h-10 w-2/3 bg-warm-200 rounded-lg mb-4" />
          <div className="h-4 w-96 bg-warm-100 rounded" />
        </div>
      </div>

      {/* Section 1 */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="h-3 w-20 bg-coral/20 rounded mb-3" />
        <div className="h-7 w-64 bg-warm-200 rounded mb-3" />
        <div className="h-4 w-80 bg-warm-100 rounded mb-10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col p-7 rounded-3xl bg-white border border-warm-100">
              <div className="w-12 h-12 bg-warm-100 rounded-2xl mb-4" />
              <div className="h-5 w-16 bg-warm-200 rounded-full mb-3" />
              <div className="h-5 w-3/4 bg-warm-200 rounded mb-2" />
              <div className="h-3 w-full bg-warm-100 rounded mb-1" />
              <div className="h-3 w-2/3 bg-warm-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 */}
      <div className="bg-white border-t border-warm-100 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="h-3 w-20 bg-coral/20 rounded mb-3" />
          <div className="h-7 w-56 bg-warm-200 rounded mb-3" />
          <div className="h-4 w-72 bg-warm-100 rounded mb-10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col p-7 rounded-3xl bg-warm-50 border border-warm-100 opacity-50">
                <div className="w-12 h-12 bg-warm-200 rounded-2xl mb-4" />
                <div className="h-5 w-16 bg-warm-200 rounded-full mb-3" />
                <div className="h-5 w-3/4 bg-warm-200 rounded mb-2" />
                <div className="h-3 w-full bg-warm-100 rounded mb-1" />
                <div className="h-3 w-2/3 bg-warm-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
