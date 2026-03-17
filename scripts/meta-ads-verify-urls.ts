/**
 * Meta Ads URL Doğrulama — Kampanya reklam URL'lerinin doğru sayfaya gittiğini kontrol eder
 * Kullanım: set -a && source .env.local && set +a && npx tsx scripts/meta-ads-verify-urls.ts
 */

const token = process.env.META_ACCESS_TOKEN!;
const accountId = process.env.META_AD_ACCOUNT_ID!;

if (!token || !accountId) {
  console.error("META_ACCESS_TOKEN ve META_AD_ACCOUNT_ID gerekli.");
  process.exit(1);
}

const API = "https://graph.facebook.com/v21.0";

// Beklenen kampanya → URL eşleşmeleri
const EXPECTED_URLS: Record<string, { expectedUrl: string; note: string }> = {
  Sanat_Estetik_Test: {
    expectedUrl: "https://klemensart.com/testler/gorsel-algi",
    note: "Görsel Algı Testi landing page (email gate aktif)",
  },
  "Müze_Gezme_Rehberi_Form": {
    expectedUrl: "https://klemensart.com/rehber",
    note: "Müze Rehberi landing page (yeni)",
  },
};

async function api(path: string) {
  const res = await fetch(`${API}/${path}&access_token=${token}`);
  const data = await res.json();
  if (data.error) {
    console.error(`API Hatası: ${data.error.message}`);
    return null;
  }
  return data.data || data;
}

async function checkUrlRedirect(url: string): Promise<{ final: string; status: number }> {
  try {
    const res = await fetch(url, { redirect: "follow" });
    return { final: res.url, status: res.status };
  } catch {
    return { final: url, status: 0 };
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("         META ADS URL DOĞRULAMA RAPORU");
  console.log("═══════════════════════════════════════════════════════════\n");

  // Get all ads with their creative URLs
  const ads = await api(
    `${accountId}/ads?fields=id,name,campaign{id,name},status,effective_status,creative{id,name,object_story_spec,asset_feed_spec}&filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE","PAUSED","CAMPAIGN_PAUSED","IN_PROCESS","WITH_ISSUES"]}]&limit=30`
  );

  if (!ads) {
    console.error("Reklam verisi alınamadı.");
    return;
  }

  let issues = 0;
  let checked = 0;

  for (const ad of ads) {
    const campName = ad.campaign?.name || "?";
    const urls: string[] = [];

    // Extract URLs from creative
    if (ad.creative?.object_story_spec) {
      const spec = ad.creative.object_story_spec;
      if (spec.link_data?.link) urls.push(spec.link_data.link);
      if (spec.link_data?.call_to_action?.value?.link) {
        urls.push(spec.link_data.call_to_action.value.link);
      }
      if (spec.video_data?.call_to_action?.value?.link) {
        urls.push(spec.video_data.call_to_action.value.link);
      }
    }

    // Extract URLs from asset_feed_spec (carousel etc.)
    if (ad.creative?.asset_feed_spec) {
      const feed = ad.creative.asset_feed_spec;
      if (feed.link_urls) {
        for (const lu of feed.link_urls) {
          if (lu.website_url) urls.push(lu.website_url);
        }
      }
      if (feed.call_to_action_types) {
        // CTA type doesn't have URLs directly
      }
    }

    // If no URLs found from creative, try fetching ad creative details
    if (urls.length === 0 && ad.creative?.id) {
      const creative = await api(
        `${ad.creative.id}?fields=effective_object_story_id,object_story_spec,asset_feed_spec,url_tags,object_url`
      );
      if (creative?.object_url) urls.push(creative.object_url);
      if (creative?.object_story_spec?.link_data?.link) {
        urls.push(creative.object_story_spec.link_data.link);
      }
    }

    const uniqueUrls = [...new Set(urls)];
    if (uniqueUrls.length === 0) continue;

    checked++;
    const statusIcon =
      ad.effective_status === "ACTIVE" ? "🟢" :
      ad.effective_status === "PAUSED" ? "⏸️" : "⚠️";

    console.log(`${statusIcon} ${ad.name}`);
    console.log(`   Kampanya: ${campName}`);
    console.log(`   Durum: ${ad.effective_status}`);

    for (const url of uniqueUrls) {
      const { final, status } = await checkUrlRedirect(url);
      const isOk = status >= 200 && status < 400;

      // Check if this campaign has an expected URL
      const expected = Object.entries(EXPECTED_URLS).find(([key]) =>
        campName.includes(key)
      );

      if (expected) {
        const [, { expectedUrl, note }] = expected;
        const urlMatches = final.includes(new URL(expectedUrl).pathname);
        if (urlMatches) {
          console.log(`   ✅ URL: ${url}`);
          console.log(`      → ${final} (${status}) — Beklenen sayfaya gidiyor`);
          console.log(`      📌 ${note}`);
        } else {
          issues++;
          console.log(`   ❌ URL: ${url}`);
          console.log(`      → ${final} (${status})`);
          console.log(`      ⚠️  BEKLENİYOR: ${expectedUrl}`);
          console.log(`      📌 ${note}`);
          console.log(`      🔧 Ads Manager'dan bu reklamın URL'ini güncelle!`);
        }
      } else {
        console.log(`   ${isOk ? "✅" : "❌"} URL: ${url}`);
        console.log(`      → ${final} (${status})`);
        if (!isOk) issues++;
      }
    }
    console.log();
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Kontrol edilen: ${checked} reklam`);
  if (issues > 0) {
    console.log(`  ❌ ${issues} sorun bulundu — Aşağıdaki adımları takip edin:`);
  } else {
    console.log(`  ✅ Tüm URL'ler doğru!`);
  }
  console.log("═══════════════════════════════════════════════════════════\n");

  // Ads Manager instructions
  if (issues > 0) {
    console.log("─── ADS MANAGER GÜNCELLEMESİ TALİMATLARI ──────────────\n");
    console.log("1. https://business.facebook.com/adsmanager adresine gidin");
    console.log("2. Yukarıda ❌ işaretli kampanyaları bulun");
    console.log("3. Reklam düzeyinde 'Düzenle' tıklayın");
    console.log("4. 'Hedef' bölümünde URL'i güncelleyin:");
    console.log("   • Sanat_Estetik_Test → https://klemensart.com/testler/gorsel-algi");
    console.log("   • Müze_Gezme_Rehberi_Form → https://klemensart.com/rehber");
    console.log("5. Reklamı 'Aktif' olarak ayarlayın");
    console.log("6. Yayınla / Publish tıklayın\n");
    console.log("NOT: Development modda olduğumuz için URL'ler API'den");
    console.log("     güncellenemiyor. Bu adımları Ads Manager'dan yapın.\n");
  }
}

main();
