"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#FFFBF7" }}
    >
      <div className="max-w-md text-center">
        <p
          className="font-bold mb-4"
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#FF6D60",
          }}
        >
          Bir şeyler ters gitti
        </p>

        <h1
          className="font-bold mb-4"
          style={{ fontSize: "clamp(28px, 5vw, 42px)", color: "#2D2926", lineHeight: 1.15 }}
        >
          Beklenmedik Hata
        </h1>

        <p className="mb-10" style={{ fontSize: 15, lineHeight: 1.8, color: "#8C857E" }}>
          Üzgünüz, bir hata oluştu. Sayfayı yeniden yüklemeyi deneyin.
        </p>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#FF6D60" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Tekrar Dene
        </button>
      </div>
    </main>
  );
}
