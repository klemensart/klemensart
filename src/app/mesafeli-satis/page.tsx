import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description:
    "Klemens üzerinden satın alınan canlı atölye, seminer ve dijital içerik hizmetlerine ilişkin mesafeli satış koşulları.",
  keywords: ["mesafeli satış sözleşmesi", "online atölye satın alma", "klemens ödeme koşulları"],
  alternates: { canonical: "/mesafeli-satis" },
  openGraph: {
    title: "Mesafeli Satış Sözleşmesi — Klemens",
    description:
      "Klemens üzerinden satın alınan canlı atölye, seminer ve dijital içerik hizmetlerine ilişkin mesafeli satış koşulları.",
    url: "https://klemensart.com/mesafeli-satis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mesafeli Satış Sözleşmesi — Klemens",
    description:
      "Klemens üzerinden satın alınan canlı atölye, seminer ve dijital içerik hizmetlerine ilişkin mesafeli satış koşulları.",
  },
};

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
};

export default function MesafeliSatisPage() {
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
          Mesafeli Satış Sözleşmesi
        </h1>
        <p style={{ color: B.warm, fontSize: 14, marginBottom: 40 }}>
          Son güncelleme: 20 Nisan 2026
        </p>

        <div
          style={{
            color: "#3d3833",
            fontSize: 15,
            lineHeight: 1.85,
          }}
        >
          <Section title="1. Taraflar">
            <p>
              İşbu Mesafeli Satış Sözleşmesi (bundan sonra &quot;Sözleşme&quot;
              olarak anılacaktır), aşağıda bilgileri yer alan taraflar arasında,
              elektronik ortamda akdedilmiştir.
            </p>

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.dark,
                margin: "16px 0 8px",
              }}
            >
              1.1. Satıcı
            </h3>
            <p>
              <strong>Unvan:</strong> Klemens Art Prodüksiyon Limited Şirketi<br />
              <strong>MERSİS No:</strong> 0564137179400001<br />
              <strong>Ticaret Sicil No:</strong> Ankara 505006<br />
              <strong>Vergi Dairesi / No:</strong> Cumhuriyet / 5641371794<br />
              <strong>Adres:</strong> Tınaztepe Mah. Başçavuş Sk. No: 55/6, Çankaya / Ankara<br />
              <strong>E-posta:</strong>{" "}
              <a href="mailto:info@klemensart.com" style={{ color: B.coral, fontWeight: 600, textDecoration: "none" }}>
                info@klemensart.com
              </a><br />
              <strong>Telefon:</strong> 0532 764 53 10<br />
              <strong>İnternet Sitesi:</strong> www.klemensart.com
            </p>
            <p>(Bundan sonra &quot;Klemens&quot; olarak anılacaktır.)</p>

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.dark,
                margin: "16px 0 8px",
              }}
            >
              1.2. Alıcı
            </h3>
            <p>
              Adı/Soyadı/Unvanı, adresi ve iletişim bilgileri sipariş esnasında
              Alıcı tarafından beyan edildiği şekildedir. (Bundan sonra
              &quot;Alıcı&quot; olarak anılacaktır.)
            </p>
          </Section>

          <Section title="2. Sözleşmenin Kapsamı">
            <p>
              İşbu Sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
              Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca, Alıcı&apos;nın
              www.klemensart.com adresinden elektronik ortamda Klemens&apos;ten satın
              aldığı hizmetlerin satışı ve ifası ile ilgili tarafların hak ve
              yükümlülüklerini düzenler.
            </p>
            <div
              style={{
                borderLeft: "4px solid #FF6D60",
                paddingLeft: 16,
                margin: "16px 0",
                background: "#FFF0EE",
                borderRadius: "0 8px 8px 0",
                padding: "16px 16px 16px 20px",
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Önemli Not</p>
              <p>
                İşbu Sözleşme yalnızca Klemens&apos;in kendi düzenlediği atölye,
                seminer ve dijital içerikler için geçerlidir. Klemens platformunda
                &quot;Düzenleyen&quot; alanında üçüncü bir kişi/kuruluş belirtilen
                atölyeler, ilgili düzenleyici ile alıcı arasında ayrı bir hukuki
                ilişki doğurur. Bu durum madde 7&apos;de açıklanmıştır.
              </p>
            </div>
          </Section>

          <Section title="3. Hizmetin Niteliği">
            <p>Klemens&apos;in satışını yaptığı hizmetler aşağıdaki türlerdedir:</p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                <strong>Canlı Atölye / Seminer:</strong> Belirli tarih ve saatte
                Zoom üzerinden gerçekleştirilen eğitim
              </li>
              <li>
                <strong>Atölye Paketi:</strong> Çoklu seans içeren, satın alma
                tarihinden itibaren 6 ay süreyle erişilebilen video kayıt paketi
              </li>
              <li>
                <strong>Tekli Video:</strong> Yayın tarihinden itibaren belirlenen
                süre boyunca erişilebilen tek seferlik dijital içerik
              </li>
            </ul>
          </Section>

          <Section title="4. Hizmet Bedeli ve Ödeme">
            <p>
              Hizmetin tüm vergiler dahil satış bedeli, ilgili ürün/atölye
              sayfasında ve sipariş özeti ekranında Türk Lirası cinsinden
              gösterilir. Ödemeler PayTR Ödeme Hizmetleri A.Ş. altyapısı
              kullanılarak kredi kartı veya banka kartı ile yapılmaktadır.
            </p>
          </Section>

          <Section title="5. Sözleşmenin İfası">
            <p>
              <strong>5.1. Canlı Atölye/Seminerler:</strong> Hizmet, atölye
              sayfasında belirtilen tarih ve saatte Zoom platformu üzerinden ifa
              edilir. Bağlantı bilgileri Alıcı&apos;ya en geç atölye saatinden 24
              saat önce e-posta yoluyla iletilir.
            </p>
            <p>
              <strong>5.2. Dijital İçerik (Atölye Paketleri ve Tekli Videolar):</strong>{" "}
              Hizmet, satın alma işleminin tamamlanmasını takiben Alıcı&apos;nın
              Klemens hesabına otomatik olarak tanımlanır ve &quot;Loca&quot;
              bölümünden erişilebilir hale gelir. Erişim süresi her ürün için ilgili
              ürün sayfasında belirtilir.
            </p>
          </Section>

          <Section title="6. Cayma Hakkı ve İstisnaları">
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.dark,
                margin: "16px 0 8px",
              }}
            >
              6.1. Canlı Atölyelerde Cayma
            </h3>
            <p>
              Alıcı, canlı atölye başlangıç tarihinden 48 saat öncesine kadar{" "}
              <a href="mailto:info@klemensart.com" style={{ color: B.coral, fontWeight: 600, textDecoration: "none" }}>
                info@klemensart.com
              </a>{" "}
              adresine bildirimde bulunarak siparişini iptal etme ve bedel iadesini
              talep etme hakkına sahiptir.
            </p>

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.dark,
                margin: "16px 0 8px",
              }}
            >
              6.2. Dijital İçerikte Cayma Hakkının İstisnası
            </h3>
            <p>
              6502 sayılı Kanun&apos;un 15/1-ğ maddesi ve Mesafeli Sözleşmeler
              Yönetmeliği&apos;nin 15/1-ğ bendi uyarınca, elektronik ortamda anında
              ifa edilen hizmetler ile tüketiciye anında teslim edilen gayri maddi
              mallara ilişkin sözleşmelerde cayma hakkı kullanılamaz.
            </p>
            <p>
              Buna göre Atölye Paketleri ve Tekli Videolar için satın alma
              işleminin tamamlanmasıyla içerik erişimi otomatik olarak açıldığından,
              bu ürünler için cayma hakkı bulunmamaktadır.
            </p>

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.dark,
                margin: "16px 0 8px",
              }}
            >
              6.3. Teknik Sorun Halinde İade
            </h3>
            <p>
              Alıcı, satın aldığı dijital içeriğe Klemens kaynaklı bir teknik sorun
              nedeniyle erişemediğini ispatlaması halinde,{" "}
              <a href="mailto:info@klemensart.com" style={{ color: B.coral, fontWeight: 600, textDecoration: "none" }}>
                info@klemensart.com
              </a>{" "}
              adresine başvurabilir. Talep, 7 iş günü içinde değerlendirilir;
              teknik sorun teyit edilirse bedel iade edilir.
            </p>

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.dark,
                margin: "16px 0 8px",
              }}
            >
              6.4. İade Yöntemi
            </h3>
            <p>
              Onaylanan iadeler, Alıcı&apos;nın ödeme yaptığı kart/hesaba 14 gün
              içerisinde aynı para birimi cinsinden iade edilir. Bankadan kaynaklı
              süreçler bu süreye dahil değildir.
            </p>
          </Section>

          <Section title="7. Marketplace Atölyeleri Hakkında">
            <div
              style={{
                borderLeft: "4px solid #FF6D60",
                paddingLeft: 16,
                margin: "0 0 16px",
              }}
            >
              <p>
                Klemens platformunda yer alan ve &quot;Düzenleyen&quot; alanında
                üçüncü bir kişi/kuruluş belirtilen atölyeler, işbu Sözleşmenin
                kapsamı dışındadır. Bu atölyelerde:
              </p>
              <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
                <li>
                  Klemens, hiçbir surette satıcı veya aracı satıcı sıfatı taşımaz
                </li>
                <li>
                  Klemens, hizmet bedelinin tahsilatına aracılık etmez; ödeme
                  doğrudan Düzenleyici ile Alıcı arasında, Düzenleyici&apos;nin
                  belirlediği yöntemle (mesajlaşma, kendi internet sitesi vb.)
                  gerçekleştirilir
                </li>
                <li>
                  Atölyenin içeriği, ifası, iptali, iadesi ve tüm müşteri
                  ilişkilerinden doğrudan ve münhasıran Düzenleyici sorumludur
                </li>
                <li>
                  Klemens, 5651 sayılı Kanun ve 6563 sayılı Elektronik Ticaretin
                  Düzenlenmesi Hakkında Kanun anlamında &quot;yer sağlayıcı&quot;
                  konumundadır; içerikten ve işlemden sorumlu tutulamaz
                </li>
              </ul>
              <p>
                Bu kapsamdaki atölyelere ilişkin koşullar,{" "}
                <Link
                  href="/duzenleyici-kosullari"
                  style={{ color: B.coral, fontWeight: 600, textDecoration: "none" }}
                >
                  Düzenleyici Koşulları
                </Link>{" "}
                sayfasında ayrıntılı olarak açıklanmıştır.
              </p>
            </div>
          </Section>

          <Section title="8. Alıcı'nın Beyanları">
            <p>
              Alıcı, sipariş öncesinde aşağıdaki hususlarda bilgilendirildiğini,
              anladığını ve kabul ettiğini beyan eder:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>Hizmetin temel nitelikleri, satış bedeli ve ödeme şekli</li>
              <li>İfa süresi ve şekli</li>
              <li>
                Cayma hakkının kullanılma koşulları ve istisnaları, özellikle
                dijital içerikte cayma hakkının bulunmadığı
              </li>
              <li>
                İşbu Sözleşmenin yalnızca Klemens&apos;in kendi düzenlediği
                hizmetleri kapsadığı
              </li>
            </ul>
          </Section>

          <Section title="9. Uyuşmazlıklar">
            <p>
              İşbu Sözleşme&apos;nin ifasından doğacak uyuşmazlıklarda, Gümrük ve
              Ticaret Bakanlığı&apos;nca yıllık olarak ilan edilen değerlere kadar
              Tüketici Hakem Heyetleri, bu değerlerin üzerinde Tüketici
              Mahkemeleri yetkilidir. Alıcı, şikayet ve itirazlarını yerleşim
              yerinin bulunduğu veya tüketici işleminin yapıldığı yerdeki Tüketici
              Hakem Heyeti&apos;ne veya Tüketici Mahkemesi&apos;ne yapabilir.
            </p>
          </Section>

          <Section title="10. Yürürlük">
            <p>
              Alıcı, sipariş onayı sırasında işbu Sözleşmeyi okuyup kabul ettiğini
              elektronik ortamda onayladığında Sözleşme yürürlüğe girer.
              Sözleşmenin elektronik ortamda saklanan nüshası, Alıcı&apos;nın
              &quot;Hesabım&quot; bölümünden erişebileceği şekilde Klemens
              tarafından muhafaza edilir.
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
