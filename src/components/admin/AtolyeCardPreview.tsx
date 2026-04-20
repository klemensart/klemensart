"use client";

import { memo } from "react";
import { getTurkeyDateParts } from "@/lib/dates";

const MONTHS = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];

/** Strip markdown formatting → plain text, truncate to maxLen */
function stripMd(md: string, maxLen = 100): string {
  const plain = md
    .replace(/!\[.*?\]\(.*?\)/g, "")       // images
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1") // links → text
    .replace(/#{1,6}\s+/g, "")             // headings
    .replace(/(\*\*|__)(.*?)\1/g, "$2")    // bold
    .replace(/(\*|_)(.*?)\1/g, "$2")       // italic
    .replace(/~~(.*?)~~/g, "$1")           // strikethrough
    .replace(/`([^`]*)`/g, "$1")           // inline code
    .replace(/^[-*+]\s+/gm, "")           // list items
    .replace(/^\d+\.\s+/gm, "")           // ordered list
    .replace(/^>\s+/gm, "")               // blockquote
    .replace(/---+/g, "")                  // hr
    .replace(/\n+/g, " ")                  // newlines → space
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "..." : plain;
}

const CATEGORY_LABELS: Record<string, string> = {
  resim: "Resim", seramik: "Seramik", fotograf: "Fotoğraf", muzik: "Müzik",
  heykel: "Heykel", dijital: "Dijital Sanat", yazarlik: "Yazarlık",
  dans: "Dans", tiyatro: "Tiyatro", diger: "Diğer",
  "sanat-tarihi": "Sanat Tarihi", sinema: "Sinema",
};

type PreviewData = {
  title: string;
  category: string;
  city: string;
  district: string;
  price: number;
  image_url: string;
  event_date: string;
  is_featured: boolean;
  is_klemens: boolean;
  organizer_name: string;
  organizer_logo_url: string;
  venue_name: string;
  duration_note: string;
  description?: string;
};

function AtolyeCardPreview({ data }: { data: PreviewData }) {
  const dateParts = data.event_date ? getTurkeyDateParts(data.event_date) : null;
  const priceText = data.price === 0 ? "Ücretsiz" : `${data.price.toLocaleString("tr-TR")} TL`;

  return (
    <div className="sticky top-20">
      <p className="text-xs font-medium text-warm-900/40 mb-3 uppercase tracking-wide">Canlı Önizleme</p>

      {/* Card */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
        {/* Image */}
        {data.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.image_url}
            alt={data.title || "Atölye"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-warm-200 to-warm-300 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-warm-900/10">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/20 backdrop-blur-sm text-white rounded-full uppercase tracking-wide">
            {CATEGORY_LABELS[data.category] ?? (data.category || "Kategori")}
          </span>
          {data.is_klemens && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-coral text-white rounded-full uppercase tracking-wide">
              Klemens
            </span>
          )}
          {data.is_featured && !data.is_klemens && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-coral text-white rounded-full uppercase tracking-wide">
              Öne Çıkan
            </span>
          )}
        </div>

        {/* Top right — date badge */}
        {dateParts && (
          <div className="absolute top-3 right-3">
            <div className="flex flex-col items-center justify-center bg-coral text-white rounded-lg leading-none min-w-[44px] px-2 py-1.5">
              <span className="font-semibold uppercase tracking-wide text-[10px]">
                {MONTHS[dateParts.month]}
              </span>
              <span className="font-bold text-lg">{dateParts.day}</span>
            </div>
          </div>
        )}

        {/* Organizer avatar */}
        {data.organizer_logo_url && (
          <div className="absolute right-4 bottom-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.organizer_logo_url}
              alt={data.organizer_name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white/30 shadow-lg"
            />
          </div>
        )}

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-base font-bold text-white line-clamp-2 mb-1">
            {data.title || "Atölye başlığı"}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {data.organizer_name && (
                <>
                  <span className="text-xs font-medium text-white/80 truncate">
                    {data.organizer_name}
                  </span>
                  <span className="text-white/30 text-xs">·</span>
                </>
              )}
              <p className="flex items-center gap-1 text-xs text-white/60 flex-shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {data.district ? `${data.district}, ${data.city}` : data.city || "Şehir"}
              </p>
            </div>
            {data.price === 0 ? (
              <span className="text-xs font-semibold text-emerald-400 flex-shrink-0">Ücretsiz</span>
            ) : (
              <span className="text-sm font-bold text-white flex-shrink-0">{priceText}</span>
            )}
          </div>
        </div>
      </div>

      {/* Info below card */}
      <div className="mt-4 space-y-2 text-xs text-warm-900/40">
        {data.description && (
          <p className="line-clamp-2">{stripMd(data.description)}</p>
        )}
        {data.venue_name && (
          <p>Mekan: {data.venue_name}</p>
        )}
        {data.duration_note && (
          <p>Süre: {data.duration_note}</p>
        )}
        {!data.title && (
          <p className="italic">Formu doldurdukça önizleme güncellenecek.</p>
        )}
      </div>
    </div>
  );
}

export default memo(AtolyeCardPreview);
