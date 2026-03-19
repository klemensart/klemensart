/**
 * Haftalık bülten slug hesaplama ve yardımcı fonksiyonlar
 */

const MONTH_NAMES = [
  "ocak", "subat", "mart", "nisan", "mayis", "haziran",
  "temmuz", "agustos", "eylul", "ekim", "kasim", "aralik",
];

const TR_MONTHS: Record<string, number> = Object.fromEntries(
  MONTH_NAMES.map((m, i) => [m, i]),
);

/**
 * Campaign created_at → SEO-friendly hafta slug'ı
 * Örnek: "16-mart-2026" (haftanın Pazartesi günü)
 */
export function campaignWeekSlug(createdAt: string | Date): string {
  const date = new Date(createdAt);
  const day = date.getDay(); // 0=Pazar
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const mon = new Date(date);
  mon.setDate(date.getDate() + mondayOffset);
  return `${mon.getDate()}-${MONTH_NAMES[mon.getMonth()]}-${mon.getFullYear()}`;
}

/**
 * Hafta slug'ından Pazartesi–Pazar tarih aralığı hesapla
 * Örnek: "16-mart-2026" → { start: "2026-03-16T...", end: "2026-03-23T..." }
 */
export function weekSlugToRange(slug: string): { start: string; end: string } | null {
  const parts = slug.split("-");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  const day = parseInt(d);
  const month = TR_MONTHS[m];
  const year = parseInt(y);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  const start = new Date(year, month, day, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Email HTML'den <body> içeriğini çıkar */
export function extractEmailBody(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}

/** HTML etiketlerini sıyırarak düz metin elde et */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Hafta slug'ından okunabilir tarih etiketi */
export function weekSlugToLabel(slug: string): string {
  const parts = slug.split("-");
  if (parts.length !== 3) return slug;
  const [d, m, y] = parts;
  const month = m.charAt(0).toUpperCase() + m.slice(1);
  return `${d} ${month} ${y} Haftası`;
}
