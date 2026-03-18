import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });
import { createClient } from "@supabase/supabase-js";
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // 1. Meta leads tablosu
  const { data: leads, count: leadCount } = await sb
    .from("meta_leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(10);
  console.log("=== META LEADS ===");
  console.log("Toplam:", leadCount);
  for (const l of leads || []) {
    console.log(
      l.created_at?.substring(0, 16),
      "|",
      l.email,
      "|",
      l.full_name,
      "|",
      l.form_name
    );
  }

  // 2. Subscribers tablosu
  const { count: subCount } = await sb
    .from("subscribers")
    .select("*", { count: "exact", head: true });
  console.log("\n=== SUBSCRIBERS ===");
  console.log("Toplam:", subCount);

  // Son 15 abone
  const { data: subs } = await sb
    .from("subscribers")
    .select("email,source,created_at,status")
    .order("created_at", { ascending: false })
    .limit(15);
  for (const s of subs || []) {
    console.log(
      s.created_at?.substring(0, 16),
      "|",
      s.status,
      "|",
      (s.source || "unknown").padEnd(15),
      "|",
      s.email
    );
  }

  // 3. Meta leadgen kaynaklı aboneler
  const { count: metaSubCount } = await sb
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .eq("source", "meta_leadgen");
  console.log("\n=== META LEADGEN KAYNAKLI ABONELER ===");
  console.log("Toplam:", metaSubCount);

  // 4. Kaynaklara göre dağılım
  const { data: allSubs } = await sb.from("subscribers").select("source");
  const counts: Record<string, number> = {};
  for (const s of allSubs || []) {
    const key = s.source || "unknown";
    counts[key] = (counts[key] || 0) + 1;
  }
  console.log("\n=== KAYNAK DAĞILIMI ===");
  const sorted = Object.entries(counts).sort(
    (a, b) => (b[1] as number) - (a[1] as number)
  );
  for (const [k, v] of sorted) {
    console.log(String(v).padStart(5), "|", k);
  }

  // 5. Haftalık abone artışı (son 4 hafta)
  console.log("\n=== HAFTALIK ABONE ARTIŞI ===");
  for (let i = 0; i < 4; i++) {
    const start = new Date(Date.now() - (i + 1) * 7 * 86400000).toISOString();
    const end = new Date(Date.now() - i * 7 * 86400000).toISOString();
    const { count } = await sb
      .from("subscribers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", start)
      .lt("created_at", end);
    const label =
      i === 0
        ? "Bu hafta"
        : i === 1
          ? "Geçen hafta"
          : `${i + 1} hafta önce`;
    console.log(label.padEnd(15), "|", count, "yeni abone");
  }

  // 6. Webhook son çalışma logları — meta_leads son kayıtlar
  console.log("\n=== SON META LEAD KAYITLARI (tarih sırası) ===");
  const { data: recentLeads } = await sb
    .from("meta_leads")
    .select("created_at,email,form_name")
    .order("created_at", { ascending: false })
    .limit(5);
  for (const l of recentLeads || []) {
    console.log(l.created_at?.substring(0, 16), "|", l.form_name, "|", l.email);
  }
}

main();
