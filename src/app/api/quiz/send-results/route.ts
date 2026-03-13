import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendThankYouEmail } from "@/lib/send-thank-you";

type ResultItem = {
  title: string;
  artist: string;
  year: string;
  info: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  correct: boolean;
  hintUsed: boolean;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, score, badge, results, mode, time_seconds, quiz_slug = "ronesans-quiz", quiz_title = "Rönesans Sanat Quizi" } = body as {
    email: string;
    score: number;
    badge: string;
    results: ResultItem[];
    mode: string;
    time_seconds: number | null;
    quiz_slug?: string;
    quiz_title?: string;
  };

  if (!email || typeof score !== "number" || !badge || !results) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(trimmedEmail)) {
    return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check if email is already registered in auth.users
  let registeredUserId: string | null = null;
  let page = 1;
  while (true) {
    const { data: { users }, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !users || users.length === 0) break;
    const found = users.find((u) => u.email?.toLowerCase() === trimmedEmail);
    if (found) {
      registeredUserId = found.id;
      break;
    }
    if (users.length < 1000) break;
    page++;
  }

  if (registeredUserId) {
    // Save quiz result — upsert: sadece en iyi skoru sakla
    try {
      const { data: existing } = await admin
        .from("quiz_results")
        .select("id, score, time_seconds")
        .eq("user_id", registeredUserId)
        .eq("quiz_slug", quiz_slug)
        .maybeSingle();

      if (existing) {
        const isBetter =
          score > existing.score ||
          (score === existing.score &&
            time_seconds != null &&
            (existing.time_seconds == null || time_seconds < existing.time_seconds));
        if (isBetter) {
          await admin.from("quiz_results").update({
            score, badge, time_seconds: time_seconds ?? null, mode: mode || "normal",
          }).eq("id", existing.id);
        }
      } else {
        await admin.from("quiz_results").insert({
          user_id: registeredUserId,
          display_name: trimmedEmail.split("@")[0],
          quiz_slug,
          score,
          badge,
          time_seconds: time_seconds ?? null,
          mode: mode || "normal",
        });
      }
    } catch { /* table might not exist yet */ }

    return NextResponse.json({ registered: true });
  }

  // Subscribe to newsletter
  const { data: existing } = await admin
    .from("subscribers")
    .select("id, is_active")
    .eq("email", trimmedEmail)
    .maybeSingle();

  if (existing) {
    if (!existing.is_active) {
      await admin.from("subscribers").update({ is_active: true }).eq("id", existing.id);
    }
  } else {
    await admin.from("subscribers").insert({ email: trimmedEmail, source: quiz_slug });
  }

  // Save quiz result as guest — upsert by email+quiz_slug
  try {
    const displayName = trimmedEmail.split("@")[0];
    const { data: existingGuest } = await admin
      .from("quiz_results")
      .select("id, score, time_seconds")
      .is("user_id", null)
      .eq("display_name", displayName)
      .eq("quiz_slug", quiz_slug)
      .maybeSingle();

    if (existingGuest) {
      const isBetter =
        score > existingGuest.score ||
        (score === existingGuest.score &&
          time_seconds != null &&
          (existingGuest.time_seconds == null || time_seconds < existingGuest.time_seconds));
      if (isBetter) {
        await admin.from("quiz_results").update({
          score, badge, time_seconds: time_seconds ?? null, mode: mode || "normal",
        }).eq("id", existingGuest.id);
      }
    } else {
      await admin.from("quiz_results").insert({
        display_name: displayName,
        quiz_slug,
        score,
        badge,
        time_seconds: time_seconds ?? null,
        mode: mode || "normal",
      });
    }
  } catch { /* table might not exist yet */ }

  // Build email HTML
  const wrongResults = results.filter((r) => !r.correct);
  const correctCount = results.filter((r) => r.correct).length;

  const html = buildResultsEmail({ score, badge, mode, time_seconds, results, wrongResults, correctCount, quiz_title });

  await sendThankYouEmail({
    to: trimmedEmail,
    subject: `${quiz_title} — Sonuçlarınız: ${score}/10`,
    html,
  });

  return NextResponse.json({ sent: true });
}

