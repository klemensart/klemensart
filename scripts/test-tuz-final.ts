// Tuz Bülteni #2 — son düzeltmeler sonrası Hülya ve Kerem'e test maili
import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { render } from "@react-email/render";
import { Resend } from "resend";
import KlemensNewsletter from "../src/emails/KlemensNewsletter";

config({ path: ".env.local" });

const SUBJECT = "Tuz Bülteni — Sayı 02";
const FROM = "Klemens Art <info@klemensart.com>";
const PREVIEW = "İkinci sayımızda tuzun peşindeyiz: sanatta, tarihte, kültürde ve yaşamda.";
const TO = ["hunkerem@gmail.com"];

async function main() {
  const filePath = path.join(process.cwd(), "src/emails/bulten-tuz-content.html");
  const htmlContent = await readFile(filePath, "utf-8");

  const html = await render(
    KlemensNewsletter({ subject: SUBJECT, htmlContent, previewText: PREVIEW })
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  for (const to of TO) {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `[TEST] ${SUBJECT}`,
      html,
    });
    if (error) {
      console.error(`HATA → ${to}:`, error.message);
    } else {
      console.log(`OK → ${to} (${data?.id})`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
