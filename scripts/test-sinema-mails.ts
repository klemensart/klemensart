import { Resend } from "resend";
import { render } from "@react-email/render";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { default: SeminerHatirlatici } = await import("../src/emails/SeminerHatirlatici");
  const html = await render(
    SeminerHatirlatici({
      eventTitle: "Pan's Labyrinth — Guillermo del Toro (2006)",
      eventDate: "25 Nisan 2026, Cuma",
      eventTime: "20:30 (TSİ)",
      zoomLink: "https://zoom.us/j/98765432100?pwd=xYzAbCdEfGhIjKlMnOpQrS",
    })
  );

  console.log("Zoom hatırlatma maili gönderiliyor...");
  const { data, error } = await resend.emails.send({
    from: "Klemens Art <info@klemensart.com>",
    to: "hunkerem@gmail.com",
    subject: "[TEST] Hatırlatma: Pan's Labyrinth — Klemens Sinema Kulübü",
    html,
  });
  if (error) console.error("Hata:", error);
  else console.log("Gönderildi! ID:", data?.id);
}
main().catch(console.error);
