export default function MekanLoading() {
  return (
    <div className="bg-warm-50 min-h-screen animate-pulse">
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        {/* Back link */}
        <div className="h-4 w-32 bg-warm-200 rounded mb-8" />

        {/* Badge */}
        <div className="h-6 w-20 bg-warm-200 rounded-full mb-4" />

        {/* Title */}
        <div className="h-10 w-3/4 bg-warm-200 rounded mb-6" />

        {/* Location */}
        <div className="h-4 w-24 bg-warm-200 rounded mb-8" />

        {/* Description card */}
        <div className="bg-white rounded-2xl border border-warm-100 p-8 mb-8">
          <div className="space-y-3">
            <div className="h-4 w-full bg-warm-100 rounded" />
            <div className="h-4 w-5/6 bg-warm-100 rounded" />
            <div className="h-4 w-2/3 bg-warm-100 rounded" />
          </div>
        </div>

        {/* CTA */}
        <div className="h-11 w-40 bg-warm-200 rounded-full mb-12" />

        {/* Related */}
        <div className="h-6 w-48 bg-warm-200 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-warm-100 p-5">
              <div className="h-4 w-16 bg-warm-100 rounded-full mb-2" />
              <div className="h-4 w-3/4 bg-warm-100 rounded mb-1" />
              <div className="h-3 w-full bg-warm-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
