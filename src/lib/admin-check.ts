import { createAdminClient } from "./supabase-admin";

/**
 * Supabase "admins" tablosunda user_id kaydı var mı kontrol eder.
 * Sadece sunucu tarafında kullan (service-role ile RLS bypass).
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("admins")
    .select("user_id", { count: "exact", head: true })
    .eq("user_id", userId);

  return (count ?? 0) > 0;
}

/**
 * Kullanıcının admin rolünü döner (ör. "admin", "editor").
 * Admin değilse null döner.
 */
export async function getAdminRole(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("admins")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.role ?? null;
}
