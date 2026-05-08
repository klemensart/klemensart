import sharp from "sharp";
import crypto from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "article-images";
const FOLDER = "newsletter-compressed";
const TARGET_WIDTH = 600;
const JPEG_QUALITY = 75;
const MAX_ORIGINAL_SIZE = 500_000; // 500 KB

/**
 * Dış kaynaklı görseli indir, sıkıştır, Supabase Storage'a yükle.
 * Zaten küçükse veya zaten Supabase'deyse dokunmaz.
 * @returns Yeni (sıkıştırılmış) URL veya değişiklik yoksa null
 */
export async function compressAndUpload(
  imageUrl: string,
  itemId: string,
  admin: SupabaseClient,
): Promise<string | null> {
  // Zaten bizim storage'da → dokunma
  if (imageUrl.includes("supabase.co/storage")) return null;

  // Boş URL
  if (!imageUrl || imageUrl.length < 10) return null;

  try {
    // HEAD ile boyut kontrol — küçükse dokunma
    const head = await fetch(imageUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
    });
    const size = parseInt(head.headers.get("content-length") || "0");
    if (size > 0 && size <= MAX_ORIGINAL_SIZE) return null;

    // İndir
    const res = await fetch(imageUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());

    // Tekrar boyut kontrol (HEAD content-length yoksa)
    if (buf.length <= MAX_ORIGINAL_SIZE) return null;

    // Sıkıştır
    const compressed = await sharp(buf)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, progressive: true })
      .toBuffer();

    const hash = crypto
      .createHash("md5")
      .update(compressed)
      .digest("hex")
      .slice(0, 8);
    const filename = `${FOLDER}/${itemId}-${hash}.jpg`;

    // Yükle
    const { error } = await admin.storage
      .from(BUCKET)
      .upload(filename, compressed, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.warn(`[compress] Upload hatası (${itemId}):`, error.message);
      return null;
    }

    const { data } = admin.storage.from(BUCKET).getPublicUrl(filename);
    return data.publicUrl;
  } catch (e) {
    // Sessizce devam et — görsel sıkıştırma kritik değil
    console.warn(
      `[compress] ${itemId}:`,
      (e as Error).message?.slice(0, 100),
    );
    return null;
  }
}
