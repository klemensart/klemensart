import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COVER =
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/tuz-ates-ve-sanat/cover.jpg";
const INLINE =
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/tuz-ates-ve-sanat/altaussee-madeni.jpg";

const content = `Bir adam, dünyanın en değerli tablolarını bir tuz madenine kapattı. Aynı adam, o tabloları havaya uçurmayı emretti.

Hitler'in sanatla ilişkisi karmaşıktır. Viyana Güzel Sanatlar Akademisi onu iki kez reddetti. Bu reddin intikamını dünya tarihinin en büyük yağmasıyla aldı. Avrupa'nın müzelerinden, kiliselerinden, özel koleksiyonlarından yüz binlerce eser sistematik biçimde toplanarak Hitler'in planladığı Führermuseum için biriktirildi. Ama bu yağma madalyonun yalnızca bir yüzüydü. Öte yüzünde *Entartete Kunst* —yoz sanat— vardı. Ekspresyonizm, soyut sanat, avangard —halkı yozlaştırdığı gerekçesiyle— düzenlenen sergilerle aşağılandı, yasaklandı, yakıldı. O, bir yandan başkalarının sanatını çalıyor, öte yandan kendi beğenisine uymayanı yok ediyordu. İkisi de aynı dürtüden besleniyordu: *Sanat kontrol edilmeliydi.*

Führermuseum, Linz'de kurulacak ve tarihin en büyük sanat koleksiyonunu barındıracaktı. Ama kimin için? Sanat için değil. Bu bir zafer anıtıydı. Başka ulusların sanat eserlerine sahip olmak, onların kültürüne sahip olmak demekti. Onların belleğini ele geçirmek, onlara hükmetmek demekti. Tablolar, heykeller birer fetih sembolüne dönüşüyordu.

Van Eyck'in Gent Sunak Tablosu; Vermeer'in *Astronom*'u; Michelangelo'nun *Brugge Madonnası*. Bu eserlerin her biri, bir uygarlığın kendini aştığı anlarda bıraktığı izdi. Ama Altaussee'deki madenin karanlığında, nemli tuz duvarlarının arasında birer kasa numarasına dönüştüler. Bağlamlarından koparıldılar, istiflendiler. Sanat değil, ganimet haline geldiler.

![Altaussee tuz madeninde depolanan tablolar, 1945](${INLINE} "Altaussee tuz madeninde Nazi yağmasıyla toplanan binlerce eser, tuz duvarlarının arasında keşfedilmeyi bekliyordu.")

Sonra savaşın seyri döndü.

1945'in ilk aylarında cepheler çökerken Hitler, *Nero Kararnamesi* olarak bilinen emri imzaladı. Geri çekilirken geride hiçbir şey bırakılmayacaktı — düşmanın işine yarayabilecek her şey imha edilecekti. Fabrikalar, köprüler, altyapı ve elbette sanat. Altaussee'deki binlerce eser de bu kararın kapsamındaydı. Madene büyük sandıklar indirildi. İçlerinde beş yüz kiloluk uçak bombaları vardı.

Düşünün: bir adam önce dünyanın dört bir yanından sanat topluyor, sonra aynı eserleri yok etmeyi emrediyor. Bu bir çelişki gibi görünür ama değildir.

İhtirasın ve egonun devreye girdiği yerde, bir şeye ya sahip olunur ya da o şey yok edilir. Üçüncü bir seçenek yoktur. Çünkü ego, bir şeyi sadece izlemeye tahammül edemez. Onu alıp kendine mâl etmek ister; edemezse ortadan kaldırmak ister. Oysa bu iki dürtüden arınan bir insan, bir eserin karşısında durup sadece bakmayı bilir. Alıp götürmek değil, o anın içinde kalmak... Sahiplenmek değil, tanık olmak… Hitler'in sanatla kurduğu ilişki, tam da bu tanıklığın imkansız olduğu bir ilişkiydi. Egosu ve hırsları o kadar büyüktü ki sahip olma ile yok etme onun için eşit derecede tatmin ediciydi. İkisi de kontroldü. İkisi de hükmetmekti.

> Sahip olmak değil. Yok etmek değil. Sadece görmek.

Nero Kararnamesi'ni uygulamayı reddeden subaylar ve Altaussee'deki madenciler, bombaları etkisiz hale getirdi. Madenin girişlerini patlattılar ama içeridekilere zarar vermeyecek şekilde... Eserleri dışarıdan gelecek yıkıma karşı korudular. Müttefik *Monuments Men* Birliği geldiğinde, tuz duvarlarının ardında insanlığın hafızası bekliyordu.

Bu hikayeyi bir kurtarma operasyonu olarak okumak kolaydır. Ama asıl ders başka yerdedir. Sanatı seven de onu nesneleştirebilir. Bir tabloyu fiyatıyla tanımlayan koleksiyoncu, bir heykeli selfie fonuna indirgeyen turist, bir eseri yalnızca yatırım aracı olarak gören piyasa — hepsi aynı hatanın yumuşak versiyonlarıdır: *Sanatın bedenine takılıp ruhunu kaçırmak.*

Altaussee'deki tuz, eserleri korudu. Ama asıl koruma, onları nesne olmaktan çıkarıp yeniden anlam olarak görebilmekte. Bir tablonun karşısında durup hiçbir şey istemeden, sadece bakabilmekte.

*Sahip olmak değil. Yok etmek değil. Sadece görmek.*`;

async function main() {
  const row = {
    slug: "tuz-ates-ve-sanat",
    title: "Tuz, Ateş ve Sanat",
    description:
      "Hitler dünyanın en değerli tablolarını bir tuz madenine kapattı, sonra havaya uçurmayı emretti. Altaussee'den Monuments Men'e, sanatı sahiplenme ile yok etme arasındaki ince çizgi.",
    author: "Kerem Hun",
    author_ig: "keremhun",
    author_email: "kerem.hun@klemensart.com",
    date: "2026-04-13T00:00:00Z",
    category: "Odak",
    tags: [
      "Altaussee",
      "Monuments Men",
      "Nazi yağması",
      "sanat tarihi",
      "tuz madeni",
      "İkinci Dünya Savaşı",
    ],
    image: COVER,
    content,
    status: "published",
  };

  const { data, error } = await supabase
    .from("articles")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("HATA:", error.message);
    process.exit(1);
  }

  console.log("Yazı eklendi!");
  console.log("ID:", data.id);
  console.log("URL: https://klemensart.com/icerikler/yazi/tuz-ates-ve-sanat");
}

main();
