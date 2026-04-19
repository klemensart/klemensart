export default function DisclaimerNote({ hostName }: { hostName: string }) {
  return (
    <div className="rounded-2xl border border-warm-200 p-5 bg-white">
      <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-brand-warm mb-2">
        <span className="text-coral/60">ⓘ</span>
        Önemli Bilgi
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
