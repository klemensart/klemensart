import Link from "next/link";
import { ArrowRightIcon } from "@/lib/icons";
import { getAllArticlesMetadata } from "@/lib/markdown";
import ArticleCard from "@/components/ArticleCard";

export default async function SonYazilarSection() {
  const allArticles = await getAllArticlesMetadata();

  // Tarihe göre sıralı son 8 yazı
  const latest = [...allArticles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  if (latest.length === 0) return null;

  return (
    <section className="py-16 px-6 bg-warm-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-coral text-xs font-semibold tracking-widest uppercase mb-2">
              Yeni Çıktı
            </p>
            <h2 className="text-2xl font-bold text-warm-900">Son Yazılar</h2>
          </div>
          <Link
            href="/icerikler"
            className="text-sm font-semibold text-warm-900/40 hover:text-coral flex items-center gap-1.5 transition-colors"
          >
            Tümünü gör <ArrowRightIcon />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {latest.map((article, i) => (
            <ArticleCard
              key={article.slug}
              article={article}
              priority={i < 4}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
