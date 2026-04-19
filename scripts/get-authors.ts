import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

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
];

async function main() {
  const { data, error } = await supabase
    .from("articles")
    .select("author, author_email, slug")
    .in("slug", slugs);
  if (error) { console.error(error); return; }
  for (const a of data || []) {
    console.log(a.author + " | " + (a.author_email || "YOK") + " | " + a.slug);
  }
}
main();
