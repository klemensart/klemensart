import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | Klemens",
  description:
    "Klemens platformunun kullanımına ilişkin koşullar ve kullanıcı yükümlülükleri.",
  alternates: { canonical: "/kullanim-kosullari" },
  openGraph: {
    title: "Kullanım Koşulları — Klemens",
    description:
      "Klemens platformunun kullanımına ilişkin koşullar ve kullanıcı yükümlülükleri.",
    url: "https://klemensart.com/kullanim-kosullari",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kullanım Koşulları — Klemens",
    description:
      "Klemens platformunun kullanımına ilişkin koşullar ve kullanıcı yükümlülükleri.",
  },
};

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
};

export default function KullanimKosullariPage() {
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
          Kullanım Koşulları
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
            İşbu Kullanım Koşulları, Klemens Art Prodüksiyon Limited Şirketi
            (&quot;Klemens&quot;) tarafından işletilen www.klemensart.com
            internet sitesi ve buna bağlı tüm dijital platformların
            (&quot;Platform&quot;) kullanımına ilişkin koşulları belirler.
            Platforma erişerek veya Platformdan herhangi bir hizmeti kullanarak,
            işbu koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan
            etmiş sayılırsınız.
          </p>

          <Section title="1. Tanımlar">
            <dl style={{ margin: "8px 0" }}>
              <Def term="Klemens">
                Klemens Art Prodüksiyon Limited Şirketi
              </Def>
              <Def term="Platform">
                www.klemensart.com adresi ve buna bağlı tüm dijital hizmetler
              </Def>
              <Def term="Kullanıcı">
                Platforma erişen ve Platformu kullanan gerçek veya tüzel kişi
              </Def>
              <Def term="Üye">
                Platforma üye kaydı yapan ve hesap oluşturan Kullanıcı
              </Def>
              <Def term="İçerik">
                Platform üzerinde yer alan tüm yazılı, görsel, işitsel ve
                dijital içerikler
              </Def>
              <Def term="Düzenleyici">
                Marketplace üzerinden atölye listeleyen üçüncü kişi/kuruluş
              </Def>
            </dl>
          </Section>

          <Section title="2. Platformun Kapsamı">
            <p>
              Klemens, kültür ve sanat alanında yayıncılık ve içerik üretimi
              yapan bir platformdur. Platform üzerinden sunulan hizmetler
              şunlardır:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>Editöryal içerikler (yazılar, dosyalar, e-bültenler)</li>
              <li>
                Klemens&apos;in kendi düzenlediği canlı atölye, seminer ve
                dijital içerik kütüphanesi (Loca)
              </li>
              <li>
                Üçüncü düzenleyicilere ait atölyelerin listelendiği keşif
                platformu (Marketplace)
              </li>
              <li>Kültür-sanat haritası, etkinlik takvimi</li>
              <li>İnteraktif testler ve oyunlar</li>
              <li>E-bülten (Tuz Bülteni)</li>
            </ul>
            <p>
              Klemens, Platform üzerinde sunulan hizmetlerin kapsamını,
              işleyişini ve özelliklerini önceden haber vermeksizin değiştirme,
              askıya alma veya sona erdirme hakkını saklı tutar.
            </p>
          </Section>

          <Section title="3. Üyelik">
            <p>
              <strong>3.1.</strong> Platformun bazı hizmetlerinden yararlanmak
              üyelik gerektirir. Üyelik, Kullanıcı&apos;nın e-posta adresi ve
              şifre belirleyerek veya Google OAuth gibi üçüncü taraf kimlik
              doğrulama yöntemleri kullanarak hesap oluşturmasıyla tamamlanır.
            </p>
            <p>
              <strong>3.2.</strong> Üye olabilmek için 18 yaşını doldurmuş olmak
              veya yasal velinin açık rızasıyla hareket ediyor olmak gereklidir.
            </p>
            <p>
              <strong>3.3.</strong> Üye, kayıt sırasında verdiği bilgilerin
              doğru, güncel ve eksiksiz olduğunu beyan eder. Yanlış veya
              yanıltıcı bilgi ile üyelik açılması durumunda Klemens, hesabı
              askıya alma veya kapatma hakkını saklı tutar.
            </p>
            <p>
              <strong>3.4.</strong> Üye, hesap güvenliğinden bizzat sorumludur.
              Şifrenin üçüncü kişilerce kullanımı sonucu doğacak zararlardan üye
              sorumludur.
            </p>
            <p>
              <strong>3.5.</strong> Üye, hesabını dilediği zaman{" "}
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
              adresine bildirimde bulunarak kapatabilir. Kapatma işlemi, satın
              alınmış ve hâlâ erişim süresi devam eden dijital içeriklere
              erişimi de sonlandırır.
            </p>
          </Section>

          <Section title="4. Kullanıcı Yükümlülükleri">
            <p>
              Kullanıcı, Platformu kullanırken aşağıdaki kurallara uymakla
              yükümlüdür:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                Platforma yalnızca yürürlükteki mevzuata, genel ahlaka ve işbu
                koşullara uygun şekilde erişmek
              </li>
              <li>
                Platformu, üçüncü kişilerin haklarını ihlal edecek veya zarar
                verecek şekilde kullanmamak
              </li>
              <li>Hesabını başkasıyla paylaşmamak veya devretmemek</li>
              <li>
                Klemens&apos;in açık yazılı izni olmaksızın Platform
                içeriklerini ticari amaçla çoğaltmamak, dağıtmamak veya yeniden
                yayımlamamak
              </li>
            </ul>
          </Section>

          <Section title="5. Yasak Kullanımlar">
            <p>
              Aşağıdaki davranışlar yasaktır ve tespit edildiklerinde Klemens,
              ihtarsız hesap askıya alma, içerik kaldırma veya yasal yollara
              başvurma hakkını saklı tutar:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                Otomatik araçlar, botlar veya scraper kullanarak Platform
                içeriklerini toplu olarak çekmek
              </li>
              <li>
                Platformun teknik altyapısına yetkisiz erişim girişiminde
                bulunmak (port tarama, açık testleri vb.)
              </li>
              <li>
                Sahte hesap oluşturmak veya başkasının kimliğini kullanmak
              </li>
              <li>
                Kötü niyetli yazılım (zararlı kod, virüs, casus yazılım)
                yüklemeye veya yaymaya çalışmak
              </li>
              <li>
                Diğer kullanıcıları taciz, tehdit veya rahatsız etmek
              </li>
              <li>
                Telif hakkı, marka veya diğer fikri mülkiyet haklarını ihlal
                eden içerik yüklemek veya paylaşmak
              </li>
              <li>
                Platformun normal işleyişini bozacak veya sunucu kaynaklarını
                aşırı tüketecek davranışlarda bulunmak
              </li>
            </ul>
          </Section>

          <Section title="6. Fikri Mülkiyet">
            <p>
              <strong>6.1.</strong> Platform üzerindeki tüm içerikler — yazılar,
              görseller, videolar, ses kayıtları, harita verileri, test soruları,
              marka, logo, tasarım ve yazılım dahil — Klemens&apos;e veya ilgili
              hak sahiplerine aittir ve Türkiye Cumhuriyeti telif hakkı mevzuatı
              ile uluslararası anlaşmalar kapsamında korunmaktadır.
            </p>
            <p>
              <strong>6.2.</strong> Kullanıcı, Platform içeriklerini yalnızca
              kişisel ve ticari olmayan amaçlarla görüntüleyebilir. Klemens&apos;in
              açık yazılı izni olmaksızın:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                İçeriklerin tamamı veya bir kısmının kopyalanması, çoğaltılması,
                dağıtılması, yeniden yayımlanması yasaktır
              </li>
              <li>
                İçeriklerin türev eserlerinin oluşturulması yasaktır
              </li>
              <li>
                &quot;Klemens&quot; markası, logosu ve görsel kimliğinin
                kullanılması yasaktır
              </li>
            </ul>
            <p>
              <strong>6.3.</strong> Sosyal medyada ve diğer mecralarda Platform
              içeriğine referans verilmesi (link paylaşımı, kısa alıntı ile
              kaynak gösterimi) bu yasakların kapsamı dışındadır ve teşvik
              edilir.
            </p>
          </Section>

          <Section title="7. Marketplace ve Yer Sağlayıcı Statüsü">
            <p>
              <strong>7.1.</strong> Klemens platformunda &quot;Düzenleyen&quot;
              alanında üçüncü bir kişi/kuruluş belirtilen atölye, seminer ve
              etkinlikler, ilgili Düzenleyici tarafından oluşturulmuş
              içeriklerdir.
            </p>
            <p>
              <strong>7.2.</strong> Bu atölyeler bakımından Klemens, 5651 sayılı
              İnternet Ortamında Yapılan Yayınların Düzenlenmesi Hakkında Kanun
              ve 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun
              anlamında &quot;yer sağlayıcı&quot; sıfatını taşır.
            </p>
            <p>
              <strong>7.3.</strong> Klemens, Düzenleyici tarafından sağlanan
              içeriği önceden denetlemekle yükümlü olmamakla birlikte, hukuka
              aykırı içerik bildirimi alması halinde gerekli incelemeyi yapar ve
              usulüne uygun bildirim üzerine içeriği yayından kaldırır.
            </p>
            <p>
              <strong>7.4.</strong> Marketplace üzerinden satın alınan
              atölyelerde ödeme, ifa, iptal, iade ve müşteri ilişkilerinden
              doğrudan ve münhasıran Düzenleyici sorumludur. Klemens hizmet
              bedelinin tahsilatına aracılık etmez. Ayrıntılı koşullar{" "}
              <Link
                href="/duzenleyici-kosullari"
                style={{
                  color: B.coral,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Düzenleyici Koşulları
              </Link>{" "}
              sayfasında açıklanmıştır.
            </p>
          </Section>

          <Section title="8. Üçüncü Taraf Hizmetler">
            <p>
              Platform, işleyişi sırasında aşağıdaki üçüncü taraf hizmet
              sağlayıcılarla entegre çalışmaktadır:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                <strong>PayTR Ödeme Hizmetleri A.Ş.</strong> — Ödeme altyapısı
              </li>
              <li>
                <strong>Bunny Stream</strong> — Video barındırma ve dağıtım
              </li>
              <li>
                <strong>Zoom Video Communications</strong> — Canlı atölye
                altyapısı
              </li>
              <li>
                <strong>Supabase</strong> — Veri tabanı ve kimlik doğrulama
              </li>
              <li>
                <strong>Vercel</strong> — Sunucu altyapısı
              </li>
              <li>
                <strong>Resend</strong> — E-bülten gönderim altyapısı
              </li>
              <li>
                <strong>Google</strong> — OAuth kimlik doğrulama (üye girişi
                tercihi kullanıldığında)
              </li>
            </ul>
            <p>
              Bu hizmetlerin kullanımı, ilgili sağlayıcıların kendi kullanım
              koşullarına ve gizlilik politikalarına tabidir. Klemens, üçüncü
              taraf hizmetlerin kesintilerinden veya hatalarından sorumlu
              tutulamaz.
            </p>
          </Section>

          <Section title="9. E-Bülten">
            <p>
              Üye veya ziyaretçi, dilediği zaman e-bülten (&quot;Tuz
              Bülteni&quot;) aboneliğine kaydolabilir veya aboneliğinden
              çıkabilir. Abonelikten çıkış, gönderilen her bültenin altında yer
              alan &quot;abonelikten çık&quot; bağlantısı veya{" "}
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
              adresine yapılacak bildirimle gerçekleştirilir.
            </p>
          </Section>

          <Section title="10. Hesap Askıya Alma ve Kapatma">
            <p>
              Klemens, aşağıdaki hallerde Üye&apos;nin hesabını ihtarlı veya
              ihtarsız olarak askıya alma veya kapatma hakkına sahiptir:
            </p>
            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
              <li>
                İşbu Kullanım Koşulları&apos;na aykırı davranış tespit edilmesi
              </li>
              <li>Yasak kullanım tespit edilmesi</li>
              <li>Üyelik bilgilerinde ciddi yanıltma tespit edilmesi</li>
              <li>Yasal makamlardan gelen talep üzerine</li>
            </ul>
            <p>
              Hesabı kapatılan Üye&apos;nin satın aldığı dijital içeriklere
              erişimi sona erer. Bu durum, ifa edilmiş hizmetler için iade hakkı
              doğurmaz.
            </p>
          </Section>

          <Section title="11. Sorumluluk Sınırlamaları">
            <p>
              <strong>11.1.</strong> Klemens, Platformun kesintisiz, hatasız ve
              güvenli çalışacağını garanti etmez. Sunucu kesintileri, üçüncü
              taraf hizmet sağlayıcı sorunları, doğal afetler, siber saldırılar
              ve benzeri mücbir sebep hallerinde Klemens&apos;in sorumluluğu
              doğmaz.
            </p>
            <p>
              <strong>11.2.</strong> Platform içeriklerinde yer alan bilgilerin
              doğruluğu ve güncelliği için makul özen gösterilir. Ancak Klemens,
              içeriklerin her kullanıcının özel durumuna uygunluğunu garanti
              etmez. Eğitsel, kültürel veya sanatsal bilgi niteliğindeki
              içerikler hukuki, tıbbi veya finansal danışmanlık olarak
              yorumlanamaz.
            </p>
            <p>
              <strong>11.3.</strong> Marketplace üzerinden gerçekleştirilen
              işlemlerde Klemens&apos;in sorumluluğu, madde 7&apos;de belirtilen
              yer sağlayıcı statüsüyle sınırlıdır.
            </p>
          </Section>

          <Section title="12. Koşullarda Değişiklik">
            <p>
              Klemens, işbu Kullanım Koşulları&apos;nı dilediği zaman değiştirme
              hakkına sahiptir. Önemli değişiklikler, Platform üzerinde
              duyurulur ve değişikliğin yürürlük tarihi belirtilir. Değişiklik
              tarihinden sonra Platformun kullanımı, güncel koşulların kabulü
              anlamına gelir.
            </p>
          </Section>

          <Section title="13. Uyuşmazlık Çözümü">
            <p>
              İşbu Kullanım Koşulları Türkiye Cumhuriyeti hukukuna tabidir.
              Doğacak uyuşmazlıkların çözümünde Ankara Mahkemeleri ve İcra
              Daireleri yetkilidir. Tüketici işlemleri bakımından, ilgili
              Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri&apos;nin yetkisi
              saklıdır.
            </p>
          </Section>

          <Section title="14. İletişim">
            <p>
              Kullanım Koşulları ile ilgili sorularınız ve bildirimleriniz için:
            </p>
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

function Def({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt style={{ fontWeight: 700, color: "#2D2926", marginTop: 8 }}>
        {term}
      </dt>
      <dd style={{ margin: "2px 0 0 0", paddingLeft: 0 }}>{children}</dd>
    </>
  );
}
