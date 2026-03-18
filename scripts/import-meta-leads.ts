/**
 * Meta Lead Form'daki tüm lead'leri çek ve subscribers + meta_leads tablolarına aktar
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const pageToken = process.env.META_PAGE_ACCESS_TOKEN!;
const appSecret = process.env.META_APP_SECRET!;
const API = "https://graph.facebook.com/v21.0";

// appsecret_proof
import { createHmac } from "crypto";
const proof = createHmac("sha256", appSecret).update(pageToken).digest("hex");

const FORM_ID = "1427804195378942"; // Müze_Gezme_Rehberi_Form

async function fetchLeads(after?: string): Promise<{ leads: any[]; next?: string }> {
  let url = `${API}/${FORM_ID}/leads?fields=id,created_time,field_data&limit=50&access_token=${pageToken}&appsecret_proof=${proof}`;
  if (after) url += `&after=${after}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) {
    console.error("API hata:", data.error.message);
    return { leads: [] };
  }
  return {
    leads: data.data || [],
    next: data.paging?.cursors?.after,
  };
}

async function main() {
  console.log("Meta Lead Form'dan tüm lead'ler çekiliyor...\n");

  let allLeads: any[] = [];
  let cursor: string | undefined;
  let page = 0;

  // Tüm sayfaları çek
  while (true) {
    page++;
    const { leads, next } = await fetchLeads(cursor);
    if (leads.length === 0) break;
    allLeads.push(...leads);
    console.log(`Sayfa ${page}: ${leads.length} lead (toplam: ${allLeads.length})`);
    if (!next) break;
    cursor = next;
  }

  console.log(`\nToplam ${allLeads.length} lead çekildi.\n`);

  // Parse et
  let imported = 0;
  let duplicates = 0;
  let errors = 0;
  let noEmail = 0;

  for (const lead of allLeads) {
    const fields: Array<{ name: string; values: string[] }> = lead.field_data || [];
    const findField = (...names: string[]) =>
      fields.find((f: any) => names.includes(f.name))?.values?.[0]?.trim();

    const email = findField("email", "e-posta")?.toLowerCase();
    const fullName = findField("full_name", "adı_soyadı");
    const firstName = findField("first_name", "adı");
    const lastName = findField("last_name", "soyadı");
    const name = fullName || [firstName, lastName].filter(Boolean).join(" ") || null;

    if (!email) {
      noEmail++;
      continue;
    }

    // 1. meta_leads'e kaydet
    const { error: leadErr } = await sb.from("meta_leads").insert({
      meta_lead_id: lead.id,
      email,
      name,
      form_id: FORM_ID,
      page_id: "110198542171215",
      processed: true,
    });

    if (leadErr) {
      if (leadErr.code === "23505") {
        duplicates++;
      } else {
        errors++;
        if (errors <= 3) console.error("meta_leads insert hata:", leadErr.message);
      }
      continue;
    }

    // 2. subscribers'a upsert
    const { data: existing } = await sb
      .from("subscribers")
      .select("id, is_active")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      if (!existing.is_active) {
        await sb
          .from("subscribers")
          .update({ is_active: true, source: "meta_leadgen" })
          .eq("id", existing.id);
      }
    } else {
      await sb.from("subscribers").insert({
        email,
        name,
        source: "meta_leadgen",
        is_active: true,
      });
    }

    imported++;
  }

  console.log("════════════════════════════════════════");
  console.log("  IMPORT SONUCU");
  console.log("════════════════════════════════════════");
  console.log(`Toplam lead:    ${allLeads.length}`);
  console.log(`Yeni eklenen:   ${imported}`);
  console.log(`Duplicate:      ${duplicates}`);
  console.log(`Email yok:      ${noEmail}`);
  console.log(`Hata:           ${errors}`);
  console.log("════════════════════════════════════════");
}

main();
