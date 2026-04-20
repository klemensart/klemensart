/**
 * Telefon numarasını WhatsApp wa.me formatına normalize eder.
 * Türkiye numaraları için optimize edilmiştir.
 *
 * Örnekler:
 *  "0532 764 53 10"    → "905327645310"
 *  "+90 532 764 53 10" → "905327645310"
 *  "905327645310"      → "905327645310"
 *  "5327645310"        → "905327645310"
 *  "00905327645310"    → "905327645310"
 *  "" veya "abc"       → null
 */
export function normalizePhoneForWhatsApp(raw: string | null | undefined): string | null {
  if (!raw) return null;

  // Whitespace, tire, parantez, nokta, + kaldır
  let cleaned = raw.replace(/[\s\-().+]/g, "");

  // Sadece rakam değilse geçersiz
  if (!/^\d+$/.test(cleaned)) return null;

  // "00" uluslararası prefix kaldır
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }

  // "90" ile başlıyorsa tamam
  if (cleaned.startsWith("90") && cleaned.length >= 12) {
    return cleaned;
  }

  // "0" ile başlıyorsa (yerel format) → "0" kaldır, "90" ekle
  if (cleaned.startsWith("0")) {
    cleaned = "90" + cleaned.slice(1);
    return cleaned.length >= 12 ? cleaned : null;
  }

  // 10 haneli (alan kodu + numara, öneksiz) → "90" ekle
  if (cleaned.length === 10) {
    return "90" + cleaned;
  }

  // Zaten 12+ haneli ve "90" ile başlamıyor — beklenmedik format
  if (cleaned.length < 10) return null;

  return cleaned;
}
