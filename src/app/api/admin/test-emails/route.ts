import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import AtolyeTesekkur from "@/emails/AtolyeTesekkur";
import BultenTesekkur from "@/emails/BultenTesekkur";
import { sendThankYouEmail } from "@/lib/send-thank-you";

const TEST_EMAIL = "hunkerem@gmail.com";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");

  if (type === "atolye") {
    const html = await render(
      AtolyeTesekkur({
        name: "Kerem",
        workshopTitle: "Modern Sanat Atölyesi",
      })
    );

    await sendThankYouEmail({
      to: TEST_EMAIL,
      subject: "Atölye Satın Alma Onayı — Klemens Art",
      html,
    });

    return NextResponse.json({
      message: `Atolye tesekkur maili ${TEST_EMAIL} adresine gonderildi.`,
    });
  }

  if (type === "bulten") {
    const html = await render(BultenTesekkur({ name: "Kerem" }));

    await sendThankYouEmail({
      to: TEST_EMAIL,
      subject: "E-Bültenimize Hoş Geldiniz — Klemens Art",
      html,
    });

    return NextResponse.json({
      message: `Bulten tesekkur maili ${TEST_EMAIL} adresine gonderildi.`,
    });
  }

  return NextResponse.json(
    { error: "type parametresi gerekli: ?type=atolye veya ?type=bulten" },
    { status: 400 }
  );
}
