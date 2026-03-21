/**
 * Kültür Haritası Engagement Kampanyası
 * - Reels tanıtım videosu → Engagement reklamı
 * - Birincil kitle: Ankara + 30km, 22-45 yaş
 * - İlgi alanları: Müze, sanat tarihi, kültürel etkinlik, seyahat, fotoğrafçılık
 * - Bütçe: 100 ₺/gün
 * - Meta AI: Tamamen kapalı
 */

import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const token = process.env.META_ACCESS_TOKEN!;
const accountId = process.env.META_AD_ACCOUNT_ID!;
const pageId = "110198542171215";
const igUserId = "17841460410904663";
const pixelId = "4128336074070304";
const API = "https://graph.facebook.com/v21.0";

async function api(
  path: string,
  method = "GET",
  body?: Record<string, string>
): Promise<any> {
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

const cmd = process.argv[2] || "find-reels";

// ─── 1. Kültür Haritası Reels'ini bul ─────────────────
async function findReels() {
  console.log("=== Instagram Postları (Kültür Haritası Reels Aranıyor) ===\n");

  // IG medyaları listele
  const media = await api(
    `${igUserId}/media?fields=id,caption,media_type,timestamp,permalink,thumbnail_url&limit=25`
  );

  if (media.error) {
    console.error("HATA:", media.error.message);
    return null;
  }

  console.log("Son 25 paylaşım:\n");
  for (const m of media.data || []) {
    const caption = (m.caption || "").substring(0, 80).replace(/\n/g, " ");
    const isReels = m.media_type === "VIDEO";
    const marker = isReels ? "🎬" : "📷";
    console.log(`${marker} ${m.id} | ${m.media_type} | ${m.timestamp}`);
    console.log(`   ${caption}...`);
    console.log(`   ${m.permalink}\n`);
  }

  // Kültür haritası içeren postu bul
  const haritaPost = (media.data || []).find(
    (m: any) =>
      m.caption &&
      (m.caption.toLowerCase().includes("harita") ||
        m.caption.toLowerCase().includes("kültür haritası") ||
        m.caption.toLowerCase().includes("kultur haritasi") ||
        m.caption.toLowerCase().includes("300"))
  );

  if (haritaPost) {
    console.log("=== BULUNAN POST ===");
    console.log(`ID: ${haritaPost.id}`);
    console.log(`Tür: ${haritaPost.media_type}`);
    console.log(`Link: ${haritaPost.permalink}`);
    console.log(`Tarih: ${haritaPost.timestamp}`);
  } else {
    console.log("⚠️  Kültür haritası ile ilgili post bulunamadı.");
    console.log("Post ID'yi manuel belirtebilirsiniz: npx tsx scripts/kultur-haritasi-campaign.ts create <POST_ID>");
  }

  return haritaPost;
}

// ─── 2. Ankara geo key bul ────────────────────────────
async function findAnkaraKey() {
  console.log("=== Ankara Geo Location Key ===\n");
  const result = await api(
    `search?type=adgeolocation&location_types=["city"]&q=Ankara`
  );

  if (result.error) {
    console.error("HATA:", result.error.message);
    return null;
  }

  for (const loc of result.data || []) {
    if (loc.country_code === "TR") {
      console.log(`${loc.name} (${loc.region}) — key: ${loc.key}, type: ${loc.type}`);
    }
  }

  const ankara = (result.data || []).find(
    (l: any) => l.country_code === "TR" && l.name === "Ankara"
  );
  return ankara?.key;
}

// ─── 3. İlgi alanı ID'lerini doğrula ─────────────────
async function verifyInterests() {
  console.log("\n=== İlgi Alanları Doğrulama ===\n");

  const interests = [
    "Müze",
    "Sanat müzesi",
    "Sanat tarihi",
    "Kültürel etkinlikler",
    "Seyahat",
    "Fotoğrafçılık",
    "Tarihi mekanlar",
    "Kültürel miras",
  ];

  const verified: { id: string; name: string }[] = [];

  for (const interest of interests) {
    const result = await api(
      `search?type=adinterest&q=${encodeURIComponent(interest)}`
    );
    if (result.data?.[0]) {
      const match = result.data[0];
      console.log(`✓ "${interest}" → ID: ${match.id}, Name: ${match.name}, Audience: ${match.audience_size_lower_bound}-${match.audience_size_upper_bound}`);
      verified.push({ id: match.id, name: match.name });
    } else {
      console.log(`✗ "${interest}" → Bulunamadı`);
    }
  }

  return verified;
}

// ─── 4. Kampanya oluştur ──────────────────────────────
async function createCampaign(postId?: string) {
  console.log("=== Kültür Haritası Engagement Kampanyası Oluşturma ===\n");

  // Ankara key bul
  const ankaraKey = await findAnkaraKey();
  if (!ankaraKey) {
    console.error("Ankara geo key bulunamadı!");
    return;
  }
  console.log(`\nAnkara key: ${ankaraKey}\n`);

  // İlgi alanlarını doğrula
  const interests = await verifyInterests();
  if (interests.length === 0) {
    console.error("Hiçbir ilgi alanı doğrulanamadı!");
    return;
  }
  console.log(`\n${interests.length} ilgi alanı doğrulandı.\n`);

  // 1. Campaign oluştur
  console.log("1. Kampanya oluşturuluyor...");
  const campaign = await api(`${accountId}/campaigns`, "POST", {
    name: "Kultur_Haritasi_Engagement",
    objective: "OUTCOME_ENGAGEMENT",
    status: "PAUSED",
    special_ad_categories: "[]",
    is_adset_budget_sharing_enabled: "false",
  });

  if (campaign.error) {
    console.error("Campaign HATA:", campaign.error.message);
    console.error("Detay:", JSON.stringify(campaign.error, null, 2));
    return;
  }
  const campaignId = campaign.id;
  console.log(`  ✓ Campaign ID: ${campaignId}\n`);

  // 2. Ad Set oluştur
  console.log("2. Ad Set oluşturuluyor...");

  const targeting = {
    age_min: 22,
    age_max: 45,
    genders: [1, 2],
    geo_locations: {
      cities: [{ key: ankaraKey, radius: 30, distance_unit: "kilometer" }],
    },
    publisher_platforms: ["instagram"],
    instagram_positions: ["stream", "explore", "reels", "story", "explore_home"],
    device_platforms: ["mobile"],
    flexible_spec: [
      {
        interests: interests,
      },
    ],
    targeting_automation: { advantage_audience: 0 },
    targeting_relaxation_types: { lookalike: 0, custom_audience: 0 },
  };

  const adset = await api(`${accountId}/adsets`, "POST", {
    name: "Kultur_Haritasi_Ankara_22-45",
    campaign_id: campaignId,
    daily_budget: "10000", // 100 TL (kuruş)
    billing_event: "IMPRESSIONS",
    optimization_goal: "THRUPLAY",
    destination_type: "ON_VIDEO",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    status: "PAUSED",
    targeting: JSON.stringify(targeting),
    promoted_object: JSON.stringify({
      page_id: pageId,
    }),
    is_dynamic_creative: "false",
  });

  if (adset.error) {
    console.error("Ad Set HATA:", adset.error.message);
    console.error("Detay:", JSON.stringify(adset.error, null, 2));
    // Cleanup: kampanyayı sil
    console.log("Kampanya siliniyor (rollback)...");
    await api(campaignId, "DELETE");
    return;
  }
  const adsetId = adset.id;
  console.log(`  ✓ Ad Set ID: ${adsetId}\n`);

  // 3. Reklam oluştur
  console.log("3. Reklam oluşturuluyor...");

  // Post ID verilmediyse bul
  if (!postId) {
    console.log("  Reels postu aranıyor...");
    const reelsPost = await findReels();
    if (reelsPost) {
      postId = reelsPost.id;
    }
  }

  if (!postId) {
    console.log("\n⚠️  Post ID bulunamadı. Kampanya PAUSED olarak oluşturuldu.");
    console.log("Ads Manager'dan elle reklam ekleyip aktifleştirin.");
    printSummary(campaignId, adsetId, null, interests, ankaraKey);
    return;
  }

  // IG post'un story ID'sini almak için page post'a ihtiyacımız var
  // IG media ID'den object_story_id oluştur: pageId_postId formatında değil,
  // bunun yerine IG kreative olarak kullanacağız
  console.log(`  Post ID: ${postId}`);

  // Kreatif oluştur (IG media'dan)
  const creative = await api(`${accountId}/adcreatives`, "POST", {
    name: "Kultur_Haritasi_Reels_Creative",
    object_story_id: `${pageId}_${postId}`,
  });

  let adId: string | null = null;

  if (creative.error) {
    // object_story_id ile olmadıysa, source_instagram_media_id dene
    console.log("  object_story_id ile olmadı, source_instagram_media_id deneniyor...");

    const creative2 = await api(`${accountId}/adcreatives`, "POST", {
      name: "Kultur_Haritasi_Reels_Creative",
      source_instagram_media_id: postId,
      instagram_actor_id: igUserId,
    });

    if (creative2.error) {
      console.error("  Creative HATA:", creative2.error.message);
      console.log("\n⚠️  Kreatif API'den oluşturulamadı (App development modda olabilir).");
      console.log("  Kampanya PAUSED olarak oluşturuldu. Ads Manager'dan reklam ekleyin.");
      printSummary(campaignId, adsetId, null, interests, ankaraKey);
      return;
    }

    // Reklam oluştur
    const ad = await api(`${accountId}/ads`, "POST", {
      name: "Kultur_Haritasi_Reels_Ad",
      adset_id: adsetId,
      creative: JSON.stringify({ creative_id: creative2.id }),
      status: "PAUSED",
    });

    if (ad.error) {
      console.error("  Ad HATA:", ad.error.message);
      printSummary(campaignId, adsetId, null, interests, ankaraKey);
      return;
    }
    adId = ad.id;
  } else {
    // Reklam oluştur
    const ad = await api(`${accountId}/ads`, "POST", {
      name: "Kultur_Haritasi_Reels_Ad",
      adset_id: adsetId,
      creative: JSON.stringify({ creative_id: creative.id }),
      status: "PAUSED",
    });

    if (ad.error) {
      console.error("  Ad HATA:", ad.error.message);
      printSummary(campaignId, adsetId, null, interests, ankaraKey);
      return;
    }
    adId = ad.id;
  }

  if (adId) {
    console.log(`  ✓ Ad ID: ${adId}\n`);
  }

  printSummary(campaignId, adsetId, adId, interests, ankaraKey);
}

function printSummary(
  campaignId: string,
  adsetId: string,
  adId: string | null,
  interests: { id: string; name: string }[],
  ankaraKey: string
) {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║     KÜLTÜR HARİTASI ENGAGEMENT KAMPANYASI   ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║ Campaign ID : ${campaignId}`);
  console.log(`║ Ad Set ID   : ${adsetId}`);
  console.log(`║ Ad ID       : ${adId || "Ads Manager'dan eklenecek"}`);
  console.log("╠══════════════════════════════════════════════╣");
  console.log("║ Hedef       : ENGAGEMENT (beğeni/kaydet/paylaş)");
  console.log("║ Bütçe       : 100 ₺/gün");
  console.log("║ Optimize    : THRUPLAY (video izleme)");
  console.log("║ Konum       : Ankara + 30 km");
  console.log("║ Yaş         : 22-45");
  console.log("║ Platform    : Instagram (Feed, Explore, Reels, Story)");
  console.log(`║ İlgi alanı  : ${interests.map((i) => i.name).join(", ")}`);
  console.log("║ Meta AI     : Tamamen KAPALI");
  console.log("║ Advantage+  : KAPALI");
  console.log("║ Status      : PAUSED (onay bekliyor)");
  console.log("╚══════════════════════════════════════════════╝");
  console.log("\nAktifleştirmek için:");
  console.log(`  npx tsx scripts/kultur-haritasi-campaign.ts activate ${campaignId} ${adsetId}${adId ? " " + adId : ""}`);
}

// ─── 5. Aktifleştir ───────────────────────────────────
async function activate() {
  const campaignId = process.argv[3];
  const adsetId = process.argv[4];
  const adId = process.argv[5];

  if (!campaignId || !adsetId) {
    console.error("Kullanım: npx tsx scripts/kultur-haritasi-campaign.ts activate <campaign_id> <adset_id> [ad_id]");
    return;
  }

  console.log("=== Kampanya Aktifleştirme ===\n");

  // Kampanyayı aktifleştir
  console.log("Campaign aktifleştiriliyor...");
  const r1 = await api(campaignId, "POST", { status: "ACTIVE" });
  if (r1.error) console.error("  HATA:", r1.error.message);
  else console.log("  ✓ Campaign ACTIVE");

  // Ad Set aktifleştir
  console.log("Ad Set aktifleştiriliyor...");
  const r2 = await api(adsetId, "POST", { status: "ACTIVE" });
  if (r2.error) console.error("  HATA:", r2.error.message);
  else console.log("  ✓ Ad Set ACTIVE");

  // Ad aktifleştir (varsa)
  if (adId) {
    console.log("Ad aktifleştiriliyor...");
    const r3 = await api(adId, "POST", { status: "ACTIVE" });
    if (r3.error) console.error("  HATA:", r3.error.message);
    else console.log("  ✓ Ad ACTIVE");
  }

  console.log("\n✅ Kampanya yayında!");
}

switch (cmd) {
  case "find-reels":
    findReels();
    break;
  case "interests":
    verifyInterests();
    break;
  case "create":
    createCampaign(process.argv[3]);
    break;
  case "activate":
    activate();
    break;
  default:
    console.log("Kullanım:");
    console.log("  npx tsx scripts/kultur-haritasi-campaign.ts find-reels     — Reels postunu bul");
    console.log("  npx tsx scripts/kultur-haritasi-campaign.ts interests      — İlgi alanlarını doğrula");
    console.log("  npx tsx scripts/kultur-haritasi-campaign.ts create [postId] — Kampanya oluştur");
    console.log("  npx tsx scripts/kultur-haritasi-campaign.ts activate <cid> <asid> [aid] — Aktifleştir");
}
