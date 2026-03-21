import { Resend } from "resend";
import { render } from "@react-email/render";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// AtolyeTesekkur template'ini dogrudan import edemeyecegimiz icin
// react-email components kullanarak ayni icerigi uretiyoruz
async function main() {
  // Dynamic import for the email template
  const React = await import("react");
  const { Section, Text, Link } = await import("@react-email/components");

  // Manually reconstruct the template since path aliases won't work
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Import the template from the project
  const mod = await import("../src/emails/AtolyeTesekkur");
  const AtolyeTesekkur = mod.default;

  const html = await render(
    AtolyeTesekkur({
      name: "Selin Özger",
      workshopTitle: "Modern Sanat Atölyesi",
    })
  );

  console.log("E-posta render edildi, gonderiliyor...");

  const { data, error } = await resend.emails.send({
    from: "Klemens Art <info@klemensart.com>",
    to: "hunkerem@gmail.com",
    subject: "[TEST] Atölye Satın Alma Onayı — Klemens Art",
    html,
  });

  if (error) {
    console.error("Hata:", error);
  } else {
    console.log("Basariyla gonderildi!");
    console.log("Resend ID:", data?.id);
  }
}
main().catch(console.error);
