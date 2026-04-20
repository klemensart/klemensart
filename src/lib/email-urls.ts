/**
 * Email'lere gömülen URL'ler için production base URL.
 *
 * Email bir kez gönderilir, kullanıcı günler sonra tıklayabilir.
 * Bu yüzden localhost veya preview URL'ler email'lerde kullanılmamalı.
 */
export function getEmailBaseUrl(): string {
  return process.env.NEXT_PUBLIC_PRODUCTION_URL || "https://klemensart.com";
}
