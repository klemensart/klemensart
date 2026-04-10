import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SLUGS = [
  "esikte-bir-bekci",
  "kozmik-tuz-yildizlardan-bedene-uzanan-hareket-dramaturgisi",
  "corbada-bizim-de-tuzumuz-olsun-deniz-suyunu-aritmak",
  "habamam-sinifi-haytalik-mi-zorbalik-mi-",
  "tuzun-sessiz-kardesi",
  "tuzla-yazilan-hafiza-motoi-yamamoto-nun-yas-ritueli",
  "ve-kadin-tuz-olur",
  "tiamat-canavarlastirlan-tanrica",
];

async function main() {
  for (const slug of SLUGS) {
    const { data } = await supabase
      .from("articles")
      .select("title, content")
      .eq("slug", slug)
      .single();
    if (!data) { console.log(`--- ${slug}: NOT FOUND ---\n`); continue; }
    // İlk 800 karakteri göster
    const preview = (data.content || "")
      .replace(/^#.*\n/gm, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .trim()
      .slice(0, 800);
    console.log(`\n=== ${data.title} ===`);
    console.log(preview);
    console.log("---");
  }
}
main().catch(console.error);
