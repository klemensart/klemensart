import { sendThankYouEmail } from "@/lib/send-thank-you";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://klemensart.com";
const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || "kerem.hun@klemensart.com";

type ApplicationData = {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_website: string | null;
  workshop_topic: string;
  workshop_description: string;
  workshop_duration: string;
  workshop_price: string;
  target_audience: string | null;
  contact_channel: string;
  contact_channel_detail: string;
};

const channelLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  email: "E-posta",
  website: "Web sitesi",
  other: "Diğer",
};

// ─── Admin bildirim emaili ──────────────────────────────────

export async function sendApplicationNotificationToAdmin(
  app: ApplicationData,
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e8e0d8;overflow:hidden;">
    <div style="padding:28px 32px 20px;border-bottom:1px solid #f0ebe6;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#FF6D60;font-weight:700;">Yeni Başvuru</p>
      <h1 style="margin:0;font-size:20px;font-weight:800;color:#2D2926;">Marketplace Başvurusu</h1>
    </div>
    <div style="padding:24px 32px;font-size:14px;line-height:1.7;color:#3d3833;">
      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#8C857E;margin:0 0 12px;font-weight:600;">Düzenleyici Bilgileri</h2>
      <p style="margin:0 0 4px;"><strong>Ad:</strong> ${esc(app.applicant_name)}</p>
      <p style="margin:0 0 4px;"><strong>E-posta:</strong> ${esc(app.applicant_email)}</p>
      <p style="margin:0 0 4px;"><strong>Telefon:</strong> ${esc(app.applicant_phone)}</p>
      <p style="margin:0 0 16px;"><strong>Web/Sosyal:</strong> ${app.applicant_website ? esc(app.applicant_website) : "—"}</p>

      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#8C857E;margin:0 0 12px;font-weight:600;">Atölye</h2>
      <p style="margin:0 0 4px;"><strong>Konu:</strong> ${esc(app.workshop_topic)}</p>
      <p style="margin:0 0 4px;"><strong>Süre:</strong> ${esc(app.workshop_duration)}</p>
      <p style="margin:0 0 4px;"><strong>Ücret:</strong> ${esc(app.workshop_price)}</p>
      <p style="margin:0 0 16px;"><strong>İletişim Kanalı:</strong> ${channelLabels[app.contact_channel] || app.contact_channel} — ${esc(app.contact_channel_detail)}</p>

      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#8C857E;margin:0 0 12px;font-weight:600;">Açıklama</h2>
      <p style="margin:0 0 16px;white-space:pre-line;">${esc(app.workshop_description)}</p>

      <p style="margin:0 0 24px;"><strong>Hedef Kitle:</strong> ${app.target_audience ? esc(app.target_audience) : "—"}</p>

      <div style="border-top:1px solid #f0ebe6;padding-top:16px;">
        <a href="${BASE_URL}/admin/atolye-basvurulari/${app.id}" style="display:inline-block;background:#FF6D60;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:600;font-size:13px;">Değerlendir</a>
      </div>
    </div>
    <div style="padding:16px 32px;background:#faf8f5;border-top:1px solid #f0ebe6;">
      <p style="margin:0;font-size:12px;color:#8C857E;font-style:italic;">Klemens Marketplace</p>
    </div>
  </div>
</body>
</html>`.trim();

  try {
    await sendThankYouEmail({
      to: ADMIN_EMAIL,
      subject: `Yeni Marketplace Başvurusu — ${app.applicant_name}`,
      html,
    });
  } catch (err) {
    console.error("[marketplace-email] Admin bildirim hatası:", err);
  }
}

// ─── Başvurana onay emaili ───────────────────────────────────

export async function sendApplicationConfirmationToApplicant(
  app: ApplicationData,
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e8e0d8;overflow:hidden;">
    <div style="padding:28px 32px 20px;border-bottom:1px solid #f0ebe6;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#FF6D60;font-weight:700;">Klemens Marketplace</p>
      <h1 style="margin:0;font-size:20px;font-weight:800;color:#2D2926;">Başvurunuz Alındı</h1>
    </div>
    <div style="padding:24px 32px;font-size:14px;line-height:1.8;color:#3d3833;">
      <p style="margin:0 0 16px;">Merhaba ${esc(app.applicant_name)},</p>

      <p style="margin:0 0 16px;">Klemens Marketplace'e gösterdiğiniz ilgi için teşekkür ederiz. <strong>"${esc(app.workshop_topic)}"</strong> başlıklı atölye başvurunuz tarafımıza ulaştı.</p>

      <p style="margin:0 0 16px;">Klemens küratörlü bir platform olduğundan, her başvuruyu dikkatle inceliyoruz. Değerlendirme sürecimiz <strong>15 iş günü</strong> içinde tamamlanır ve sonuç bu e-posta adresine bildirilir.</p>

      <p style="margin:0 0 8px;">Bu süreçte:</p>
      <ul style="margin:0 0 16px;padding-left:20px;color:#3d3833;">
        <li style="margin-bottom:6px;">Başvurunuzu incelerken atölyenizin Klemens'in editöryal duruşuyla uyumunu ve hedef kitlemize sunabileceği değeri değerlendiriyoruz</li>
        <li>Gerekli görürsek ek bilgi için size e-posta ile ulaşabiliriz</li>
      </ul>

      <p style="margin:0 0 16px;">Platformumuzda atölye düzenleyicilerini bağlayan koşulları şu adresten inceleyebilirsiniz:</p>
      <p style="margin:0 0 24px;"><a href="${BASE_URL}/duzenleyici-kosullari" style="color:#FF6D60;font-weight:600;text-decoration:none;">Düzenleyici Koşulları →</a></p>

      <p style="margin:0 0 4px;">Sorularınız için: <a href="mailto:info@klemensart.com" style="color:#FF6D60;font-weight:600;text-decoration:none;">info@klemensart.com</a></p>

      <p style="margin:24px 0 0;color:#8C857E;">Saygılarımızla,<br><strong style="color:#2D2926;">Klemens</strong></p>
    </div>
    <div style="padding:16px 32px;background:#faf8f5;border-top:1px solid #f0ebe6;">
      <p style="margin:0;font-size:12px;color:#8C857E;font-style:italic;">Bu e-posta, başvurunuza istinaden otomatik olarak gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>`.trim();

  try {
    await sendThankYouEmail({
      to: app.applicant_email,
      subject: "Başvurunuz Alındı — Klemens Marketplace",
      html,
    });
  } catch (err) {
    console.error("[marketplace-email] Başvuran onay hatası:", err);
  }
}

