/**
 * Meta Ads detaylı durum kontrolü — kampanya, ad set, reklam seviyesi
 * Kullanım: set -a && source .env.local && set +a && npx tsx scripts/meta-ads-deep-check.ts
 */

const token = process.env.META_ACCESS_TOKEN!;
const accountId = process.env.META_AD_ACCOUNT_ID!;

if (!token || !accountId) {
  console.error("META_ACCESS_TOKEN ve META_AD_ACCOUNT_ID gerekli.");
  process.exit(1);
}

const API = "https://graph.facebook.com/v21.0";

async function gql(path: string) {
  const res = await fetch(`${API}/${path}&access_token=${token}`);
  const data = await res.json();
  if (data.error) {
    console.error(`API Hatası (${path.slice(0, 60)}):`, data.error.message);
    return null;
  }
  return data.data || data;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("         META ADS DERİN ANALİZ RAPORU");
  console.log("═══════════════════════════════════════════════════════════\n");

  // 1. Hesap bilgisi
  const account = await gql(`${accountId}?fields=name,account_status,balance,amount_spent,currency`);
  if (account) {
    console.log(`Hesap: ${account.name}`);
    console.log(`Durum: ${account.account_status === 1 ? "AKTİF" : "SORUNLU (" + account.account_status + ")"}`);
    console.log(`Bakiye: ${(parseInt(account.balance) / 100).toFixed(2)} ${account.currency}`);
    console.log(`Toplam harcama: ${(parseInt(account.amount_spent) / 100).toFixed(2)} ${account.currency}\n`);
  }

  // 2. Kampanyalar
  console.log("─── KAMPANYALAR ──────────────────────────────────────────\n");
  const campaigns = await gql(
    `${accountId}/campaigns?fields=id,name,objective,status,effective_status,daily_budget,lifetime_budget,budget_remaining,start_time,stop_time,bid_strategy&filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE","PAUSED","CAMPAIGN_PAUSED","IN_PROCESS","WITH_ISSUES"]}]&limit=20`
  );

  if (!campaigns) return;

  const campaignMap: Record<string, string> = {};
  for (const c of campaigns) {
    campaignMap[c.id] = c.name;
    const statusIcon = c.effective_status === "ACTIVE" ? "🟢" : c.effective_status === "PAUSED" ? "⏸️" : "⚠️";
    console.log(`${statusIcon} ${c.name}`);
    console.log(`   ID: ${c.id}`);
    console.log(`   Hedef: ${c.objective} | Durum: ${c.status} → ${c.effective_status}`);
    console.log(`   Günlük bütçe: ${c.daily_budget ? (c.daily_budget / 100).toFixed(0) + " ₺" : "Ad set seviyesi"}`);
    console.log(`   Ömür boyu bütçe: ${c.lifetime_budget ? (c.lifetime_budget / 100).toFixed(0) + " ₺" : "-"}`);
    console.log(`   Kalan bütçe: ${c.budget_remaining ? (c.budget_remaining / 100).toFixed(0) + " ₺" : "-"}`);
    console.log(`   Bid strategy: ${c.bid_strategy || "LOWEST_COST"}`);
    console.log(`   Başlangıç: ${c.start_time || "-"} | Bitiş: ${c.stop_time || "süresiz"}\n`);
  }

  // 3. Ad Set'ler
  console.log("─── AD SET'LER (Öğrenme + Dağıtım Durumu) ───────────────\n");
  const adsets = await gql(
    `${accountId}/adsets?fields=id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget,budget_remaining,optimization_goal,bid_amount,start_time,end_time,issues_info&filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE","PAUSED","CAMPAIGN_PAUSED","IN_PROCESS","WITH_ISSUES"]}]&limit=30`
  );

  if (adsets) {
    for (const s of adsets) {
      const campName = campaignMap[s.campaign_id] || s.campaign_id;
      const statusIcon = s.effective_status === "ACTIVE" ? "🟢" : s.effective_status === "PAUSED" ? "⏸️" : s.effective_status === "CAMPAIGN_PAUSED" ? "⏸️" : "⚠️";
      console.log(`${statusIcon} ${s.name}`);
      console.log(`   Kampanya: ${campName}`);
      console.log(`   Durum: ${s.status} → ${s.effective_status}`);
      console.log(`   Günlük bütçe: ${s.daily_budget ? (s.daily_budget / 100).toFixed(0) + " ₺" : "kampanya seviyesi"}`);
      console.log(`   Ömür boyu bütçe: ${s.lifetime_budget ? (s.lifetime_budget / 100).toFixed(0) + " ₺" : "-"}`);
      console.log(`   Kalan bütçe: ${s.budget_remaining ? (s.budget_remaining / 100).toFixed(0) + " ₺" : "-"}`);
      console.log(`   Optimizasyon: ${s.optimization_goal || "-"}`);
      if (s.issues_info && s.issues_info.length > 0) {
        console.log(`   ⚠️ SORUNLAR:`);
        for (const issue of s.issues_info) {
          console.log(`      - ${issue.level}: ${issue.error_summary || issue.error_message || JSON.stringify(issue)}`);
        }
      }
      console.log(`   Başlangıç: ${s.start_time || "-"} | Bitiş: ${s.end_time || "süresiz"}\n`);
    }
  }

  // 4. Reklamlar
  console.log("─── REKLAMLAR (Onay + Sorun Durumu) ──────────────────────\n");
  const ads = await gql(
    `${accountId}/ads?fields=id,name,campaign_id,adset_id,status,effective_status,issues_info&filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE","PAUSED","CAMPAIGN_PAUSED","IN_PROCESS","WITH_ISSUES","DISAPPROVED","PENDING_REVIEW"]}]&limit=30`
  );

  if (ads) {
    for (const ad of ads) {
      const campName = campaignMap[ad.campaign_id] || ad.campaign_id;
      const statusIcon = ad.effective_status === "ACTIVE" ? "🟢" : ad.effective_status === "PAUSED" ? "⏸️" : ad.effective_status === "DISAPPROVED" ? "🚫" : ad.effective_status === "PENDING_REVIEW" ? "🔍" : "⚠️";
      console.log(`${statusIcon} ${ad.name}`);
      console.log(`   Kampanya: ${campName}`);
      console.log(`   Durum: ${ad.status} → ${ad.effective_status}`);
      if (ad.issues_info && ad.issues_info.length > 0) {
        console.log(`   ⚠️ SORUNLAR:`);
        for (const issue of ad.issues_info) {
          console.log(`      - ${issue.level}: ${issue.error_summary || issue.error_message || JSON.stringify(issue)}`);
        }
      }
      console.log();
    }
  }

  // 5. Son 30 gün kampanya bazlı performans
  console.log("─── SON 30 GÜN KAMPANYA PERFORMANSI ─────────────────────\n");
  const insights = await gql(
    `${accountId}/insights?fields=campaign_id,campaign_name,spend,impressions,reach,clicks,ctr,cpc,actions,cost_per_action_type&level=campaign&time_range={"since":"2026-02-15","until":"2026-03-17"}&limit=20`
  );

  if (insights) {
    for (const row of insights) {
      const spend = parseFloat(row.spend || "0");
      if (spend === 0) continue;
      console.log(`📊 ${row.campaign_name}`);
      console.log(`   Harcama: ${spend.toFixed(2)} ₺ | Gösterim: ${row.impressions} | Erişim: ${row.reach}`);
      console.log(`   Tıklama: ${row.clicks} | CTR: ${row.ctr}% | CPC: ${row.cpc ? parseFloat(row.cpc).toFixed(2) + " ₺" : "-"}`);
      if (row.actions) {
        const actions = row.actions as Array<{ action_type: string; value: string }>;
        const important = actions.filter((a) =>
          ["link_click", "landing_page_view", "add_to_cart", "purchase", "lead", "post_engagement", "video_view", "onsite_conversion.post_save"].includes(a.action_type)
        );
        if (important.length > 0) {
          console.log(`   Aksiyonlar:`);
          for (const a of important) {
            console.log(`      ${a.action_type}: ${a.value}`);
          }
        }
      }
      if (row.cost_per_action_type) {
        const costs = row.cost_per_action_type as Array<{ action_type: string; value: string }>;
        const importantCosts = costs.filter((a) =>
          ["link_click", "landing_page_view", "add_to_cart", "purchase", "lead"].includes(a.action_type)
        );
        if (importantCosts.length > 0) {
          console.log(`   Birim maliyetler:`);
          for (const a of importantCosts) {
            console.log(`      ${a.action_type}: ${parseFloat(a.value).toFixed(2)} ₺`);
          }
        }
      }
      console.log();
    }
  }

  // 6. Delivery insights (neden dağıtılmıyor?)
  console.log("─── DAĞITIM ANALİZİ (Aktif Kampanyalar) ─────────────────\n");
  if (adsets) {
    for (const s of adsets) {
      if (s.effective_status !== "ACTIVE") continue;
      const delivery = await gql(
        `${s.id}/delivery_estimate?fields=estimate_dau,estimate_mau,estimate_ready&optimization_goal=${s.optimization_goal || "LINK_CLICKS"}`
      );
      if (delivery && delivery.length > 0) {
        console.log(`📡 ${s.name}`);
        console.log(`   Tahmini günlük erişim: ${delivery[0].estimate_dau || "?"}`);
        console.log(`   Tahmini aylık erişim: ${delivery[0].estimate_mau || "?"}`);
        console.log(`   Hazır mı: ${delivery[0].estimate_ready ? "Evet" : "Hayır"}\n`);
      }
    }
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Rapor tamamlandı.");
  console.log("═══════════════════════════════════════════════════════════");
}

main();
