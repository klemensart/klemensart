import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const slug = "iskenderiye-feneri-1600-yil-sonra-denizden-yukseliyor";
const title = "İskenderiye Feneri 1.600 Yıl Sonra Denizden Yükseliyor";
const description =
  "Antik dünyanın yedi harikasından biri olan İskenderiye Feneri'ne ait 22 devasa taş blok, Akdeniz'in tabanından çıkarıldı.";
const author = "KLEMENS";
const category = "Kültür & Sanat";
const tags = ["arkeoloji", "iskenderiye", "antik-dunya", "akdeniz", "kulturel-miras"];
const image =
  "https://cff2.earth.com/uploads/2026/02/08120520/lighthouse-of-alexandria-remains-recovered-mediterranean-sea-1400x850.jpg";

const content = `Antik dünyanın yedi harikasından biri olan İskenderiye Feneri'ne ait 22 devasa taş blok, Akdeniz'in tabanından çıkarıldı. İskenderiye'nin doğu limanında gerçekleştirilen operasyon, fenerin fiziksel kalıntılarına ulaşma konusunda bugüne kadar atılmış en büyük adım olarak değerlendiriliyor.

![İskenderiye Feneri'nden çıkarılan devasa taş bloklar](https://cff2.earth.com/uploads/2026/02/08120520/lighthouse-of-alexandria-remains-recovered-mediterranean-sea-1400x850.jpg "İskenderiye Feneri'ne ait taş bloklar, 1.600 yıl sonra Akdeniz'in tabanından çıkarıldı.")

## PHAROS Projesi

Operasyonu Fransa Ulusal Bilimsel Araştırma Merkezi'nden (CNRS) arkeolog ve mimar Isabelle Hairy yönetiyor. Çalışma, Mısır Turizm ve Antikalar Bakanlığı'nın yetkisi altında yürütülen PHAROS projesi kapsamında gerçekleşti. Projenin nihai hedefi, fenerin dijital ikizini oluşturarak yapıyı sanal ortamda tam ölçekli biçimde yeniden ayağa kaldırmak.

## Denizden Çıkan Parçalar

Denizden çıkarılan parçalar arasında fenerin anıtsal giriş kapısına ait lentolar, söveler, eşik taşları ve kuleyi taşıyan temel plakaları yer alıyor. Blokların her biri 70 ile 80 ton arasında ağırlığa sahip.

Ancak asıl dikkat çekici bulgu, daha önce varlığı bilinmeyen bir yapıya ait. Yunan inşaat teknikleriyle inşa edilmiş Mısır tarzı bir giriş kapısına sahip pilon yapısı, Ptolemaios döneminde iki büyük kültürün mimari düzeyde nasıl iç içe geçtiğine dair yeni sorular açıyor.

## Dijital İkiz

Çıkarılan bloklar fotogrametrik taramadan geçirilerek üç boyutlu dijital modellere dönüştürülecek. Bu aşamayı Dassault Systèmes Vakfı'nın gönüllü mühendisleri üstleniyor. Ekip, blokları sanal ortamda orijinal konumlarına yerleştirerek fenerin ayakta durduğu haliyle ziyaret edilebileceği bir dijital model oluşturmayı hedefliyor. Aynı model, yapının neden ve nasıl çöktüğüne dair hipotezlerin test edilmesine de olanak tanıyacak.

## Sualtı Araştırmalarının Tarihi

Fenerin sualtı kalıntıları ilk kez 1994 yılında Fransız arkeolog Jean-Yves Empereur tarafından sistematik olarak belgelenmişti. O dönemde sfenksler, dikilitaşlar, sütunlar ve granit bloklar dahil 3.300'den fazla obje kayıt altına alınmıştı. Son on yılda 100'den fazla mimari parça doğrudan deniz tabanında dijital olarak taranmıştı. Ancak bu büyüklükte blokların yüzeye çıkarılması ilk kez gerçekleşiyor.

## İskenderiye Feneri'nin Kısa Tarihi

İskenderiye Feneri MÖ 3. yüzyılın başlarında Ptolemaios I Soter döneminde inşa edilmişti. Yaklaşık 100 metre yüksekliğindeki yapı, yüzyıllar boyunca Akdeniz'in en önemli limanına giriş yapan gemilere rehberlik etti. MS 4. yüzyıldan itibaren ardı ardına gelen depremler yapıyı kademeli olarak tahrip etti. 1303 yılındaki büyük deprem ve ardından gelen tsunami fenerin büyük bölümünü yıktı. 1477'de ise Kayıtbay Kalesi'nin inşasında fenerin taşları devşirme malzeme olarak kullanıldı. Yani fener hem doğanın hem insanın eliyle ortadan kaldırıldı.

---

## Kaynakça

- [After 1,600 years underwater, remains of the Lighthouse of Alexandria emerge — Earth.com](https://www.earth.com/news/after-1600-years-underwater-remains-of-the-lighthouse-of-alexandria-emerge/)
- [The Gates of the Alexandria Lighthouse Emerge from the Sea — La Fondation Dassault Systèmes](https://www.lafondation3ds.org/news/gates-alexandria-lighthouse-emerge-sea/)
`;

async function main() {
  // Önce görseli Supabase'e yükle
  let finalImage = image;
  try {
    const res = await fetch(image, {
      headers: { "User-Agent": "KlemensArt/1.0" },
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const ct = res.headers.get("content-type") ?? "image/jpeg";
      const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
      const path = `article-covers/${slug}.${ext}`;
      const { error: upErr } = await sb.storage
        .from("email-assets")
        .upload(path, buf, { contentType: ct, upsert: true });
      if (!upErr) {
        const { data: pub } = sb.storage.from("email-assets").getPublicUrl(path);
        finalImage = pub.publicUrl;
        console.log("Cover uploaded:", finalImage);
      } else {
        console.warn("Upload failed, using original URL:", upErr.message);
      }
    }
  } catch (e) {
    console.warn("Image download failed, using original URL");
  }

  const { data, error } = await sb.from("articles").insert({
    slug,
    title,
    description,
    author,
    category,
    tags,
    image: finalImage,
    content,
    status: "draft",
    date: new Date().toISOString().split("T")[0],
  }).select("id").single();

  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log("Article created as DRAFT:", data.id);
  console.log(`View at: /admin/icerikler/${data.id}`);
}

main();