// ─── Onay emaili (approved) ──────────────────────────────────

type StatusEmailData = {
  applicant_name: string;
  applicant_email: string;
  workshop_topic: string;
};

export async function sendApplicationApprovedEmail(
  app: StatusEmailData,
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e8e0d8;overflow:hidden;">
    <div style="padding:28px 32px 20px;border-bottom:1px solid #f0ebe6;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#FF6D60;font-weight:700;">Klemens Marketplace</p>
      <h1 style="margin:0;font-size:20px;font-weight:800;color:#2D2926;">Başvurunuz Onaylandı!</h1>
    </div>
    <div style="padding:24px 32px;font-size:14px;line-height:1.8;color:#3d3833;">
      <p style="margin:0 0 16px;">Merhaba ${esc(app.applicant_name)},</p>

      <p style="margin:0 0 16px;">Tebrikler! <strong>"${esc(app.workshop_topic)}"</strong> başlıklı atölye başvurunuz Klemens küratörlük ekibi tarafından onaylandı.</p>

      <p style="margin:0 0 8px;">Sonraki adımlar:</p>
      <ol style="margin:0 0 16px;padding-left:20px;color:#3d3833;">
        <li style="margin-bottom:8px;">Klemens ekibi sizinle iletişime geçerek atölye detaylarını (tarih, konum, kontenjan vb.) netleştirecek.</li>
        <li style="margin-bottom:8px;">Atölye sayfanız platformda yayına alınacak ve tanıtım sürecine başlanacak.</li>
        <li>Düzenleyici paneline erişim bilgileriniz ayrıca iletilecek.</li>
      </ol>

      <p style="margin:0 0 16px;">Platformumuzda atölye düzenleyicilerini bağlayan koşulları henüz incelemediyseniz:</p>
      <p style="margin:0 0 24px;"><a href="${BASE_URL}/duzenleyici-kosullari" style="color:#FF6D60;font-weight:600;text-decoration:none;">Düzenleyici Koşulları →</a></p>

      <p style="margin:0 0 4px;">Sorularınız için: <a href="mailto:info@klemensart.com" style="color:#FF6D60;font-weight:600;text-decoration:none;">info@klemensart.com</a></p>

      <p style="margin:24px 0 0;color:#8C857E;">Saygılarımızla,<br><strong style="color:#2D2926;">Klemens</strong></p>
    </div>
    <div style="padding:16px 32px;background:#faf8f5;border-top:1px solid #f0ebe6;">
      <p style="margin:0;font-size:12px;color:#8C857E;font-style:italic;">Bu e-posta, başvurunuzun onaylanması üzerine otomatik olarak gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>`.trim();

  try {
    await sendThankYouEmail({
      to: app.applicant_email,
      subject: "Başvurunuz Onaylandı — Klemens Marketplace",
      html,
    });
  } catch (err) {
    console.error("[marketplace-email] Onay email hatası:", err);
  }
}

// ─── Red emaili (rejected) ──────────────────────────────────

export async function sendApplicationRejectedEmail(
  app: StatusEmailData,
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e8e0d8;overflow:hidden;">
    <div style="padding:28px 32px 20px;border-bottom:1px solid #f0ebe6;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#FF6D60;font-weight:700;">Klemens Marketplace</p>
      <h1 style="margin:0;font-size:20px;font-weight:800;color:#2D2926;">Başvuru Sonucunuz</h1>
    </div>
    <div style="padding:24px 32px;font-size:14px;line-height:1.8;color:#3d3833;">
      <p style="margin:0 0 16px;">Merhaba ${esc(app.applicant_name)},</p>

      <p style="margin:0 0 16px;"><strong>"${esc(app.workshop_topic)}"</strong> başlıklı atölye başvurunuzu dikkatle inceledik. Ancak şu aşamada bu atölyeyi platformumuzda yayınlayamayacağımızı bildirmek isteriz.</p>

      <p style="margin:0 0 16px;">Klemens küratörlü bir platformdur; her dönem sınırlı sayıda atölyeyi programa alıyoruz. Bu karar, kişisel bir değerlendirme değil; mevcut programımızın dengesi ve hedef kitlemizin beklentileri doğrultusunda alınmıştır.</p>

      <p style="margin:0 0 16px;">Gelecekte farklı bir konu veya formatta yeniden başvurmanızı memnuniyetle karşılarız. Platformumuzun yönelimlerini takip etmek için bültenimize abone olabilirsiniz:</p>
      <p style="margin:0 0 24px;"><a href="${BASE_URL}/bulten" style="color:#FF6D60;font-weight:600;text-decoration:none;">E-bültene Abone Ol →</a></p>

      <p style="margin:0 0 4px;">Sorularınız için: <a href="mailto:info@klemensart.com" style="color:#FF6D60;font-weight:600;text-decoration:none;">info@klemensart.com</a></p>

      <p style="margin:24px 0 0;color:#8C857E;">Saygılarımızla,<br><strong style="color:#2D2926;">Klemens</strong></p>
    </div>
    <div style="padding:16px 32px;background:#faf8f5;border-top:1px solid #f0ebe6;">
      <p style="margin:0;font-size:12px;color:#8C857E;font-style:italic;">Bu e-posta, başvurunuzun değerlendirilmesi sonucunda otomatik olarak gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>`.trim();

  try {
    await sendThankYouEmail({
      to: app.applicant_email,
      subject: "Başvuru Sonucunuz — Klemens Marketplace",
      html,
    });
  } catch (err) {
    console.error("[marketplace-email] Red email hatası:", err);
  }
}

// ─── HTML escape ─────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
