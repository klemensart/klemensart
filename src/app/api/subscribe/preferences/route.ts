import { NextRequest, NextResponse } from "next/server";
import { getSubscriberByToken, updateSubscriberPreferences } from "@/lib/newsletter-preferences";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token || token.length < 10) {
    return NextResponse.json(
      { error: "Geçersiz token." },
      { status: 400 },
    );
  }

  const subscriber = await getSubscriberByToken(token);
  if (!subscriber) {
    return NextResponse.json(
      { error: "Bu link geçersiz veya süresi dolmuş." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    email: subscriber.email,
    weekly_subscribed: subscriber.weekly_subscribed,
    thematic_subscribed: subscriber.thematic_subscribed,
  });
}

export async function PATCH(req: NextRequest) {
  const { token, weekly, thematic } = await req.json();

  if (!token || typeof token !== "string" || token.length < 10) {
    return NextResponse.json(
      { error: "Geçersiz token." },
      { status: 400 },
    );
  }

  if (typeof weekly !== "boolean" || typeof thematic !== "boolean") {
    return NextResponse.json(
      { error: "Geçersiz tercih değerleri." },
      { status: 400 },
    );
  }

  const success = await updateSubscriberPreferences(token, { weekly, thematic });
  if (!success) {
    return NextResponse.json(
      { error: "Güncellenemedi, tekrar deneyin." },
      { status: 500 },
    );
  }

  return NextResponse.json({ updated: true });
}
