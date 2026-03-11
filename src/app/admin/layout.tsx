import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAdminRole } from "@/lib/admin-check";
import AdminShell from "./AdminShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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

  // Rol kontrolü — admin veya editor olmalı
  const role = await getAdminRole(user.id);
  if (!role) redirect("/");

  return <AdminShell role={role}>{children}</AdminShell>;
}
