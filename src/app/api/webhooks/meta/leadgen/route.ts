import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { render } from "@react-email/render";
import Muzede1SaatTesekkur from "@/emails/Muzede1SaatTesekkur";
import { sendThankYouEmail } from "@/lib/send-thank-you";

// --- GET: Meta webhook verification challenge ---
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.META_WEBHOOK_VERIFY_TOKEN
  ) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// --- POST: Leadgen webhook notification ---
export async function POST(req: NextRequest) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.error("[meta-leadgen] META_APP_SECRET tanımlı değil");
    return NextResponse.json({ error: "Config error" }, { status: 500 });
  }

  // 1. HMAC-SHA256 imza doğrulama
  const signature = req.headers.get("x-hub-signature-256");
  const rawBody = await req.text();

  if (signature) {
    const crypto = await import("crypto");
    const expected =
      "sha256=" +
      crypto
        .createHmac("sha256", appSecret)
        .update(rawBody)
        .digest("hex");

    if (signature !== expected) {
      console.error("[meta-leadgen] İmza doğrulama başarısız");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  }

  const body = JSON.parse(rawBody);

  // 2. Leadgen ID'leri topla
  const leadgenIds: Array<{ leadgenId: string; formId?: string; pageId?: string }> = [];

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field === "leadgen" && change.value?.leadgen_id) {
        leadgenIds.push({
          leadgenId: String(change.value.leadgen_id),
          formId: change.value.form_id ? String(change.value.form_id) : undefined,
          pageId: change.value.page_id ? String(change.value.page_id) : undefined,
        });
      }
    }
  }

  if (leadgenIds.length === 0) {
    return NextResponse.json({ received: true, leads: 0 });
  }

  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("[meta-leadgen] META_ACCESS_TOKEN tanımlı değil");
    return NextResponse.json({ error: "Config error" }, { status: 500 });
  }

  const admin = createAdminClient();

  for (const { leadgenId, formId, pageId } of leadgenIds) {
    try {
      // 3. Meta Graph API'den lead detaylarını çek
      const graphRes = await fetch(
        `https://graph.facebook.com/v21.0/${leadgenId}?fields=field_data&access_token=${accessToken}`,
      );

      if (!graphRes.ok) {
        console.error(
          `[meta-leadgen] Graph API hata (${leadgenId}):`,
          await graphRes.text(),
        );
        continue;
      }

      const graphData = await graphRes.json();
      const fields: Array<{ name: string; values: string[] }> =
        graphData.field_data || [];

      const email = fields
        .find((f) => f.name === "email")
        ?.values?.[0]?.trim()
        .toLowerCase();
      const firstName = fields.find((f) => f.name === "first_name")?.values?.[0]?.trim();
      const lastName = fields.find((f) => f.name === "last_name")?.values?.[0]?.trim();
      const fullName = fields.find((f) => f.name === "full_name")?.values?.[0]?.trim();

      if (!email) {
        console.warn(`[meta-leadgen] Lead ${leadgenId} — email bulunamadı`);
        continue;
      }

      const name = fullName || [firstName, lastName].filter(Boolean).join(" ") || null;

      // 4. meta_leads tablosuna kaydet (dedup: meta_lead_id UNIQUE)
      const { error: insertError } = await admin.from("meta_leads").insert({
        meta_lead_id: leadgenId,
        email,
        name,
        form_id: formId || null,
        page_id: pageId || null,
        processed: true,
      });

      if (insertError) {
        // UNIQUE constraint → duplicate lead, skip
        if (insertError.code === "23505") {
          console.log(`[meta-leadgen] Duplicate lead atlandı: ${leadgenId}`);
          continue;
        }
        console.error(`[meta-leadgen] DB insert hata (${leadgenId}):`, insertError.message);
        continue;
      }

      // 5. subscribers tablosuna upsert
      const { data: existing } = await admin
        .from("subscribers")
        .select("id, is_active")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        if (!existing.is_active) {
          await admin
            .from("subscribers")
            .update({ is_active: true, source: "meta_leadgen" })
            .eq("id", existing.id);
        }
      } else {
        await admin.from("subscribers").insert({
          email,
          name,
          source: "meta_leadgen",
        });
      }

      // 6. Teşekkür emaili gönder
      sendMuzede1SaatEmail(email, name || undefined);

      console.log(`[meta-leadgen] Lead işlendi: ${leadgenId} → ${email}`);
    } catch (err) {
      console.error(`[meta-leadgen] Lead işlenirken hata (${leadgenId}):`, err);
    }
  }

  return NextResponse.json({ received: true, leads: leadgenIds.length });
}

function sendMuzede1SaatEmail(email: string, name?: string) {
  (async () => {
    try {
      const html = await render(Muzede1SaatTesekkur({ name }));
      await sendThankYouEmail({
        to: email,
        subject: "Müzede 1 Saat Rehberiniz Hazır! — Klemens Art",
        html,
      });
    } catch (err) {
      console.error("[meta-leadgen] Tesekkur maili gonderilemedi:", err);
    }
  })();
}
