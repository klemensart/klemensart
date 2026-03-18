/**
 * Müze Rehberi Kampanya Setup
 * 1. Sanat_Estetik_Test reklamını aktifleştir
 * 2. Müze_Gezme_Rehberi_Form reklamını aktifleştir
 * 3. Müze Rehberi Landing Page Traffic kampanyası kur (YENİ)
 */

import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const token = process.env.META_ACCESS_TOKEN!;
const accountId = process.env.META_AD_ACCOUNT_ID!;
const API = "https://graph.facebook.com/v21.0";

async function api(path: string, method = "GET", body?: Record<string, string>) {
  const url = `${API}/${path}`;
  const opts: RequestInit = { method };
  if (body) {
    body.access_token = token;
    opts.body = new URLSearchParams(body);
  } else {
    const sep = path.includes("?") ? "&" : "?";
    return fetch(`${url}${sep}access_token=${token}`).then((r) => r.json());
  }
  const res = await fetch(url, opts);
  return res.json();
}

const cmd = process.argv[2];

// ─── 1. Reklamları aktifleştir ─────────────────────────
async function activateAds() {
  console.log("=== Reklamları Aktifleştirme ===\n");

  // Get all ads
  const ads = await api(
    `${accountId}/ads?fields=id,name,status,effective_status,campaign_id,creative{id,effective_object_story_id}&limit=20`
  );

  const targetCampaigns: Record<string, string> = {
    "120244823719530728": "Sanat_Estetik_Test",
    "120243998450430728": "Müze_Gezme_Rehberi_Form",
  };

  for (const ad of ads.data || []) {
    const campaignName = targetCampaigns[ad.campaign_id];
    if (!campaignName) continue;

    console.log(`${campaignName}:`);
    console.log(`  Ad ID: ${ad.id}`);
    console.log(`  Status: ${ad.status} → ${ad.effective_status}`);

    if (ad.creative) {
      console.log(`  Creative ID: ${ad.creative.id}`);
      console.log(`  Story ID: ${ad.creative.effective_object_story_id}`);
    }

    if (ad.status === "PAUSED") {
      console.log(`  → Aktifleştiriliyor...`);
      const result = await api(ad.id, "POST", { status: "ACTIVE" });
      if (result.error) {
        console.log(`  HATA: ${result.error.message}`);
      } else {
        console.log(`  ✓ Aktif`);
      }
    } else {
      console.log(`  Zaten aktif`);
    }
    console.log();
  }
}

// ─── 2. Müze targeting bilgilerini çek ────────────────
async function getTargeting() {
  console.log("=== Müze Kampanyası Targeting Bilgileri ===\n");

  // Müze_Gezme_Rehberi_Form ad set ID
  const adsetId = "120243998450410728";
  const data = await api(
    `${adsetId}?fields=targeting,promoted_object,optimization_goal,billing_event,daily_budget`
  );

  console.log("Müze Form Ad Set Targeting:");
  console.log(JSON.stringify(data.targeting, null, 2));
  console.log("\nOptimization:", data.optimization_goal);
  console.log("Billing:", data.billing_event);
  console.log("Daily budget:", data.daily_budget);
  if (data.promoted_object) {
    console.log("Promoted object:", JSON.stringify(data.promoted_object));
  }
}

