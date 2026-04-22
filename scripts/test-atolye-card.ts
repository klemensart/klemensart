import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { generateAtolyeDesignRows } from "../src/lib/auto-atolye-card";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATOLYE_ID = "09aa8850-b421-41b1-8d92-ab48bdfa00d6";

async function main() {
  const { data: event } = await sb
    .from("marketplace_events")
    .select(
      "id, title, category, city, district, venue_name, price, currency, event_date, end_date, image_url, host_id, organizer_name, organizer_logo_url"
    )
    .eq("id", ATOLYE_ID)
    .single();

  if (!event) {
    console.error("Atölye bulunamadı");
    return;
  }

  let instructorName = event.organizer_name;
  let instructorAvatarUrl: string | null = null;

  if (event.host_id) {
    const { data: person } = await sb
      .from("people")
      .select("name, avatar_url")
      .eq("id", event.host_id)
      .single();
    if (person) {
      instructorName = person.name || instructorName;
      instructorAvatarUrl = person.avatar_url;
    }
  }

  const input = {
    id: event.id,
    title: event.title,
    category: event.category || "diger",
    startDate: event.event_date,
    endDate: event.end_date,
    instructorName,
    instructorAvatarUrl,
    venue: event.venue_name,
    city: event.city || "Ankara",
    district: event.district,
    price: event.price ?? 0,
    currency: event.currency || "TRY",
    coverImageUrl: event.image_url,
    organizerLogoUrl: event.organizer_logo_url,
  };

  console.log("Input:", JSON.stringify(input, null, 2));
  console.log();

  const rows = generateAtolyeDesignRows(input);

  // Eski design'ları sil
  const { count } = await sb
    .from("designs")
    .delete()
    .eq("linked_entity_id", event.id)
    .select("id", { count: "exact", head: true });
  if (count) console.log(`${count} eski design silindi`);

  // Yeni design'ları ekle
  const { data: designs, error } = await sb
    .from("designs")
    .insert(rows)
    .select("id, name, platform, width, height");

  if (error) {
    console.error("INSERT HATA:", error.message);
    return;
  }

  console.log("Oluşturulan tasarımlar:");
  for (const d of designs!) {
    console.log(`  [${d.platform}] ${d.width}x${d.height}`);
    console.log(`    ${d.name}`);
    console.log(`    /admin/tasarim/${d.id}`);
  }
}

main();
