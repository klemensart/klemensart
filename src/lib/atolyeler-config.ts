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
    targetDate: "2026-04-08T20:30:00+03:00",
  },
  "ronesans-okuryazarligi": {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    price: 0,
    forSale: false,
    imgCover: "/images/workshops/ronesans-atolyesi-cover.webp",
    imgSquare: "/images/workshops/ronesans-atolyesi-square.webp",
    targetDate: "2025-12-11T20:30:00+03:00",
  },
  "ronesans-okuryazarligi-2": {
    id: "019ef1b5-08a1-4fb0-a794-34d52fa4060b",
    price: 450000,
    forSale: false,
    imgCover: "/images/workshops/ronesans-atolyesi-cover.webp",
    imgSquare: "/images/workshops/ronesans-atolyesi-square.webp",
    targetDate: "2026-05-11T20:30:00+03:00",
  },
  "kapsamli-sanat-tarihi": {
    id: "75468e8b-5de7-4f69-95f2-c8132778cf6a",
    price: 600000,
    forSale: true,
    imgCover: "/images/workshops/kapsamli-sanat-tarihi-cover.webp",
    imgSquare: "/images/workshops/kapsamli-sanat-tarihi-kart.webp",
    targetDate: "2026-05-07T20:30:00+03:00",
  },

  "leonardo-da-vinci-semineri": {
    id: "d5e6f7a8-b9c0-1234-defa-567890123456",
    price: 60000,
    forSale: true,
    imgCover: "/images/workshops/leonardo-da-vinci-cover.webp",
    imgSquare: "/images/workshops/leonardo-da-vinci-square.webp",
    targetDate: "2026-04-01T20:30:00+03:00",
  },

  /* ─── Sinema Kulübü ──────────────────────────── */
  "sinema-klubu-tekli": {
    id: "a1e2f3d4-5b6c-4d7e-8f9a-0b1c2d3e4f5a",
    price: 40000,
    forSale: true,
    imgCover: "",
    imgSquare: "",
  },
  "sinema-klubu-tekli-ogrenci": {
    id: "b2f3a4e5-6c7d-4e8f-9a0b-1c2d3e4f5a6b",
    price: 15000,
    forSale: true,
    imgCover: "",
    imgSquare: "",
  },
  "sinema-klubu-yillik": {
    id: "c3a4b5f6-7d8e-4f9a-0b1c-2d3e4f5a6b7c",
    price: 360000,
    forSale: true,
    imgCover: "",
    imgSquare: "",
  },
  "sinema-klubu-yillik-ogrenci": {
    id: "d4b5c6a7-8e9f-4a0b-1c2d-3e4f5a6b7c8d",
    price: 135000,
    forSale: true,
    imgCover: "",
    imgSquare: "",
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
