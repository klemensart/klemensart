/**
 * Turkey timezone helpers — tüm tarihler Europe/Istanbul olarak gösterilir.
 */

const TZ = "Europe/Istanbul";
const TURKEY_OFFSET = "+03:00";

/** datetime-local input'tan gelen "2026-04-24T19:00" → UTC ISO string */
export function toTurkeyISO(datetimeLocal: string): string {
  return new Date(datetimeLocal + TURKEY_OFFSET).toISOString();
}

/** UTC ISO string → datetime-local input formatı (Turkey time) */
export function fromUTCToTurkeyLocal(isoString: string): string {
  const d = new Date(isoString);
  // Intl ile Turkey time'ın parçalarını al
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Tam tarih+saat formatı: "24 Nisan 2026 Cumartesi, 19:00" */
export function formatTurkeyDateTime(isoString: string): string {
  return new Date(isoString).toLocaleDateString("tr-TR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Multi-day range: "24 Nisan", "24–25 Nisan", "28 Nisan – 2 Mayıs" */
export function formatDateRange(
  eventDate: string,
  endDate?: string | null
): string {
  const opts = { timeZone: TZ } as const;
  const start = new Date(eventDate);

  const startDay = start.toLocaleDateString("tr-TR", { ...opts, day: "numeric" });
  const startMonth = start.toLocaleDateString("tr-TR", { ...opts, month: "long" });
  const startYear = start.toLocaleDateString("tr-TR", { ...opts, year: "numeric" });

  if (!endDate) {
    return `${startDay} ${startMonth} ${startYear}`;
  }

  const end = new Date(endDate);
  const endDay = end.toLocaleDateString("tr-TR", { ...opts, day: "numeric" });
  const endMonth = end.toLocaleDateString("tr-TR", { ...opts, month: "long" });

  const sameDay = startDay === endDay && startMonth === endMonth;
  if (sameDay) return `${startDay} ${startMonth} ${startYear}`;

  if (startMonth === endMonth) {
    return `${startDay}–${endDay} ${startMonth} ${startYear}`;
  }

  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
}

/** Turkey time saat: "19:00" */
export function formatTurkeyTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("tr-TR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** DateBadge için: Turkey time'da gün ve ay index'i */
export function getTurkeyDateParts(isoString: string): { day: number; month: number } {
  const d = new Date(isoString);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    day: "numeric",
    month: "numeric",
  }).formatToParts(d);

  const day = Number(parts.find((p) => p.type === "day")?.value ?? 1);
  const month = Number(parts.find((p) => p.type === "month")?.value ?? 1) - 1;
  return { day, month };
}
