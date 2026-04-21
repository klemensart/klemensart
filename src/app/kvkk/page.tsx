import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "Klemens Art kişisel verilerin korunması ve işlenmesine ilişkin aydınlatma metni.",
  keywords: ["kvkk", "kişisel veri", "aydınlatma metni", "klemens gizlilik"],
  alternates: { canonical: "/kvkk" },
  openGraph: {
    title: "KVKK Aydınlatma Metni — Klemens",
    description:
      "Klemens Art kişisel verilerin korunması ve işlenmesine ilişkin aydınlatma metni.",
    url: "https://klemensart.com/kvkk",
  },
  twitter: {
    card: "summary_large_image",
    title: "KVKK Aydınlatma Metni — Klemens",
    description:
      "Klemens Art kişisel verilerin korunması ve işlenmesine ilişkin aydınlatma metni.",
  },
};

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
};

export default function KvkkPage() {
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
          KVKK Aydınlatma Metni
        </h1>
        <p style={{ color: B.warm, fontSize: 14, marginBottom: 40 }}>
          Son güncelleme: 16 Mart 2026
        </p>

        <div
          style={{
            color: "#3d3833",
            fontSize: 15,
            lineHeight: 1.85,
          }}
        >
          <Section title="1. Veri Sorumlusu">
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
              kapsamında veri sorumlusu <strong>Klemens Art Prodüksiyon Limited Şirketi</strong>&apos;dir.
            </p>
          </Section>

          <Section title="2. İşlenen Kişisel Veriler">
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                <strong>Kimlik verileri:</strong> Ad, soyad (hesap oluşturulduğunda)
              </li>
              <li>
                <strong>İletişim verileri:</strong> E-posta adresi
              </li>
              <li>
                <strong>İşlem güvenliği verileri:</strong> Oturum bilgileri, IP
                adresi, tarayıcı bilgileri
              </li>
              <li>
                <strong>Pazarlama verileri:</strong> Bülten abonelik tercihi
              </li>
            </ul>
          </Section>

          <Section title="3. Verilerin İşlenme Amaçları">
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>Kullanıcı hesabı oluşturma ve yönetimi</li>
              <li>Satın alınan atölye ve içeriklere erişim sağlanması</li>
              <li>Ödeme işlemlerinin güvenli biçimde gerçekleştirilmesi</li>
              <li>E-bülten ve bilgilendirme e-postaları gönderimi (açık rıza ile)</li>
              <li>Platform güvenliğinin sağlanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </Section>

          <Section title="4. Verilerin Aktarılması">
            <p>
              Kişisel verileriniz; ödeme işlemleri için{" "}
              <strong>PayTR Ödeme Hizmetleri A.Ş.</strong>&apos;ye, altyapı
              hizmetleri için <strong>Supabase Inc.</strong> ve{" "}
              <strong>Vercel Inc.</strong>&apos;e, e-posta gönderim hizmetleri
              için <strong>Resend Inc.</strong>&apos;e KVKK&apos;nın 8. ve 9.
              maddelerine uygun olarak aktarılabilir.
            </p>
          </Section>

          <Section title="5. Verilerin Saklanma Süresi">
            <p>
              Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve
              yasal saklama yükümlülükleri kapsamında muhafaza edilir. Bülten
              aboneliğinizi iptal ettiğinizde e-posta adresiniz pazarlama
              amaçlı işlenmekten çıkarılır.
            </p>
          </Section>

          <Section title="6. Haklarınız (KVKK Madde 11)">
            <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Silinmesini veya yok edilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla
                analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına
                itiraz etme</li>
              <li>Kanuna aykırı işleme nedeniyle zarara uğramanız halinde
                zararın giderilmesini talep etme</li>
            </ul>
          </Section>

          <Section title="7. Çerezler ve İzleme Teknolojileri">
            <p>
              Platformumuzda aşağıdaki çerez kullanılmaktadır:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                <strong>ka_anon_id</strong> — Anonim ziyaretçi tanımlama çerezi.
                Satın alma hunisi analizinde kullanılır. Süre: 1 yıl. Yalnızca
                kullanıcının açık onayı ile set edilir.
              </li>
            </ul>
            <p>
              Site ilk ziyaretinizde alt kısımda bir çerez onay banner&apos;ı
              görüntülenir. &quot;Kabul Et&quot; seçeneğini tercih etmeniz
              halinde yukarıdaki çerez tarayıcınıza kaydedilir.
              &quot;Reddet&quot; seçeneğini tercih etmeniz halinde hiçbir izleme
              çerezi oluşturulmaz ve anonim izleme yapılmaz.
            </p>
            <p>
              Tercihleriniz tarayıcınızın yerel depolama alanında (localStorage)
              saklanır ve istediğiniz zaman tarayıcı ayarlarınızdan
              temizlenebilir.
            </p>
          </Section>

          <Section title="8. İletişim">
            <p>
              Haklarınıza ilişkin taleplerinizi{" "}
              <a
                href="mailto:info@klemensart.com"
                style={{ color: B.coral, fontWeight: 600, textDecoration: "none" }}
              >
                info@klemensart.com
              </a>{" "}
              adresine yazılı olarak iletebilirsiniz.
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