// ─── 3. Yeni kampanya kur ─────────────────────────────
async function createCampaign() {
  console.log("=== Müze Rehberi Landing Page Traffic Kampanyası ===\n");

  // Önce müze form kampanyasının targeting'ini çek
  const adsetData = await api(
    `120243998450410728?fields=targeting,promoted_object`
  );
  const existingTargeting = adsetData.targeting;

  console.log("Mevcut müze targeting kopyalanıyor...\n");

  // 1. Campaign oluştur
  console.log("1. Kampanya oluşturuluyor...");
  const campaign = await api(`${accountId}/campaigns`, "POST", {
    name: "Müze_Rehberi_Landing_Page_Traffic",
    objective: "OUTCOME_TRAFFIC",
    status: "PAUSED",
    special_ad_categories: "[]",
    is_adset_budget_sharing_enabled: "false",
  });

  if (campaign.error) {
    console.error("Campaign HATA:", campaign.error.message);
    return;
  }
  const campaignId = campaign.id;
  console.log(`  Campaign ID: ${campaignId}`);

  // 2. Ad Set oluştur — tüm Meta AI kapalı
  console.log("2. Ad Set oluşturuluyor...");

  // Targeting: Müze kampanyasından kopyala, ama Meta AI'ı kapat
  const targeting: Record<string, unknown> = {
    age_min: 25,
    age_max: 64,
    genders: [1, 2], // Herkese göster
    geo_locations: existingTargeting?.geo_locations || {
      countries: ["TR"],
    },
    publisher_platforms: ["instagram"],
    instagram_positions: ["stream", "explore", "reels"],
    device_platforms: ["mobile"],
    // İlgi alanları — doğrulanmış ID'ler
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
    // Meta AI tamamen kapalı
    targeting_automation: JSON.stringify({ advantage_audience: 0 }),
    targeting_relaxation_types: JSON.stringify({
      lookalike: 0,
      custom_audience: 0,
    }),
  };

  const adset = await api(`${accountId}/adsets`, "POST", {
    name: "Müze_Rehberi_LP_Traffic_25-64",
    campaign_id: campaignId,
    daily_budget: "15000", // 150 TL (kuruş cinsinden)
    billing_event: "IMPRESSIONS",
    optimization_goal: "LINK_CLICKS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    status: "PAUSED",
    targeting: JSON.stringify(targeting),
    promoted_object: JSON.stringify({
      page_id: "110198542171215",
    }),
    is_dynamic_creative: "false",
  });

  if (adset.error) {
    console.error("Ad Set HATA:", adset.error.message);
    console.error("Detay:", JSON.stringify(adset.error));
    return;
  }
  const adsetId = adset.id;
  console.log(`  Ad Set ID: ${adsetId}`);

  // 3. Müze form reklamının kreatifini bul ve kopyala
  console.log("3. Reklam oluşturuluyor...");

  // Müze form kampanyasının reklamını bul
  const muzeAds = await api(
    `120243998450430728/ads?fields=id,creative{id,effective_object_story_id}&limit=5`
  );

  let creativeStoryId = "";
  for (const ad of muzeAds.data || []) {
    if (ad.creative?.effective_object_story_id) {
      creativeStoryId = ad.creative.effective_object_story_id;
      console.log(`  Müze kreatif story ID: ${creativeStoryId}`);
      break;
    }
  }

  if (!creativeStoryId) {
    console.error("  Müze kreatifi bulunamadı. Ads Manager'dan elle reklam eklenecek.");
    console.log(`\n  Campaign ID: ${campaignId}`);
    console.log(`  Ad Set ID: ${adsetId}`);
    console.log("  Kampanya PAUSED olarak oluşturuldu. Reklam ekleyip aktifleştirin.");
    return;
  }

  // Kreatif oluştur
  const creative = await api(`${accountId}/adcreatives`, "POST", {
    name: "Müze_Rehberi_LP_Creative",
    object_story_id: creativeStoryId,
  });

  if (creative.error) {
    console.error("Creative HATA:", creative.error.message);
    console.log(`\n  Campaign ID: ${campaignId}`);
    console.log(`  Ad Set ID: ${adsetId}`);
    console.log("  Kreatif Ads Manager'dan eklenecek.");
    return;
  }

  // Reklam oluştur
  const ad = await api(`${accountId}/ads`, "POST", {
    name: "Müze_Rehberi_LP_Ad",
    adset_id: adsetId,
    creative: JSON.stringify({ creative_id: creative.id }),
    status: "PAUSED",
    tracking_specs: JSON.stringify([
      { action_type: ["link_click"], fb_pixel: ["4128336074070304"] },
    ]),
  });

  if (ad.error) {
    console.error("Ad HATA:", ad.error.message);
  } else {
    console.log(`  Ad ID: ${ad.id}`);
  }

  console.log("\n=== Kampanya Özeti ===");
  console.log(`Campaign: ${campaignId} (Müze_Rehberi_Landing_Page_Traffic)`);
  console.log(`Ad Set: ${adsetId} (150 TL/gün, 25-64, Instagram, Link Clicks)`);
  console.log(`Ad: ${ad?.id || "Ads Manager'dan eklenecek"}`);
  console.log(`Hedef URL: https://klemensart.com/rehber`);
  console.log(`Status: PAUSED — onay sonrası aktifleştirilecek`);
  console.log("\nMeta AI: Tamamen KAPALI");
  console.log("Advantage+ Audience: KAPALI");
  console.log("Kitle genişletme: KAPALI");
}

switch (cmd) {
  case "activate":
    activateAds();
    break;
  case "targeting":
    getTargeting();
    break;
  case "create":
    createCampaign();
    break;
  case "all":
    activateAds().then(() => createCampaign());
    break;
  default:
    console.log("Kullanım: npx tsx scripts/muze-campaign-setup.ts [activate|targeting|create|all]");
}
