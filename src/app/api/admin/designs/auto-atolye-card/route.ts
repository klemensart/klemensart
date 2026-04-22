import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { generateAtolyeDesignRows } from "@/lib/auto-atolye-card";
import type { AtolyeCardInput } from "@/lib/auto-atolye-card";

/**
 * POST { atolyeId }
 * Belirtilen atölye için 3 formatta (feed, story, landscape)
 * otomatik sosyal medya görseli oluşturur.
 * Aynı atölye için mevcut design varsa üzerine yazar.
 */
export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const atolyeId = body.atolyeId;

  if (!atolyeId) {
    return NextResponse.json({ error: "atolyeId gerekli" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Atölye bilgisini çek
  const { data: event, error: eventError } = await admin
    .from("marketplace_events")
    .select(
      "id, title, category, city, district, venue_name, price, currency, event_date, end_date, image_url, host_id, organizer_name, organizer_logo_url"
    )
    .eq("id", atolyeId)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Atölye bulunamadı" }, { status: 404 });
  }

  // Eğitmen avatar URL'si (host_id varsa people tablosundan çek)
  let instructorAvatarUrl: string | null = null;
  let instructorName: string | null = event.organizer_name;

  if (event.host_id) {
    const { data: person } = await admin
      .from("people")
      .select("name, avatar_url")
      .eq("id", event.host_id)
      .single();

    if (person) {
      instructorAvatarUrl = person.avatar_url;
      if (person.name) instructorName = person.name;
    }
  }

  // Input objesi oluştur
  const input: AtolyeCardInput & { id: string } = {
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

  // 3 format için design row'ları üret
  const designRows = generateAtolyeDesignRows(input, user.id);

  // Aynı atölye için mevcut design'ları sil
  await admin
    .from("designs")
    .delete()
    .eq("linked_entity_id", atolyeId);

  // Yeni design'ları ekle
  const { data: designs, error: insertError } = await admin
    .from("designs")
    .insert(designRows)
    .select("id, platform");

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    designs: designs ?? [],
    message: `"${event.title}" için ${designRows.length} tasarım oluşturuldu.`,
  });
}
