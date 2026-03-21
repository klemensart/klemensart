import type { Room } from "./types";

export const ROOMS: Room[] = [
  {
    id: 1,
    slug: "ana-salon",
    title: "Ana Salon",
    theme: "Ünlü Eserler",
    description:
      "Leonardo'nun en bilinen başyapıtlarının sergilendiği büyük salon. Duvarları dolduran tablolar, yüzyılların ötesinden size sesleniyor.",
    bgImage: "/images/leonardo/bg-salon.webp",
    multiplier: 1.0,
    questionIds: [0, 1, 2, 3, 4],
  },
  {
    id: 2,
    slug: "resim-odasi",
    title: "Resim Odası",
    theme: "Teknikler & Üslup",
    description:
      "Sfumato, chiaroscuro, perspektif... Leonardo'nun resim tekniklerinin incelendiği özel oda. Şövalelerde yarım kalmış eskizler duruyor.",
    bgImage: "/images/leonardo/bg-resim.webp",
    multiplier: 1.2,
    questionIds: [5, 6, 7, 8, 9],
  },
  {
    id: 3,
    slug: "heykel-atolyesi",
    title: "Heykel Atölyesi",
    theme: "Anatomi & Heykel",
    description:
      "Mermer tozuyla kaplı çalışma masaları, anatomi çizimleri ve Leonardo'nun hiç tamamlayamadığı dev atlı heykelin maketi.",
    bgImage: "/images/leonardo/bg-heykel.webp",
    multiplier: 1.5,
    questionIds: [10, 11, 12, 13, 14],
  },
  {
    id: 4,
    slug: "icat-odasi",
    title: "İcat Odası",
    theme: "Mühendislik & Bilim",
    description:
      "Uçan makineler, savaş araçları, köprü tasarımları... Leonardo'nun mühendislik dehası bu odada hayat buluyor.",
    bgImage: "/images/leonardo/bg-icat.webp",
    multiplier: 1.8,
    questionIds: [15, 16, 17, 18, 19],
  },
  {
    id: 5,
    slug: "kutuphane",
    title: "Kütüphane",
    theme: "Miras & Final",
    description:
      "Leonardo'nun defterlerinin, mektuplarının ve mirasının korunduğu kütüphane. Son ve en zorlu sınav sizi burada bekliyor.",
    bgImage: "/images/leonardo/bg-kutuphane.webp",
    multiplier: 2.0,
    questionIds: [20, 21, 22, 23, 24],
  },
];

export const ROOM_COUNT = ROOMS.length;
export const QUESTIONS_PER_ROOM = 5;
export const TOTAL_QUESTIONS = ROOM_COUNT * QUESTIONS_PER_ROOM;
