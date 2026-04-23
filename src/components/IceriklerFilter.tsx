"use client";

import Link from "next/link";
import { categories } from "@/lib/icerikler";
import { categoryStyles } from "@/lib/category-styles";

export default function IceriklerFilter({ aktifKategori }: { aktifKategori: string }) {
  return (
    <div className="bg-white px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-3 pt-8" role="group" aria-label="Kategori filtreleri">
          <Link
            href="/icerikler"
            scroll={false}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-150 ${
              !aktifKategori
                ? "bg-warm-900 border-warm-900 text-white"
                : "bg-warm-50 border-warm-200 text-warm-900/60 hover:border-warm-900/40 hover:text-warm-900"
            }`}
          >
            Tümü
          </Link>
          {categories.map((cat) => {
            const isActive = aktifKategori === cat.title;
            const cs = categoryStyles[cat.slug];
            return (
              <Link
                key={cat.slug}
                href={`/icerikler?kategori=${encodeURIComponent(cat.title)}`}
                scroll={false}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-150 ${
                  isActive
                    ? cs.filterActive
                    : `bg-warm-50 border-warm-200 text-warm-900/60 ${cs.filterInactive}`
                }`}
              >
                {cat.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
