// Atölye slug → Supabase ID + fiyat + görsel eşlemesi
// Fiyatlar kuruş cinsindendir (150000 = 1500 TL)

export type AtolyeConfig = {
  id: string;
  price: number;
  forSale: boolean;
  imgCover: string;   // hero bölümü (yatay)
  imgSquare: string;  // katalog kartı (4:3)
  targetDate?: string; // ISO tarih — geri sayım için
};

export const SLUG_TO_ATOLYE: Record<string, AtolyeConfig> = {
  "sanat-tarihinde-duygular": {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    price: 150000,
    forSale: false,
    imgCover: "/images/workshops/sanat-tarihinde-duygular-cover.webp",
    imgSquare: "/images/workshops/sanat-tarihinde-duygular-square.webp",
    targetDate: "2026-03-10T20:30:00+03:00",
  },
  "modern-sanat-atolyesi": {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    price: 600000,
    forSale: true,
    imgCover: "/images/workshops/modern-sanat-atolyesi-cover.webp",
    imgSquare: "/images/workshops/modern-sanat-atolyesi-square.webp",
    targetDate: "2026-03-25T20:30:00+03:00",
  },
  "ronesans-okuryazarligi": {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    price: 0,
    forSale: false,
    imgCover: "/images/workshops/ronesans-atolyesi-cover.webp",
    imgSquare: "/images/workshops/ronesans-atolyesi-square.webp",
    targetDate: "2025-12-11T20:30:00+03:00",
  },
  "kapsamli-sanat-tarihi": {
    id: "75468e8b-5de7-4f69-95f2-c8132778cf6a",
    price: 600000,
    forSale: false,
    imgCover: "/images/workshops/kapsamli-sanat-tarihi-cover.webp",
    imgSquare: "/images/workshops/kapsamli-sanat-tarihi-kart.webp",
    targetDate: "2026-01-28T20:30:00+03:00",
  },
};

// Reverse: workshopId → slug
export const ID_TO_SLUG = Object.entries(SLUG_TO_ATOLYE).reduce(
  (acc, [slug, cfg]) => {
    acc[cfg.id] = slug;
    return acc;
  },
  {} as Record<string, string>
);

export function formatPrice(kurus: number): string {
  return (
    (kurus / 100).toLocaleString("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + " TL"
  );
}
