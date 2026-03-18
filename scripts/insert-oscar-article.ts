import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const content = `> "Eğer film yapımcıları uçak yapsaydı, her kalkış bir kazayla sonuçlanırdı. Ama sinemada bu kazalara Oscar deniyor."

> "ABD vizem yok ve başvurmak da istemiyorum. Üstelik o kadar uzun uçmak da istemiyorum."

> — Jean-Luc Godard

Hadi gelin, kimi film severlerin her sene merakla beklediği, kimilerininse keskin bir şekilde eleştirdiği, kimi sinema emekçilerinin ise ödül alıp reddettiği (Brando, 1973) Hollywood'un en büyük gecesi Akademi Ödülleri'nden yani Oscar'dan konuşalım!

Bu yılın yani 98. Akademi Ödülleri'nin üzerine konuşmadan önce, Oscar ödül töreninin prestij ve ihtişamının ötesinde, altın heykelciğinin arka yüzünde ne var bunu konuşalım biraz seninle sayın okuyucu. Çeşitlilik sorunu (Her yer beyaz erkek yani ne kadar sıkıcı değil mi?), ana akım sinema tutuculuğu (Tek yol Hollywood efendim!) ve çeşitli reklam faaliyetlerini sayarsak sanırım kısaca özetlemiş oluruz altın heykelciğin öteki yüzünü. Kubrick'in sinemaya bir güzelleme olarak sunduğu şaheser 2001: A Space Odyssey filminin, jürinin bilim kurguyu ciddiye almadığı için ödül almaması mesela oldukça hararetli bir tartışma başlatmıştır bu heykelciğin meşruiyeti hakkında. Gelgelim 2026 yılı ödüllerine, bu sene sevgili [Kült Kavaklıdere](https://www.instagram.com/kultkavaklidere/)'miz, sinema salonlarından birini sabaha kadar açık tutarak, Oscar sever Ankaralıları bir çatı altında birleştirdi. Akademi Ödülleri'ni ne kadar tenkit etsem de Ankara özelinde böyle kolektif sinema etkinliklerine ön ayak oldukları için öncelikle kendilerine teşekkür ediyor ve filmlerden konuşmaya başlıyorum izninizle.

Bu senenin aday filmleri arasında Savaş Üstüne Savaş (One Battle After Another), Marty Supreme, Hamnet, Günahkarlar (Sinners), Manevi Değer (Sentimental Value), Frankenstein ve Bugonia yer aldı. Özellikle Marty Supreme öyle bir reklam kampanyası ile önümüze çıktı ki sosyal medya reklamcılık sayfalarında sık sık bir sinema filmini görür olduk. Timothée Chalamet'in (namıdeğer TC Ahmet) Las Vegas'ın Atakule'sinde zuhur etmesi ve binanın dev bir masa tenis topuna dönüşmesi ile alışılmadık bir reklam kampanyası gördük. Yalnızca, reklam ajansları değil, Hollywood'un genç yeteneği TC Ahmet de mahir bir sporcu gibi rol yapabilmek için altı yıl evet yanlış duymadınız tam ALTI yıl (çeşitli kaynaklardan itina ile doğruladım) masa tenisi çalıştı. Gösterime oldukça yoğun bir ilgiyle başladı yani Marty Supreme. Fakat sinemanın büyüsü yalnızca ışıklar açılana kadar sürermiş sayın sinemaseverler. TC Ahmet'in büyüsü de Variety'e verdiği röportaj ile bozuluverdi: "I don't want to be working in ballet, or opera, or things where it's like, 'Hey, keep this thing alive, even though like no one cares about this any more'," (Guardian, 2016). Sen altı yıl masa tenisi oyna, Kardashian ailesine çocuk damat ol, fakat bu kadar yakınken Oscar'ı bu gaf yüzünden kaybet, bakınız dramdır bu.

Peki efendim neye binaen bu kadar eleştiri? Öncelikle meselenin aslında oldukça kişisel olduğu, bale geçmişi olan Tom Holland'ın seçmelerde esnekliği sebebiyle Chalamet'e tercih edildiği ve böylelikle TC Ahmet'in örümcek adam rolünü kaybettiği bu yorumun arka planı olarak iddia edildi. Fakat bana sorarsanız, mesele daha derin fay hatlarına temas ediyor. Teknolojinin ve bilgiye ulaşımın ziyadesiyle kolaylaşmasına binaen, bilgiyi ve bilgeyi hakir gören anti entelektüel akım, bugün gördüğünüz gibi sanata da sirayet etmiş durumdadır. Popülist söylemlerin vasat güç sahipleri ile bu akım arasındaki bağlantıyı, bugünün Amerika'sında oldukça iyi gözlemleyebiliriz mesela. Artık, bilgenin üzerinde bir şekilde hakimiyet kurmuş vasatın, vasatlığından dünya oldukça bıkmış durumda. Her radikal fikrini, hiçbir utanç duymaksızın dürüstlük ve samimiyet kisvesi altında sorumsuzca ifade edenler artık bekledikleri gibi, dürüst ve samimi bulunmuyorlar. Bakınız TC Ahmet gibi sorumsuzluklarının bedellerini ödüyorlar. Yani TC Ahmet sanatın entelektüel formunu popüler söylemler ile aşındırmaya teşebbüs ettiği gereğince yargılandı diyebiliriz kısacası. Böylelikle, sezonun favorilerinden Marty Supreme, ilk yenilgisini BAFTA'da (British Academy Film Awards), 0 adet ödül ile geceyi tamamlayarak aldı. Fakat, Chalamet için sınav yeni başlıyordu. Academy bu seneye özel olarak Misty Copeland'ı geceye davet etti. Chalamet'in en iyi erkek oyuncu Oscar'ını kaybettiği filmin (The Sinners) müzik gösteriminde, Copeland'ın bale performansı Chalamet'in en ön sıralarda oturduğu sahnede icra edildi. Ne yalan söyleyeyim, o sıra TC Ahmet'in zihninden geçenleri okuyabilmeyi çok isterdim. Sonuç olarak, Akademi Ödülleri'nden de bildiğiniz 0 adet ödülle döndüler, bakın tekrar ediyorum hiç ama hiç bir kategoriden ödül almadılar.

Bir başka ses getiren yapım ise nereye baksak ya kitabını ya da insanların film öncesi ve sonrasındaki durumlarını gösteren sosyal medya içeriklerini gördüğümüz, Hamnet oldu. En İyi Kadın Oyuncu kategorisinde yarışan başrol oyuncusu Jessie Buckley bu film ile Oscar heykelciğine kavuştu ve Oscar alan ilk İrlandalı kadın oyuncu oluverdi. Ne tuhaf değil mi? Akademi ödüllerini faşist bulduğumu zaten yukarıda söylemiştim. Bu arada lütfen Emily Stone'un (Emma değil Emily lütfen) rekorunu unuttuğumu zannetmeyin. Kendisi en çok Oscar'a aday gösterilen en genç kadın oyuncu rekorunun sahibi şu anda. Oscar benim için bir şey ifade etmese de kendisini ve sevgili Lanthimos'u (filmlerini izlemediyseniz hemen başlamanızı tavsiye ederim derhal bugün) çok sevdiğimden, onlar için mutlu oldum. Bugonia'nın geceye ödülsüz veda etmesi ise benim için umut verici bir gelişme oldu. En azından Hollywood'cu Lanthimos iftiralarının bir sonu gelmiş olur bu şekilde.

En İyi Uluslararası film ise Sentimental Value oldu. Yine bu film ziyadesiyle sevilen bir yapım oldu. Frankenstein, üç ayrı ödüllü geceden ayrılırken (bakınız: En İyi Yapım Tasarımı, Saç ve Makyaj Tasarımı, Kostüm Tasarımı), Pedro Pascal filmin kendisinden daha çok konuşuldu. Bu beyefendiyi kim hazırlamışsa bu geceye gerçekten Avrupa İnsan Hakları Mahkemesi'nde yargılanmalı! Yeni imajı, oynadığı filmin bütün estetiksel ödüllerine rağmen çok vahimdi. Tez vakitte sakalları uzar umarım ki.

En çok ödül alan One Battle After Another ise birçok kişiyi üzse de beni şaşırtmadı çünkü yine bariz bir ana akım sinema geleneğinden geliyordu. En İyi Film, En İyi Yönetmen, En İyi Uyarlama Senaryo, En İyi Yardımcı Erkek Oyuncu, En İyi Kurgu ve En İyi Oyuncu Seçimi ödüllerini aldı. Bu film Oscar tarihinde ilk kez verilen, En İyi Oyuncu Seçimi Ödülü ile tarihe geçmiş oldu aynı zamanda. En İyi Yardımcı Erkek Oyuncu sahibi Sean Penn ise törene katılmayı tercih etmedi ve aktivizm ile meşgul olduğunu dile getirdi.

Sinners'a geldiğim zaman ise film En İyi Erkek Oyuncu, En İyi Özgün Senaryo, En İyi Film Müziği, En İyi Görüntü Yönetimi kategorisinde altın heykelcik aldı. Autumn Durald Arkapaw, En İyi Görüntü Yönetimi Ödülü'nü alan ilk kadın oldu. Irkçılık ve cinsiyetçiliği tahmin edebiliyor musunuz şimdi? Yıl 2027 olacak, ilk kez bir kadın bu kategoride ödül aldı… Kendisine çokça sevgiler.

Fakat günü sonunda en çok konuşulan en PR kokan hareket ne oldu dersiniz? Michael B. Jordan'ın törenden çıkar çıkmaz bir hamburger restoranına gidip hamburger yemesi maalesef. Birbiri ardına patlayan flaş ışıkları, çekim ekipmanları bizlere neler düşündürür? Bu eleştirinin çıkıp Devrez'e gelmemesi ile bir alakası kesinlikle yok tabi!

Pozitif bir şey yok muydu? Javier Bardem'in savaş ve Filistin'deki soykırıma karşı konuşması kesinlikle. Bizi hiç hayal kırıklığına uğratmayan yiğit bir kişi olduğun için teşekkür ederiz, güzelim İspanyol aksanlı sevgili Bardem.

Sonuç olarak bütün popülerliğini aslında prestijden değil de ana akım temsilciliğinden üreten 98. Akademi Ödül Töreni'nin sonuçları böyleydi işte sayın okur. Törenin sonunda Hannah Einbinder'a mikrofon uzatıldığında (Bardem'in savaş karşıtı konuşması üzerine), ödül töreni boyunca kimsenin savaş hakkında hiçbir şey söylemediği dile getirdi. Muhabirin cevabıysa oldukça ilginçti: "Şaşırdınız mı buna?".`;

async function main() {
  const row = {
    slug: "altin-heykelcigin-oteki-yuzu",
    title: "Altın Heykelciğin Öteki Yüzü",
    description:
      "98. Akademi Ödülleri'nin altın ışıltısının ardındaki çeşitlilik sorunu, ana akım tutuculuğu ve bir Oscar gecesinin Ankara'daki yansıması.",
    author: "Hitit Güneşi",
    author_ig: null,
    author_email: null,
    date: "2026-03-17T00:00:00Z",
    category: "Kültür & Sanat",
    tags: ["Oscar", "Akademi Ödülleri", "Sinema", "Hollywood", "Jean-Luc Godard"],
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
  console.log("URL (yayınlandığında): https://klemensart.com/icerikler/yazi/" + row.slug);
}

main();
