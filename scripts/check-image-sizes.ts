// Bültendeki tüm görsellerin dosya boyutlarını kontrol et
const urls = [
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/email-assets/tuz-bulten-kapak-v2.png",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/tuz-ates-ve-sanat/cover.jpg",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/tuz-golunden-muranoya-bir-mineralin-yolculugu/Zeynep_ayd-n-1773582827385.jpg",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/esikte-bir-bekci/photo-1585773818647-8b6473cda135-1774290849291.jpg",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/kozmik-tuz-yildizlardan-bedene-uzanan-hareket-dramaturgisi/Resim1-1775590224022.jpg",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/corbada-bizim-de-tuzumuz-olsun-deniz-suyunu-aritmak/annie-spratt-O_Lyb6Et9Hw-unsplash-1773730846768.jpg",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/haytalik-mi-zorbalik-mi-hababam-sinifi/Hababams-n-f-_Mahmuthoca2-1773578898929.jpg",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/deniz-cekilir-tuz-kalir-kaunos-antik-kenti/1-Mustafa-Orhon--2018-1774024004833.jpg",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/tuzun-sessiz-kardesi/John_William_Edy_Alum_Mine_at_Egeberg-1774223890697.jpg",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/tuzla-yazilan-hafiza-motoi-yamamoto-nun-yas-ritueli/yamamoto-1774227327858.jpg",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/ve-kadin-tuz-olur/main-image-1774452132974-1775334879842.webp",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/tiamat-canavarlastirlan-tanrica/Chaos_Monster_and_Sun_God-1773678974009.png",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/tuzdan-kaide/cover.jpg",
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/article-images/tuz-incil/1000021471-1776118748302.jpg",
];

async function main() {
  for (const url of urls) {
    const res = await fetch(url, { method: "HEAD" });
    const size = Number(res.headers.get("content-length") || 0);
    const name = url.split("/").pop()!;
    const kb = (size / 1024).toFixed(0);
    const flag = size > 500_000 ? " ⚠️ BÜYÜK" : "";
    console.log(`${kb.padStart(6)} KB | ${name}${flag}`);
  }
}
main();
