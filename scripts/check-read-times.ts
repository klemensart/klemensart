import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const slugs = [
  "tuz-ates-ve-sanat",
  "tuz-golunden-muranoya-bir-mineralin-yolculugu",
  "esikte-bir-bekci",
  "kozmik-tuz-yildizlardan-bedene-uzanan-hareket-dramaturgisi",
  "corbada-bizim-de-tuzumuz-olsun-deniz-suyunu-aritmak",
  "habamam-sinifi-haytalik-mi-zorbalik-mi-",
  "deniz-cekilir-tuz-kalir-kaunos-antik-kenti",
  "tuzun-sessiz-kardesi",
  "tuzla-yazilan-hafiza-motoi-yamamoto-nun-yas-ritueli",
  "ve-kadin-tuz-olur",
  "tiamat-canavarlastirlan-tanrica",
  "tuzdan-kaide",
  "tuz-incil",
];

async function main() {
  const { data } = await sb.from("articles").select("slug, title, content").in("slug", slugs);
  if (!data) return;
  for (const a of data) {
    const text = (a.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text.split(" ").filter(Boolean).length;
    const readMin = Math.max(1, Math.ceil(words / 200));
    console.log(`${readMin} DK | ${a.slug} (${words} kelime)`);
  }
}
main();
