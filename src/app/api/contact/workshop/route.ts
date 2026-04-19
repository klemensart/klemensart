import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, phone, message, workshopTitle, organizerEmail } =
      await req.json();

    if (!name || !email || !message) {
      return Response.json({ error: "Eksik alan" }, { status: 400 });
    }

    const to = organizerEmail || "kerem.hun@klemensart.com";

    await resend.emails.send({
      from: "Klemens Atölyeler <noreply@klemensart.com>",
      to,
      replyTo: email,
      subject: `Atölye Sorusu: ${workshopTitle}`,
      html: `
        <p><strong>${name}</strong> (${email}${phone ? `, ${phone}` : ""}) atölye hakkında soru sordu:</p>
        <blockquote style="border-left:3px solid #FF6D60;padding-left:12px;color:#555">${message}</blockquote>
        <p style="color:#888"><em>Atölye: ${workshopTitle}</em></p>
      `,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Gönderilemedi" }, { status: 500 });
  }
}
