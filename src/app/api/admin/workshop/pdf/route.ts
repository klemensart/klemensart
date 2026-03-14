import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";
import { renderToBuffer } from "@react-pdf/renderer";
import { WeeklyPDF } from "@/lib/workshop/pdf-template";
import { getWeek } from "@/lib/workshop/curriculum";
import { getArtworksForWeek } from "@/lib/workshop/artworks";
import { SLUG_TO_ATOLYE } from "@/lib/atolyeler-config";
import React from "react";

const WORKSHOP_ID = SLUG_TO_ATOLYE["modern-sanat-atolyesi"].id;

export async function POST(req: NextRequest) {
  // Admin auth
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekNumber, upload } = await req.json();
  if (!weekNumber || weekNumber < 1 || weekNumber > 10) {
    return NextResponse.json({ error: "weekNumber 1-10 arası olmalı" }, { status: 400 });
  }

  const week = getWeek(weekNumber);
  if (!week) {
    return NextResponse.json({ error: "Hafta bulunamadı" }, { status: 404 });
  }

  const artworks = getArtworksForWeek(weekNumber);

  try {
    // PDF oluştur
    const buffer = await (renderToBuffer as (el: React.ReactElement) => Promise<Buffer>)(
      React.createElement(WeeklyPDF, { week, artworks }) as React.ReactElement
    );

    // Eğer upload=true ise Supabase Storage'a yükle ve session'ı güncelle
    if (upload) {
      const admin = createAdminClient();
      const fileName = `modern-sanat-hafta-${weekNumber}.pdf`;
      const storagePath = `workshop-materials/${WORKSHOP_ID}/${fileName}`;

      // Storage'a yükle
      const { error: uploadError } = await admin.storage
        .from("workshop-materials")
        .upload(storagePath, buffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        return NextResponse.json({ error: `Upload hatası: ${uploadError.message}` }, { status: 500 });
      }

      const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/workshop-materials/${storagePath}`;

      // workshop_sessions tablosunu güncelle
      const { error: updateError } = await admin
        .from("workshop_sessions")
        .update({ pdf_url: pdfUrl })
        .eq("workshop_id", WORKSHOP_ID)
        .eq("session_number", weekNumber);

      if (updateError) {
        // Session bulunamadıysa sorun yok, PDF zaten yüklendi
        console.warn("Session update warning:", updateError.message);
      }

      return NextResponse.json({
        success: true,
        pdfUrl,
        storagePath,
      });
    }

    // Upload istenmemişse doğrudan PDF indir
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="modern-sanat-hafta-${weekNumber}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF oluşturma hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
