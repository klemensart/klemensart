import { createAdminClient } from "./supabase-admin";
import type { Person, PersonSummary } from "@/types/people";

const SUMMARY_FIELDS = "id, slug, name, avatar_url, short_bio, instagram";

/** Slug ile tek kişi getir */
export async function getPersonBySlug(
  slug: string
): Promise<Person | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as Person;
}

/** Tüm host'ları getir (is_host=true) */
export async function getHosts(): Promise<PersonSummary[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("people")
    .select(SUMMARY_FIELDS)
    .eq("is_host", true)
    .order("name");
  return (data ?? []) as PersonSummary[];
}

/** Tüm yazarları getir (is_author=true) */
export async function getAuthors(): Promise<PersonSummary[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("people")
    .select(SUMMARY_FIELDS)
    .eq("is_author", true)
    .order("name");
  return (data ?? []) as PersonSummary[];
}

/** Bir kişinin yazılarını getir */
export async function getPersonArticles(personId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("articles")
    .select("slug, title, description, image, date, category, tags")
    .eq("author_id", personId)
    .eq("status", "published")
    .order("date", { ascending: false });
  return data ?? [];
}

/** Bir kişinin düzenlediği atölyeleri getir */
export async function getPersonHostings(personId: string) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("marketplace_events")
    .select(
      "id, slug, title, category, city, event_date, image_url, price, status"
    )
    .eq("host_id", personId)
    .eq("status", "active")
    .order("event_date", { ascending: true });

  // Gelecekte aktif/geçmiş ayrımı için altyapı
  const upcoming = (data ?? []).filter(
    (e) => !e.event_date || new Date(e.event_date) >= new Date(now)
  );
  const past = (data ?? []).filter(
    (e) => e.event_date && new Date(e.event_date) < new Date(now)
  );

  return { upcoming, past, all: data ?? [] };
}
