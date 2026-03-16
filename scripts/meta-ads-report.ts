/**
 * Meta (Facebook) Ads Performans Raporu
 *
 * Kullanım:
 *   npx tsx scripts/meta-ads-report.ts                 # Son 30 gün
 *   npx tsx scripts/meta-ads-report.ts --days 7        # Son 7 gün
 *   npx tsx scripts/meta-ads-report.ts --days 90       # Son 90 gün
 *   npx tsx scripts/meta-ads-report.ts --daily          # Günlük kırılım
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const TOKEN = process.env.META_ACCESS_TOKEN!;
const AD_ACCOUNT = process.env.META_AD_ACCOUNT_ID!;
const API_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${API_VERSION}`;

if (!TOKEN || !AD_ACCOUNT) {
  console.error("META_ACCESS_TOKEN ve META_AD_ACCOUNT_ID .env.local'de tanımlı olmalı.");
  process.exit(1);
}

// ── Args ──────────────────────────────────────────────
const args = process.argv.slice(2);
const daysIdx = args.indexOf("--days");
const days = daysIdx !== -1 ? parseInt(args[daysIdx + 1], 10) : 30;
const daily = args.includes("--daily");

function dateRange(d: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - d);
  const fmt = (dt: Date) => dt.toISOString().split("T")[0];
  return { since: fmt(start), until: fmt(end) };
}

// ── API helpers ───────────────────────────────────────
async function fetchGraph(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set("access_token", TOKEN);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Meta API Error: ${JSON.stringify(err.error ?? err)}`);
  }
  return res.json();
}

// ── Account Summary ───────────────────────────────────
async function accountSummary() {
  const data = await fetchGraph(AD_ACCOUNT, {
    fields: "name,account_status,currency,balance,amount_spent",
  });
  return data;
}

// ── Campaign Insights ─────────────────────────────────
async function campaignInsights() {
  const { since, until } = dateRange(days);
  const params: Record<string, string> = {
    fields: "campaign_name,objective,impressions,reach,clicks,ctr,cpc,cpm,spend,actions,cost_per_action_type",
    level: "campaign",
    time_range: JSON.stringify({ since, until }),
    limit: "100",
    sort: "spend_descending",
  };
  if (daily) params.time_increment = "1";
  const data = await fetchGraph(`${AD_ACCOUNT}/insights`, params);
  return data.data ?? [];
}

// ── Account-level Insights ────────────────────────────
async function accountInsights() {
  const { since, until } = dateRange(days);
  const data = await fetchGraph(`${AD_ACCOUNT}/insights`, {
    fields: "impressions,reach,clicks,ctr,cpc,cpm,spend,actions",
    time_range: JSON.stringify({ since, until }),
  });
  return data.data?.[0] ?? null;
}

// ── Active Campaigns ──────────────────────────────────
async function activeCampaigns() {
  const data = await fetchGraph(`${AD_ACCOUNT}/campaigns`, {
    fields: "name,status,objective,daily_budget,lifetime_budget,start_time",
    filtering: JSON.stringify([{ field: "effective_status", operator: "IN", value: ["ACTIVE"] }]),
    limit: "50",
  });
  return data.data ?? [];
}

// ── Helpers ───────────────────────────────────────────
function money(v: string | number) {
  return Number(v).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(v: string | number) {
  return Number(v).toFixed(2) + "%";
}

function getAction(actions: Array<{ action_type: string; value: string }> | undefined, type: string) {
  if (!actions) return "0";
  const a = actions.find((x) => x.action_type === type);
  return a?.value ?? "0";
}

function getActionCost(costs: Array<{ action_type: string; value: string }> | undefined, type: string) {
  if (!costs) return null;
  const a = costs.find((x) => x.action_type === type);
  return a ? Number(a.value) : null;
}

// ── Main ──────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("              META ADS PERFORMANS RAPORU");
  console.log(`              Son ${days} gün ${daily ? "(günlük kırılım)" : ""}`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Account Summary
  const account = await accountSummary();
  const statusMap: Record<number, string> = { 1: "Aktif", 2: "Devre Dışı", 3: "Askıda", 7: "Beklemede" };
  console.log(`Hesap: ${account.name}`);
  console.log(`Durum: ${statusMap[account.account_status] ?? account.account_status}`);
  console.log(`Para birimi: ${account.currency}`);
  console.log(`Bakiye: ${money(Number(account.balance) / 100)} ₺`);
  console.log(`Toplam harcama (tüm zamanlar): ${money(Number(account.amount_spent) / 100)} ₺`);
  console.log("");

  // Account-level insights
  const total = await accountInsights();
  if (total) {
    console.log("─── GENEL ÖZET ───────────────────────────────────────────────");
    console.log(`  Harcama:     ${money(total.spend)} ₺`);
    console.log(`  Gösterim:    ${Number(total.impressions).toLocaleString("tr-TR")}`);
    console.log(`  Erişim:      ${Number(total.reach).toLocaleString("tr-TR")}`);
    console.log(`  Tıklama:     ${Number(total.clicks).toLocaleString("tr-TR")}`);
    console.log(`  CTR:         ${pct(total.ctr)}`);
    console.log(`  CPC:         ${money(total.cpc)} ₺`);
    console.log(`  CPM:         ${money(total.cpm)} ₺`);

    const linkClicks = getAction(total.actions, "link_click");
    const leads = getAction(total.actions, "lead");
    const landingViews = getAction(total.actions, "landing_page_view");
    const addToCart = getAction(total.actions, "omni_add_to_cart");
    const videoViews = getAction(total.actions, "video_view");

    console.log(`  Link tıklama: ${Number(linkClicks).toLocaleString("tr-TR")}`);
    console.log(`  Sayfa görüntüleme: ${Number(landingViews).toLocaleString("tr-TR")}`);
    console.log(`  Lead: ${leads}`);
    console.log(`  Sepete ekleme: ${addToCart}`);
    console.log(`  Video izleme: ${Number(videoViews).toLocaleString("tr-TR")}`);
    console.log("");
  }

  // Active campaigns
  const active = await activeCampaigns();
  console.log(`─── AKTİF KAMPANYALAR (${active.length}) ────────────────────────────────`);
  for (const c of active) {
    const budget = c.daily_budget
      ? `Günlük: ${money(Number(c.daily_budget) / 100)} ₺`
      : c.lifetime_budget
        ? `Toplam: ${money(Number(c.lifetime_budget) / 100)} ₺`
        : "CBO / üst seviye bütçe";
    const obj = c.objective?.replace("OUTCOME_", "") ?? "?";
    console.log(`  • ${c.name}`);
    console.log(`    Hedef: ${obj} | Bütçe: ${budget}`);
  }
  console.log("");

  // Campaign insights
  const campaigns = await campaignInsights();

  if (daily) {
    // Daily breakdown
    console.log("─── GÜNLÜK KIRILIM ───────────────────────────────────────────");
    const byDate = new Map<string, { spend: number; impressions: number; clicks: number }>();
    for (const row of campaigns) {
      const key = row.date_start;
      const existing = byDate.get(key) ?? { spend: 0, impressions: 0, clicks: 0 };
      existing.spend += Number(row.spend);
      existing.impressions += Number(row.impressions);
      existing.clicks += Number(row.clicks);
      byDate.set(key, existing);
    }
    const sorted = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    console.log("  Tarih       | Harcama    | Gösterim | Tıklama | CTR");
    console.log("  ------------|------------|----------|---------|------");
    for (const [date, d] of sorted) {
      const ctr = d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(2) : "0.00";
      console.log(
        `  ${date} | ${money(d.spend).padStart(10)} | ${d.impressions.toLocaleString("tr-TR").padStart(8)} | ${d.clicks.toLocaleString("tr-TR").padStart(7)} | ${ctr}%`
      );
    }
    console.log("");
  }

  // Campaign-level performance table
  console.log("─── KAMPANYA PERFORMANSI ──────────────────────────────────────\n");

  // Sort by spend descending (already sorted by API)
  const uniqueCampaigns = daily
    ? aggregateCampaigns(campaigns)
    : campaigns;

  for (const c of uniqueCampaigns) {
    const spend = Number(c.spend);
    if (spend === 0 && Number(c.impressions) === 0) continue;

    console.log(`  📊 ${c.campaign_name}`);
    console.log(`     Harcama: ${money(spend)} ₺ | Gösterim: ${Number(c.impressions).toLocaleString("tr-TR")} | Erişim: ${Number(c.reach).toLocaleString("tr-TR")}`);
    console.log(`     Tıklama: ${Number(c.clicks).toLocaleString("tr-TR")} | CTR: ${pct(c.ctr ?? 0)} | CPC: ${c.cpc ? money(c.cpc) + " ₺" : "-"}`);

    // Key actions
    const linkClicks = getAction(c.actions, "link_click");
    const leads = getAction(c.actions, "lead");
    const landingViews = getAction(c.actions, "landing_page_view");
    const addToCart = getAction(c.actions, "omni_add_to_cart");
    const videoViews = getAction(c.actions, "video_view");
    const saves = getAction(c.actions, "onsite_conversion.post_save");

    const parts: string[] = [];
    if (Number(linkClicks) > 0) parts.push(`Link tıklama: ${linkClicks}`);
    if (Number(landingViews) > 0) parts.push(`Sayfa görüntüleme: ${landingViews}`);
    if (Number(leads) > 0) {
      const cpl = spend > 0 ? money(spend / Number(leads)) : "-";
      parts.push(`Lead: ${leads} (CPL: ${cpl} ₺)`);
    }
    if (Number(addToCart) > 0) parts.push(`Sepete ekleme: ${addToCart}`);
    if (Number(videoViews) > 0) parts.push(`Video izleme: ${videoViews}`);
    if (Number(saves) > 0) parts.push(`Kaydetme: ${saves}`);

    if (parts.length > 0) {
      console.log(`     ${parts.join(" | ")}`);
    }
    console.log("");
  }

  // Performance scoring
  console.log("─── PERFORMANS DEĞERLENDİRMESİ ───────────────────────────────\n");

  const scorable = uniqueCampaigns.filter((c: any) => Number(c.spend) > 50);
  if (scorable.length > 0) {
    // Best CTR
    const bestCTR = scorable.reduce((best: any, c: any) =>
      Number(c.ctr ?? 0) > Number(best.ctr ?? 0) ? c : best
    );
    console.log(`  🏆 En iyi CTR: ${bestCTR.campaign_name} (${pct(bestCTR.ctr)})`);

    // Best CPC (lowest)
    const withCPC = scorable.filter((c: any) => c.cpc && Number(c.cpc) > 0);
    if (withCPC.length > 0) {
      const bestCPC = withCPC.reduce((best: any, c: any) =>
        Number(c.cpc) < Number(best.cpc) ? c : best
      );
      console.log(`  💰 En düşük CPC: ${bestCPC.campaign_name} (${money(bestCPC.cpc)} ₺)`);
    }

    // Highest spend
    const topSpend = scorable.reduce((best: any, c: any) =>
      Number(c.spend) > Number(best.spend) ? c : best
    );
    console.log(`  📈 En çok harcama: ${topSpend.campaign_name} (${money(topSpend.spend)} ₺)`);

    // Lead efficiency
    const leadCampaigns = scorable.filter((c: any) => Number(getAction(c.actions, "lead")) > 0);
    if (leadCampaigns.length > 0) {
      const bestLead = leadCampaigns.reduce((best: any, c: any) => {
        const costA = Number(best.spend) / Number(getAction(best.actions, "lead"));
        const costB = Number(c.spend) / Number(getAction(c.actions, "lead"));
        return costB < costA ? c : best;
      });
      const cpl = Number(bestLead.spend) / Number(getAction(bestLead.actions, "lead"));
      console.log(`  🎯 En verimli lead: ${bestLead.campaign_name} (CPL: ${money(cpl)} ₺)`);
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  Not: Bu token ~1 saat geçerlidir. Uzun süreli kullanım");
  console.log("  için System User token oluşturulmalıdır.");
  console.log("═══════════════════════════════════════════════════════════════");
}

// Aggregate daily rows into campaign-level
function aggregateCampaigns(rows: any[]) {
  const map = new Map<string, any>();
  for (const row of rows) {
    const key = row.campaign_name;
    if (!map.has(key)) {
      map.set(key, { ...row, spend: Number(row.spend), impressions: Number(row.impressions), clicks: Number(row.clicks), reach: Number(row.reach) });
    } else {
      const existing = map.get(key)!;
      existing.spend += Number(row.spend);
      existing.impressions += Number(row.impressions);
      existing.clicks += Number(row.clicks);
      existing.reach += Number(row.reach);
      existing.ctr = existing.impressions > 0 ? (existing.clicks / existing.impressions) * 100 : 0;
      existing.cpc = existing.clicks > 0 ? existing.spend / existing.clicks : 0;
      existing.cpm = existing.impressions > 0 ? (existing.spend / existing.impressions) * 1000 : 0;
      // Merge actions
      if (row.actions) {
        if (!existing.actions) existing.actions = [];
        for (const a of row.actions) {
          const ea = existing.actions.find((x: any) => x.action_type === a.action_type);
          if (ea) ea.value = String(Number(ea.value) + Number(a.value));
          else existing.actions.push({ ...a });
        }
      }
    }
  }
  return [...map.values()].sort((a, b) => b.spend - a.spend);
}

main().catch((err) => {
  console.error("Hata:", err.message);
  process.exit(1);
});
