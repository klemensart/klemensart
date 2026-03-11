import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAdminRole } from "@/lib/admin-check";

/**
 * Server component — sadece admin rolüne sahip kullanıcılara izin verir.
 * Editor'ler /admin'e yönlendirilir.
 */
export default async function AdminOnlyGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/club/giris");

  const role = await getAdminRole(user.id);
  if (role !== "admin") redirect("/admin");

  return <>{children}</>;
}
