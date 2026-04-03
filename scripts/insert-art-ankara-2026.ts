import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const content = `Art Ankara 2026, kapılarını bir sanat fuarı iddiasıyla açmış olsa da, içeri adım atar atmaz bizi karşılayan manzara, küratöryel bir zekanın ürünü olmaktan ziyade, estetik bir enkazın disiplinsiz istifçiliğinden ibaret. Bir sanat yönetimi ve sanat tarihi disiplininden gelen gözler için bu fuar, profesyonel bir sergileme pratiği sunmak yerine, sanatı dekoratif bir metaya indirgeyen devasa bir high-class panayır simülasyonuna dönüşmüş durumda.

Galerilerin sergileme alanlarındaki o boğucu yerleşim, izleyicide entelektüel bir tefekkür uyandırmak şöyle dursun, daha beşinci dakikada akut müze yorgunluğu yaratarak algıyı felç ediyor. Duvarlardaki soyut tabloların hemen dibine, hiçbir kavramsal bağlam gözetilmeksizin fırlatılmış heykeller, eserlerin kendi aurasını solumasını engelliyor. Burada boşluk kavramı, sanatın nefes aldığı o hayati alan değil, galericinin "buraya bir eser daha sığdırıp nakde çeviremez miyim?" korkusuyla doldurduğu ticari bir kayıp alanı olarak okunuyor.

Fuarın koridorlarında yürürken kulaklara çalınan "adamın aynısını çizmiş Sibel, inanılmaz bir yetenek!" nidaları ise sanat tarihimizin trajikomik bir özeti niteliğinde. Sanatın bir düşünce üretme, bir dünya kurma biçimi olmaktan çıkıp, sadece teknik bir taklit becerisine indirgenerek alkışlandığı bu ortam, profesyonel sanat dünyasını bir hobi ressamları cemiyeti seviyesine çekiyor. 21. yüzyılın çeyreğini bitirmek üzereyken, sanatın kalitesini hala "gerçeğe yakınlık" üzerinden ölçen bu muhafazakar beğeni eşiği, fuarı uluslararası bir platform olmaktan çıkarıp yerel bir el emeği pazarına hapsediyor.

Bu sığ beğeni katmanının hemen yanında ise interaktif sanat adı altında sunulan kazı-kazan estetiği boy gösteriyor. İzleyiciye bir alet verip, altından çıkan "cesaret" gibi bir kelime üzerinden "peki bu size ne hissettirdi?" diye sormak, katılımcı sanatı bir kişisel gelişim semineri sığlığına, koca fuarı ise bir AVM'nin çocuk oyalama alanına indirgemektir. Eğer bir eser, kendi ontolojik varlığıyla bir duygu geçiremiyorsa ve sanatçının rehberli yorumuna muhtaçsa, orada sanattan değil, ancak kötü bir deneyim tasarımından söz edilebilir.

Özgünlük meselesine gelince, karşımıza çıkan KAWS replikaları, sanattaki kendine mâl etme kavramının nasıl yanlış anlaşılabileceğinin ders niteliğinde bir örneği. KAWS'ın tüm görsel kodlarını, o tescilli çarpı gözlerini alıp üzerine "Be Happy" veya "Never Give Up" gibi ucuz sloganlar ekleyerek "yeni bir iş" ürettiğini sanmak, sanat üretimi değil, popüler olanın pazar değerini sömürmektir. Bu eserlerin fuarın en kalabalık köşelerini oluşturması, Art Ankara'nın entelektüel derinlikten ziyade instagramlık anlar yaratma peşinde koştuğunun en somut kanıtı.

Tüm bu kaosu daha da vahim kılan ise fuarın fiziksel mimarisinin sunduğu o keskin sınıfsal hiyerarşi. Giriş katındaki kontrolsüz gürültü ve panayır havasının aksine, üst katlardaki VIP izolasyonlu, piyasa yapıcı dev galerilerin steril kaleleri, sanatın demokratikleştiği iddiasının kocaman bir yalan olduğunu yüzümüze çarpıyor. Alt katlarda "sanat herkes içindir" illüzyonuyla halk oyalanırken, üst katlarda sermayenin gerçek sahipleri kendi kast sistemlerini estetize etmeye devam ediyor. Sonuç olarak Art Ankara, sanatın bir özne değil, sadece sosyalleşme performansı için şık bir arka plan süsü olarak kullanıldığı, insanların başka bir yerde bir araya gelemediği için sığındığı devasa bir fiziksel network organizasyonundan öteye gidemiyor.

Tüm bu tablo karşısındaki asıl konu ise tecrübenin getirdiği hayal kırıklığı. Karşımızdaki organizasyon, acemi bir deneme değil; bu yıl 12. edisyonunu gerçekleştiren, yani rüştünü çoktan ispatlamış olması gereken bir yapı. 12 yıl, bir fuarın karakterini oturtması, seçiciliğini keskinleştirmesi ve kentin sanat vizyonuna yön vermesi için fazlasıyla yeterli bir süre. Ancak görüyoruz ki Art Ankara, geçen onca yıla rağmen fuar olmanın akademik ve küratöryel gerekliliklerini yerine getirmek yerine, aynı karmaşayı büyüterek sürdürmeyi tercih etmiş.

Eğer 12. yılında bir organizasyon hala "pazar yeri" ile "sanat fuarı" arasındaki o kalın çizgiyi ayırt edemiyorsa, ya ismindeki o iddialı "fuar" sıfatından vazgeçmeli ya da gerçekten bir fuar yapmaya başlamalıdır. Zira bu haliyle Art Ankara, sanatın dönüştürücü gücünü değil, piyasanın yozlaştırıcı etkisini kutlayan devasa bir network organizasyonundan öteye gidemiyor.`;

async function main() {
  const row = {
    slug: "art-ankara-2026-estetik-enkaz",
    title: "Art Ankara 2026: Estetik Enkazın Anatomisi",
    description:
      "12. edisyonuna ulaşmış Art Ankara 2026, küratöryel bir zekanın ürünü olmaktan ziyade estetik bir enkazın disiplinsiz istifçiliğine dönüşmüş durumda.",
    author: "Hazal Kılıç",
    author_ig: null,
    author_email: null,
    date: "2026-04-03T00:00:00Z",
    category: "Kültür & Sanat",
    tags: ["Art Ankara", "Sanat Fuarı", "Çağdaş Sanat", "Ankara", "Sergileme"],
    image: "",
    content,
    status: "draft",
  };

  const { data, error } = await supabase
    .from("articles")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("HATA:", error.message);
    return;
  }

  console.log("Yazı taslak olarak eklendi!");
  console.log("ID:", data.id);
  console.log("Slug:", row.slug);
  console.log("Düzenleme URL:", "https://klemensart.com/admin/icerikler/" + data.id);
  console.log("Yayın URL (yayınlandığında):", "https://klemensart.com/icerikler/yazi/" + row.slug);
}

main();
