/* ─── Birleşik XP/Yıldız Konfigürasyonu ─── */

export type XpAction =
  | "place_visit"
  | "route_complete"
  | "category_badge"
  | "milestone_25"
  | "milestone_50"
  | "milestone_100"
  | "workshop_complete"
  | "test_complete"
  | "article_read"
  | "comment_write"
  | "audio_listen"
  | "exhibition_visit"
  | "daily_streak";

export const XP_VALUES: Record<XpAction, number> = {
  place_visit: 1,
  route_complete: 3,
  category_badge: 2,
  milestone_25: 5,
  milestone_50: 5,
  milestone_100: 10,
  workshop_complete: 5,
  test_complete: 2,
  article_read: 1,
  comment_write: 1,
  audio_listen: 1,
  exhibition_visit: 2,
  daily_streak: 1,
};

// Ödül eşikleri (gelecek: kupon / indirim)
export const REWARD_THRESHOLDS = [
  { stars: 10, label: "İlk ödül" },
  { stars: 30, label: "Atölye indirimi" },
  { stars: 75, label: "Erken erişim" },
  { stars: 150, label: "VIP" },
];
