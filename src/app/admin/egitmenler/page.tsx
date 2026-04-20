import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-check";
import { redirect } from "next/navigation";
import HostlarListesi from "./HostlarListesi";

export default async function EgitmenlerPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) redirect("/admin");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <HostlarListesi />
    </div>
  );
}
