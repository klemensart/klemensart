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
    if (!data) continue;
    const clean = (data.content || "")
      .replace(/^#.*\n/gm, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .trim();
    // İlk 1500 karakter
    console.log(`\n=== ${data.title} ===`);
    console.log(clean.slice(0, 1500));
    console.log("\n---");
  }
}
main().catch(console.error);
