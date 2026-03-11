import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İade ve İptal Politikası",
  description:
    "Klemens Art online atölye ve dijital içerik satın alımlarına ilişkin iade, iptal ve cayma hakkı koşulları.",
  alternates: { canonical: "/iade-ve-iptal" },
  openGraph: {
    title: "İade ve İptal Politikası — Klemens",
    description:
      "Klemens Art online atölye ve dijital içerik satın alımlarına ilişkin iade, iptal ve cayma hakkı koşulları.",
    url: "https://klemensart.com/iade-ve-iptal",
  },
  twitter: {
    card: "summary_large_image",
    title: "İade ve İptal Politikası — Klemens",
    description:
      "Klemens Art online atölye ve dijital içerik satın alımlarına ilişkin iade, iptal ve cayma hakkı koşulları.",
  },
};

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
  light: "#F5F0EB",
};

export default function IadeVeIptalPage() {
  return (
    <main style={{ background: B.cream, minHeight: "100vh" }}>
      <article
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "72px 24px 96px",
        }}
      >
        <p
          style={{
            color: B.coral,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Yasal
        </p>
        <h1
          style={{
            fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 800,
            color: B.dark,
            margin: "0 0 12px",
            lineHeight: 1.2,
          }}
        >
          İade ve İptal Politikası
        </h1>
        <p style={{ color: B.warm, fontSize: 14, marginBottom: 40 }}>
          Son güncelleme: 10 Mart 2026
        </p>

        <div
          style={{
            color: "#3d3833",
            fontSize: 15,
            lineHeight: 1.85,
          }}
        >
          <Section title="1. Kapsam">
            <p>
              Bu politika, <strong>Klemens Art</strong> platformu üzerinden satın
              alınan canlı Zoom atölyeleri, tekli oturum kayıtları ve dijital
              içerik erişim haklarına ilişkin iade ve iptal koşullarını
              düzenler.
            </p>
          </Section>

          <Section title="2. Canlı Atölye Serileri">
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                Atölyenin <strong>ilk oturumundan 48 saat öncesine kadar</strong>{" "}
                yapılan iptal taleplerinde ödemenin tamamı iade edilir.
              </li>
              <li>
                İlk oturumun başlamasına 48 saatten az süre kaldığında veya ilk
                oturum gerçekleştikten sonra <strong>iade yapılmaz</strong>;
                ancak kayıt erişim hakkınız (tekrar izleme) devam eder.
              </li>
              <li>
                Katılımcı, atölye süresince herhangi bir oturuma katılamazsa
                kayıttan izleme hakkını kullanabilir; bu durum iade gerekçesi
                oluşturmaz.
              </li>
            </ul>
          </Section>

          <Section title="3. Tekli Oturum Kayıtları ve Dijital İçerikler">
            <p>
              Satın alma işlemi tamamlandığında içeriğe anında erişim sağlandığı
              için 6502 sayılı Tüketicinin Korunması Hakkında Kanun&apos;un 53.
              maddesi uyarınca{" "}
              <strong>cayma hakkı kullanılamaz</strong>. Satın alma öncesinde
              içerik açıklamaları ve önizleme bilgileri sunulmaktadır.
            </p>
          </Section>

          <Section title="4. Teknik Sorunlar">
            <p>
              Platform kaynaklı teknik bir aksaklık nedeniyle içeriğe hiç
              erişilemediği durumlarda, sorunun bildirilmesinden itibaren{" "}
              <strong>7 iş günü içinde</strong> tam iade yapılır veya alternatif
              erişim sağlanır.
            </p>
          </Section>

          <Section title="5. İade Süreci">
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                İade talebi{" "}
                <a
                  href="mailto:info@klemensart.com"
                  style={{ color: B.coral, fontWeight: 600, textDecoration: "none" }}
                >
                  info@klemensart.com
                </a>{" "}
                adresine gönderilmelidir.
              </li>
              <li>
                Talep, <strong>3 iş günü içinde</strong> değerlendirilerek
                sonuçlandırılır.
              </li>
              <li>
                Onaylanan iadeler, ödemenin yapıldığı yöntemle (kredi kartı,
                banka kartı) <strong>en geç 14 iş günü içinde</strong> hesaba
                yansıtılır.
              </li>
            </ul>
          </Section>

          <Section title="6. Ödeme Güvenliği">
            <p>
              Tüm ödemeler <strong>PayTR</strong> altyapısı üzerinden, 256-bit
              SSL şifreleme ile güvenli biçimde işlenir. Kart bilgileri
              sunucularımızda saklanmaz. E-arşiv fatura kesilir.
            </p>
          </Section>

          <Section title="7. İletişim">
            <p>
              Sorularınız için{" "}
              <a
                href="mailto:info@klemensart.com"
                style={{ color: B.coral, fontWeight: 600, textDecoration: "none" }}
              >
                info@klemensart.com
              </a>{" "}
              adresinden bize ulaşabilirsiniz.
            </p>
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: "#2D2926",
          margin: "0 0 10px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
