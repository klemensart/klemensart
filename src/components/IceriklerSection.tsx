import Link from "next/link";
import { categories } from "@/lib/icerikler";
import { categoryStyles } from "@/lib/category-styles";
import { ArrowRightIcon } from "@/lib/icons";
import { getAllArticlesMetadata } from "@/lib/markdown";
import ArticleCard from "@/components/ArticleCard";

const categoryIcons: Record<string, React.ReactNode> = {
  "odak": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  ),
  "kultur-sanat": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  "ilham-verenler": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 1 0 5 5" />
      <path d="M22 22s-1.5-5-9-5-9 5-9 5" />
      <path d="M17 7h5M19 5v4" />
    </svg>
  ),
  "kent-yasam": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
};

export default async function IceriklerSection() {
  const allArticles = await getAllArticlesMetadata();
  const featured = allArticles.slice(0, 3);

  return (
    <section id="icerikler" className="py-24 px-6 bg-warm-50">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-4">İçeriklerimiz</p>
            <h2 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight">
              Keşfetmeye<br />başlayın
            </h2>
          </div>
          <p className="text-warm-900/50 text-sm max-w-xs leading-relaxed sm:text-right">
            Sanat, kültür ve düşünce dünyasına dört farklı kapıdan girin.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {categories.map((cat) => {
            const s = categoryStyles[cat.slug];
            return (
              <Link
                key={cat.slug}
                href={{ pathname: "/icerikler", query: { kategori: cat.title } }}
                className="group flex flex-col rounded-3xl bg-white border border-warm-100 overflow-hidden hover:border-warm-200 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-warm-900/[0.06] transition-all duration-300"
              >
                {/* Top accent stripe */}
                <div className={`h-1.5 flex-shrink-0 ${s.accentBg}`} />

                <div className="flex flex-col flex-1 p-7">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-2xl self-start mb-5 ${s.iconClass}`}>
                    {categoryIcons[cat.slug]}
                  </div>

                  <h3 className="text-lg font-bold text-warm-900 mb-2.5">{cat.title}</h3>
                  <p className="text-sm text-warm-900/55 leading-relaxed flex-1">{cat.description}</p>

                  {/* Link */}
                  <div className={`mt-6 flex items-center gap-1.5 text-sm font-semibold ${s.linkClass} group-hover:gap-3 transition-all duration-200`}>
                    Yazıları Gör
                    <ArrowRightIcon />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Featured articles */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-warm-900">Son Yazılar</h3>
            <Link
              href="/icerikler"
              className="text-sm font-semibold text-warm-900/40 hover:text-coral flex items-center gap-1.5 transition-colors"
            >
              Tümünü gör <ArrowRightIcon />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((article, i) => (
              <ArticleCard key={article.slug} article={article} priority={i < 3} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/icerikler"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-warm-900 text-white font-semibold rounded-full hover:bg-warm-900/85 active:scale-95 transition-all duration-200"
          >
            Tüm Yazıları Gör
            <ArrowRightIcon />
          </Link>
        </div>

      </div>
    </section>
  );
}
