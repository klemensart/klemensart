// Tuz bülteni #2 makaleleri için okuma sürelerini hesapla
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SLUGS = [
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

const WPM = 200; // Türkçe ortalama okuma hızı

function countWords(text: string): number {
  // Markdown sözdizimini ve özel blokları temizle
  const cleaned = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.split(/\s+/).filter(Boolean).length;
}

async function main() {
  for (const slug of SLUGS) {
    const { data, error } = await supabase
      .from("articles")
      .select("title, content")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      console.log(`${slug.padEnd(60)} -> NOT FOUND`);
      continue;
    }

    const words = countWords(data.content || "");
    const totalSec = Math.round((words / WPM) * 60);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const label = sec === 0 ? `${min} DK` : `${min} DK ${sec} SN`;
    const niceLabel = Math.max(1, Math.round(totalSec / 60));
    console.log(
      `${slug.padEnd(60)} ${String(words).padStart(5)} kelime  ->  ${label}  (~${niceLabel} dk)`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
