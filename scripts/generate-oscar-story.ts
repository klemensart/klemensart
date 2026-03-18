import { createClient } from "@supabase/supabase-js";
import { generateStoryDesignRow } from "../src/lib/auto-story";
import * as dotenv from "dotenv";

dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const storyRow = generateStoryDesignRow({
    title: "Altın Heykelciğin Öteki Yüzü",
    description:
      "98. Akademi Ödülleri'nin altın ışıltısının ardındaki çeşitlilik sorunu, ana akım tutuculuğu ve bir Oscar gecesinin Ankara'daki yansıması.",
    author: "Hitit Güneşi",
    category: "Kültür & Sanat",
    image:
      "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/email-assets/article-covers/altin-heykelcigin-oteki-yuzu.jpg",
  });

  const { data, error } = await supabase
    .from("designs")
    .insert(storyRow)
    .select("id")
    .single();

  if (error) {
    console.error("HATA:", error.message);
    return;
  }

  console.log("Story tasarımı oluşturuldu! ID:", data.id);
}

main();
