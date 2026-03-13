import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-check";

const HAIKU = "claude-haiku-4-5-20251001";

const SEGMENT_PROFILES: Record<string, { label: string; tone: string }> = {
  // Harita davranış segmentleri
  map_tarihi: {
    label: "Tarih Meraklıları",
    tone: "Tarihi mekanlara ve kültürel mirasa tutkulu. Antik dönem, Osmanlı, Cumhuriyet tarihi gibi konulara ilgi duyuyor. Derinlikli, akademik ama ulaşılabilir bir dil kullan.",
  },
  map_sanat: {
    label: "Sanat Severler",
    tone: "Müze ve galeri ziyaretçisi. Görsel sanatlara, sergilere, çağdaş ve klasik sanata ilgili. Estetik ve sanatsal bir dil kullan.",
  },
  map_muzik_tiyatro: {
    label: "Sahne Sanatları",
    tone: "Konser ve tiyatroya giden, performans sanatlarına ilgili. Enerji dolu, deneyim odaklı, heyecan verici bir dil kullan.",
  },
  map_aktif_gezgin: {
    label: "Aktif Gezginler",
    tone: "Kültür haritasında 10+ mekan keşfetmiş süper kullanıcı. Sadık ve bağlı. Onlara özel VIP hissiyatı yarat, insider bilgiler ver.",
  },
  map_yeni_kesfifci: {
    label: "Yeni Kaşifler",
    tone: "Henüz 1-3 ziyaret yapmış yeni kullanıcı. Meraklı ama kararsız. Keşfetme motivasyonu ver, basit ve davetkar bir dil kullan.",
  },
  // E-posta davranış segmentleri
  loyal_readers: {
    label: "Sadık Okuyucular",
    tone: "Bültenleri düzenli açan bağlı okuyucu. Derinlikli içerikten hoşlanır. Detaylı ve bilgi dolu bir dil kullan.",
  },
  cooling_off: {
    label: "Soğuyan Kitle",
    tone: "Bir süredir ilgilenmeyen kişi. İlgiyi yeniden çekmek için merak uyandırıcı, kısa ve çarpıcı bir dil kullan.",
  },
  subscriber_no_purchase: {
    label: "Henüz Almamışlar",
    tone: "Abone ama hiç satın almamış. Güven oluşturucu, fayda odaklı ve yumuşak bir satış dili kullan.",
  },
};

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topic, segmentIds } = (await req.json()) as {
    topic: string;
    segmentIds: string[];
  };

  if (!topic?.trim()) {
    return NextResponse.json({ error: "Konu/etkinlik açıklaması gerekli." }, { status: 400 });
  }

  if (!segmentIds?.length) {
    return NextResponse.json({ error: "En az bir segment seçilmeli." }, { status: 400 });
  }

  // Segment sayılarını al
  const segRes = await fetch(
    new URL("/api/admin/newsletter/segments", req.url),
    { headers: req.headers },
  );
  const segData = await segRes.json();
  const segmentCounts = new Map<string, number>();
  if (segData.segments) {
    for (const s of segData.segments) {
      segmentCounts.set(s.id, s.count);
    }
  }

  const anthropic = new Anthropic();

  // Her segment için varyant üret (paralel)
  const variants = await Promise.all(
    segmentIds.map(async (segId) => {
      const profile = SEGMENT_PROFILES[segId];
      if (!profile) {
        return { segmentId: segId, label: segId, count: 0, subject: "", body: "", error: "Bilinmeyen segment" };
      }

      const count = segmentCounts.get(segId) ?? 0;

      try {
        const response = await anthropic.messages.create({
          model: HAIKU,
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `Sen Klemens Art'ın e-posta bülten editörüsün. Aşağıdaki etkinlik/konuyu, belirtilen hedef kitleye özel bir e-posta giriş paragrafı ve konu başlığı olarak yaz.

ETKİNLİK/KONU:
${topic}

HEDEF KİTLE: ${profile.label}
KİTLE PROFİLİ: ${profile.tone}

KURALLAR:
- Konu başlığı en fazla 60 karakter olmalı
- Giriş paragrafı 2-3 cümle, sıcak ve samimi
- Kişinin ilgi alanına doğal referans ver ama "seni izliyoruz" hissiyatı VERME
- Türkçe yaz, "Sen" hitap formu kullan
- KVKK/gizlilik dostu ol — spesifik kullanıcı verilerine atıfta bulunma

JSON formatında yanıt ver:
{"subject": "...", "body": "..."}`,
            },
          ],
        });

        const text = response.content[0].type === "text" ? response.content[0].text : "";
        // JSON parse (toleranslı)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            segmentId: segId,
            label: profile.label,
            count,
            subject: parsed.subject || "",
            body: parsed.body || "",
          };
        }
        return { segmentId: segId, label: profile.label, count, subject: "", body: text, error: "JSON parse hatası" };
      } catch (err) {
        return { segmentId: segId, label: profile.label, count, subject: "", body: "", error: String(err) };
      }
    }),
  );

  return NextResponse.json({ variants });
}
