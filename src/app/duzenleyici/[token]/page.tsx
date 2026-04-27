import { validateUploadToken } from "@/lib/upload-token";
import UploadForm from "./UploadForm";

export default async function DuzenleyiciPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await validateUploadToken(token);

  // ── Hata durumları ──────────────────────────────────────────────────────

  if (result.status === "not_found") {
    return (
      <ErrorState
        title="Bu bağlantı geçersiz"
        message="Bağlantı yanlış veya artık aktif değil. Doğru bağlantıyı kullandığınızdan emin olun."
      />
    );
  }

  if (result.status === "expired") {
    return (
      <ErrorState
        title="Bağlantının süresi doldu"
        message="Bu bağlantı 30 gün geçerlidir ve süresi dolmuştur. Yeni bir bağlantı için info@klemensart.com adresinden iletişime geçin."
      />
    );
  }

  if (result.status === "not_approved") {
    return (
      <ErrorState
        title="Başvurunuz henüz onaylanmadı"
        message="Başvurunuz onaylandığında bu sayfa aktif hale gelecektir."
      />
    );
  }

  // ── Materyaller zaten gönderilmiş ───────────────────────────────────────

  if (result.status === "submitted") {
    const date = new Date(result.submitted_at).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Istanbul",
    });

    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="bg-white rounded-2xl border border-warm-200 p-8 sm:p-12">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-warm-900 mb-3">
            Materyalleriniz Alındı
          </h1>
          <p className="text-warm-900/60 leading-relaxed mb-2">
            <strong>{result.applicant_name}</strong>, <strong>&ldquo;{result.workshop_topic}&rdquo;</strong> atölyesi için materyallerinizi <strong>{date}</strong> tarihinde gönderdiniz.
          </p>
          <p className="text-warm-900/40 text-sm">
            Güncellemek için{" "}
            <a href="mailto:info@klemensart.com" className="text-coral hover:underline">
              info@klemensart.com
            </a>{" "}
            adresinden iletişime geçebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  // ── Hazır — upload formu ────────────────────────────────────────────────

  return <UploadForm application={result.application} token={token} />;
}

// ── Hata state bileşeni ─────────────────────────────────────────────────────

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="bg-white rounded-2xl border border-warm-200 p-8 sm:p-12">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-warm-900 mb-3">{title}</h1>
        <p className="text-warm-900/50 leading-relaxed">{message}</p>
        <p className="text-warm-900/30 text-sm mt-6">
          <a href="mailto:info@klemensart.com" className="text-coral hover:underline">
            info@klemensart.com
          </a>
        </p>
      </div>
    </div>
  );
}
