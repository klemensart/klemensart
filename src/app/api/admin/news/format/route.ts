import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-check";

const HAIKU = "claude-haiku-4-5-20251001";

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rawText } = (await req.json()) as { rawText?: string };

  if (!rawText?.trim() || rawText.trim().length < 20) {
    return NextResponse.json(
      { error: "En az 20 karakter içeren bir metin gerekli." },
      { status: 400 },
    );
  }

  const anthropic = new Anthropic();

  try {
    const response = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Sen Klemens Art kültür-sanat platformunun editörüsün. Aşağıdaki ham basın bülteni / haber metnini, e-bülten ve haber listesinde yayınlanacak formata dönüştür.

HAM METİN:
${rawText}

KURALLAR:
- Başlık: Kısa, çarpıcı, bilgilendirici (max 100 karakter)
- Özet: 2-3 cümle, haberin özünü aktaran, akıcı Türkçe (max 300 karakter)
- Kaynak adı: Basın bültenindeki kurum/organizasyon adı (yoksa "Klemens" yaz)
- Gereksiz promosyon dilini ve abartılı sıfatları temizle
- Doğal, gazetecilik diline yakın, samimi bir ton kullan
- Tarih, yer, kişi gibi somut bilgileri koru

JSON formatında yanıt ver:
{"title": "...", "summary": "...", "source_name": "..."}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        title: parsed.title || "",
        summary: parsed.summary || "",
        source_name: parsed.source_name || "Klemens",
      });
    }

    return NextResponse.json(
      { error: "AI yanıtı okunamadı." },
      { status: 500 },
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
