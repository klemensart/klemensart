// Bültendeki büyük görselleri indir, sıkıştır, geri yükle
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile, unlink } from "fs/promises";
import { execSync } from "child_process";
config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// 500KB üstü görseller (bucket/path formatında)
const images = [
  { bucket: "article-images", path: "esikte-bir-bekci/photo-1585773818647-8b6473cda135-1774290849291.jpg" },
  { bucket: "article-images", path: "corbada-bizim-de-tuzumuz-olsun-deniz-suyunu-aritmak/annie-spratt-O_Lyb6Et9Hw-unsplash-1773730846768.jpg" },
  { bucket: "article-images", path: "deniz-cekilir-tuz-kalir-kaunos-antik-kenti/1-Mustafa-Orhon--2018-1774024004833.jpg" },
  { bucket: "article-images", path: "tuzun-sessiz-kardesi/John_William_Edy_Alum_Mine_at_Egeberg-1774223890697.jpg" },
  { bucket: "article-images", path: "tuzla-yazilan-hafiza-motoi-yamamoto-nun-yas-ritueli/yamamoto-1774227327858.jpg" },
  { bucket: "article-images", path: "tiamat-canavarlastirlan-tanrica/Chaos_Monster_and_Sun_God-1773678974009.png" },
  { bucket: "article-images", path: "tuz-incil/1000021471-1776118748302.jpg" },
];

async function main() {
  for (const img of images) {
    const filename = img.path.split("/").pop()!;
    const ext = filename.endsWith(".png") ? "png" : "jpeg";
    const tmpIn = `/tmp/opt-in-${filename}`;
    const tmpOut = `/tmp/opt-out-${filename.replace(".png", ".jpg")}`;

    // Download
    const { data: url } = sb.storage.from(img.bucket).getPublicUrl(img.path);
    const res = await fetch(url.publicUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(tmpIn, buf);
    const origKB = (buf.length / 1024).toFixed(0);

    // Resize & compress with sips
    try {
      execSync(`sips -Z 1200 "${tmpIn}" -s format jpeg -s formatOptions 75 --out "${tmpOut}" 2>/dev/null`);
    } catch {
      console.error(`  SIPS hata: ${filename}`);
      continue;
    }

    const optimized = await readFile(tmpOut);
    const newKB = (optimized.length / 1024).toFixed(0);

    // Upload (overwrite)
    const uploadPath = ext === "png" ? img.path.replace(".png", ".png") : img.path;
    const { error } = await sb.storage.from(img.bucket).update(uploadPath, optimized, {
      contentType: "image/jpeg",
      upsert: true,
    });

    if (error) {
      console.error(`  UPLOAD HATA [${filename}]: ${error.message}`);
    } else {
      console.log(`${origKB.padStart(5)} KB → ${newKB.padStart(4)} KB | ${filename}`);
    }

    // Cleanup
    await unlink(tmpIn).catch(() => {});
    await unlink(tmpOut).catch(() => {});
  }
}
main();
