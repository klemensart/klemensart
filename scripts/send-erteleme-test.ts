import { Resend } from "resend";
import { render } from "@react-email/render";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const mod = await import("../src/emails/AtolyeErteleme");
  const AtolyeErteleme = mod.default;

  const html = await render(
    AtolyeErteleme({
      workshopTitle: "Modern Sanat Tarihi Atölyesi",
      oldDate: "25 Mart 2026, Çarşamba",
      newDate: "8 Nisan 2026, Çarşamba",
    })
  );

  console.log("E-posta render edildi, gönderiliyor...");

  const { data, error } = await resend.emails.send({
    from: "Klemens Art <info@klemensart.com>",
    to: "hunkerem@gmail.com",
    subject: "Modern Sanat Tarihi Atölyesi — Tarih Değişikliği",
    html,
  });

  if (error) {
    console.error("Hata:", error);
  } else {
    console.log("Test maili başarıyla gönderildi!");
    console.log("Resend ID:", data?.id);
  }
}
main().catch(console.error);
