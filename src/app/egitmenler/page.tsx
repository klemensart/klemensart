import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllHostsWithStats } from "@/lib/people";

export const metadata: Metadata = {
  title: "Eğitmenler",
  description:
    "Klemens'te atölye düzenleyen kültür-sanat eğitmenleri ve düzenleyiciler.",
};

function getInitials(name: string) {
  const words = name.split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default async function EgitmenlerPage() {
  const hosts = await getAllHostsWithStats();
  const totalUpcoming = hosts.reduce((s, h) => s + h.upcoming, 0);

  return (
    <>
      <Navbar solid />

      <main className="bg-cream min-h-screen">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-28 pb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-warm-900 mb-3">
            Eğitmenler
          </h1>
          <p className="text-brand-warm text-[15px] max-w-lg mx-auto leading-relaxed">
            Klemens&apos;te atölye düzenleyen tüm eğitmenler. Bağımsız
            düzenleyiciler ve Klemens editöryal ekibi bir arada.
          </p>
          <p className="mt-4 text-sm text-warm-900/40">
            {hosts.length} eğitmen · {totalUpcoming} aktif atölye
          </p>
        </section>

        {/* Grid */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          {hosts.length === 0 ? (
            <p className="text-center text-warm-900/40 py-20">
              Henüz eğitmen yok. Klemens kalite kriterlerine uygun eğitmenler
              eklendikçe burada görünecek.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hosts.map((host) => (
                <Link
                  key={host.id}
                  href={`/egitmenler/${host.slug}`}
                  className="group block"
                >
                  <article className="bg-white rounded-2xl border border-warm-100 p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-4">
                      {host.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={host.avatar_url}
                          alt={host.name}
                          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-coral flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {getInitials(host.name)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-warm-900 truncate group-hover:text-coral transition-colors">
                          {host.name}
                        </h2>
                        {host.short_bio && (
                          <p className="text-sm text-warm-900/50 line-clamp-2 leading-snug mt-0.5">
                            {host.short_bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expertise chips */}
                    {host.expertise && host.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {host.expertise.map((e) => (
                          <span
                            key={e}
                            className="px-2 py-0.5 text-[11px] font-medium bg-warm-100 text-warm-900/60 rounded-full"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <p className="text-xs text-warm-900/40">
                      {host.upcoming > 0
                        ? `${host.upcoming} yaklaşan atölye`
                        : ""}
                      {host.upcoming > 0 && host.past > 0 ? " · " : ""}
                      {host.past > 0 ? `${host.past} geçmiş atölye` : ""}
                      {host.upcoming === 0 && host.past === 0
                        ? "Henüz atölye yok"
                        : ""}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
