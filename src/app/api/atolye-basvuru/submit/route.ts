import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  sendApplicationNotificationToAdmin,
  sendApplicationConfirmationToApplicant,
} from "@/lib/marketplace-emails";

// ─── Zod schema ──────────────────────────────────────────────

const applicationSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalı"),
  website: z
    .string()
    .url("Geçerli bir URL girin")
    .optional()
    .or(z.literal("")),
  topic: z.string().min(5, "Atölye konusu en az 5 karakter olmalı"),
  description: z
    .string()
    .min(50, "Açıklama en az 50 karakter olmalı")
    .max(2000, "Açıklama en fazla 2000 karakter olabilir"),
  duration: z.string().min(2, "Süre bilgisi en az 2 karakter olmalı"),
  price: z.string().min(1, "Ücret bilgisi gerekli"),
  audience: z.string().optional().or(z.literal("")),
  whatsapp_number: z.string().min(10, "WhatsApp numarası en az 10 karakter olmalı"),
  proposed_dates: z.string().min(5, "Lütfen en az bir tarih/zaman aralığı belirtin"),
  contact_channel: z.enum(["whatsapp", "email", "website", "other"], {
    error: "Geçersiz iletişim kanalı",
  }),
  contact_channel_detail: z
    .string()
    .min(3, "İletişim detayı en az 3 karakter olmalı"),
  terms_accepted: z.literal(true, {
    error: "Koşulları kabul etmeniz gerekli",
  }),
  honeypot: z.string().optional(),
});

// ─── In-memory rate limiter ──────────────────────────────────

const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => t > now - windowMs);
  hits.push(now);
  ipHits.set(ip, hits);
  return hits.length > max;
}

// ─── Route handler ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Honeypot — doluysa sessizce "success" dön
    if (body.honeypot) {
      return NextResponse.json({
        success: true,
        application_id: "00000000-0000-0000-0000-000000000000",
        message: "Başvurunuz alındı.",
      });
    }

    // 2. Zod validation
    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      return NextResponse.json(
        { error: "Lütfen formu kontrol edin.", fields: fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || null;

    // 3. IP rate limit — son 1 saatte max 3 başvuru
    if (isRateLimited(ip, 60 * 60 * 1000, 3)) {
      return NextResponse.json(
        { error: "Çok fazla başvuru gönderdiniz. Lütfen daha sonra tekrar deneyin." },
        { status: 429 },
      );
    }

    const admin = createAdminClient();

    // 4. Aynı email + aynı başlık ile son 24 saatte başvuru var mı?
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();
    const normalizedTopic = data.topic.trim().toLowerCase();
    const { data: duplicates } = await admin
      .from("marketplace_applications")
      .select("id, workshop_topic")
      .eq("applicant_email", data.email.trim().toLowerCase())
      .gte("created_at", twentyFourHoursAgo);

    const hasDuplicate = (duplicates ?? []).some(
      (row) => row.workshop_topic.trim().toLowerCase() === normalizedTopic,
    );

    if (hasDuplicate) {
      return NextResponse.json(
        {
          error:
            "Bu atölye için zaten başvurunuz var. En kısa sürede değerlendireceğiz. Farklı bir atölye önermek isterseniz başlığı değiştirip tekrar gönderebilirsiniz.",
          duplicate: true,
        },
        { status: 429 },
      );
    }

    // 5. Insert
    const { data: inserted, error: insertError } = await admin
      .from("marketplace_applications")
      .insert({
        applicant_name: data.name.trim(),
        applicant_email: data.email.trim().toLowerCase(),
        applicant_phone: data.phone.trim(),
        applicant_website: data.website?.trim() || null,
        workshop_topic: data.topic.trim(),
        workshop_description: data.description.trim(),
        workshop_duration: data.duration.trim(),
        workshop_price: data.price.trim(),
        target_audience: data.audience?.trim() || null,
        contact_channel: data.contact_channel,
        contact_channel_detail: data.contact_channel_detail.trim(),
        whatsapp_number: data.whatsapp_number.trim(),
        proposed_dates: data.proposed_dates.trim(),
        terms_accepted: true,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("[atolye-basvuru] INSERT hatası:", insertError);
      return NextResponse.json(
        { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
        { status: 500 },
      );
    }

    // 6. Email gönderimleri — fire-and-forget (paralel)
    const appData = {
      id: inserted.id,
      applicant_name: data.name.trim(),
      applicant_email: data.email.trim().toLowerCase(),
      applicant_phone: data.phone.trim(),
      applicant_website: data.website?.trim() || null,
      workshop_topic: data.topic.trim(),
      workshop_description: data.description.trim(),
      workshop_duration: data.duration.trim(),
      workshop_price: data.price.trim(),
      target_audience: data.audience?.trim() || null,
      contact_channel: data.contact_channel,
      contact_channel_detail: data.contact_channel_detail.trim(),
    };

    Promise.all([
      sendApplicationNotificationToAdmin(appData),
      sendApplicationConfirmationToApplicant(appData),
    ]).catch((err) => {
      console.error("[atolye-basvuru] Email gönderimleri hatası:", err);
    });

    // 7. Başarılı yanıt
    return NextResponse.json({
      success: true,
      application_id: inserted.id,
      message:
        "Başvurunuz başarıyla alındı. 15 iş günü içinde e-posta ile dönüş yapılacaktır.",
    });
  } catch (err) {
    console.error("[atolye-basvuru] Beklenmeyen hata:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
