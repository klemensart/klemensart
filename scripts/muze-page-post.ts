/**
 * Facebook sayfasına müze rehberi link postu yayınla
 * Sonra bu postu reklam kreatifi olarak kullan
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const token = process.env.META_ACCESS_TOKEN!;
const accountId = process.env.META_AD_ACCOUNT_ID!;
const pageId = "110198542171215";
const API = "https://graph.facebook.com/v21.0";

async function api(path: string, method = "GET", body?: Record<string, string>) {
  const url = `${API}/${path}`;
  if (body) {
    body.access_token = token;
    return fetch(url, { method, body: new URLSearchParams(body) }).then((r) => r.json());
  }
  const sep = path.includes("?") ? "&" : "?";
  return fetch(`${url}${sep}access_token=${token}`).then((r) => r.json());
}

async function main() {
  const cmd = process.argv[2] || "post";

  if (cmd === "post") {
    // 1. Sayfa page_access_token al
    console.log("Sayfa token alınıyor...");
    const pageInfo = await api(`${pageId}?fields=access_token`);
    const pageToken = pageInfo.access_token;

    if (!pageToken) {
      console.error("Page token alınamadı:", JSON.stringify(pageInfo));
      return;
    }
    console.log("Page token alındı.\n");

    // 2. Published=false olarak link post oluştur (dark post)
    console.log("Dark post oluşturuluyor (published=false)...");
    const body = new URLSearchParams({
      message:
        "Müze Gezme Rehberi! Türkiye'nin en kapsamlı müze rehberini ücretsiz indirmek için linke tıklayın.",
      link: "https://klemensart.com/rehber",
      published: "false",
      access_token: pageToken,
    });

    const res = await fetch(`${API}/${pageId}/feed`, { method: "POST", body });
    const post = await res.json();

    if (post.error) {
      console.error("Post HATA:", post.error.message);
      console.error("Detay:", JSON.stringify(post.error));
      return;
    }
    console.log(`Dark Post ID: ${post.id}\n`);

    // 3. Bu postu kullanarak kreatif oluştur
    console.log("Kreatif oluşturuluyor...");
    const creative = await api(`${accountId}/adcreatives`, "POST", {
      name: "Muze_Rehberi_LP_Creative_DarkPost",
      object_story_id: post.id,
    });

    if (creative.error) {
      console.error("Creative HATA:", creative.error.message);
      console.error("Detay:", JSON.stringify(creative.error));
      console.log(`\nDark Post ID: ${post.id}`);
      console.log("Bu post ID'sini Ads Manager'da kullanabilirsiniz.");
      return;
    }
    console.log(`Creative ID: ${creative.id}\n`);

    // 4. Reklam oluştur
    console.log("Reklam oluşturuluyor...");
    const ad = await api(`${accountId}/ads`, "POST", {
      name: "Muze_Rehberi_LP_Ad",
      adset_id: "120245734629290728",
      creative: JSON.stringify({ creative_id: creative.id }),
      status: "PAUSED",
    });

    if (ad.error) {
      console.error("Ad HATA:", ad.error.message);
      console.error("Detay:", JSON.stringify(ad.error));
    } else {
      console.log(`Ad ID: ${ad.id}`);
    }

    console.log("\n════════════════════════════════════════");
    console.log("  KAMPANYA TAMAMLANDI");
    console.log("════════════════════════════════════════");
    console.log(`Campaign:  120245734443220728`);
    console.log(`Ad Set:    120245734629290728`);
    console.log(`Dark Post: ${post.id}`);
    console.log(`Creative:  ${creative.id}`);
    console.log(`Ad:        ${ad?.id || "Ads Manager'dan eklenecek"}`);
    console.log(`Hedef:     klemensart.com/rehber`);
    console.log(`CTA:       Link Click`);
    console.log(`Bütçe:     150 TL/gün`);
    console.log(`Kitle:     25-64, TR, Müze/Sanat`);
    console.log(`Platform:  Instagram`);
    console.log(`Meta AI:   Tamamen KAPALI`);
    console.log(`Status:    PAUSED (onay bekliyor)`);
    console.log("════════════════════════════════════════");
  }
}

main();
