function getFaqItems(hostName: string, isKlemens: boolean) {
  return [
    {
      q: "Bu atölyeyi kim düzenliyor?",
      a: isKlemens
        ? "Bu atölye Klemens editöryal ekibi tarafından düzenlenmektedir."
        : `Bu atölye ${hostName} tarafından sunulmaktadır. Klemens, atölyenin kendisini düzenlememekte, sadece duyurusunu sağlamaktadır.`,
    },
    {
      q: "Ödeme nasıl yapılır?",
      a: isKlemens
        ? "Ödeme Klemens üzerinden güvenli olarak alınır."
        : "Ödeme doğrudan düzenleyiciye yapılır. Klemens ödeme sürecine taraf değildir. Ödeme yöntemleri için düzenleyiciyle iletişime geçin.",
    },
    {
      q: "İptal ve iade koşulları nelerdir?",
      a: isKlemens
        ? "Atölye başlamadan 48 saat öncesine kadar tam iade alabilirsiniz."
        : "İptal ve iade koşulları her düzenleyici tarafından ayrı ayrı belirlenir. Kayıt olmadan önce düzenleyicinin iade politikasını öğrenin.",
    },
    {
      q: "Atölye iptal edilirse ne olur?",
      a: isKlemens
        ? "Klemens tarafından iptal edilen atölyeler için tam iade yapılır veya başka bir tarihe transfer edilir."
        : "Atölyenin gerçekleşmemesi durumunda iade ve mağduriyet giderme yükümlülüğü düzenleyiciye aittir. Klemens, bu durumda iletişimi kolaylaştırmaya çalışır.",
    },
    {
      q: "Bir sorun yaşarsam ne yapabilirim?",
      a: isKlemens
        ? "info@klemensart.com adresinden bize ulaşabilirsiniz."
        : "Önce düzenleyiciyle iletişime geçiniz. Çözülemeyen durumlarda info@klemensart.com adresine bildirebilirsiniz.",
    },
  ];
}

export default function AtolyeFAQ({
  hostName,
  isKlemens,
}: {
  hostName: string;
  isKlemens: boolean;
}) {
  const items = getFaqItems(hostName, isKlemens);

  return (
    <div className="rounded-2xl bg-warm-50 p-6">
      <h3 className="font-bold text-lg text-warm-900 mb-4">
        Sıkça Sorulan Sorular
      </h3>
      <div className="space-y-0">
        {items.map((item, i) => (
          <details key={i} className="group border-b border-warm-200 last:border-0">
            <summary className="list-none cursor-pointer font-medium text-sm text-warm-900 py-3 flex justify-between items-center gap-2">
              <span>{item.q}</span>
              <span className="text-brand-warm text-xs flex-shrink-0 group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <div className="text-sm text-brand-warm pb-3 leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
