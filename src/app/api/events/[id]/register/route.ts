import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { render } from "@react-email/render";
import KayitOnay from "@/emails/KayitOnay";
import { sendThankYouEmail } from "@/lib/send-thank-you";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id: eventId } = await ctx.params;
  const body = await req.json();
  const { name, email, phone, note, user_id } = body as {
    name?: string;
    email?: string;
    phone?: string;
    note?: string;
    user_id?: string;
  };

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Ad ve email zorunludur." }, { status: 400 });
  }

  const emailLower = email.trim().toLowerCase();

  const admin = createAdminClient();

  // Etkinlik var mı + kayıt açık mı kontrol
  const { data: event, error: evErr } = await admin
    .from("events")
    .select("id,title,event_date,venue,address,registration_enabled,registration_deadline,capacity,slug,contact_email,is_klemens_event")
    .eq("id", eventId)
    .eq("status", "approved")
    .single();

  if (evErr || !event) {
    return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 });
  }

  if (!event.registration_enabled) {
    return NextResponse.json({ error: "Bu etkinlik için kayıt kapalı." }, { status: 400 });
  }

  // Deadline kontrolü
  if (event.registration_deadline) {
    const now = new Date();
    const deadline = new Date(event.registration_deadline);
    if (now > deadline) {
      return NextResponse.json({ error: "Kayıt süresi dolmuş." }, { status: 400 });
    }
  }

  // Insert
  const { data: reg, error: insertErr } = await admin
    .from("event_registrations")
    .insert({
      event_id: eventId,
      user_id: user_id || null,
      name: name.trim(),
      email: emailLower,
      phone: phone?.trim() || null,
      note: note?.trim() || null,
      status: "confirmed",
    })
    .select("id,confirmation_token")
    .single();

  if (insertErr) {
    if (insertErr.message.includes("event_registrations_event_email_unique")) {
      return NextResponse.json(
        { error: "Bu email adresiyle zaten kayıt aldınız." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Onay maili — await ile gönder (serverless timeout'u önlemek için)
  const eventSlug = event.slug || event.id;
  const cancelUrl = `https://klemensart.com/etkinlikler/${eventSlug}/kayit-iptal?token=${reg.confirmation_token}`;
  const eventUrl = `https://klemensart.com/etkinlikler/${event.slug || event.id}`;

  const fmtDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString("tr-TR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  try {
    const html = await render(
      KayitOnay({
        name: name.trim(),
        eventTitle: event.title,
        eventDate: fmtDate,
        eventVenue: event.venue || "",
        eventAddress: event.address || "",
        contactEmail: event.contact_email || "info@klemensart.com",
        eventUrl,
        cancelUrl,
      })
    );

    await sendThankYouEmail({
      to: emailLower,
      subject: `${event.title} — Kaydınız alındı`,
      html,
    });
  } catch (err) {
    console.error("[register] Mail hatası:", err);
  }

  return NextResponse.json({ success: true, registrationId: reg.id });
}
