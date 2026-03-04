/**
 * Tek seferlik migration: src/content/icerikler/*.md → Supabase articles tablosu
 *
 * Kullanım:
 *   npx tsx scripts/migrate-articles.ts
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

// .env.local dosyasını elle parse et (dotenv bağımlılığı yok)
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
    // Tırnak soyma
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik!");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const contentDir = path.join(process.cwd(), "src/content/icerikler");

async function migrate() {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  console.log(`${files.length} markdown dosyası bulundu.\n`);

  const rows: Record<string, unknown>[] = [];
  const errors: { file: string; error: string }[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
      const { data, content } = matter(raw);

      const slug = file.replace(/\.md$/, "");

      rows.push({
        slug,
        title: data.title ?? "",
        description: data.description ?? "",
        author: data.author ?? "",
        author_ig: data.authorIg ?? null,
        author_email: data.authorEmail ?? null,
        date: data.date ?? null,
        category: data.category ?? "",
        tags: data.tags ?? [],
        image: data.image ?? "",
        content: content.trim(),
        status: "published",
      });
    } catch (e) {
      errors.push({ file, error: (e as Error).message });
    }
  }

  console.log(`${rows.length} yazı parse edildi, ${errors.length} hata.\n`);

  if (rows.length === 0) {
    console.log("Eklenecek yazı yok.");
    return;
  }

  // Toplu insert (Supabase max ~1000 row per request, 77 dosya OK)
  const { data, error } = await admin
    .from("articles")
    .insert(rows)
    .select("slug");

  if (error) {
    console.error("Supabase insert hatası:", error.message);
    console.error("Detay:", error.details);
    return;
  }

  console.log(`${data.length} yazı başarıyla Supabase'e eklendi.`);

  if (errors.length > 0) {
    console.log("\nParse hataları:");
    for (const e of errors) {
      console.log(`  - ${e.file}: ${e.error}`);
    }
  }
}

migrate().catch(console.error);
