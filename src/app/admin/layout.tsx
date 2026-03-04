import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-check";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Giriş yapmamış → login sayfasına yönlendir
  if (!user) redirect("/club/giris");

  // Admin değil → ana sayfaya yönlendir
  const admin = await isAdmin(user.id);
  if (!admin) redirect("/");

  return <AdminShell>{children}</AdminShell>;
}
