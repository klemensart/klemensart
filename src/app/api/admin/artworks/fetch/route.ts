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

/* ── Cleveland Museum of Art ────────────────────────── */
async function fetchCMA(artistName: string): Promise<SourceResult> {
  const url = `https://openaccess-api.clevelandart.org/api/artworks/?artists=${encodeURIComponent(artistName)}&has_image=1&limit=20`;
  const res = await fetch(url);
  if (!res.ok) {
    return { found: 0, artworks: [], error: "CMA API araması başarısız oldu." };
  }

  const data = await res.json();
  const items: Record<string, unknown>[] = data.data ?? [];

  const artworks: Artwork[] = items
    .filter((item) => {
      const images = item.images as Record<string, unknown> | undefined;
      return images?.web && (images.web as Record<string, unknown>).url;
    })
    .map((item) => {
      const images = item.images as Record<string, Record<string, unknown>>;
      const creators = item.creators as Array<Record<string, unknown>> | undefined;
      const artistDisplay = creators?.[0]?.description
        ? String(creators[0].description)
        : artistName;
      return {
        artist_name: artistDisplay,
        artwork_title: String(item.title || "Untitled"),
        year: String(item.creation_date || ""),
        medium: String(item.technique || ""),
        image_url: String(images.web.url),
        museum: "Cleveland Museum of Art",
      };
    });

  return { found: artworks.length, artworks };
}

/* ── Smithsonian Institution ────────────────────────── */
async function fetchSmithsonian(artistName: string): Promise<SourceResult> {
  const apiKey = process.env.SMITHSONIAN_API_KEY;
  if (!apiKey) {
    return { found: 0, artworks: [], error: "SMITHSONIAN_API_KEY tanımlı değil." };
  }

  const url = `https://api.si.edu/openaccess/api/v1.0/category/art_design/search?q=${encodeURIComponent(artistName)}&rows=20&api_key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    return { found: 0, artworks: [], error: "Smithsonian API araması başarısız oldu." };
  }

  const data = await res.json();
  const rows: Record<string, unknown>[] = data.response?.rows ?? [];

  const artworks: Artwork[] = [];
  for (const row of rows) {
    const content = row.content as Record<string, unknown> | undefined;
    if (!content) continue;

    const dnr = content.descriptiveNonRepeating as Record<string, unknown> | undefined;
    const freetext = content.freetext as Record<string, Array<Record<string, string>>> | undefined;

    // Check for image
    const onlineMedia = dnr?.online_media as Record<string, unknown> | undefined;
    const media = (onlineMedia?.media as Array<Record<string, unknown>> | undefined)?.[0];
    if (!media) continue;

    const imageUrl = String(media.content || media.thumbnail || "");
    if (!imageUrl) continue;

    // Extract artist name from freetext.name
    const names = freetext?.name ?? [];
    const artistEntry = names.find((n) =>
      ["artist", "designer", "painter", "creator", "author"].some((role) =>
        n.label?.toLowerCase().includes(role)
      )
    );
    const artist = artistEntry?.content || artistName;

    // Title
    const titleObj = dnr?.title as Record<string, string> | undefined;
    const title = titleObj?.content || String(row.title || "Untitled");

    // Date
    const dates = freetext?.date ?? [];
    const year = dates[0]?.content || "";

    // Medium
    const physDesc = freetext?.physicalDescription ?? [];
    const mediumEntry = physDesc.find((p) => p.label?.toLowerCase() === "medium");
    const medium = mediumEntry?.content || "";

    artworks.push({
      artist_name: artist,
      artwork_title: title,
      year,
      medium,
      image_url: imageUrl,
      museum: "Smithsonian Institution",
    });
  }

  return { found: artworks.length, artworks };
}

/* ── Harvard Art Museums ────────────────────────────── */
async function fetchHarvard(artistName: string): Promise<SourceResult> {
  const apiKey = process.env.HARVARD_ART_MUSEUMS_API_KEY;
  if (!apiKey) {
    return { found: 0, artworks: [], error: "HARVARD_ART_MUSEUMS_API_KEY tanımlı değil." };
  }

  const url = `https://api.harvardartmuseums.org/object?person=${encodeURIComponent(artistName)}&hasimage=1&size=20&fields=id,title,primaryimageurl,people,dated,medium&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    return { found: 0, artworks: [], error: "Harvard API araması başarısız oldu." };
  }

  const data = await res.json();
  const records: Record<string, unknown>[] = data.records ?? [];

  const artworks: Artwork[] = records
    .filter((r) => !!r.primaryimageurl)
    .map((r) => {
      const people = r.people as Array<Record<string, unknown>> | undefined;
      const artist = people?.[0]?.name ? String(people[0].name) : artistName;
      return {
        artist_name: artist,
        artwork_title: String(r.title || "Untitled"),
        year: String(r.dated || ""),
        medium: String(r.medium || ""),
        image_url: String(r.primaryimageurl),
        museum: "Harvard Art Museums",
      };
    });

  return { found: artworks.length, artworks };
}

/* ── Victoria and Albert Museum ─────────────────────── */
async function fetchVA(artistName: string): Promise<SourceResult> {
  const url = `https://api.vam.ac.uk/v2/objects/search?q_actor=${encodeURIComponent(artistName)}&images_exist=1&page_size=20`;
  const res = await fetch(url);
  if (!res.ok) {
    return { found: 0, artworks: [], error: "V&A API araması başarısız oldu." };
  }

  const data = await res.json();
  const records: Record<string, unknown>[] = data.records ?? [];

  const artworks: Artwork[] = records
    .filter((r) => !!(r._primaryImageId))
    .map((r) => {
      const maker = r._primaryMaker as Record<string, string> | undefined;
      const artist = maker?.name || artistName;
      return {
        artist_name: artist,
        artwork_title: String(r._primaryTitle || "Untitled"),
        year: String(r._primaryDate || ""),
        medium: String(r.objectType || ""),
        image_url: `https://framemark.vam.ac.uk/collections/${r._primaryImageId}/full/!843,/0/default.jpg`,
        museum: "Victoria and Albert Museum",
      };
    });

  return { found: artworks.length, artworks };
}

/* ── POST handler ───────────────────────────────────── */
const ALL_SOURCES = ["met", "aic", "cma", "smithsonian", "harvard", "va"];

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
  const sources: string[] = body.sources ?? ALL_SOURCES;

  if (!artistName || typeof artistName !== "string") {
    return NextResponse.json(
      { error: "artistName gerekli." },
      { status: 400 }
    );
  }

  // Run selected sources in parallel
  const fetchers: Record<string, () => Promise<SourceResult>> = {
    met: () => fetchMet(artistName),
    aic: () => fetchAIC(artistName),
    cma: () => fetchCMA(artistName),
    smithsonian: () => fetchSmithsonian(artistName),
    harvard: () => fetchHarvard(artistName),
    va: () => fetchVA(artistName),
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
