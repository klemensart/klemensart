// Tuzdan Kaide makalesini Supabase'e ekle (imla düzeltmeleri uygulanmış)
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const COVER = "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/tuzdan-kaide/cover.jpg";
const INLINE = "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/tuzdan-kaide/salt-crystals.jpg";

const content = `<blockquote style="font-style: italic; border-left: 3px solid #b0a99f; padding-left: 16px; margin: 0 0 28px 0; color: #5a534c;">
<p>"And on the pedestal, these words appear:<br>
My name is Ozymandias, King of Kings;<br>
Look on my Works, ye Mighty, and despair!"<br>
Nothing beside remains. Round the decay<br>
Of that colossal Wreck, boundless and bare<br>
The lone and level sands stretch far away."</p>
<p style="font-style: normal; font-size: 14px; color: #8C857E;">— Percy Bysshe Shelley</p>
</blockquote>

<p>Lut kavmi yok edilirken arkasına bakmaktan kendini alıkoyamayan Lut'un eşinin bir tuzdan heykele dönüşmesi ile bu adı alan, Tuzdan Kaide filmini konuşalım sizinle. Benim filmle çok kişisel bir deneyimim olmasından ötürü, olabildiğince az laf kalabalığı ile yazmak için kendime söz veriyorum evvela, fakat ne mümkün!</p>

<p>Çok yoğun bir günün akşamında, soğuk ve yağmurdan kaçarak birden sıcak fizik amfisine girdiğimden olsa gerek, bu filmi izlemeye gittiğimde uyuyakaldım. Bu tatlı uyku süresince bazen Ümit Besen'i şarkı söylerken, bazen de kadınları çığlıklar atarken duydum. Ben bir noktada uyandığımda ve uyumakta olduğum filmin yönetmeninin de olduğu salonda söyleşi başlayınca kendimi oldukça mahcup hissettim, üstelik bir de çok görünebilir bir yer seçmiştim kendime. Mahcubiyetimden doğan sıkıntı duyguları ile kıvranırken yönetmen Burak Çevik, birden bir gün İstanbul'dan Antalya'ya yalnız bir filmi izlemek için seyahat ettiğini ve sonrasında da bu yolculuğunda verdiği yorgunluktan olsa gerek film boyunca uyuduğunu anlatmaya başladı. Benim yaşadığım talihsizliğin, kendisi tarafından da tatbik edildiğini duyunca şaşkınlıkla karışık bir gülümseme ile söyleşiyi dinledim. Tuzdan Kaide'yi ilk izlediğimde endişeli bir sinemaseverdim. Filmleri bütün mevcudiyetim, gücüm ve sabrımla izler, her yarım bıraktığım film içinse oldukça büyük bir vicdan azabı ile kendimi kötü hissederdim. O günden sonra bitiremediğim, uyuyakaldığım filmler için mahcup olmayı bırakmış oldum böylece.</p>

<p>Gelgelelim, film meselesine.</p>

<p>Tuzdan Kaide'ye girişi böylesine uzatmamın sebebi aslında izlemesi hiç de kolay olmayan bir filmin gelmekte olduğunu müjdelemek olabilir pekâlâ.</p>

<img src="${INLINE}" alt="Ölü Deniz kıyısındaki tuz kristalleri" style="width: 100%; border-radius: 12px; margin: 24px 0;" />

<p>Deneysel sinemanın hayli dikkat gerektiren yorucu sekanslarını çekilir kılan nedir sizin için? Benim için bu filmin içerdiği mesajlardır. Mesajlar derken kimi zaman yönetmenin oldukça açık bir şekilde, bir öğretmen edasıyla filmi mesajlarla doldurmasından bahsetmiyorum (Semih Kaplanoğlu'nun Bağlılık Hasan'ın o güzelim sekanslarını mesaja boğması beni hep üzmüştür mesela.) İzleyici ile daha müphem bir noktadan samimi bir bağ kurabilen filmlerdir bunlar. Tam bu açıdan baktığımızda, Tuzdan Kaide bize asırlar öncesinden böylece seslenir.</p>

<p>Burak Çevik Altyazı Sinema Dergisi'ne "Lut Kavmi hikâyesi, arkasına dönüp baktığı için tuzdan bir heykele (kaide) dönüştürülen, yani zamanda sabitlenen Lut'un karısının hikâyesi… Milan Kundera'nın 'Ölümsüzlük' kitabında dediği gibi: 'Tanrı'nın en büyük laneti insanı zamanda sabitlemektir.' Bunu fotoğraf da yapıyor, sinema da." (2019) diyor. Dolayısıyla film boyunca biz bir durağanlık daha doğrusu zamansızlık izliyoruz. Zaman yok, koşuşturmaca ve kaos var sadece. Mesela bir masa tenisi maçı sahnesi var, iki oyuncunun oldukça çevik ve ahenkli bir şekilde tenis oynadığını görüyoruz. Sporcuların ve tenis topunun çevik hareketleri, süratli bir oyunun etrafında yakalıyor bizi. Zamansızlık algısı yaratmak isteyen bir film için bu süratin varlığı oldukça ilginç bir seçim öyle değil mi? Aslında hızın giderek arttığı modern zamanların, bizde uyandırdığı his de artan bir zamansızlık değil mi? Şehrin, trafiğin ve iş hayatının beyhude koşuşturmaları arasında en çok hissettiğimiz duygu da bu değil mi? Filmde de böyle işte, ana karakterimiz ikizini telaş içinde ararken, ancak bulduğunda çalmaya başlayan Ümit Besen şarkısı gibi, her şey oldukça zamansız.</p>

<p>Sahnelere baktığımız zaman ise bizi üç görsel karşılıyor: Doğu Perinçek resmi, fotoğrafçıdaki vav harfi ve şahmeran. Zaten şahmeran sağ olsun, film boyunca hiç erkek birey izlemiyoruz: hamile yarı-zamanlı vampir kadının çocuğunun babası bile yok ortalıklarda. Bu oyuncu seçimi kriterinin arkasındaki sebebini ise oldukça merak etmekteyim hâlâ. Filmde sanki bir korku filmi atmosferi var fakat bazı ögeler de çok katmanlı mizahi bir anlatım yaratıyor. Örneğin, yarı-zamanlı vampir hanımefendiye kuş satmak isteyen esnaf birey diyor ki "Eğer çok yaşasın diyorsan, sana papağan verelim." Burada gayri ihtiyari şaşkın bir gülümseme beliriyor yüzünüzde. Mimiksiz oyuncular nasıl anlatımı kırıp, duygularıyla senaryoyu manipüle edemiyorsa bu tuhaf diyaloglar, doğaüstü parçalar, hareketsiz objeler üstünden konuşan insanlar ve herkesin hikayesini birbirine bağlayan o garip rüya da, aynı küvet sahnesinde sürekli dönen kamera gibi dönüp dönüp seyirciye diyor ki efendim uyumayınız, ne izlediğinizin farkında kalınız.</p>

<p>Fakat ya filmin sonu? Burak Çevik'in filmi neden "oyunbaz" (Altyazı Sinema Dergisi, 2019) olarak nitelediğini daha iyi anlatamaz.</p>

<p>Evet film bütün akış boyunca bizi dirayetli ve farkındalığı yüksek kalmaya zorlar adeta, fakat sonundaki mimari çizim cenaze sekansıyla kazandığımız bu farkındalığı, bu kez tamamen yitiririz. Yalnızca çizimler üzerinden akan son bir hikâyeyi dinleyip, kendi mitlerimizle, ifritlerimizle tuzdan bir kaide gibi öylece kalıveririz o hikayenin içinde, çünkü kaybettiğimiz herkesle bir parça daha tuzdan bir kaideye dönüşürüz hepimiz, hepimizin en gerçek hikayesi budur. Sonra fotoğrafçı kadına söylenen o cümle aklımıza gelir:</p>

<p><em>"Senin fotoğrafta yaptığını, (Tanrı) Lut'un karısına yaptı."</em></p>

<p style="font-size: 13px; color: #8C857E; margin-top: 32px;"><strong>Referanslar</strong><br>Çiftçi, A., & Göl, B. (2019, May 9). <em>Tuzdan Kaide'nin yönetmeni Burak Çevik ile söyleşi.</em> Altyazı Sinema Dergisi.<br><a href="https://altyazi.net/soylesiler/tuzdan-kaidenin-yonetmeni-burak-cevik-ile-soylesi/" style="color: #FF6D60;">altyazi.net</a></p>`;

async function main() {
  const { data, error } = await sb.from("articles").insert({
    id: "b8c2d3e4-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
    title: "Tuzdan Kaide",
    slug: "tuzdan-kaide",
    description: "Lut kavmi yok edilirken arkasına bakmaktan kendini alıkoyamayan Lut'un eşinin bir tuzdan heykele dönüşmesi ile bu adı alan, Tuzdan Kaide filmini konuşalım sizinle.",
    content,
    category: "Kültür & Sanat",
    author: "Hitit Güneşi",
    author_email: null,
    image: COVER,
    status: "published",
    tags: ["tuz", "sinema", "film eleştirisi", "deneysel sinema"],
  }).select();

  if (error) {
    console.error("HATA:", error.message);
  } else {
    console.log("Makale eklendi:", data?.[0]?.id);
    console.log("Slug:", data?.[0]?.slug);
  }
}
main();
