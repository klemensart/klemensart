import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — sadece sunucu tarafında kullan.
 * RLS'yi bypass eder. Client bileşenlerinde KULLANMA.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
