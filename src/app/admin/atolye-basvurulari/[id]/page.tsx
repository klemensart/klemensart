import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import BasvuruDetay from "./BasvuruDetay";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("marketplace_applications")
    .select("applicant_name")
    .eq("id", id)
    .single();

  return {
    title: data
      ? `${data.applicant_name} — Başvuru | Klemens Admin`
      : "Başvuru | Klemens Admin",
    robots: { index: false, follow: false },
  };
}

export default async function BasvuruDetayPage({ params }: Props) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("marketplace_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return <BasvuruDetay application={data} />;
}
