import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const { data, error } = await admin
    .from("articles")
    .select("slug, title, category, status, content")
    .order("title");

  if (error) { console.error(error); return; }

  console.log("--- Boş içerikli makaleler ---\n");
  let emptyCount = 0;
  for (const a of data || []) {
    const isEmpty = !a.content || a.content.trim().length < 50;
    if (isEmpty) {
      emptyCount++;
      console.log(`[${a.status}] ${a.slug} — "${a.title}" (${a.category})`);
    }
  }
  console.log(`\nToplam: ${emptyCount} boş makale / ${data?.length} toplam`);

  // Also search for "miras"
  console.log("\n--- 'miras' içeren makaleler ---");
  for (const a of data || []) {
    if (a.title?.toLowerCase().includes("miras") || a.slug?.includes("miras") || a.category?.toLowerCase().includes("miras")) {
      const isEmpty = !a.content || a.content.trim().length < 50;
      console.log(`[${a.status}] ${a.slug} — "${a.title}" (${a.category}) — ${isEmpty ? 'BOŞ' : 'DOLU'}`);
    }
  }
}
main();
