export default function HaritaLoading() {
  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#1a1a2e] animate-pulse">
      {/* Map background */}
      <div className="absolute inset-0 bg-[#1a1a2e]" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-14">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-full" />
            <div className="h-5 w-32 bg-white/10 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-white/10 rounded-full" />
            <div className="h-9 w-20 bg-white/10 rounded-full" />
            <div className="w-9 h-9 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="absolute top-28 left-0 right-0 z-10 px-4">
        <div className="flex gap-3 overflow-hidden">
          {[70, 60, 80, 65, 90, 55, 70, 50].map((w, i) => (
            <div key={i} className="h-8 rounded-full bg-white/10 flex-shrink-0" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Fake map markers */}
      <div className="absolute top-1/3 left-1/4 w-8 h-10 bg-[#4A9EFF]/30 rounded-full" />
      <div className="absolute top-1/2 left-1/2 w-8 h-10 bg-[#FF6D60]/30 rounded-full" />
      <div className="absolute top-2/5 right-1/4 w-8 h-10 bg-[#9B6BB0]/30 rounded-full" />
      <div className="absolute bottom-1/3 left-1/3 w-8 h-10 bg-[#4CAF50]/30 rounded-full" />
      <div className="absolute top-1/4 right-1/3 w-8 h-10 bg-[#FFB300]/30 rounded-full" />

      {/* Locate button */}
      <div className="absolute bottom-24 left-4 z-10">
        <div className="w-11 h-11 bg-white/10 rounded-full" />
      </div>
    </div>
  );
}
