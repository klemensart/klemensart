import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { slugify } from "@/lib/slugify";

async function checkAuth() {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) return null;
  return user;
}

async function generateUniqueSlug(name: string) {
  const admin = createAdminClient();
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await admin
      .from("people")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

// ── GET: Host listesi ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { searchParams } = new URL(req.url);
  const isHost = searchParams.get("is_host");
  const search = searchParams.get("search");

  let query = admin.from("people").select("*").order("name");

  if (isHost === "true") {
    query = query.eq("is_host", true);
  }

  const { data: people, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Workshop count per host
  const { data: events } = await admin
    .from("marketplace_events")
    .select("host_id")
    .eq("status", "active");

  const eventCounts: Record<string, number> = {};
  for (const ev of events ?? []) {
    if (ev.host_id) {
      eventCounts[ev.host_id] = (eventCounts[ev.host_id] || 0) + 1;
    }
  }

  let results = (people ?? []).map((p) => ({
    ...p,
    workshop_count: eventCounts[p.id] || 0,
  }));

  // Client-side search filter on server for efficiency
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.expertise ?? []).some((e: string) => e.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({ people: results });
}

// ── POST: Yeni host oluştur ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug: customSlug, avatar_url, short_bio, bio, expertise, instagram, website, twitter, linkedin, email, phone } = body;

  if (!name || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Ad Soyad zorunludur (en az 2 karakter)" },
      { status: 400 }
    );
  }

  const slug = customSlug ? slugify(customSlug) : await generateUniqueSlug(name);

  // Check slug uniqueness if custom slug provided
  if (customSlug) {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("people")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: `"${slug}" slug'ı zaten kullanılıyor` },
        { status: 409 }
      );
    }
  }

  const admin = createAdminClient();
  const { data: person, error } = await admin
    .from("people")
    .insert({
      name: name.trim(),
      slug,
      is_host: true,
      avatar_url: avatar_url || null,
      short_bio: short_bio || null,
      bio: bio || null,
      expertise: expertise || [],
      instagram: instagram || null,
      website: website || null,
      twitter: twitter || null,
      linkedin: linkedin || null,
      email: email || null,
      metadata: phone ? { phone } : {},
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ person }, { status: 201 });
}
