/**
 * İki makalenin Supabase content alanını markdown dosyalarından günceller.
 *
 * Kullanım:
 *   npx tsx scripts/update-articles.ts
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

// .env.local dosyasını elle parse et
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
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
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

const slugs = [
  "turk-sanatinda-islamiyet-sonrasi-buyuk-degisim-bilinmeyenler",
  "payam-latifi-ile-dusler-diyarinda",
  "saman-sembolleri",
];

async function update() {
  for (const slug of slugs) {
    const filePath = path.join(contentDir, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      console.error(`Dosya bulunamadı: ${filePath}`);
      continue;
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    const row = {
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
    };

    const { data: result, error } = await admin
      .from("articles")
      .update(row)
      .eq("slug", slug)
      .select("slug, title");

    if (error) {
      console.error(`HATA [${slug}]:`, error.message);
      continue;
    }

    if (!result || result.length === 0) {
      console.log(`Kayıt bulunamadı, insert ediliyor: ${slug}`);
      const { error: insertErr } = await admin
        .from("articles")
        .insert({ ...row, slug, status: "draft" });
      if (insertErr) {
        console.error(`INSERT HATA [${slug}]:`, insertErr.message);
      } else {
        console.log(`INSERT OK: ${slug}`);
      }
    } else {
      console.log(`UPDATE OK: ${result[0].slug} — "${result[0].title}"`);
    }
  }
}

update().catch(console.error);
