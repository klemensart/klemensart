import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Düzenleyici Koşulları | Klemens",
  description:
    "Klemens marketplace'inde atölye listelemek isteyen düzenleyiciler için koşullar.",
  keywords: ["düzenleyici koşulları", "atölye listeleme", "klemens eğitmen sözleşme"],
  alternates: { canonical: "/duzenleyici-kosullari" },
  openGraph: {
    title: "Düzenleyici Koşulları — Klemens",
    description:
      "Klemens marketplace'inde atölye listelemek isteyen düzenleyiciler için koşullar.",
    url: "https://klemensart.com/duzenleyici-kosullari",
  },
  twitter: {
    card: "summary_large_image",
    title: "Düzenleyici Koşulları — Klemens",
    description:
      "Klemens marketplace'inde atölye listelemek isteyen düzenleyiciler için koşullar.",
  },
};

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
};

export default function DuzenleyiciKosullariPage() {
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
          Düzenleyici Koşulları
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
          <p style={{ marginBottom: 16 }}>
            İşbu Düzenleyici Koşulları (&quot;Sözleşme&quot;),
            www.klemensart.com platformunda (&quot;Platform&quot;) atölye,
            seminer veya etkinlik listelemek isteyen üçüncü kişi/kuruluşlar
            (&quot;Düzenleyici&quot;) ile Klemens Art Prodüksiyon Limited
            Şirketi (&quot;Klemens&quot;) arasındaki ilişkinin koşullarını
            belirler.
          </p>
          <p style={{ marginBottom: 32 }}>
            Düzenleyici, başvuru sırasında işbu Sözleşmeyi okuduğunu,
            anladığını ve kabul ettiğini elektronik ortamda onaylar.
          </p>

          <Section title="1. Platformun Kapsamı ve Klemens'in Rolü">
            <p>
              <strong>1.1.</strong> Klemens, Düzenleyici&apos;lere ait atölye,
              seminer ve etkinliklerin listelenmesine ve duyurulmasına olanak
              tanıyan bir keşif platformudur. Klemens; bu listelemelerin
              organizatörü, satıcısı, aracı satıcısı veya tahsilat aracısı
              değildir.
            </p>
            <p>
              <strong>1.2.</strong> Klemens, 5651 sayılı İnternet Ortamında
              Yapılan Yayınların Düzenlenmesi Hakkında Kanun ile 6563 sayılı
              Elektronik Ticaretin Düzenlenmesi Hakkında Kanun çerçevesinde
              &quot;yer sağlayıcı&quot; sıfatını taşır.
            </p>
            <p>
              <strong>1.3.</strong> Düzenleyici, Platform üzerindeki
              listelemesinin tüm içeriğinden, doğruluğundan ve hukuka
              uygunluğundan münhasıran sorumludur.
            </p>
          </Section>

          <Section title="2. Düzenleyici Olma Koşulları">
            <p>
              <strong>2.1.</strong> Düzenleyici olabilmek için aşağıdaki
              koşulların sağlanması gerekir:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                <strong>Gerçek kişiler için:</strong> 18 yaşını doldurmuş olmak
                ve fiil ehliyetine sahip olmak
              </li>
              <li>
                <strong>Tüzel kişiler için:</strong> Türkiye&apos;de veya ilgili
                ülkede usulüne uygun olarak kurulmuş olmak ve sözleşme yapma
                yetkisine sahip bir temsilci ile başvurmak
              </li>
              <li>
                <strong>Faaliyet alanı:</strong> Sunulacak atölye/etkinlik
                konusunda yetkinlik veya deneyim sahibi olmak
              </li>
            </ul>
            <p>
              <strong>2.2.</strong> Aşağıdaki konularda Klemens, başvuruyu
              gerekçe göstermek zorunda olmaksızın reddedebilir:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                Klemens&apos;in editöryal duruşu, hedef kitlesi veya marka
                konumlandırmasıyla uyumsuz içerikler
              </li>
              <li>
                Yetkinlik, deneyim veya referans bakımından yetersiz görülen
                başvurular
              </li>
              <li>
                Hukuka, kamu düzenine, genel ahlaka aykırı olabilecek içerikler
              </li>
            </ul>
            <p>
              <strong>2.3.</strong> Klemens, küratörlü bir platform olup tüm
              başvuruları kabul etmek zorunluluğu yoktur.
            </p>
          </Section>

          <Section title="3. Başvuru ve Onay Süreci">
            <p>
              <strong>3.1.</strong> Düzenleyici, Platform üzerindeki başvuru
              formunu doldurarak başvuruda bulunur. Başvuruda en az şu bilgilerin
              verilmesi gerekir:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>Ad/Soyad/Unvan</li>
              <li>İletişim bilgileri (e-posta, telefon)</li>
              <li>Atölye/etkinlik konusu, içeriği ve süresi</li>
              <li>Hedef katılımcı profili</li>
              <li>Ücret bilgisi</li>
              <li>
                Düzenleyici&apos;nin daha önce yaptığı çalışmalar veya
                referansları
              </li>
              <li>
                Müşteri iletişim yöntemi (WhatsApp, e-posta, kendi internet
                sitesi vb.)
              </li>
            </ul>
            <p>
              <strong>3.2.</strong> Klemens, başvuruyu 15 iş günü içinde
              değerlendirir ve sonucu Düzenleyici&apos;ye e-posta yoluyla
              bildirir.
            </p>
            <p>
              <strong>3.3.</strong> Onaylanan başvurularda Düzenleyici&apos;nin
              profil sayfası ve atölye/etkinlik sayfası Platform üzerinde yayına
              alınır.
            </p>
          </Section>

          <Section title="4. Listeleme ve İçerik Kuralları">
            <p>
              <strong>4.1.</strong> Düzenleyici, listeleme içeriğinin (görsel,
              metin, fiyat, program vb.) doğru, güncel ve eksiksiz olmasından
              sorumludur.
            </p>
            <p>
              <strong>4.2.</strong> Düzenleyici, listeleme içeriğinde aşağıdakilere
              uyacağını taahhüt eder:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                Üçüncü kişilerin telif, marka veya kişilik haklarını ihlal eden
                görsel veya metin kullanmamak
              </li>
              <li>
                Yanıltıcı, abartılı veya gerçeği yansıtmayan ifadeler
                kullanmamak
              </li>
              <li>
                Klemens&apos;in marka kimliği, logosu veya görsel diline
                benzeyen unsurlar kullanmamak
              </li>
              <li>
                Politik propaganda, ayrımcı söylem, nefret söylemi veya diğer
                hukuka aykırı içerikler yer vermemek
              </li>
              <li>
                Türk Tüketici Hukuku başta olmak üzere yürürlükteki tüm
                mevzuata uygun davranmak
              </li>
            </ul>
            <p>
              <strong>4.3.</strong> Klemens, içerik üzerinde editöryal düzenleme
              yapma ve gerekli gördüğünde içeriği önceden bildirim yapmaksızın
              yayından kaldırma hakkına sahiptir.
            </p>
          </Section>

          <Section title="5. Ödeme ve Tahsilat">
            <p>
              <strong>5.1.</strong> Klemens, Düzenleyici&apos;nin
              atölye/etkinlik bedellerinin tahsilatına aracılık etmez ve
              aracılık etmeyecektir. Müşterinin yapacağı ödeme, tamamen
              Düzenleyici ile müşteri arasında, Düzenleyici&apos;nin belirlediği
              yöntemle gerçekleştirilir.
            </p>
            <p>
              <strong>5.2.</strong> Platform üzerindeki &quot;Atölyeye
              Katıl&quot; veya benzeri butonlar, müşteriyi
              Düzenleyici&apos;nin tercih ettiği iletişim/ödeme kanalına
              (WhatsApp, e-posta, kendi internet sitesi vb.) yönlendirir.
            </p>
            <p>
              <strong>5.3.</strong> Klemens; müşterinin Düzenleyici&apos;ye
              ödeme yapmamasından, Düzenleyici&apos;nin müşteriye iade
              yapmamasından, ödeme uyuşmazlıklarından veya benzer ihtilaflardan
              hiçbir surette sorumlu tutulamaz.
            </p>
          </Section>

          <Section title="6. Kullanıcı (Müşteri) ile İlişki">
            <p>
              <strong>6.1.</strong> Müşteri ile Düzenleyici arasındaki tüm
              hukuki ilişki (satış sözleşmesi, ifa, iptal, iade, şikayet)
              doğrudan ve münhasıran Düzenleyici&apos;nin
              sorumluluğundadır.
            </p>
            <p>
              <strong>6.2.</strong> Düzenleyici, müşteriye sunduğu hizmette
              aşağıdaki asgari standartları sağlamayı taahhüt eder:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                Atölye/etkinliğin ilanda belirtilen tarih, saat, içerik ve süre
                ile gerçekleştirilmesi
              </li>
              <li>
                Mücbir sebep dışındaki iptallerde müşteriye bedel iadesi
                yapılması
              </li>
              <li>
                Müşteri şikayet ve sorularına makul sürede dönüş sağlanması
              </li>
            </ul>
            <p>
              <strong>6.3.</strong> Klemens&apos;e ulaşan müşteri
              şikayetlerinde Klemens, şikayeti Düzenleyici&apos;ye iletmekle
              yetinir; çözüm sürecinde taraf olmaz.
            </p>
            <p>
              <strong>6.4.</strong> Klemens, tekrarlayan ve ciddi müşteri
              şikayetleri durumunda Düzenleyici&apos;nin profil ve
              listelemelerini Platform&apos;dan kaldırma hakkını saklı tutar.
            </p>
          </Section>

          <Section title="7. Marka ve İsim Kullanımı">
            <p>
              <strong>7.1.</strong> Düzenleyici, kendi tanıtım materyallerinde
              &quot;Klemens&apos;te listelenmektedir&quot; veya benzeri ifadeler
              kullanabilir. Ancak:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                Klemens&apos;in iş ortağı, sponsor veya partner&apos;i olduğu
                izlenimi verecek ifadeler kullanamaz
              </li>
              <li>
                Klemens&apos;in logosunu, görsel kimliğini veya marka unsurlarını
                Klemens&apos;in açık yazılı izni olmaksızın kendi materyallerinde
                kullanamaz
              </li>
              <li>
                Klemens adına işlem yapma, fatura kesme, sözleşme imzalama veya
                temsil yetkisi yoktur
              </li>
            </ul>
            <p>
              <strong>7.2.</strong> Klemens, Düzenleyici&apos;nin Platform
              üzerinde sunduğu profil bilgisi, görsel ve içerik metinlerini,
              Düzenleyici&apos;nin listelemesini tanıtmak amacıyla
              Platform&apos;da, sosyal medya hesaplarında ve e-bültenlerde
              kullanma hakkına sahiptir.
            </p>
          </Section>

          <Section title="8. Sorumluluk Sınırlaması">
            <p>
              <strong>8.1.</strong> Klemens&apos;in sorumluluğu, yer sağlayıcı
              statüsü ile sınırlıdır. Klemens; Düzenleyici&apos;nin sözleşmeye
              aykırı davranışlarından, taahhütlerini yerine getirmemesinden veya
              müşterilerle yaşadığı uyuşmazlıklardan sorumlu tutulamaz.
            </p>
            <p>
              <strong>8.2.</strong> Düzenleyici, Klemens&apos;in işbu
              Sözleşme&apos;den doğan yükümlülüklerini yerine getirmesini
              engelleyen veya Klemens&apos;in itibarını zedeleyen davranışlarda
              bulunması halinde, doğacak zararlardan sorumludur.
            </p>
            <p>
              <strong>8.3.</strong> Düzenleyici, listeleme içeriği nedeniyle
              üçüncü kişilerden veya yetkili makamlardan Klemens&apos;e gelecek
              tüm talep, şikayet ve davalarda Klemens&apos;i tüm zarar, masraf
              ve yargılama giderlerinden ari tutmayı taahhüt eder.
            </p>
          </Section>

          <Section title="9. Ücretlendirme">
            <p>
              <strong>9.1.</strong> İşbu Sözleşme&apos;nin yürürlüğe girdiği
              tarih itibarıyla Düzenleyici&apos;lerden listeleme veya komisyon
              ücreti alınmamaktadır.
            </p>
            <p>
              <strong>9.2.</strong> Klemens, ileride listeleme ücreti, komisyon
              veya benzeri bir ücretlendirme modeli getirme hakkını saklı tutar.
              Yeni bir ücretlendirme modeli, en az 30 gün öncesinden
              Düzenleyici&apos;ye e-posta yoluyla duyurulur ve yalnızca
              Düzenleyici&apos;nin onay vermesi halinde Düzenleyici&apos;ye
              uygulanır.
            </p>
            <p>
              <strong>9.3.</strong> Düzenleyici, yeni ücretlendirme modelini
              kabul etmediği takdirde, mevcut listelemelerini Platform&apos;dan
              kaldırarak Sözleşme&apos;yi sonlandırabilir.
            </p>
          </Section>

          <Section title="10. Süre ve Sona Erme">
            <p>
              <strong>10.1.</strong> İşbu Sözleşme, Düzenleyici&apos;nin
              başvurusunun onaylandığı tarihte yürürlüğe girer ve belirsiz
              süreli olarak devam eder.
            </p>
            <p>
              <strong>10.2.</strong> Taraflardan her biri, 30 gün önceden yazılı
              bildirim yapmak suretiyle Sözleşme&apos;yi feshedebilir. Fesih
              bildirimi e-posta ile yapılabilir.
            </p>
            <p>
              <strong>10.3.</strong> Klemens, Düzenleyici&apos;nin işbu
              Sözleşme&apos;ye veya Platform Kullanım Koşullarına aykırı
              davranması halinde Sözleşme&apos;yi ihtarsız ve tazminatsız
              feshedebilir. Bu durumda Düzenleyici&apos;nin profili ve
              listelemeleri Platform&apos;dan derhal kaldırılır.
            </p>
            <p>
              <strong>10.4.</strong> Sözleşme&apos;nin sona ermesi, sona erme
              tarihinden önce müşterilerle kurulmuş olan ilişkilerden doğan
              yükümlülükleri sona erdirmez. Düzenleyici, bu yükümlülükleri
              yerine getirmekle sorumludur.
            </p>
          </Section>

          <Section title="11. Kişisel Verilerin İşlenmesi">
            <p>
              Düzenleyici&apos;nin başvuru sırasında ve Sözleşme&apos;nin ifası
              boyunca verdiği kişisel veriler,{" "}
              <Link
                href="/kvkk-duzenleyici"
                style={{
                  color: B.coral,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Düzenleyici Aydınlatma Metni
              </Link>{" "}
              kapsamında işlenir. Düzenleyici, başvuru anında bu aydınlatma
              metnini okuduğunu ve anladığını beyan eder.
            </p>
          </Section>

          <Section title="12. Sözleşme Değişikliği">
            <p>
              Klemens, işbu Sözleşme&apos;yi tek taraflı olarak değiştirme
              hakkına sahiptir. Önemli değişiklikler en az 15 gün öncesinden
              Düzenleyici&apos;ye e-posta yoluyla bildirilir. Düzenleyici,
              değişiklikleri kabul etmediği takdirde madde 10.2 uyarınca
              Sözleşme&apos;yi feshedebilir.
            </p>
          </Section>

          <Section title="13. Uyuşmazlıklar">
            <p>
              İşbu Sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Doğacak
              uyuşmazlıkların çözümünde Ankara Mahkemeleri ve İcra Daireleri
              yetkilidir.
            </p>
          </Section>

          <Section title="14. İletişim">
            <p>
              <strong>Klemens Art Prodüksiyon Limited Şirketi</strong>
              <br />
              Tınaztepe Mah. Başçavuş Sk. No: 55/6, Çankaya / Ankara
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
