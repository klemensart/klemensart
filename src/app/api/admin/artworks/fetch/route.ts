import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

const MET_SEARCH = "https://collectionapi.metmuseum.org/public/collection/v1/search";
const MET_OBJECT = "https://collectionapi.metmuseum.org/public/collection/v1/objects";

type Artwork = {
  artist_name: string;
  artwork_title: string;
  year: string;
  medium: string;
  image_url: string;
  museum: string;
};

type SourceResult = {
  found: number;
  artworks: Artwork[];
  error?: string;
};

/* ── Met Museum ─────────────────────────────────────── */
async function fetchMet(artistName: string): Promise<SourceResult> {
  const searchUrl = `${MET_SEARCH}?artistOrCulture=true&hasImages=true&q=${encodeURIComponent(artistName)}`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    return { found: 0, artworks: [], error: "Met API araması başarısız oldu." };
  }

  const searchData = await searchRes.json();
  const objectIDs: number[] = searchData.objectIDs ?? [];

  if (objectIDs.length === 0) {
    return { found: 0, artworks: [] };
  }

  const batch = objectIDs.slice(0, 20);
  const objectResults = await Promise.allSettled(
    batch.map((id) => fetch(`${MET_OBJECT}/${id}`).then((r) => r.json()))
  );

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

  return { found: artworks.length, artworks };
}

/* ── Rijksmuseum ────────────────────────────────────── */
async function fetchRijks(artistName: string): Promise<SourceResult> {
  const apiKey = process.env.RIJKSMUSEUM_API_KEY;
  if (!apiKey) {
    return { found: 0, artworks: [], error: "RIJKSMUSEUM_API_KEY tanımlı değil." };
  }

  const url = `https://www.rijksmuseum.nl/api/en/collection?key=${apiKey}&q=${encodeURIComponent(artistName)}&ps=20&imgonly=True`;
  const res = await fetch(url);
  if (!res.ok) {
    return { found: 0, artworks: [], error: "Rijksmuseum API araması başarısız oldu." };
  }

  const data = await res.json();
  const artObjects: Record<string, unknown>[] = data.artObjects ?? [];

  const artworks: Artwork[] = artObjects
    .filter((obj) => obj.webImage && (obj.webImage as Record<string, unknown>).url)
    .map((obj) => ({
      artist_name: String(obj.principalOrFirstMaker || artistName),
      artwork_title: String(obj.title || "Untitled"),
      year: obj.dating
        ? String((obj.dating as Record<string, unknown>).sortingDate || "")
        : "",
      medium: "",
      image_url: String((obj.webImage as Record<string, unknown>).url),
      museum: "Rijksmuseum",
    }));

  return { found: artworks.length, artworks };
}

/* ── Art Institute of Chicago ───────────────────────── */
async function fetchAIC(artistName: string): Promise<SourceResult> {
  const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(artistName)}&limit=20&fields=id,title,artist_title,date_display,medium_display,image_id`;
  const res = await fetch(url);
  if (!res.ok) {
    return { found: 0, artworks: [], error: "AIC API araması başarısız oldu." };
  }

  const data = await res.json();
  const items: Record<string, unknown>[] = data.data ?? [];

  const artworks: Artwork[] = items
    .filter((item) => !!item.image_id)
    .map((item) => ({
      artist_name: String(item.artist_title || artistName),
      artwork_title: String(item.title || "Untitled"),
      year: String(item.date_display || ""),
      medium: String(item.medium_display || ""),
      image_url: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
      museum: "Art Institute of Chicago",
    }));

  return { found: artworks.length, artworks };
}

/* ── POST handler ───────────────────────────────────── */
export async function POST(req: NextRequest) {
  // Auth check
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const artistName: string = body.artistName;
  const sources: string[] = body.sources ?? ["met", "rijks", "aic"];

  if (!artistName || typeof artistName !== "string") {
    return NextResponse.json(
      { error: "artistName gerekli." },
      { status: 400 }
    );
  }

  // Run selected sources in parallel
  const fetchers: Record<string, () => Promise<SourceResult>> = {
    met: () => fetchMet(artistName),
    rijks: () => fetchRijks(artistName),
    aic: () => fetchAIC(artistName),
  };

  const selectedFetchers = sources
    .filter((s) => fetchers[s])
    .map((s) => ({ key: s, fn: fetchers[s] }));

  if (selectedFetchers.length === 0) {
    return NextResponse.json(
      { error: "En az bir kaynak seçilmeli." },
      { status: 400 }
    );
  }

  const results = await Promise.allSettled(
    selectedFetchers.map((f) => f.fn())
  );

  // Collect per-source stats and combine artworks
  const allArtworks: Artwork[] = [];
  const breakdown: Record<string, { found: number; error?: string }> = {};

  results.forEach((result, i) => {
    const key = selectedFetchers[i].key;
    if (result.status === "fulfilled") {
      breakdown[key] = { found: result.value.found, error: result.value.error };
      allArtworks.push(...result.value.artworks);
    } else {
      breakdown[key] = { found: 0, error: "Beklenmeyen hata oluştu." };
    }
  });

  if (allArtworks.length === 0) {
    return NextResponse.json({
      message: `"${artistName}" için görsel içeren eser bulunamadı.`,
      breakdown,
      total: { found: 0, inserted: 0 },
    });
  }

  // Upsert into Supabase
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("artworks")
    .upsert(allArtworks, { onConflict: "artist_name,artwork_title", ignoreDuplicates: true })
    .select("id");

  if (error) {
    return NextResponse.json(
      { error: `Veritabanı hatası: ${error.message}` },
      { status: 500 }
    );
  }

  const inserted = data?.length ?? 0;

  return NextResponse.json({
    message: `${allArtworks.length} eser bulundu, ${inserted} yeni eser veritabanına eklendi.`,
    breakdown,
    total: { found: allArtworks.length, inserted },
  });
}
