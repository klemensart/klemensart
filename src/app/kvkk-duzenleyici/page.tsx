import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Düzenleyici Aydınlatma Metni | Klemens",
  description:
    "Klemens platformunda düzenleyici olarak yer alan kişi ve kuruluşların kişisel verilerinin işlenmesine ilişkin aydınlatma.",
  keywords: ["düzenleyici kvkk", "eğitmen kişisel veri", "klemens düzenleyici gizlilik"],
  alternates: { canonical: "/kvkk-duzenleyici" },
  openGraph: {
    title: "Düzenleyici Aydınlatma Metni — Klemens",
    description:
      "Klemens platformunda düzenleyici olarak yer alan kişi ve kuruluşların kişisel verilerinin işlenmesine ilişkin aydınlatma.",
    url: "https://klemensart.com/kvkk-duzenleyici",
  },
  twitter: {
    card: "summary_large_image",
    title: "Düzenleyici Aydınlatma Metni — Klemens",
    description:
      "Klemens platformunda düzenleyici olarak yer alan kişi ve kuruluşların kişisel verilerinin işlenmesine ilişkin aydınlatma.",
  },
};

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
};

export default function KvkkDuzenleyiciPage() {
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
          Düzenleyici Aydınlatma Metni
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
          <p style={{ marginBottom: 32 }}>
            İşbu Aydınlatma Metni, www.klemensart.com platformunda
            (&quot;Platform&quot;) atölye, seminer veya etkinlik listelemek
            üzere başvuruda bulunan veya hâlihazırda listeleme yapan
            kişi/kuruluşların (&quot;Düzenleyici&quot;) kişisel verilerinin
            işlenmesine ilişkin olarak, 6698 sayılı Kişisel Verilerin Korunması
            Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla
            aydınlatılmasını amaçlamaktadır.
          </p>

          <Section title="1. Veri Sorumlusu">
            <p>
              <strong>Unvan:</strong> Klemens Art Prodüksiyon Limited Şirketi
              <br />
              <strong>MERSİS No:</strong> 0564137179400001
              <br />
              <strong>Adres:</strong> Tınaztepe Mah. Başçavuş Sk. No: 55/6,
              Çankaya / Ankara
              <br />
              <strong>E-posta:</strong>{" "}
              <a
                href="mailto:info@klemensart.com"
                style={{
                  color: B.coral,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                info@klemensart.com
              </a>
              <br />
              <strong>Telefon:</strong> 0532 764 53 10
            </p>
            <p>(Bundan sonra &quot;Klemens&quot; olarak anılacaktır.)</p>
          </Section>

          <Section title="2. Kapsam">
            <p>
              İşbu Aydınlatma Metni, gerçek kişi Düzenleyiciler ile tüzel kişi
              Düzenleyici&apos;leri temsilen başvuran/işlem yapan gerçek kişiler
              için geçerlidir. Tüzel kişilere ait ticari bilgiler, KVKK
              kapsamında &quot;kişisel veri&quot; olarak değerlendirilmez; ancak
              söz konusu tüzel kişiyi temsil eden gerçek kişilerin ad, iletişim
              ve benzer verileri kişisel veri olarak işlenir.
            </p>
          </Section>

          <Section title="3. İşlenen Kişisel Veriler">
            <p>
              Klemens, Düzenleyici&apos;lerden aşağıdaki kişisel verileri toplar
              ve işler:
            </p>

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.dark,
                margin: "16px 0 8px",
              }}
            >
              3.1. Kimlik Bilgileri
            </h3>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>Ad, Soyad</li>
              <li>Tüzel kişi temsilcisinin unvanı</li>
            </ul>

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.dark,
                margin: "16px 0 8px",
              }}
            >
              3.2. İletişim Bilgileri
            </h3>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>E-posta adresi</li>
              <li>Telefon numarası (sabit ve/veya cep)</li>
              <li>Posta adresi (gerektiğinde)</li>
              <li>
                Müşteri yönlendirme amacıyla beyan edilen iletişim kanalı
                (WhatsApp numarası, internet sitesi adresi, e-posta vb.)
              </li>
            </ul>

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.dark,
                margin: "16px 0 8px",
              }}
            >
              3.3. Mesleki Bilgiler
            </h3>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>Atölye/etkinlik konusu, içeriği, süresi</li>
              <li>Daha önce yapılan çalışmalar, referanslar</li>
              <li>Profesyonel deneyim ve yetkinlik bilgisi</li>
              <li>Sosyal medya hesapları, internet sitesi (varsa)</li>
            </ul>

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.dark,
                margin: "16px 0 8px",
              }}
            >
              3.4. Ticari/Mali Bilgiler
            </h3>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                Tüzel kişiler için ticaret unvanı, MERSİS no, vergi dairesi/no
              </li>
              <li>Atölye/etkinlik için belirlediği ücret bilgisi</li>
            </ul>

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
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Önemli</p>
              <p>
                Klemens, Düzenleyici&apos;lerin tahsilatına aracılık
                etmediğinden banka hesap bilgisi, IBAN, kart bilgisi gibi
                finansal verileri toplamaz.
              </p>
            </div>

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.dark,
                margin: "16px 0 8px",
              }}
            >
              3.5. Otomatik Toplanan Veriler
            </h3>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>IP adresi</li>
              <li>Tarayıcı ve cihaz bilgisi</li>
              <li>
                Platform üzerinde gerçekleştirilen işlemlere ait kayıtlar
                (giriş, oturum, listeleme güncellemeleri)
              </li>
            </ul>
          </Section>

          <Section title="4. Kişisel Veri İşleme Amaçları">
            <p>
              Yukarıda belirtilen kişisel veriler aşağıdaki amaçlarla işlenir:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                Düzenleyici başvurusunun değerlendirilmesi ve onay/red kararının
                verilmesi
              </li>
              <li>
                Düzenleyici profilinin ve atölye/etkinlik listelemelerinin
                Platform&apos;da yayınlanması
              </li>
              <li>
                Düzenleyici&apos;nin tanıtımı amacıyla bilgilerin Platform,
                sosyal medya hesapları ve e-bültende kullanılması
              </li>
              <li>
                Düzenleyici ile sözleşmesel ilişkinin yürütülmesi
              </li>
              <li>
                Müşterilerin Düzenleyici&apos;ye yönlendirilmesi (iletişim
                kanalları aracılığıyla)
              </li>
              <li>
                Müşteri şikayetlerinin Düzenleyici&apos;ye iletilmesi
              </li>
              <li>
                Hukuki yükümlülüklerin yerine getirilmesi (vergi, ticari kayıt,
                resmi makamlardan gelen talepler)
              </li>
              <li>
                Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi
              </li>
            </ul>
          </Section>

          <Section title="5. Hukuki Sebepler">
            <p>
              Kişisel verileriniz, KVKK madde 5/2 kapsamındaki aşağıdaki hukuki
              sebeplere dayanılarak işlenir:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                <strong>
                  Sözleşmenin kurulması ve ifası için zorunlu olması
                </strong>{" "}
                (Düzenleyici Koşulları ile akdedilen sözleşme)
              </li>
              <li>
                <strong>Hukuki yükümlülüğün yerine getirilmesi</strong> (vergi
                mevzuatı, 6563 sayılı Kanun, KVKK)
              </li>
              <li>
                <strong>Veri sorumlusunun meşru menfaati</strong> (Platform
                güvenliği, kötüye kullanımın önlenmesi)
              </li>
            </ul>
            <p>
              Bunların dışında kalan ve açık rıza gerektiren işlemeler (örneğin
              tanıtım amaçlı bilgilerin Klemens dışı ortamlarda kullanımı) için
              Düzenleyici&apos;den ayrıca açık rıza alınır.
            </p>
          </Section>

          <Section title="6. Veri Aktarımı">
            <p>
              Kişisel verileriniz, hizmetin yürütülmesi için zorunlu olan
              aşağıdaki üçüncü taraflara aktarılabilir:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                <strong>Supabase (veritabanı sağlayıcısı)</strong> — AB /
                Frankfurt bölgesinde sunucu
              </li>
              <li>
                <strong>Vercel (sunucu altyapısı)</strong> — Küresel CDN
              </li>
              <li>
                <strong>Resend (e-posta gönderim altyapısı)</strong> — Aday
                başvuru sonucu ve duyuru e-postaları için
              </li>
              <li>
                <strong>Yetkili kamu kurum ve kuruluşları</strong> — kanunen
                zorunlu hallerde
              </li>
            </ul>
            <p>
              Düzenleyici&apos;nin Platform üzerinde kamuya açık profil ve
              listeleme bilgileri (ad/unvan, atölye içeriği, görsel, iletişim
              bağlantıları) Platform ziyaretçileri tarafından görüntülenebilir;
              bu durum Düzenleyici&apos;nin başvuru anında kabul ettiği bir
              sözleşmesel sonuçtur ve ayrı bir aktarım olarak
              değerlendirilmez.
            </p>
            <p>
              Klemens, kişisel verileri yurt dışına aktarımda KVKK madde 9
              hükümlerine ve Kişisel Verileri Koruma Kurulu&apos;nun ilgili
              kararlarına uygun davranır.
            </p>
          </Section>

          <Section title="7. Saklama Süreleri">
            <div style={{ overflowX: "auto", margin: "12px 0" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderBottom: "2px solid #e8e0d8",
                        fontWeight: 700,
                        color: B.dark,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Veri Türü
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderBottom: "2px solid #e8e0d8",
                        fontWeight: 700,
                        color: B.dark,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Saklama Süresi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <TableRow
                    label="Düzenleyici sözleşmesi süresince işlenen veriler"
                    value="Sözleşme süresince"
                  />
                  <TableRow
                    label="Sözleşme sonrası ticari ve hukuki kayıtlar"
                    value="Sözleşme sonu + 10 yıl (TTK md. 82)"
                  />
                  <TableRow
                    label="Vergi mevzuatı kapsamındaki kayıtlar"
                    value="5 yıl (VUK)"
                  />
                  <TableRow
                    label="Reddedilen başvurular"
                    value="1 yıl"
                  />
                  <TableRow
                    label="Otomatik kayıtlar (log)"
                    value="6 ay"
                  />
                </tbody>
              </table>
            </div>
            <p>
              Saklama süresi sona eren veriler, KVKK madde 7 ve Kişisel
              Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi
              Hakkında Yönetmelik uyarınca silinir, yok edilir veya anonim hale
              getirilir.
            </p>
          </Section>

          <Section title="8. Veri Sahibinin Hakları">
            <p>
              KVKK madde 11 uyarınca Düzenleyici, Klemens&apos;e başvurarak şu
              haklarını kullanabilir:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                Kişisel verilerinin işlenip işlenmediğini öğrenme
              </li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>
                Kişisel verilerinin işlenme amacını ve amacına uygun kullanılıp
                kullanılmadığını öğrenme
              </li>
              <li>
                Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
              </li>
              <li>
                Eksik veya yanlış işlenmişse düzeltilmesini isteme
              </li>
              <li>
                KVKK madde 7&apos;de öngörülen şartlar çerçevesinde silinmesini
                veya yok edilmesini isteme
              </li>
              <li>
                Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı
                üçüncü kişilere bildirilmesini isteme
              </li>
              <li>
                İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla
                analiz edilmesi suretiyle aleyhine bir sonuç çıkmasına itiraz
                etme
              </li>
              <li>
                Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle
                zarara uğraması halinde zararın giderilmesini talep etme
              </li>
            </ul>
          </Section>

          <Section title="9. Başvuru Yöntemi">
            <p>
              Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki
              yöntemlerle Klemens&apos;e başvuruda bulunabilirsiniz:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                <strong>E-posta:</strong>{" "}
                <a
                  href="mailto:info@klemensart.com"
                  style={{
                    color: B.coral,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  info@klemensart.com
                </a>{" "}
                adresine, kayıtlı e-posta adresinizden talebinizi iletmek
              </li>
              <li>
                <strong>Posta:</strong> Tınaztepe Mah. Başçavuş Sk. No: 55/6,
                Çankaya / Ankara adresine yazılı başvuru göndermek
              </li>
            </ul>
            <p>
              Başvurunuzda; ad-soyadınızı, talebinizin konusunu ve dayanağını
              açıkça belirtmeniz gerekir. Klemens, talebinizi en geç 30 gün
              içinde ücretsiz olarak sonuçlandırır. İşlemin ayrıca bir maliyet
              gerektirmesi halinde, Kişisel Verileri Koruma Kurulu tarafından
              belirlenen tarifedeki ücret talep edilebilir.
            </p>
          </Section>

          <Section title="10. Değişiklikler">
            <p>
              Klemens, işbu Aydınlatma Metnini gerektiğinde güncelleyebilir.
              Önemli değişiklikler, kayıtlı e-posta adresinize bildirilir ve
              Platform üzerinde duyurulur.
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

function TableRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid #f0ebe6",
          verticalAlign: "top",
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid #f0ebe6",
          fontWeight: 600,
          color: "#2D2926",
          whiteSpace: "nowrap",
          verticalAlign: "top",
        }}
      >
        {value}
      </td>
    </tr>
  );
}
