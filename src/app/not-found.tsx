import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı",
  description:
    "Aradığınız sayfa taşınmış, kaldırılmış veya hiç var olmamış olabilir.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
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
          404
        </p>

        <h1
          className="font-bold mb-4"
          style={{ fontSize: "clamp(28px, 5vw, 42px)", color: "#2D2926", lineHeight: 1.15 }}
        >
          Sayfa Bulunamadı
        </h1>

        <p className="mb-10" style={{ fontSize: 15, lineHeight: 1.8, color: "#8C857E" }}>
          Aradığınız sayfa taşınmış, kaldırılmış veya hiç var olmamış olabilir.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#FF6D60" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Ana Sayfa
          </Link>
          <Link
            href="/icerikler"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold border transition-colors hover:border-[#FF6D60] hover:text-[#FF6D60]"
            style={{ borderColor: "#e8e2dc", color: "#8C857E" }}
          >
            İçeriklere Göz At
          </Link>
        </div>
      </div>
    </main>
  );
}
