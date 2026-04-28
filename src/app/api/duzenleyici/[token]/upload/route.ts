import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendThankYouEmail } from "@/lib/send-thank-you";
import { getEmailBaseUrl } from "@/lib/email-urls";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const BUCKET = "marketplace-uploads";

// ── Yardımcılar ─────────────────────────────────────────────────────────────

function fileExt(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() ?? "jpg";
}

function publicUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Basit boyut kontrolü — ArrayBuffer'ın ilk byte'larından width/height çıkar (JPEG/PNG). */
async function getImageDimensions(
  buf: ArrayBuffer,
): Promise<{ width: number; height: number } | null> {
  const view = new DataView(buf);

  // PNG: byte 16-23 = width (4B) + height (4B)
  if (view.getUint8(0) === 0x89 && view.getUint8(1) === 0x50) {
    return {
      width: view.getUint32(16),
      height: view.getUint32(20),
    };
  }

  // JPEG: SOI marker ardından SOFn marker'ı ara
  if (view.getUint8(0) === 0xff && view.getUint8(1) === 0xd8) {
    let offset = 2;
    while (offset < view.byteLength - 10) {
      if (view.getUint8(offset) !== 0xff) break;
      const marker = view.getUint8(offset + 1);
      const segLen = view.getUint16(offset + 2);
      // SOF0..SOF3 markers
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          height: view.getUint16(offset + 5),
          width: view.getUint16(offset + 7),
        };
      }
      offset += 2 + segLen;
    }
  }

  // WebP: RIFF header → "VP8 " chunk
  if (
    view.getUint8(0) === 0x52 && // R
    view.getUint8(1) === 0x49 && // I
    view.getUint8(2) === 0x46 && // F
    view.getUint8(3) === 0x46    // F
  ) {
    // Check VP8 (lossy)
    const sig = String.fromCharCode(
      view.getUint8(12), view.getUint8(13), view.getUint8(14), view.getUint8(15),
    );
    if (sig === "VP8 " && view.byteLength > 30) {
      // VP8 bitstream header starts at offset 23 (after frame tag)
      const w = view.getUint16(26, true) & 0x3fff;
      const h = view.getUint16(28, true) & 0x3fff;
      if (w > 0 && h > 0) return { width: w, height: h };
    }
    // VP8L (lossless)
    if (sig === "VP8L" && view.byteLength > 25) {
      const bits = view.getUint32(21, true);
      const w = (bits & 0x3fff) + 1;
      const h = ((bits >> 14) & 0x3fff) + 1;
      if (w > 0 && h > 0) return { width: w, height: h };
    }
  }

  return null;
}

async function validateToken(token: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return { error: "Geçersiz bağlantı", status: 404 } as const;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("marketplace_applications")
    .select("id, applicant_name, applicant_email, workshop_topic, status, upload_token_expires_at, materials_submitted_at")
    .eq("upload_token", token)
    .single();

  if (error || !data) {
    return { error: "Geçersiz bağlantı", status: 404 } as const;
  }

  if (data.upload_token_expires_at && new Date(data.upload_token_expires_at) < new Date()) {
    return { error: "Bağlantı süresi doldu", status: 410 } as const;
  }

  if (data.status !== "approved") {
    return { error: "Başvuru henüz onaylanmadı", status: 403 } as const;
  }

  if (data.materials_submitted_at) {
    return {
      error: "Materyallerinizi daha önce gönderdiniz. Güncellemek için info@klemensart.com adresinden iletişime geçin.",
      status: 409,
    } as const;
  }

  return { data } as const;
}

