import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const slugs = [
  "tuz-golunden-muranoya-bir-mineralin-yolculugu",
  "deniz-cekilir-tuz-kalir-kaunos-antik-kenti",
];
async function main() {
  for (const slug of slugs) {
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
    console.log(`\n=== ${data.title} ===`);
    console.log(clean.slice(0, 1500));
    console.log("\n---");
  }
}
main().catch(console.error);
