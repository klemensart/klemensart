import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CancelForm from "./CancelForm";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
};

export const metadata = {
  title: "Kayıt İptali — Klemens Art",
  robots: { index: false },
};

export default async function KayitIptalPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) notFound();

  const admin = createAdminClient();

  // Token ile kayıt bul
  const { data: reg, error } = await admin
    .from("event_registrations")
    .select("id,event_id,name,email,status,confirmation_token")
    .eq("confirmation_token", token)
    .maybeSingle();

  if (error || !reg) {
    return (
      <>
        <Navbar />
        <main className="bg-warm-50 min-h-screen">
          <div className="max-w-xl mx-auto px-6 pt-32 pb-20 text-center">
            <h1 className="text-2xl font-bold text-warm-900 mb-4">
              Kayıt Bulunamadı
            </h1>
            <p className="text-warm-900/60">
              Bu iptal bağlantısı geçersiz veya süresi dolmuş olabilir.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Etkinlik bilgilerini çek
  const { data: event } = await admin
    .from("events")
    .select("id,title,event_date,venue,slug")
    .eq("id", reg.event_id)
    .single();

  const fmtDate = event?.event_date
    ? new Date(event.event_date).toLocaleDateString("tr-TR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  // Zaten iptal edilmişse
  if (reg.status === "cancelled") {
    return (
      <>
        <Navbar />
        <main className="bg-warm-50 min-h-screen">
          <div className="max-w-xl mx-auto px-6 pt-32 pb-20 text-center">
            <h1 className="text-2xl font-bold text-warm-900 mb-4">
              Kayıt Zaten İptal Edilmiş
            </h1>
            <p className="text-warm-900/60">
              <strong>{event?.title}</strong> etkinliği için kaydınız daha önce iptal edilmişti.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-warm-50 min-h-screen">
        <div className="max-w-xl mx-auto px-6 pt-32 pb-20">
          <CancelForm
            token={token}
            eventId={id}
            eventTitle={event?.title || ""}
            eventDate={fmtDate}
            eventVenue={event?.venue || ""}
            registrationName={reg.name}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
