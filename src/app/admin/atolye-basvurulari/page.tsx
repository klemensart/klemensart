import { createAdminClient } from "@/lib/supabase-admin";
import BasvuruListesi from "./BasvuruListesi";

export default async function AtolyeBasvurulariPage() {
  const admin = createAdminClient();
  const { data: applications } = await admin
    .from("marketplace_applications")
    .select("id, created_at, status, applicant_name, applicant_email, workshop_topic, contact_channel")
    .order("created_at", { ascending: false });

  return <BasvuruListesi applications={applications ?? []} />;
}
