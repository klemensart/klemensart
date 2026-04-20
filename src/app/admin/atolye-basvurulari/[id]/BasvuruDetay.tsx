"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

type Application = {
  id: string;
  created_at: string;
  updated_at: string | null;
  status: string;
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
  terms_accepted: boolean;
  ip_address: string | null;
  user_agent: string | null;
  user_id: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_note: string | null;
};

type ToastState = {
  message: string;
  type: "success" | "error";
  sub?: string;
} | null;

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Beklemede", bg: "bg-amber-100", text: "text-amber-800" },
  reviewing: { label: "İnceleniyor", bg: "bg-blue-100", text: "text-blue-800" },
  approved: { label: "Onaylı", bg: "bg-emerald-100", text: "text-emerald-800" },
  rejected: { label: "Reddedildi", bg: "bg-red-100", text: "text-red-700" },
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  email: "E-posta",
  website: "Web sitesi",
  other: "Diğer",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function BasvuruDetay({ application }: { application: Application }) {
  const router = useRouter();
  const [app, setApp] = useState(application);
  const [adminNote, setAdminNote] = useState(app.admin_note || "");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function showToast(t: ToastState) {
    setToast(t);
    if (t) setTimeout(() => setToast(null), 4000);
  }

  async function handleUpdate(status: string) {
    setLoading(status);

    // Uyarı: Zaten onaylı/reddedilmiş başvuruda tekrar onay/red
    if (
      (status === "approved" || status === "rejected") &&
      app.status === status &&
      sendEmail
    ) {
      const confirmed = window.confirm(
        `Bu başvuru zaten ${STATUS_CONFIG[status].label.toLowerCase()}. Tekrar email gönderilsin mi?`,
      );
      if (!confirmed) {
        setLoading(null);
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/atolye-basvurulari/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          admin_note: adminNote || undefined,
          send_email: status === "reviewing" ? false : sendEmail,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      // Optimistic update
      setApp((prev) => ({
        ...prev,
        status,
        admin_note: adminNote || prev.admin_note,
        reviewed_at:
          status === "approved" || status === "rejected"
            ? new Date().toISOString()
            : prev.reviewed_at,
        updated_at: new Date().toISOString(),
      }));

      const emailSent =
        status !== "reviewing" && sendEmail && (status === "approved" || status === "rejected");
      showToast({
        message:
          status === "approved"
            ? "Başvuru onaylandı"
            : status === "rejected"
              ? "Başvuru reddedildi"
              : "İnceleniyor olarak işaretlendi",
        type: "success",
        sub: emailSent ? "Email başvurana iletildi" : undefined,
      });

      router.refresh();
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : "Bir hata oluştu",
        type: "error",
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/atolye-basvurulari/${app.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Silinemedi");
      router.push("/admin/atolye-basvurulari");
      router.refresh();
    } catch {
      showToast({ message: "Silme işlemi başarısız", type: "error" });
      setLoading(null);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <p>{toast.message}</p>
          {toast.sub && (
            <p className="text-xs opacity-80 mt-0.5">{toast.sub}</p>
          )}
        </div>
      )}

      {/* Breadcrumb */}
      <Link
        href="/admin/atolye-basvurulari"
        className="inline-flex items-center gap-1.5 text-sm text-warm-900/50 hover:text-coral transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Başvurulara Dön
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-900">{app.applicant_name}</h1>
        <div className="flex items-center gap-3 mt-2">
          <StatusBadge status={app.status} large />
          <span className="text-sm text-warm-900/50">
            {formatDate(app.created_at)}
          </span>
        </div>
      </div>

      {/* Two column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Düzenleyici Bilgileri */}
          <Card title="Düzenleyici Bilgileri">
            <InfoRow label="Ad" value={app.applicant_name} />
            <InfoRow
              label="E-posta"
              value={
                <a href={`mailto:${app.applicant_email}`} className="text-coral hover:underline">
                  {app.applicant_email}
                </a>
              }
            />
            <InfoRow
              label="Telefon"
              value={
                <a href={`tel:${app.applicant_phone}`} className="text-coral hover:underline">
                  {app.applicant_phone}
                </a>
              }
            />
            <InfoRow
              label="Web/Sosyal"
              value={
                app.applicant_website ? (
                  <a
                    href={app.applicant_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-coral hover:underline"
                  >
                    {app.applicant_website}
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </Card>

          {/* Atölye Bilgileri */}
          <Card title="Atölye Bilgileri">
            <InfoRow label="Konu" value={<span className="font-medium">{app.workshop_topic}</span>} />
            <InfoRow label="Süre" value={app.workshop_duration} />
            <InfoRow label="Ücret" value={app.workshop_price} />
            <InfoRow
              label="İletişim"
              value={
                <span className="inline-flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-warm-100 text-xs font-medium text-warm-900/70">
                    {CHANNEL_LABELS[app.contact_channel] || app.contact_channel}
                  </span>
                  <ContactLink channel={app.contact_channel} detail={app.contact_channel_detail} />
                </span>
              }
            />
          </Card>

          {/* Açıklama */}
          <Card title="Açıklama">
            <p className="text-warm-900/80 text-sm leading-relaxed whitespace-pre-line max-w-[70ch]">
              {app.workshop_description}
            </p>
          </Card>

          {/* Hedef Kitle */}
          <Card title="Hedef Kitle">
            <p className="text-warm-900/80 text-sm">
              {app.target_audience || "Belirtilmemiş"}
            </p>
          </Card>

          {/* Meta Bilgiler */}
          <Card title="Meta Bilgiler">
            <InfoRow label="Başvuru tarihi" value={formatDateFull(app.created_at)} />
            <InfoRow
              label="IP"
              value={
                <span className="font-mono text-xs text-warm-900/50">
                  {app.ip_address || "—"}
                </span>
              }
            />
            <InfoRow
              label="Tarayıcı"
              value={
                <span className="text-xs text-warm-900/40 block max-w-[400px] truncate">
                  {app.user_agent || "—"}
                </span>
              }
            />
            <InfoRow
              label="Üyelik"
              value={app.user_id ? "Kayıtlı kullanıcı" : "Hayır"}
            />
            <InfoRow
              label="Koşullar"
              value={
                app.terms_accepted ? (
                  <span className="text-emerald-700">✓ Kabul edildi</span>
                ) : (
                  <span className="text-red-600">Edilmedi</span>
                )
              }
            />
          </Card>

          {/* Karar Geçmişi */}
          {app.reviewed_at && (
            <Card title="Karar Geçmişi">
              <InfoRow label="İncelenme" value={formatDateFull(app.reviewed_at)} />
              <InfoRow label="İnceleyen" value={app.reviewed_by || "—"} />
              <InfoRow label="Admin notu" value={app.admin_note || "Not yok"} />
              <InfoRow label="Durum" value={<StatusBadge status={app.status} />} />
            </Card>
          )}
        </div>

        {/* Right column (1/3) — Actions */}
        <div className="space-y-5">
          {/* Status Card */}
          <div className="bg-white border border-warm-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-warm-900/50 uppercase tracking-wide mb-3">
              Mevcut Durum
            </p>
            <StatusBadge status={app.status} large />
          </div>

          {/* Actions Card */}
          <div className="bg-white border border-warm-200 rounded-xl p-5 space-y-5">
            {/* Admin Note */}
            <div>
              <label className="block text-xs font-semibold text-warm-900/50 uppercase tracking-wide mb-2">
                Admin Notu
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="İçsel not: karar gerekçesi, hatırlatmalar..."
                className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm text-warm-900 placeholder:text-warm-900/30 focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral resize-y"
                style={{ minHeight: "120px" }}
              />
              <p className="text-xs text-warm-900/30 mt-1">Başvurana gösterilmez.</p>
            </div>

            {/* Email checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-warm-300 text-coral focus:ring-coral/30"
              />
              <div>
                <span className="text-sm text-warm-900 font-medium">Başvurana karar emaili gönder</span>
                <p className="text-xs text-warm-900/40 mt-0.5">
                  Onay/red durumunda başvurana otomatik email gider. Sadece status güncellemek istiyorsan işareti kaldır.
                </p>
              </div>
            </label>

            {/* Action buttons */}
            <div className="pt-3 border-t border-warm-100 space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <button
                    onClick={() => handleUpdate("approved")}
                    disabled={loading !== null}
                    className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === "approved" ? "..." : "Onayla"}
                  </button>
                  <p className="text-[11px] text-warm-900/35 mt-1.5 italic">Başvuru onaylanır ve email gider</p>
                </div>
                <div>
                  <button
                    onClick={() => handleUpdate("rejected")}
                    disabled={loading !== null}
                    className="w-full px-4 py-2.5 rounded-lg border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === "rejected" ? "..." : "Reddet"}
                  </button>
                  <p className="text-[11px] text-warm-900/35 mt-1.5 italic">Red emaili gider</p>
                </div>
              </div>
              <div>
                <button
                  onClick={() => handleUpdate("reviewing")}
                  disabled={loading !== null}
                  className="w-full px-4 py-2 rounded-lg border border-warm-300 text-warm-700 text-sm font-medium hover:bg-warm-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === "reviewing" ? "..." : "İnceleniyor Olarak İşaretle"}
                </button>
                <p className="text-[11px] text-warm-900/35 mt-1.5 italic">Karar vermeden beklemek için (email gitmez)</p>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white border border-red-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-red-600/70 uppercase tracking-wide mb-3">
              Tehlikeli Bölge
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Başvuruyu Sil
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-warm-900/70">
                  <strong>{app.applicant_name}</strong>&apos;in başvurusunu kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-2 rounded-lg border border-warm-200 text-sm text-warm-900/70 hover:bg-warm-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading === "delete"}
                    className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading === "delete" ? "Siliniyor..." : "Evet, Sil"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-warm-200 rounded-xl p-5">
      <h2 className="text-xs font-semibold text-warm-900/50 uppercase tracking-wide mb-4">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-xs text-warm-900/40 sm:w-28 sm:flex-shrink-0 font-medium">
        {label}
      </span>
      <span className="text-sm text-warm-900/80">{value}</span>
    </div>
  );
}

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const config = STATUS_CONFIG[status] || { label: status, bg: "bg-warm-100", text: "text-warm-900/50" };
  return (
    <span
      className={`inline-block rounded-full font-medium ${config.bg} ${config.text} ${
        large ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"
      }`}
    >
      {config.label}
    </span>
  );
}

function ContactLink({ channel, detail }: { channel: string; detail: string }) {
  if (channel === "whatsapp") {
    const waLink = `https://wa.me/90${detail.replace(/\D/g, "").replace(/^0/, "")}`;
    return (
      <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-coral text-sm hover:underline">
        {detail}
      </a>
    );
  }
  if (channel === "email") {
    return (
      <a href={`mailto:${detail}`} className="text-coral text-sm hover:underline">
        {detail}
      </a>
    );
  }
  if (channel === "website") {
    const href = detail.startsWith("http") ? detail : `https://${detail}`;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-coral text-sm hover:underline">
        {detail}
      </a>
    );
  }
  return <span className="text-sm text-warm-900/70">{detail}</span>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
