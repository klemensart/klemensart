/**
 * Müze rehberi mailini almamış kişilere gönder
 * Kullanım: npx tsx scripts/send-muze-mail.ts [--dry-run]
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { render } from "@react-email/render";
import Muzede1SaatTesekkur from "../src/emails/Muzede1SaatTesekkur";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY!);

// Bozuk / test email'leri filtrele
const EXCLUDE = [
  "test@meta.com",
  "fery04@gmail.comf",
  "aoby09@gmail.com.mesaj.atin.cebe.aramayin",
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !EXCLUDE.includes(email);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // Mailchimp'te olan email'ler (zaten mail almış)
  const { data: mcSubs } = await sb
    .from("subscribers")
    .select("email")
    .eq("source", "mailchimp_import");
  const mcEmails = new Set(
    (mcSubs || []).map((s) => s.email?.toLowerCase())
  );

  // Meta lead'ler
  const { data: leads } = await sb.from("meta_leads").select("email,name");

  // Mailchimp'te olmayan + geçerli email'ler
  const toSend = (leads || []).filter(
    (l) =>
      !mcEmails.has(l.email?.toLowerCase()) && isValidEmail(l.email)
  );

  console.log(`Gönderilecek: ${toSend.length} kişi`);
  if (dryRun) {
    console.log("\n[DRY RUN] Mail gönderilmeyecek.\n");
    for (const l of toSend) {
      console.log(" ", l.email, "|", l.name || "-");
    }
    return;
  }

  let sent = 0;
  let failed = 0;

  for (const lead of toSend) {
    try {
      const html = await render(
        Muzede1SaatTesekkur({ name: lead.name || undefined })
      );

      const { data, error } = await resend.emails.send({
        from: "Klemens Art <info@klemensart.com>",
        to: lead.email,
        subject: "Müzede 1 Saat Rehberiniz Hazır! — Klemens Art",
        html,
      });

      if (error) {
        console.error(`HATA (${lead.email}):`, error.message);
        failed++;
      } else {
        // email_logs'a kaydet — admin panelde açma/tıklama takibi için
        await sb.from("email_logs").insert({
          resend_email_id: data?.id || null,
          subscriber_email: lead.email,
          subject: "Müzede 1 Saat Rehberiniz Hazır! — Klemens Art",
        });
        console.log(`✓ ${lead.email}`);
        sent++;
      }

      // Rate limit — Resend free tier: 10/s
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      console.error(`HATA (${lead.email}):`, err);
      failed++;
    }
  }

  console.log(`\nSonuç: ${sent} gönderildi, ${failed} hata`);
}

main();
