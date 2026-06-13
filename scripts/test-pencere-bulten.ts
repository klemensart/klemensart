/**
 * Pencere Bülteni #3 — tematik bülteni test olarak tek adrese gönderir.
 * İçeriği src/emails/bulten-pencere-content.html'den okur, KlemensNewsletter ile sarar.
 * Kullanım: npx tsx scripts/test-pencere-bulten.ts hunkerem@gmail.com
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

import { Resend } from "resend";
import { render } from "@react-email/render";
import { readFileSync } from "fs";
import KlemensNewsletter from "../src/emails/KlemensNewsletter";

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const testEmail = process.argv[2] || "hunkerem@gmail.com";

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

  const { data, error } = await resend.emails.send({
    from: "Klemens Art <info@klemensart.com>",
    to: testEmail,
    subject,
    html: emailHtml,
  });

  if (error) {
    console.error("❌ Gönderim hatası:", error);
    process.exit(1);
  }
  console.log(`✅ Test maili gönderildi → ${testEmail}`);
  console.log("   id:", data?.id);
}

main().catch(console.error);
