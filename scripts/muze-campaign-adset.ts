/**
 * Mevcut kampanyaya ad set + ad ekle
 * Campaign ID: 120245734443220728 (zaten oluşturuldu)
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const token = process.env.META_ACCESS_TOKEN!;
const accountId = process.env.META_AD_ACCOUNT_ID!;
const API = "https://graph.facebook.com/v21.0";

const campaignId = "120245734443220728";

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
  // 1. Ad Set oluştur
  console.log("Ad Set oluşturuluyor...");

  const targeting = {
    age_min: 25,
    age_max: 64,
    genders: [1, 2],
    geo_locations: { countries: ["TR"], location_types: ["home", "recent"] },
    publisher_platforms: ["instagram"],
    instagram_positions: ["stream", "explore", "reels", "story", "explore_home"],
    device_platforms: ["mobile"],
    flexible_spec: [
      {
        interests: [
          { id: "6002892294422", name: "Sanat müzesi" },
          { id: "6003042998915", name: "Müze" },
          { id: "6003081721815", name: "Sanat tarihi" },
          { id: "6002989694968", name: "Görsel sanatlar" },
          { id: "6003344675130", name: "Arkeoloji" },
          { id: "6003375678577", name: "Kültürel miras" },
        ],
      },
    ],
    targeting_automation: { advantage_audience: 0, individual_setting: { age: 0, gender: 0 } },
    targeting_relaxation_types: { lookalike: 0, custom_audience: 0 },
  };

  const adset = await api(`${accountId}/adsets`, "POST", {
    name: "Müze_Rehberi_LP_Traffic_25-64",
    campaign_id: campaignId,
    daily_budget: "15000",
    billing_event: "IMPRESSIONS",
    optimization_goal: "LINK_CLICKS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    status: "PAUSED",
    targeting: JSON.stringify(targeting),
    promoted_object: JSON.stringify({ page_id: "110198542171215" }),
    is_dynamic_creative: "false",
  });

  if (adset.error) {
    console.error("Ad Set HATA:", adset.error.message);
    console.error("Detay:", JSON.stringify(adset.error));
    return;
  }
  console.log(`Ad Set ID: ${adset.id}`);

  // 2. Müze form kreatifini bul
  console.log("\nMüze form kreatifi aranıyor...");
  const muzeAds = await api(
    `120243998450430728/ads?fields=id,creative{id,effective_object_story_id}&limit=5`
  );

  let storyId = "";
  for (const ad of muzeAds.data || []) {
    if (ad.creative?.effective_object_story_id) {
      storyId = ad.creative.effective_object_story_id;
      console.log(`Story ID: ${storyId}`);
      break;
    }
  }

  // 3. Yeni kreatif oluştur (aynı post'u kullan, farklı CTA/link)
  console.log("\nKreatif oluşturuluyor...");
  const creative = await api(`${accountId}/adcreatives`, "POST", {
    name: "Müze_Rehberi_LP_Creative",
    object_story_id: storyId,
  });

  if (creative.error) {
    console.error("Creative HATA:", creative.error.message);
    console.log("\nKampanya ve Ad Set oluşturuldu ama kreatif hata verdi.");
    console.log("Ads Manager'dan kreatif/reklam ekleyin:");
    console.log(`  Campaign ID: ${campaignId}`);
    console.log(`  Ad Set ID: ${adset.id}`);
    return;
  }
  console.log(`Creative ID: ${creative.id}`);

  // 4. Reklam oluştur
  console.log("\nReklam oluşturuluyor...");
  const ad = await api(`${accountId}/ads`, "POST", {
    name: "Müze_Rehberi_LP_Ad",
    adset_id: adset.id,
    creative: JSON.stringify({ creative_id: creative.id }),
    status: "PAUSED",
  });

  if (ad.error) {
    console.error("Ad HATA:", ad.error.message);
    console.log("Ads Manager'dan reklam ekleyin.");
  } else {
    console.log(`Ad ID: ${ad.id}`);
  }

  console.log("\n════════════════════════════════════════");
  console.log("  KAMPANYA ÖZETI");
  console.log("════════════════════════════════════════");
  console.log(`Campaign: ${campaignId}`);
  console.log(`Ad Set:   ${adset.id}`);
  console.log(`Ad:       ${ad?.id || "Ads Manager'dan eklenecek"}`);
  console.log(`Bütçe:    150 TL/gün`);
  console.log(`Hedef:    Link Clicks → klemensart.com/rehber`);
  console.log(`Kitle:    25-64, TR, Müze/Sanat ilgi alanları`);
  console.log(`Platform: Instagram`);
  console.log(`Meta AI:  Tamamen KAPALI`);
  console.log(`Status:   PAUSED (onay bekliyor)`);
  console.log("════════════════════════════════════════");
}

main();
