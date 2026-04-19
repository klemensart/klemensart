export default function DisclaimerNote({ hostName }: { hostName: string }) {
  return (
    <div className="rounded-2xl border border-warm-200 p-6 bg-white">
      <div className="text-xs uppercase tracking-wider text-brand-warm mb-2">
        &#9432; Önemli Bilgi
      </div>
      <p className="text-sm text-brand-warm leading-relaxed">
        Bu atölye <strong className="text-warm-900">{hostName}</strong> tarafından
        düzenlenmektedir. Klemens, atölyeyi listeleyen ve duyuran platformdur.
        Ödeme, iptal ve iade koşulları doğrudan düzenleyicinin
        sorumluluğundadır.
      </p>
    </div>
  );
}
