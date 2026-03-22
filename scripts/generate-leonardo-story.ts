import { createClient } from "@supabase/supabase-js";
import { generateLeonardoStoryDesignRow } from "../src/lib/auto-story";
import * as dotenv from "dotenv";

dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Önceki Leonardo story'lerini temizle
  await supabase
    .from("designs")
    .delete()
    .eq("name", "Story — Leonardo'nun Atölyesi");

  const storyRow = generateLeonardoStoryDesignRow();

  const { data, error } = await supabase
    .from("designs")
    .insert(storyRow)
    .select("id")
    .single();

  if (error) {
    console.error("HATA:", error.message);
    return;
  }

  console.log("Leonardo story tasarımı oluşturuldu! ID:", data.id);
}

main();
