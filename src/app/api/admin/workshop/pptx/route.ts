import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-check";
import { generateWeekPPTX } from "@/lib/workshop/pptx-generator";

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekNumber } = await req.json();
  if (!weekNumber || weekNumber < 1 || weekNumber > 10) {
    return NextResponse.json({ error: "weekNumber 1-10 arası olmalı" }, { status: 400 });
  }

  try {
    const buffer = await generateWeekPPTX(weekNumber);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="modern-sanat-hafta-${weekNumber}.pptx"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PPTX oluşturma hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
