import { createAdminClient } from "@/lib/supabase-admin";
import AnnouncementBarClient, { type Announcement } from "./AnnouncementBarClient";

export type { Announcement };

/**
 * Server component — fetches announcements at build/request time.
 * Renders the bar HTML in initial paint (no CLS).
 */
export default async function AnnouncementBar({ page }: { page: string }) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("announcements")
    .select("id, title, link_url, link_text, badge_text, pages")
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .contains("pages", [page])
    .order("created_at", { ascending: false });

  const announcements = (data ?? []) as Announcement[];
  if (announcements.length === 0) return null;

  return <AnnouncementBarClient announcements={announcements} />;
}

/**
 * Aktif duyurulardan, verilen slug'a eşleşen badge_text döner.
 * Atölye kartlarında "Yeni" badge göstermek için kullanılır.
 */
export { useAnnouncementBadges } from "./AnnouncementBarClient";
