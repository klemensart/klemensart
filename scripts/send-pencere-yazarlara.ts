/**
 * Pencere Bülteni #3 — 13 yazara AYRI AYRI test/önizleme gönderir (BCC/CC yok, gizlilik).
 * Kullanım: npx tsx scripts/send-pencere-yazarlara.ts
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

import { Resend } from "resend";
import { render } from "@react-email/render";
import { readFileSync } from "fs";
import KlemensNewsletter from "../src/emails/KlemensNewsletter";

const resend = new Resend(process.env.RESEND_API_KEY);

const RECIPIENTS = [
  "bararslan2009@gmail.com",      // Barış Arslan
  "ezelevin96@gmail.com",         // Ezel Evin Altındağ
  "zeyneppmorgul@gmail.com",      // Zeynep Aydın
  "mehtapkurt7140@gmail.com",     // Mehtap Kurt
  "defneeged@gmail.com",          // Defne Ege Durucu
  "soldidem@gmail.com",           // Didem Kazan Sol
  "info@gizemdinc.com",           // Gizem Dinç
  "civasecem1@gmail.com",         // Ecem Civaş
  "terzi_melis@hotmail.com",      // Melis Terzi
  "berraalkann@gmail.com",        // Ebru Berra Alkan
  "dogaugurel@gmail.com",         // Doğa Uğurel
  "gozdesnsy@gmail.com",          // Gözde Şensoy Murt
  "hulyautkuluer@gmail.com",      // Hülya Utkuluer
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const htmlContent = readFileSync(
    "/Volumes/PortableSSD/klemensart/src/emails/bulten-pencere-content.html",
    "utf-8",
  );
  const subject = "[TEST] Klemens Bülten — Pencere";
  const previewText =
    "Üçüncü sayımızı pencereye ayırdık: sanat, sinema, edebiyat ve daha fazlasına yeni bir pencere.";

  const emailHtml = await render(
    KlemensNewsletter({ subject, htmlContent, previewText }),
  );

  let ok = 0;
  let fail = 0;
  for (const to of RECIPIENTS) {
    const { data, error } = await resend.emails.send({
      from: "Klemens Art <info@klemensart.com>",
      to,
      subject,
      html: emailHtml,
    });
    if (error) {
      fail++;
      console.error(`❌ ${to}:`, error);
    } else {
      ok++;
      console.log(`✅ ${to}  (${data?.id})`);
    }
    await sleep(600); // Resend rate limitine takılmamak için
  }
  console.log(`\nBitti — ${ok} başarılı, ${fail} hatalı, toplam ${RECIPIENTS.length}.`);
}

main().catch(console.error);
