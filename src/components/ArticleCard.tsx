import Link from "next/link";
import type { ArticleMeta } from "@/lib/markdown";

// Kategori adına göre placeholder gradient
const categoryGradient: Record<string, string> = {
  "Odak":                  "from-[#3b0a1a] via-[#6b1a2e] to-[#9d2a45]",
  "Kültür & Sanat":        "from-[#7c4a03] via-[#b8720a] to-[#e8a030]",
  "İlham Verenler":        "from-[#0a3d2e] via-[#1a6b4a] to-[#2d9e72]",
  "Kent & Yaşam":          "from-[#0d1f3c] via-[#1a3a6b] to-[#2a5fa8]",
  "Psikoloji & Sosyoloji": "from-[#2d0a4e] via-[#5a1a8a] to-[#8b4fc4]",
  "Felsefe":               "from-[#1a1a2e] via-[#2d2d5a] to-[#4a4a8a]",
};

const defaultGradient = "from-[#3d1f0a] via-[#6b3a1a] to-[#c47a3a]";

export default function ArticleCard({ article }: { article: ArticleMeta }) {
  const gradient = categoryGradient[article.category] ?? defaultGradient;
  const hasImage = article.image && article.image.trim() !== "";

  return (
    <article className="group flex flex-col rounded-3xl bg-white border border-warm-100 overflow-hidden hover:border-warm-200 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-warm-900/[0.07] transition-all duration-300">

      {/* ── Görsel alanı ── */}
      <div className="relative h-[200px] overflow-hidden flex-shrink-0">
        {hasImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}

        {/* Alt gradient overlay — okunabilirlik için */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* Kategori badge — görsel üzerinde */}
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-black/30 backdrop-blur-sm text-white/90 border border-white/15">
          {article.category}
        </span>
      </div>

      {/* ── İçerik alanı ── */}
      <div className="flex flex-col flex-1 p-6">
        {/* Başlık */}
        <h3 className="text-base font-bold text-warm-900 leading-snug mb-2.5 line-clamp-2 group-hover:text-coral transition-colors duration-200">
          {article.title}
        </h3>

        {/* Özet */}
        <p className="text-sm text-warm-900/50 leading-relaxed line-clamp-2 flex-1">
          {article.description}
        </p>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-warm-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium flex-wrap">
            <span className="text-warm-900/70 font-semibold">{article.author}</span>
            <span className="text-warm-900/25">·</span>
            <span className="text-warm-900/35">{article.date}</span>
            <span className="text-warm-900/25">·</span>
            <span className="text-warm-900/35">{article.readTime}</span>
          </div>
          <Link
            href={`/icerikler/yazi/${article.slug}`}
            className="flex items-center gap-1 text-xs font-semibold text-coral hover:gap-2 transition-all duration-150"
          >
            Devamını Oku
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

    </article>
  );
}