function buildResultsEmail(params: {
  score: number;
  badge: string;
  mode: string;
  time_seconds: number | null;
  results: ResultItem[];
  wrongResults: ResultItem[];
  correctCount: number;
  quiz_title: string;
}): string {
  const { score, badge, mode, time_seconds, results, wrongResults, correctCount, quiz_title } = params;

  const timeStr = time_seconds
    ? `${Math.floor(time_seconds / 60) > 0 ? Math.floor(time_seconds / 60) + "dk " : ""}${time_seconds % 60}sn`
    : "";

  const summaryRows = results
    .map(
      (r) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #3a302a;color:${r.correct ? "#22c55e" : "#ef4444"};font-weight:700;font-size:14px;">
          ${r.correct ? "&#10003;" : "&#10007;"}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #3a302a;">
          <div style="font-weight:600;color:#f0ebe4;font-size:14px;">${r.title}</div>
          <div style="color:#9B918A;font-size:12px;">${r.artist} &middot; ${r.year}</div>
        </td>
      </tr>`
    )
    .join("");

  const wrongDetails = wrongResults
    .map(
      (r) => `
      <div style="background:#252220;border:1px solid #3a302a;border-radius:12px;padding:16px;margin-bottom:12px;">
        <div style="font-weight:700;color:#f0ebe4;font-size:15px;margin-bottom:6px;">${r.question}</div>
        <div style="margin-bottom:4px;">
          <span style="color:#ef4444;font-weight:600;font-size:13px;">Sizin cevabınız:</span>
          <span style="color:#ef4444;font-size:13px;"> ${r.userAnswer}</span>
        </div>
        <div style="margin-bottom:8px;">
          <span style="color:#22c55e;font-weight:600;font-size:13px;">Doğru cevap:</span>
          <span style="color:#22c55e;font-size:13px;"> ${r.correctAnswer}</span>
        </div>
        <div style="color:#9B918A;font-size:13px;line-height:1.6;border-top:1px solid #3a302a;padding-top:8px;">
          ${r.info}
        </div>
      </div>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#1a1714;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;">
        Klemens Art
      </div>
      <h1 style="font-size:24px;font-weight:800;color:#f0ebe4;margin:0 0 4px;">
        ${quiz_title}
      </h1>
      <p style="color:#9B918A;font-size:14px;margin:0;">Sonuçlarınız aşağıda</p>
    </div>

    <!-- Score -->
    <div style="text-align:center;background:#252220;border:1px solid #3a302a;border-radius:16px;padding:28px 20px;margin-bottom:24px;">
      <div style="font-size:48px;font-weight:800;color:#C9A84C;line-height:1;">
        ${score}<span style="font-size:20px;color:#9B918A;">/10</span>
      </div>
      ${timeStr ? `<div style="font-size:13px;color:#9B918A;margin-top:6px;">${timeStr}${mode === "timed" ? " — Hızlı Mod" : ""}</div>` : ""}
      <div style="margin-top:16px;display:inline-block;background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.25);border-radius:99px;padding:10px 28px;">
        <div style="font-size:10px;color:#9B918A;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Rozetiniz</div>
        <div style="font-size:18px;font-weight:800;color:#C9A84C;margin-top:2px;">${badge}</div>
      </div>
      <div style="margin-top:12px;color:#9B918A;font-size:13px;">
        ${correctCount} doğru &middot; ${10 - correctCount} yanlış
      </div>
    </div>

    <!-- Summary Table -->
    <div style="margin-bottom:24px;">
      <h2 style="font-size:16px;font-weight:700;color:#f0ebe4;margin:0 0 12px;">Soru Özeti</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${summaryRows}
      </table>
    </div>

    <!-- Wrong Answer Details -->
    ${
      wrongResults.length > 0
        ? `
    <div style="margin-bottom:32px;">
      <h2 style="font-size:16px;font-weight:700;color:#f0ebe4;margin:0 0 12px;">
        Yanlış Cevaplarınız — Doğruları ve Açıklamaları
      </h2>
      ${wrongDetails}
    </div>`
        : `
    <div style="text-align:center;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:20px;margin-bottom:32px;">
      <div style="font-size:16px;font-weight:700;color:#22c55e;margin-bottom:4px;">Muhteşem!</div>
      <div style="font-size:14px;color:#9B918A;">Tüm soruları doğru cevapladınız.</div>
    </div>`
    }

    <!-- CTA -->
    <div style="text-align:center;background:#252220;border:1px solid #3a302a;border-radius:16px;padding:24px 20px;">
      <div style="font-size:16px;font-weight:700;color:#f0ebe4;margin-bottom:6px;">
        Daha fazla quiz ve sanat içeriği için
      </div>
      <div style="font-size:14px;color:#9B918A;margin-bottom:16px;">
        Klemens Art'a üye olun, rozetlerinizi kaydedin ve liderlik tablosunda yerinizi alın.
      </div>
      <a href="https://klemensart.com/club/giris" style="display:inline-block;background:#C9A84C;color:#1a1714;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:99px;">
        Ücretsiz Üye Ol
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #3a302a;">
      <div style="font-size:12px;color:#9B918A;">
        Bu e-posta Klemens Art quiz sonuçlarınız için gönderilmiştir.
      </div>
      <a href="https://klemensart.com" style="font-size:12px;color:#C9A84C;text-decoration:none;">klemensart.com</a>
    </div>

  </div>
</body>
</html>`;
}
