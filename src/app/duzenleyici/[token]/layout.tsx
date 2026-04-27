import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Materyal Yükle — Klemens Marketplace",
  description: "Atölye materyallerinizi yükleyin.",
  robots: { index: false, follow: false },
};

export default function DuzenleyiciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Minimal header — sadece logo */}
      <header className="fixed top-0 inset-x-0 z-40 bg-cream/80 backdrop-blur-md border-b border-warm-200/60">
        <div className="max-w-3xl mx-auto flex items-center justify-center h-16 px-6">
          <Link href="/" aria-label="Klemens Ana Sayfa">
            <Image
              src="/logos/logo-wide-dark.PNG"
              alt="Klemens"
              width={100}
              height={30}
              priority
            />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="min-h-screen bg-cream pt-24 pb-16 px-4 sm:px-6">
        {children}
      </main>

      {/* Minimal footer */}
      <footer className="bg-cream border-t border-warm-200/60 py-6 px-6 text-center">
        <p className="text-xs text-warm-900/30">
          &copy; {new Date().getFullYear()} Klemens Art. Tüm hakları saklıdır.
        </p>
      </footer>
    </>
  );
}
