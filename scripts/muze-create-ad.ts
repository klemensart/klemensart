/**
 * Müze Rehberi LP kampanyasına kreatif + reklam ekle
 * Aynı müze videosunu kullanıp klemensart.com/rehber'e yönlendir
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const token = process.env.META_ACCESS_TOKEN!;
const accountId = process.env.META_AD_ACCOUNT_ID!;
const pageId = "110198542171215";
const igUserId = "17841460410904663";
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
  console.log("=== Müze Rehberi LP — Kreatif + Reklam ===\n");

  // Link post olarak oluştur — görsel ile klemensart.com/rehber'e yönlendir
  console.log("1. Kreatif oluşturuluyor (link post, LP'ye yönlendirme)...");
  const creative = await api(`${accountId}/adcreatives`, "POST", {
    name: "Muze_Rehberi_LP_Creative_v3",
    object_story_spec: JSON.stringify({
      page_id: pageId,
      link_data: {
        link: "https://klemensart.com/rehber",
        message:
          "Müze Gezme Rehberi! Türkiye'nin en kapsamlı müze rehberini ücretsiz indirmek için linke tıklayın.",
        name: "Müze Gezme Rehberi | Klemens Art",
        description:
          "Türkiye'deki en önemli müzeleri keşfedin. Ücretsiz PDF rehberinizi indirin.",
        image_hash: "a9ab03159701b90981076431b92584ad",
        call_to_action: {
          type: "LEARN_MORE",
          value: { link: "https://klemensart.com/rehber" },
        },
      },
    }),
  });

  if (creative.error) {
    console.error("Creative HATA:", creative.error.message);
    console.error("Detay:", JSON.stringify(creative.error));
    return;
  }
  console.log(`Creative ID: ${creative.id}\n`);

  // 2. Reklam oluştur
  console.log("2. Reklam oluşturuluyor...");
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
  console.log(`Campaign: 120245734443220728`);
  console.log(`Ad Set:   120245734629290728`);
  console.log(`Creative: ${creative.id}`);
  console.log(`Ad:       ${ad?.id || "Ads Manager'dan eklenecek"}`);
  console.log(`Hedef:    klemensart.com/rehber`);
  console.log(`CTA:      LEARN_MORE`);
  console.log(`Bütçe:    150 TL/gün`);
  console.log(`Kitle:    25-64, TR, Müze/Sanat ilgi alanları`);
  console.log(`Platform: Instagram`);
  console.log(`Meta AI:  Tamamen KAPALI`);
  console.log(`Status:   PAUSED (onay bekliyor)`);
  console.log("════════════════════════════════════════");
}

main();
