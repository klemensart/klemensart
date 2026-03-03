"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { categories } from "@/lib/icerikler";
import ArticleCard from "@/components/ArticleCard";
import type { ArticleMeta } from "@/lib/markdown";

const categoryAccent: Record<string, { active: string; inactive: string }> = {
  "odak":           { active: "bg-coral border-coral text-white",           inactive: "hover:border-coral hover:text-coral" },
  "kultur-sanat":   { active: "bg-amber-400 border-amber-400 text-white",   inactive: "hover:border-amber-400 hover:text-amber-600" },
  "ilham-verenler": { active: "bg-sky-400 border-sky-400 text-white",       inactive: "hover:border-sky-400 hover:text-sky-600" },
  "kent-yasam":     { active: "bg-emerald-500 border-emerald-500 text-white", inactive: "hover:border-emerald-500 hover:text-emerald-600" },
};

export default function IceriklerClient({ articles }: { articles: ArticleMeta[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const aktifKategori = searchParams.get("kategori") ?? "";

  const filteredArticles = aktifKategori
    ? articles.filter((a) => a.category === aktifKategori)
    : articles;

  const setKategori = (title: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!title) {
      params.delete("kategori");
    } else {
      params.set("kategori", title);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <>
      {/* Filter pills — white hero bölümünün devamı */}
      <div className="bg-white px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 pt-8">
            <button
              onClick={() => setKategori("")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-150 ${
                !aktifKategori
                  ? "bg-warm-900 border-warm-900 text-white"
                  : "bg-warm-50 border-warm-200 text-warm-900/60 hover:border-warm-900/40 hover:text-warm-900"
              }`}
            >
              Tümü
            </button>
            {categories.map((cat) => {
              const isActive = aktifKategori === cat.title;
              const accent = categoryAccent[cat.slug];
              return (
                <button
                  key={cat.slug}
                  onClick={() => setKategori(cat.title)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-150 ${
                    isActive
                      ? accent.active
                      : `bg-warm-50 border-warm-200 text-warm-900/60 ${accent.inactive}`
                  }`}
                >
                  {cat.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Articles grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {filteredArticles.length === 0 ? (
            <p className="text-warm-900/40 text-sm text-center py-16">
              Bu kategoride henüz yazı bulunmuyor.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
