import { createAdminClient } from "./supabase-admin";
import type { Person, PersonSummary } from "@/types/people";

const SUMMARY_FIELDS = "id, slug, name, avatar_url, short_bio, instagram, expertise";

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

/** Tüm host'ları etkinlik istatistikleriyle getir */
export async function getAllHostsWithStats() {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: hosts } = await supabase
    .from("people")
    .select(SUMMARY_FIELDS)
    .eq("is_host", true)
    .order("name");

  const { data: events } = await supabase
    .from("marketplace_events")
    .select("host_id, event_date, status")
    .eq("status", "active");

  const hostList = (hosts ?? []) as PersonSummary[];
  const eventList = events ?? [];

  return hostList
    .map((h) => {
      const mine = eventList.filter((e) => e.host_id === h.id);
      const upcoming = mine.filter(
        (e) => !e.event_date || new Date(e.event_date) >= new Date(now)
      ).length;
      const past = mine.filter(
        (e) => e.event_date && new Date(e.event_date) < new Date(now)
      ).length;
      return { ...h, eventCount: mine.length, upcoming, past };
    })
    .sort((a, b) => b.upcoming - a.upcoming || a.name.localeCompare(b.name, "tr"));
}

/** Tüm yazarları yazı istatistikleriyle getir */
export async function getAllAuthorsWithStats() {
  const supabase = createAdminClient();

  const { data: authors } = await supabase
    .from("people")
    .select(SUMMARY_FIELDS)
    .eq("is_author", true)
    .order("name");

  const { data: articles } = await supabase
    .from("articles")
    .select("author_id, date")
    .eq("status", "published");

  const authorList = (authors ?? []) as PersonSummary[];
  const articleList = articles ?? [];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  return authorList
    .map((a) => {
      const mine = articleList.filter((ar) => ar.author_id === a.id);
      const hasRecent = mine.some((ar) => ar.date && ar.date >= thirtyDaysAgo);
      return { ...a, articleCount: mine.length, hasRecent };
    })
    .sort((a, b) => b.articleCount - a.articleCount || a.name.localeCompare(b.name, "tr"));
}

const EVENT_CARD_FIELDS =
  "id, slug, title, category, city, district, price, image_url, event_date, is_featured, is_klemens, detail_slug, duration_note, organizer_name, organizer_logo_url";

/** Bir kişinin gelecek atölyelerini getir */
export async function getHostUpcomingEvents(personId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("marketplace_events")
    .select(EVENT_CARD_FIELDS)
    .eq("host_id", personId)
    .eq("status", "active")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });
  return data ?? [];
}

/** Bir kişinin geçmiş atölyelerini getir */
export async function getHostPastEvents(personId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("marketplace_events")
    .select(EVENT_CARD_FIELDS)
    .eq("host_id", personId)
    .eq("status", "active")
    .lt("event_date", new Date().toISOString())
    .order("event_date", { ascending: false });
  return data ?? [];
}

/** Bir kişinin yazılarını getir (kategori ve tarih ile) */
export async function getAuthorArticles(personId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("articles")
    .select("slug, title, description, image, date, category, tags")
    .eq("author_id", personId)
    .eq("status", "published")
    .order("date", { ascending: false });
  return data ?? [];
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

/** Bir yazarın belirli bir yazı dışındaki en yeni N yazısını getir */
export async function getAuthorOtherArticles(
  authorId: string,
  excludeSlug: string,
  limit: number = 3
) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("articles")
    .select("slug, title, image, date, category")
    .eq("author_id", authorId)
    .eq("status", "published")
    .neq("slug", excludeSlug)
    .order("date", { ascending: false })
    .limit(limit);
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