function validateFile(
  file: File | null,
  field: string,
  required: boolean,
): string | null {
  if (!file || file.size === 0) {
    return required ? `${field} zorunludur` : null;
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return `${field}: Sadece JPG, PNG ve WebP formatları kabul edilir`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${field}: Dosya boyutu en fazla 5MB olmalı`;
  }
  return null;
}

async function uploadFile(
  admin: ReturnType<typeof createAdminClient>,
  file: File,
  path: string,
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });
  if (error) throw new Error(`Yükleme hatası (${path}): ${error.message}`);
  return publicUrl(path);
}

// ── POST: Materyalleri yükle ─────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  // Token doğrula
  const validation = await validateToken(token);
  if ("error" in validation) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status },
    );
  }

  const { data: application } = validation;

  // FormData parse
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz form verisi" },
      { status: 400 },
    );
  }

  // Text alanları
  const bio = (formData.get("bio") as string)?.trim() ?? "";
  const detailedBio = (formData.get("detailed_bio") as string)?.trim() ?? "";
  const city = (formData.get("city") as string)?.trim() ?? "";
  const district = (formData.get("district") as string)?.trim() ?? "";
  const venueName = (formData.get("venue_name") as string)?.trim() ?? "";
  const venueAddress = (formData.get("venue_address") as string)?.trim() ?? "";
  const maxParticipantsStr = (formData.get("max_participants") as string)?.trim() ?? "";
  const proposedDatesFinal = (formData.get("proposed_dates_final") as string)?.trim() ?? "";

  // Dosyalar
  const cover = formData.get("cover") as File | null;
  const profile = formData.get("profile") as File | null;
  const venue = formData.get("venue") as File | null;
  const galleryFiles = formData.getAll("gallery") as File[];

  // ── Validation ──────────────────────────────────────────────────────────

  const errors: { error: string; field: string }[] = [];

  // Zorunlu text alanları
  if (!bio) {
    errors.push({ error: "Biyografi zorunludur", field: "bio" });
  } else if (bio.length < 100) {
    errors.push({ error: "Biyografi en az 100 karakter olmalı", field: "bio" });
  } else if (bio.length > 1000) {
    errors.push({ error: "Biyografi en fazla 1000 karakter olmalı", field: "bio" });
  }

  if (!city) {
    errors.push({ error: "Şehir zorunludur", field: "city" });
  }

  const maxParticipants = parseInt(maxParticipantsStr, 10);
  if (!maxParticipantsStr || isNaN(maxParticipants) || maxParticipants < 1) {
    errors.push({ error: "Geçerli bir kontenjan sayısı girin", field: "max_participants" });
  }

  if (!proposedDatesFinal) {
    errors.push({ error: "Tarih bilgisi zorunludur", field: "proposed_dates_final" });
  }

  // Dosya validasyonu
  const coverErr = validateFile(cover, "Kapak görseli", true);
  if (coverErr) errors.push({ error: coverErr, field: "cover" });

  const profileErr = validateFile(profile, "Profil fotoğrafı", true);
  if (profileErr) errors.push({ error: profileErr, field: "profile" });

  const venueErr = validateFile(venue, "Mekân fotoğrafı", false);
  if (venueErr) errors.push({ error: venueErr, field: "venue" });

  // Gallery: max 5
  const validGallery = galleryFiles.filter((f) => f.size > 0);
  if (validGallery.length > 5) {
    errors.push({ error: "En fazla 5 galeri görseli yüklenebilir", field: "gallery" });
  }
  for (let i = 0; i < validGallery.length; i++) {
    const gErr = validateFile(validGallery[i], `Galeri görseli ${i + 1}`, false);
    if (gErr) errors.push({ error: gErr, field: "gallery" });
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors[0].error, field: errors[0].field, errors },
      { status: 400 },
    );
  }

  // ── Boyut kontrolleri ───────────────────────────────────────────────────

  const coverBuf = await cover!.arrayBuffer();
  const coverDims = await getImageDimensions(coverBuf);
  if (coverDims && (coverDims.width < 1200 || coverDims.height < 800)) {
    return NextResponse.json(
      {
        error: `Kapak görseli en az 1200x800 piksel olmalı (mevcut: ${coverDims.width}x${coverDims.height})`,
        field: "cover",
      },
      { status: 400 },
    );
  }

  const profileBuf = await profile!.arrayBuffer();
  const profileDims = await getImageDimensions(profileBuf);
  if (profileDims && (profileDims.width < 600 || profileDims.height < 600)) {
    return NextResponse.json(
      {
        error: `Profil fotoğrafı en az 600x600 piksel olmalı (mevcut: ${profileDims.width}x${profileDims.height})`,
        field: "profile",
      },
      { status: 400 },
    );
  }

  // ── Upload ──────────────────────────────────────────────────────────────

  const admin = createAdminClient();
  const appId = application.id;

  try {
    // Cover
    const coverUrl = await uploadFile(
      admin,
      cover!,
      `${appId}/cover.${fileExt(cover!)}`,
    );

    // Profile
    const profileUrl = await uploadFile(
      admin,
      profile!,
      `${appId}/profile.${fileExt(profile!)}`,
    );

    // Venue (opsiyonel)
    let venueUrl: string | null = null;
    if (venue && venue.size > 0) {
      venueUrl = await uploadFile(
        admin,
        venue,
        `${appId}/venue.${fileExt(venue)}`,
      );
    }

    // Gallery (opsiyonel)
    const galleryUrls: string[] = [];
    const ts = Date.now();
    for (let i = 0; i < validGallery.length; i++) {
      const url = await uploadFile(
        admin,
        validGallery[i],
        `${appId}/gallery/${ts}_${i}.${fileExt(validGallery[i])}`,
      );
      galleryUrls.push(url);
    }

    // ── DB güncelle ──────────────────────────────────────────────────────

    const { error: dbError } = await admin
      .from("marketplace_applications")
      .update({
        cover_url: coverUrl,
        profile_url: profileUrl,
        venue_url: venueUrl,
        gallery_urls: galleryUrls,
        bio,
        detailed_bio: detailedBio || null,
        city,
        district: district || null,
        venue_name: venueName || null,
        venue_address: venueAddress || null,
        max_participants: maxParticipants,
        proposed_dates_final: proposedDatesFinal,
        materials_submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", appId);

    if (dbError) {
      console.error("[duzenleyici/upload] DB güncelleme hatası:", dbError);
      return NextResponse.json(
        { error: "Bilgiler kaydedilemedi, lütfen tekrar deneyin" },
        { status: 500 },
      );
    }

    // ── Admin'e bildirim emaili ──────────────────────────────────────────

    const baseUrl = getEmailBaseUrl();
    sendThankYouEmail({
      to: "info@klemensart.com",
      subject: `Materyaller Yüklendi — ${application.applicant_name}`,
      html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e8e0d8;overflow:hidden;">
    <div style="padding:28px 32px 20px;border-bottom:1px solid #f0ebe6;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#FF6D60;font-weight:700;">Materyal Bildirimi</p>
      <h1 style="margin:0;font-size:20px;font-weight:800;color:#2D2926;">Materyaller Yüklendi</h1>
    </div>
    <div style="padding:24px 32px;font-size:14px;line-height:1.7;color:#3d3833;">
      <p style="margin:0 0 16px;"><strong>${esc(application.applicant_name)}</strong>, <strong>"${esc(application.workshop_topic)}"</strong> atölyesi için materyallerini yükledi.</p>
      <p style="margin:0 0 8px;"><strong>Şehir:</strong> ${esc(city)}${district ? ` / ${esc(district)}` : ""}</p>
      <p style="margin:0 0 8px;"><strong>Kontenjan:</strong> ${maxParticipants} kişi</p>
      <p style="margin:0 0 8px;"><strong>Tarih:</strong> ${esc(proposedDatesFinal)}</p>
      <p style="margin:0 0 8px;"><strong>Galeri:</strong> ${galleryUrls.length} görsel</p>
      <div style="border-top:1px solid #f0ebe6;padding-top:16px;margin-top:16px;">
        <a href="${baseUrl}/admin/atolye-basvurulari/${appId}" style="display:inline-block;background:#FF6D60;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:600;font-size:13px;">Başvuruyu İncele</a>
      </div>
    </div>
  </div>
</body>
</html>`.trim(),
    }).catch((err) =>
      console.error("[duzenleyici/upload] Admin bildirim hatası:", err),
    );

    return NextResponse.json({
      success: true,
      message:
        "Materyaller başarıyla yüklendi. En kısa sürede atölye sayfanız yayına alınacak.",
    });
  } catch (err) {
    console.error("[duzenleyici/upload] Upload hatası:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Yükleme sırasında bir hata oluştu",
      },
      { status: 500 },
    );
  }
}

// ── HTML escape ─────────────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
