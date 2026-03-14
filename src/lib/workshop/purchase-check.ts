import type { SupabaseClient } from "@supabase/supabase-js";
import { SLUG_TO_ATOLYE } from "@/lib/atolyeler-config";

const WORKSHOP_ID = SLUG_TO_ATOLYE["modern-sanat-atolyesi"].id;

/**
 * Kullanıcının Modern Sanat Atölyesi'ni satın alıp almadığını kontrol eder.
 * Client-side Supabase client ile çalışır.
 */
export async function checkWorkshopPurchase(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("workshop_id", WORKSHOP_ID)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Purchase check error:", error.message);
    return false;
  }

  return !!data;
}
