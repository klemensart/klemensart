/**
 * PageSpeed Insights API — Core Web Vitals Raporu
 *
 * Kullanım:
 *   npx tsx scripts/pagespeed-report.ts                  # Varsayılan sayfalar
 *   npx tsx scripts/pagespeed-report.ts <url>            # Tek URL
 *
 * API key gerektirmez (günlük 25 istek sınırı keyless).
 */

const BASE = "https://klemensart.com";

const DEFAULT_PAGES = [
  "/",
  "/icerikler",
  "/atolyeler",
  "/haberler",
  "/etkinlikler",
  "/harita",
  "/testler",
  "/bulten",
];

interface CWVMetric {
  id: string;
  title: string;
  score: number | null;
  numericValue?: number;
  displayValue?: string;
}

interface PageResult {
  url: string;
  strategy: string;
  score: number;
  lcp: CWVMetric;
  fid: CWVMetric;
  cls: CWVMetric;
  ttfb: CWVMetric;
  fcp: CWVMetric;
  si: CWVMetric;
  tbt: CWVMetric;
}

async function analyze(url: string, strategy: "mobile" | "desktop"): Promise<PageResult | null> {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      console.error(`  ✗ ${strategy}: HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    const lh = data.lighthouseResult;
    if (!lh) return null;

    const perfScore = Math.round((lh.categories?.performance?.score ?? 0) * 100);
    const audits = lh.audits ?? {};

    const getMetric = (key: string): CWVMetric => ({
      id: key,
      title: audits[key]?.title ?? key,
      score: audits[key]?.score ?? null,
      numericValue: audits[key]?.numericValue,
      displayValue: audits[key]?.displayValue,
    });

    return {
      url,
      strategy,
      score: perfScore,
      lcp: getMetric("largest-contentful-paint"),
      fid: getMetric("max-potential-fid"),
      cls: getMetric("cumulative-layout-shift"),
      ttfb: getMetric("server-response-time"),
      fcp: getMetric("first-contentful-paint"),
      si: getMetric("speed-index"),
      tbt: getMetric("total-blocking-time"),
    };
  } catch (err) {
    console.error(`  ✗ ${strategy}: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

function scoreColor(score: number): string {
  if (score >= 90) return "🟢";
  if (score >= 50) return "🟡";
  return "🔴";
}

function metricStatus(metric: CWVMetric): string {
  return metric.displayValue ?? (metric.numericValue ? `${Math.round(metric.numericValue)}ms` : "N/A");
}

async function main() {
  const arg = process.argv[2];
  const urls = arg
    ? [arg.startsWith("http") ? arg : `${BASE}${arg}`]
    : DEFAULT_PAGES.map((p) => `${BASE}${p}`);

  console.log("=== PAGESPEED INSIGHTS RAPORU ===");
  console.log(`Tarih: ${new Date().toISOString().slice(0, 10)}`);
  console.log(`Sayfa sayısı: ${urls.length}\n`);

  const results: PageResult[] = [];

  for (const url of urls) {
    const path = url.replace(BASE, "") || "/";
    console.log(`--- ${path} ---`);

    // Run mobile and desktop sequentially (API rate limit)
    const mobile = await analyze(url, "mobile");
    const desktop = await analyze(url, "desktop");

    if (mobile) {
      results.push(mobile);
      console.log(`  Mobil:   ${scoreColor(mobile.score)} ${mobile.score}/100  LCP: ${metricStatus(mobile.lcp)}  CLS: ${metricStatus(mobile.cls)}  TBT: ${metricStatus(mobile.tbt)}  TTFB: ${metricStatus(mobile.ttfb)}`);
    }
    if (desktop) {
      results.push(desktop);
      console.log(`  Desktop: ${scoreColor(desktop.score)} ${desktop.score}/100  LCP: ${metricStatus(desktop.lcp)}  CLS: ${metricStatus(desktop.cls)}  TBT: ${metricStatus(desktop.tbt)}  TTFB: ${metricStatus(desktop.ttfb)}`);
    }
    console.log();

    // Rate limit: 1 request per 2 seconds (keyless limit)
    if (urls.length > 1) await new Promise((r) => setTimeout(r, 3000));
  }

  // Summary
  if (results.length > 0) {
    const mobileResults = results.filter((r) => r.strategy === "mobile");
    const desktopResults = results.filter((r) => r.strategy === "desktop");

    const avgMobile = mobileResults.length > 0
      ? Math.round(mobileResults.reduce((s, r) => s + r.score, 0) / mobileResults.length)
      : 0;
    const avgDesktop = desktopResults.length > 0
      ? Math.round(desktopResults.reduce((s, r) => s + r.score, 0) / desktopResults.length)
      : 0;

    console.log("=== ÖZET ===");
    console.log(`Ortalama Mobil:   ${scoreColor(avgMobile)} ${avgMobile}/100`);
    console.log(`Ortalama Desktop: ${scoreColor(avgDesktop)} ${avgDesktop}/100`);

    // Find worst pages
    const worstMobile = mobileResults.sort((a, b) => a.score - b.score)[0];
    const worstDesktop = desktopResults.sort((a, b) => a.score - b.score)[0];
    if (worstMobile) console.log(`En yavaş (mobil):   ${worstMobile.url.replace(BASE, "")} → ${worstMobile.score}/100`);
    if (worstDesktop) console.log(`En yavaş (desktop): ${worstDesktop.url.replace(BASE, "")} → ${worstDesktop.score}/100`);
  }
}

main().catch(console.error);
