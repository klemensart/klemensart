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
      workshopTitle: "Rönesans Okur-Yazarlığı Atölyesi",
      oldDate: "18 Mayıs 2026, Pazartesi",
      newDate: "1 Haziran 2026, Pazartesi",
      reason:
        "Bayram tatili sebebiyle atölyemizin başlangıcını bayram sonrasına ertelemeye karar verdik.",
      refundNote:
        "Yeni tarihler sizin için uygun değilse, ücret iadesi konusunda bize bildirmeniz yeterlidir — info@klemensart.com adresinden ya da bu e-postayı yanıtlayarak ulaşabilirsiniz.",
      weekCount: 8,
      detailSlug: "ronesans-okuryazarligi-2",
    })
  );

  console.log("E-posta render edildi, gönderiliyor...");

  const { data, error } = await resend.emails.send({
    from: "Klemens Art <info@klemensart.com>",
    to: "hunkerem@gmail.com",
    subject: "Rönesans Okur-Yazarlığı Atölyesi — Tarih Değişikliği",
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
