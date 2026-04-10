// Tuz Bülteni #2 — geçerli (commitlenmemiş) HTML versiyonunu test maili olarak gönder
import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { render } from "@react-email/render";
import { Resend } from "resend";
import KlemensNewsletter from "../src/emails/KlemensNewsletter";

config({ path: ".env.local" });

const TO = "hunkerem@gmail.com";
const SUBJECT = "[TEST] Tuz E-Bülteni — 2. versiyon";
const FROM = "Klemens Art <info@klemensart.com>";

async function main() {
  const filePath = path.join(process.cwd(), "src/emails/bulten-tuz-content.html");
  const htmlContent = await readFile(filePath, "utf-8");

  const html = await render(
    KlemensNewsletter({
      subject: SUBJECT,
      htmlContent,
      previewText: "Tuz Gölü'nden Murano'ya — yeni sayı, yeni tasarım.",
    })
  );

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: TO,
    subject: SUBJECT,
    html,
  });

  if (error) {
    console.error("HATA:", error);
    process.exit(1);
  }

  console.log(`Test maili gönderildi → ${TO}`);
  console.log(`Resend ID: ${data?.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
