/**
 * Cansu Kul — Instagram Carousel Post
 * 1) /tmp/cansu-ig/ dosyalarını Supabase Storage'a yükle
 * 2) Instagram Graph API ile carousel container oluştur
 * 3) Publish (onay sonrası)
 *
 * Kullanım:
 *   npx tsx scripts/cansu-carousel.ts upload     → Supabase'e yükle
 *   npx tsx scripts/cansu-carousel.ts containers → IG container oluştur
 *   npx tsx scripts/cansu-carousel.ts status     → Container durumlarını kontrol et
 *   npx tsx scripts/cansu-carousel.ts publish    → Yayınla
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const META_TOKEN = process.env.META_ACCESS_TOKEN!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LOCAL_DIR = "/tmp/cansu-ig";
const STORAGE_BUCKET = "design-assets";
const STORAGE_PREFIX = "instagram/cansu-kul-konusma";

const FILES = ["1.mp4", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"];

const CAPTION = `Lord Byron'ın Don Juan'ında yalnızlık neden hiç başlamaz? Çünkü konuşma, tek bir an bile durmaz. Romantiklerin ayrıcalıklı bir ötekilik olarak kutsadığı yalnızlığı, Byron'ın diyalog sahnesine dönüştüren o devrimci anlatı yapısını keşfetmek için bu derinlikli analizi kaçırmayın. Cansu Kul kaleme aldı.
👇
Yazının tamamına klemensart.com üzerinden ulaşabilirsiniz.`;

// ─── 1. Upload to Supabase ─────────────────────────────────────
async function upload() {
  console.log("=== Supabase Storage'a Yükleme ===\n");

  const urls: Record<string, string> = {};

  for (const file of FILES) {
    const localPath = path.join(LOCAL_DIR, file);
    const storagePath = `${STORAGE_PREFIX}/${file}`;
    const contentType = file.endsWith(".mp4") ? "video/mp4" : "image/jpeg";

    const buffer = fs.readFileSync(localPath);
    console.log(`Yükleniyor: ${file} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)...`);

    // Upsert — varsa üzerine yaz
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, { contentType, upsert: true });

    if (error) {
      console.error(`  HATA: ${file} →`, error.message);
      continue;
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
    urls[file] = publicUrl;
    console.log(`  OK → ${publicUrl}`);
  }

  // URL'leri dosyaya kaydet (sonraki adımlar için)
  const urlsPath = path.join(LOCAL_DIR, "urls.json");
  fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 2));
  console.log(`\nURL'ler kaydedildi: ${urlsPath}`);

  return urls;
}

// ─── 2. Instagram Container'lar ────────────────────────────────
async function getIgUserId(): Promise<string> {
  // META_ACCESS_TOKEN ile bağlı IG Business Account'u bul
  const res = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account,name&access_token=${META_TOKEN}`
  );
  const data = await res.json();

  if (data.error) {
    throw new Error(`Facebook API hatası: ${JSON.stringify(data.error)}`);
  }

  for (const page of data.data ?? []) {
    if (page.instagram_business_account) {
      console.log(`IG Business Account: ${page.instagram_business_account.id} (Page: ${page.name})`);
      return page.instagram_business_account.id;
    }
  }

  throw new Error("Instagram Business Account bulunamadı. Token'ın instagram_content_publish izni var mı?");
}

async function createContainers() {
  console.log("=== Instagram Container Oluşturma ===\n");

  // URL'leri oku
  const urlsPath = path.join(LOCAL_DIR, "urls.json");
  if (!fs.existsSync(urlsPath)) {
    console.error("urls.json bulunamadı. Önce 'upload' çalıştırın.");
    return;
  }
  const urls: Record<string, string> = JSON.parse(fs.readFileSync(urlsPath, "utf-8"));

  const igUserId = await getIgUserId();

  // Her dosya için child container oluştur
  const childIds: string[] = [];

  for (const file of FILES) {
    const url = urls[file];
    if (!url) {
      console.error(`URL bulunamadı: ${file}`);
      continue;
    }

    const isVideo = file.endsWith(".mp4");
    const params = new URLSearchParams({
      access_token: META_TOKEN,
      is_carousel_item: "true",
    });

    if (isVideo) {
      params.set("media_type", "VIDEO");
      params.set("video_url", url);
    } else {
      params.set("image_url", url);
    }

    console.log(`Container oluşturuluyor: ${file} (${isVideo ? "VIDEO" : "IMAGE"})...`);

    const res = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media`, {
      method: "POST",
      body: params,
    });
    const data = await res.json();

    if (data.error) {
      console.error(`  HATA: ${file} →`, JSON.stringify(data.error));
      continue;
    }

    childIds.push(data.id);
    console.log(`  OK → container_id: ${data.id}`);
  }

  // Carousel container oluştur
  console.log("\nCarousel container oluşturuluyor...");
  const carouselParams = new URLSearchParams({
    access_token: META_TOKEN,
    media_type: "CAROUSEL",
    caption: CAPTION,
    children: childIds.join(","),
    collaborators: JSON.stringify(["cansu.jlz"]),
  });

  const carouselRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media`, {
    method: "POST",
    body: carouselParams,
  });
  const carouselData = await carouselRes.json();

  if (carouselData.error) {
    console.error("Carousel HATA:", JSON.stringify(carouselData.error));
    return;
  }

  const carouselId = carouselData.id;
  console.log(`Carousel container_id: ${carouselId}`);

  // Container bilgilerini kaydet
  const containerInfo = { igUserId, childIds, carouselId };
  const containerPath = path.join(LOCAL_DIR, "containers.json");
  fs.writeFileSync(containerPath, JSON.stringify(containerInfo, null, 2));
  console.log(`\nContainer bilgileri kaydedildi: ${containerPath}`);
}

// ─── 3. Status Kontrolü ────────────────────────────────────────
async function checkStatus() {
  console.log("=== Container Status Kontrolü ===\n");

  const containerPath = path.join(LOCAL_DIR, "containers.json");
  if (!fs.existsSync(containerPath)) {
    console.error("containers.json bulunamadı. Önce 'containers' çalıştırın.");
    return;
  }

  const { childIds, carouselId } = JSON.parse(fs.readFileSync(containerPath, "utf-8"));

  const allIds = [...childIds, carouselId];
  let allFinished = true;

  for (const id of allIds) {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${id}?fields=status_code,status&access_token=${META_TOKEN}`
    );
    const data = await res.json();
    const isCarousel = id === carouselId;
    const label = isCarousel ? "CAROUSEL" : `CHILD ${childIds.indexOf(id) + 1}`;
    const status = data.status_code || data.status || "UNKNOWN";

    console.log(`  ${label} (${id}): ${status}`);
    if (status !== "FINISHED") allFinished = false;
  }

  console.log(`\n${allFinished ? "Tüm container'lar hazır! 'publish' çalıştırabilirsiniz." : "Bazı container'lar henüz hazır değil. Birkaç dakika bekleyip tekrar deneyin."}`);
}

// ─── 4. Publish ────────────────────────────────────────────────
async function publish() {
  console.log("=== Instagram Publish ===\n");

  const containerPath = path.join(LOCAL_DIR, "containers.json");
  if (!fs.existsSync(containerPath)) {
    console.error("containers.json bulunamadı.");
    return;
  }

  const { igUserId, carouselId } = JSON.parse(fs.readFileSync(containerPath, "utf-8"));

  console.log(`Yayınlanıyor... (carousel: ${carouselId})`);

  const res = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media_publish`, {
    method: "POST",
    body: new URLSearchParams({
      access_token: META_TOKEN,
      creation_id: carouselId,
    }),
  });
  const data = await res.json();

  if (data.error) {
    console.error("Publish HATA:", JSON.stringify(data.error));
    return;
  }

  console.log(`Yayınlandı! Media ID: ${data.id}`);

  // Permalink al
  const permaRes = await fetch(
    `https://graph.facebook.com/v21.0/${data.id}?fields=permalink&access_token=${META_TOKEN}`
  );
  const permaData = await permaRes.json();
  if (permaData.permalink) {
    console.log(`Permalink: ${permaData.permalink}`);
  }
}

// ─── CLI ───────────────────────────────────────────────────────
const cmd = process.argv[2];

switch (cmd) {
  case "upload":
    upload().catch(console.error);
    break;
  case "containers":
    createContainers().catch(console.error);
    break;
  case "status":
    checkStatus().catch(console.error);
    break;
  case "publish":
    publish().catch(console.error);
    break;
  default:
    console.log("Kullanım: npx tsx scripts/cansu-carousel.ts [upload|containers|status|publish]");
}
