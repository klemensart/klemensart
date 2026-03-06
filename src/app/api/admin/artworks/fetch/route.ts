import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

const MET_SEARCH = "https://collectionapi.metmuseum.org/public/collection/v1/search";
const MET_OBJECT = "https://collectionapi.metmuseum.org/public/collection/v1/objects";

export async function POST(req: NextRequest) {
  // Auth check
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { artistName } = await req.json();
  if (!artistName || typeof artistName !== "string") {
    return NextResponse.json(
      { error: "artistName gerekli." },
      { status: 400 }
    );
  }

  // 1) Search Met API
  const searchUrl = `${MET_SEARCH}?artistOrCulture=true&hasImages=true&q=${encodeURIComponent(artistName)}`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    return NextResponse.json(
      { error: "Met API araması başarısız oldu." },
      { status: 502 }
    );
  }

  const searchData = await searchRes.json();
  const objectIDs: number[] = searchData.objectIDs ?? [];

  if (objectIDs.length === 0) {
    return NextResponse.json({
      message: `"${artistName}" için Met koleksiyonunda eser bulunamadı.`,
      found: 0,
      inserted: 0,
    });
  }

  // 2) Fetch first 20 objects in parallel
  const batch = objectIDs.slice(0, 20);
  const objectResults = await Promise.allSettled(
    batch.map((id) => fetch(`${MET_OBJECT}/${id}`).then((r) => r.json()))
  );

  // 3) Filter: only those with primaryImage
  const artworks = objectResults
    .filter(
      (r): r is PromiseFulfilledResult<Record<string, unknown>> =>
        r.status === "fulfilled" && !!r.value.primaryImage
    )
    .map((r) => ({
      artist_name: String(r.value.artistDisplayName || artistName),
      artwork_title: String(r.value.title || "Untitled"),
      year: String(r.value.objectDate || ""),
      medium: String(r.value.medium || ""),
      image_url: String(r.value.primaryImage),
      museum: "Metropolitan Museum of Art",
    }));

  if (artworks.length === 0) {
    return NextResponse.json({
      message: `"${artistName}" için görsel içeren eser bulunamadı.`,
      found: 0,
      inserted: 0,
    });
  }

  // 4) Upsert into Supabase (skip duplicates via onConflict)
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("artworks")
    .upsert(artworks, { onConflict: "artist_name,artwork_title", ignoreDuplicates: true })
    .select("id");

  if (error) {
    return NextResponse.json(
      { error: `Veritabanı hatası: ${error.message}` },
      { status: 500 }
    );
  }

  const inserted = data?.length ?? 0;

  return NextResponse.json({
    message: `${artworks.length} eser bulundu, ${inserted} yeni eser veritabanına eklendi.`,
    found: artworks.length,
    inserted,
  });
}
