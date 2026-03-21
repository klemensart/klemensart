import type { Badge, AnswerResult, RoomSummary } from "./types";
import { ROOMS } from "./rooms";

const TIMER_SECONDS = 20;

/** Tek soru puanı: baz + hız bonusu × seri çarpanı × oda çarpanı */
export function calcPoints(
  timeLeft: number,
  streak: number,
  roomIndex: number,
): number {
  const base = 100 + timeLeft * 5; // 100-200
  const streakMul = streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1;
  const roomMul = ROOMS[roomIndex]?.multiplier ?? 1;
  return Math.round(base * streakMul * roomMul);
}

/** Max puan hesabı (bilgi amaçlı): ~5200 */
export const MAX_SCORE = (() => {
  let total = 0;
  let streak = 0;
  for (const room of ROOMS) {
    for (let i = 0; i < 5; i++) {
      streak++;
      total += calcPoints(TIMER_SECONDS, streak, ROOMS.indexOf(room));
    }
  }
  return total;
})();

export const TIMER = TIMER_SECONDS;

const BADGES: Badge[] = [
  { name: "Usta Çırak", emoji: "🎨", description: "Leonardo sizi atölyesine kabul etti!" },
  { name: "Sanat Bilgini", emoji: "🏛️", description: "Rönesans'ın sırlarını çözdünüz" },
  { name: "Meraklı Gezgin", emoji: "🔍", description: "Atölyeyi keşfetmeye devam edin" },
  { name: "Çaylak Öğrenci", emoji: "📚", description: "Leonardo sabırla eğitime devam edecek" },
  { name: "İlk Ziyaretçi", emoji: "🚪", description: "Atölyeye tekrar bekleniyorsunuz!" },
];

export function getBadge(score: number): Badge {
  if (score >= 4500) return BADGES[0];
  if (score >= 3500) return BADGES[1];
  if (score >= 2500) return BADGES[2];
  if (score >= 1500) return BADGES[3];
  return BADGES[4];
}

export function getRoomSummaries(results: AnswerResult[]): RoomSummary[] {
  return ROOMS.map((_, i) => {
    const roomResults = results.filter((r) => r.roomIndex === i);
    return {
      roomIndex: i,
      correct: roomResults.filter((r) => r.correct).length,
      total: roomResults.length,
      points: roomResults.reduce((s, r) => s + r.points, 0),
    };
  });
}

export function formatTime(seconds: number | null | undefined): string {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
