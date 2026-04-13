// Tuz Bülteni #2 — yazı sahiplerine test maili gönder
import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { render } from "@react-email/render";
import { Resend } from "resend";
import KlemensNewsletter from "../src/emails/KlemensNewsletter";

config({ path: ".env.local" });

const SUBJECT = "[TEST] Tuz Bülteni #2 — Yazarlarımıza Özel Ön İzleme";
const FROM = "Klemens Art <info@klemensart.com>";

const AUTHORS = [
  "hunkerem@gmail.com",
  "civasecem1@gmail.com",
  "gozdesnsy@gmail.com",
  "hulyautkuluer@gmail.com",
  "mehtapkurt7140@gmail.com",
  "bararslan2009@gmail.com",
  "soldidem@gmail.com",
  "zeyneppmorgul@gmail.com",
  "terzi_melis@hotmail.com",
  "berraalkann@gmail.com",
];

async function main() {
  const filePath = path.join(process.cwd(), "src/emails/bulten-tuz-content.html");
  const htmlContent = await readFile(filePath, "utf-8");

  const html = await render(
    KlemensNewsletter({
      subject: SUBJECT,
      htmlContent,
      previewText: "Tuz, Ateş ve Sanat — yeni sayı, yeni tasarım.",
    })
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  let ok = 0;
  let fail = 0;

  for (const to of AUTHORS) {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: SUBJECT,
      html,
    });

    if (error) {
      console.error(`HATA → ${to}:`, error.message);
      fail++;
    } else {
      console.log(`OK → ${to} (${data?.id})`);
      ok++;
    }
  }

  console.log(`\nToplam: ${ok} başarılı, ${fail} hata`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
