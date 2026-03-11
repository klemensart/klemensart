import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sgabkrzzzszfqrtgkord.supabase.co",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  async redirects() {
    return [
      // ═══════════════════════════════════════════════════════
      // 1. YAZILAR — WordPress bare-slug → /icerikler/yazi/slug
      // ═══════════════════════════════════════════════════════

      // Özel durum: alt çizgili slug → tireli
      { source: "/pisuvar_nasil_sanat_eserine_donustu", destination: "/icerikler/yazi/pisuvar-nasil-sanat-eserine-donustu", permanent: true },
      // Supabase'de yok — genel içeriklere
      { source: "/klemens-e-bulten-subatta-sizlerle", destination: "/icerikler", permanent: true },

      // A-B
      { source: "/28-istanbul-tiyatro-festivali-perdelerini-aciyor", destination: "/icerikler/yazi/28-istanbul-tiyatro-festivali-perdelerini-aciyor", permanent: true },
      { source: "/ankaranin-hafiza-mekanlari-ile-cumhuriyet-yolculugu", destination: "/icerikler/yazi/ankaranin-hafiza-mekanlari-ile-cumhuriyet-yolculugu", permanent: true },
      { source: "/ara-gulerin-kumkapi-balikcilari-baslikli-sergisi-acildi", destination: "/icerikler/yazi/ara-gulerin-kumkapi-balikcilari-baslikli-sergisi-acildi", permanent: true },
      { source: "/artemisia-gentileschi-hafiza-yalnizlik", destination: "/icerikler/yazi/artemisia-gentileschi-hafiza-yalnizlik", permanent: true },
      { source: "/artnouva-sanat-fuarinda-son-iki-gun", destination: "/icerikler/yazi/artnouva-sanat-fuarinda-son-iki-gun", permanent: true },
      { source: "/belcika-da-orta-cagdan-kalma-iskence-kalesi", destination: "/icerikler/yazi/belcika-da-orta-cagdan-kalma-iskence-kalesi", permanent: true },
      { source: "/biden-yonetimi-eski-sanat-enstituleri-ogrencilerinin-61-milyar-dolarlik-borcunu-affetti", destination: "/icerikler/yazi/biden-yonetimi-eski-sanat-enstituleri-ogrencilerinin-61-milyar-dolarlik-borcunu-affetti", permanent: true },
      { source: "/bir-hikaye-anlatiliyor-bursada", destination: "/icerikler/yazi/bir-hikaye-anlatiliyor-bursada", permanent: true },
      { source: "/birdman-ve-sosyal-medya-mitosu", destination: "/icerikler/yazi/birdman-ve-sosyal-medya-mitosu", permanent: true },
      { source: "/british-museum-hirsizlik-skandalinin-ardindan-268-kayip-objenin-daha-bulundugunu-acikladi", destination: "/icerikler/yazi/british-museum-hirsizlik-skandalinin-ardindan-268-kayip-objenin-daha-bulundugunu-acikladi", permanent: true },
      { source: "/butunlugun-buyusu", destination: "/icerikler/yazi/butunlugun-buyusu", permanent: true },

      // C-D
      { source: "/calinan-salvator-rosa-tablosu-oxford-universitesi-galerisine-geri-dondu", destination: "/icerikler/yazi/calinan-salvator-rosa-tablosu-oxford-universitesi-galerisine-geri-dondu", permanent: true },
      { source: "/cocukluk-yoruldu-ya-sonra", destination: "/icerikler/yazi/cocukluk-yoruldu-ya-sonra", permanent: true },
      { source: "/culturati-ile-kultur-sanat-oyunlarina-ve-size-ozel-rotalara-hazir-olun", destination: "/icerikler/yazi/culturati-ile-kultur-sanat-oyunlarina-ve-size-ozel-rotalara-hazir-olun", permanent: true },
      { source: "/delacroixnin-unlu-ozgurluk-tablosunun-gercek-renkleri-ortaya-cikti", destination: "/icerikler/yazi/delacroixnin-unlu-ozgurluk-tablosunun-gercek-renkleri-ortaya-cikti", permanent: true },
      { source: "/denim-otesi", destination: "/icerikler/yazi/denim-otesi", permanent: true },
      { source: "/dijital-nostalji-tehlikesi-yapay-zeka-tarihi-fotograflarin-yerini-alabilir-mi", destination: "/icerikler/yazi/dijital-nostalji-tehlikesi-yapay-zeka-tarihi-fotograflarin-yerini-alabilir-mi", permanent: true },
      { source: "/dijital-sanat-festivali-istanbul-2024-basliyor", destination: "/icerikler/yazi/dijital-sanat-festivali-istanbul-2024-basliyor", permanent: true },
      { source: "/dunya-disi-kokenlere-sahip-alaca-hoyuk-hanceri", destination: "/icerikler/yazi/dunya-disi-kokenlere-sahip-alaca-hoyuk-hanceri", permanent: true },
      { source: "/dunyanin-en-prestijli-sanat-odullerinden-altin-aslani-nil-yalter-aldi", destination: "/icerikler/yazi/dunyanin-en-prestijli-sanat-odullerinden-altin-aslani-nil-yalter-aldi", permanent: true },

      // E
      { source: "/eda-erdem-heykelindeki-sorun-ne", destination: "/icerikler/yazi/eda-erdem-heykelindeki-sorun-ne", permanent: true },
      { source: "/edebi-bir-muhit-ankara", destination: "/icerikler/yazi/edebi-bir-muhit-ankara", permanent: true },
      { source: "/edebi-bir-muhit-ankara-bolum-2", destination: "/icerikler/yazi/edebi-bir-muhit-ankara-bolum-2", permanent: true },
      { source: "/edebi-bir-muhit-ankara-bolum-3", destination: "/icerikler/yazi/edebi-bir-muhit-ankara-bolum-3", permanent: true },
      { source: "/edebi-bir-muhit-ankara-bolum-4", destination: "/icerikler/yazi/edebi-bir-muhit-ankara-bolum-4", permanent: true },
      { source: "/edebi-bir-muhit-ankara-bolum-5", destination: "/icerikler/yazi/edebi-bir-muhit-ankara-bolum-5", permanent: true },
      { source: "/edebi-bir-muhit-ankara-bolum-6", destination: "/icerikler/yazi/edebi-bir-muhit-ankara-bolum-6", permanent: true },
      { source: "/edebi-bir-muhit-ankara-bolum-7", destination: "/icerikler/yazi/edebi-bir-muhit-ankara-bolum-7", permanent: true },
      { source: "/edebi-bir-muhit-ankara-bolum-8", destination: "/icerikler/yazi/edebi-bir-muhit-ankara-bolum-8", permanent: true },
      { source: "/edward-hopper-yalnizlik", destination: "/icerikler/yazi/edward-hopper-yalnizlik", permanent: true },
      { source: "/eskiden-yeniyi-bulmak-birinci-ulusal-mimari", destination: "/icerikler/yazi/eskiden-yeniyi-bulmak-birinci-ulusal-mimari", permanent: true },

      // F-H
      { source: "/fotograflarla-tarihi-izlemek", destination: "/icerikler/yazi/fotograflarla-tarihi-izlemek", permanent: true },
      { source: "/gulnaz-colaktan-siyah-beyaz-anilar", destination: "/icerikler/yazi/gulnaz-colaktan-siyah-beyaz-anilar", permanent: true },
      { source: "/harry-potter-ve-felsefe-tasi-kitabinin-orijinal-kapak-cizimi-satisa-cikiyor", destination: "/icerikler/yazi/harry-potter-ve-felsefe-tasi-kitabinin-orijinal-kapak-cizimi-satisa-cikiyor", permanent: true },
      { source: "/her-film-analiz", destination: "/icerikler/yazi/her-film-analiz", permanent: true },
      { source: "/huzurlu-rahatsizlik-ve-sanatin-etimolojik-bunalimi", destination: "/icerikler/yazi/huzurlu-rahatsizlik-ve-sanatin-etimolojik-bunalimi", permanent: true },

      // I-K
      { source: "/iklim-aktivistleri-bu-sefer-magna-cartanin-bulundugu-cam-kasayi-parcaladi", destination: "/icerikler/yazi/iklim-aktivistleri-bu-sefer-magna-cartanin-bulundugu-cam-kasayi-parcaladi", permanent: true },
      { source: "/insanlik-halleri-ikilem-ve-denge", destination: "/icerikler/yazi/insanlik-halleri-ikilem-ve-denge", permanent: true },
      { source: "/istanbulda-kendime-ait-bir-oda-beyoglu", destination: "/icerikler/yazi/istanbulda-kendime-ait-bir-oda-beyoglu", permanent: true },
      { source: "/izmirin-locus-amoenusu", destination: "/icerikler/yazi/izmirin-locus-amoenusu", permanent: true },
      { source: "/izler-ve-baglar", destination: "/icerikler/yazi/izler-ve-baglar", permanent: true },
      { source: "/jonathan-yeonun-kral-charles-iii-portresi-sanat-dunyasinda-tartisma-yaratti", destination: "/icerikler/yazi/jonathan-yeonun-kral-charles-iii-portresi-sanat-dunyasinda-tartisma-yaratti", permanent: true },
      { source: "/kalabaliklar-caginda-muze", destination: "/icerikler/yazi/kalabaliklar-caginda-muze", permanent: true },
      { source: "/kazlarin-senfonisi-fotograf-albumu-yayinlandi", destination: "/icerikler/yazi/kazlarin-senfonisi-fotograf-albumu-yayinlandi", permanent: true },
      { source: "/kliselerden-kaciyoruz", destination: "/icerikler/yazi/kliselerden-kaciyoruz", permanent: true },
      { source: "/konusma-devam-ediyor", destination: "/icerikler/yazi/konusma-devam-ediyor", permanent: true },
      { source: "/korkuyu-beklerken-bosluk-ilerliyor", destination: "/icerikler/yazi/korkuyu-beklerken-bosluk-ilerliyor", permanent: true },
      { source: "/kozmik-yalnizlik-kopernik-devrimi", destination: "/icerikler/yazi/kozmik-yalnizlik-kopernik-devrimi", permanent: true },
      { source: "/kralicenin-ordugu-kazak-tavan-arasinda-bulundu", destination: "/icerikler/yazi/kralicenin-ordugu-kazak-tavan-arasinda-bulundu", permanent: true },
      { source: "/kuslar-da-olur", destination: "/icerikler/yazi/kuslar-da-olur", permanent: true },

      // M-O
      { source: "/medeanin-intikami", destination: "/icerikler/yazi/medeanin-intikami", permanent: true },
      { source: "/minyaturlerde-donusen-venus", destination: "/icerikler/yazi/minyaturlerde-donusen-venus", permanent: true },
      { source: "/muz-sanat-midir", destination: "/icerikler/yazi/muz-sanat-midir", permanent: true },
      { source: "/muze-galerisine-kendi-eserini-asan-muze-calisani-isten-cikartildi", destination: "/icerikler/yazi/muze-galerisine-kendi-eserini-asan-muze-calisani-isten-cikartildi", permanent: true },
      { source: "/nicole-l-ben-son-kadin-nesneyim", destination: "/icerikler/yazi/nicole-l-ben-son-kadin-nesneyim", permanent: true },
      { source: "/ozan-sagdicin-fotografcinin-tanikligi-sergisi", destination: "/icerikler/yazi/ozan-sagdicin-fotografcinin-tanikligi-sergisi", permanent: true },
      { source: "/ozel-bir-deneyim-dubai-gelecek-muzesi", destination: "/icerikler/yazi/ozel-bir-deneyim-dubai-gelecek-muzesi", permanent: true },

      // P-S
      { source: "/payam-latifi-ile-dusler-diyarinda", destination: "/icerikler/yazi/payam-latifi-ile-dusler-diyarinda", permanent: true },
      { source: "/pompeiide-truva-savasi-suslemelerinin-bulundugu-yemek-salonu-ortaya-cikarildi", destination: "/icerikler/yazi/pompeiide-truva-savasi-suslemelerinin-bulundugu-yemek-salonu-ortaya-cikarildi", permanent: true },
      { source: "/ronesansi-hazirlayan-teknik-gelismeler", destination: "/icerikler/yazi/ronesansi-hazirlayan-teknik-gelismeler", permanent: true },
      { source: "/saman-sembolleri", destination: "/icerikler/yazi/saman-sembolleri", permanent: true },
      { source: "/sanat-kimin-icin", destination: "/icerikler/yazi/sanat-kimin-icin", permanent: true },
      { source: "/sanat-yoktur-sanatci-vardir", destination: "/icerikler/yazi/sanat-yoktur-sanatci-vardir", permanent: true },
      { source: "/sanatin-tekel-yonetimi", destination: "/icerikler/yazi/sanatin-tekel-yonetimi", permanent: true },
      { source: "/saticinin-olumu", destination: "/icerikler/yazi/saticinin-olumu", permanent: true },
      { source: "/saturnun-ipinde-yuruyenler-korku-hafiza-ve-olum-uzerine-bir-masal", destination: "/icerikler/yazi/saturnun-ipinde-yuruyenler-korku-hafiza-ve-olum-uzerine-bir-masal", permanent: true },
      { source: "/sessizce-yasamaya-calisanlar", destination: "/icerikler/yazi/sessizce-yasamaya-calisanlar", permanent: true },
      { source: "/sinema-oluyor-mu", destination: "/icerikler/yazi/sinema-oluyor-mu", permanent: true },
      { source: "/soylenmeyeni-afsadda-kesfedin", destination: "/icerikler/yazi/soylenmeyeni-afsadda-kesfedin", permanent: true },

      // T-Y
      { source: "/tarot-destesinin-gizemli-kadini", destination: "/icerikler/yazi/tarot-destesinin-gizemli-kadini", permanent: true },
      { source: "/tarihte-ilk-kez-bir-papa-venedik-bienalini-ziyaret-etti", destination: "/icerikler/yazi/tarihte-ilk-kez-bir-papa-venedik-bienalini-ziyaret-etti", permanent: true },
      { source: "/turk-sanatinda-islamiyet-sonrasi-buyuk-degisim-bilinmeyenler", destination: "/icerikler/yazi/turk-sanatinda-islamiyet-sonrasi-buyuk-degisim-bilinmeyenler", permanent: true },
      { source: "/yalniz-cerceve", destination: "/icerikler/yazi/yalniz-cerceve", permanent: true },
      { source: "/yalniz-kadin-dario-fo", destination: "/icerikler/yazi/yalniz-kadin-dario-fo", permanent: true },
      { source: "/yalnizlik-agi", destination: "/icerikler/yazi/yalnizlik-agi", permanent: true },
      { source: "/yalnizlik-istikameti-rota-yeniden-olusturuluyor", destination: "/icerikler/yazi/yalnizlik-istikameti-rota-yeniden-olusturuluyor", permanent: true },
      { source: "/yikik-kente-ozlem-bir-antakya-anlatisi", destination: "/icerikler/yazi/yikik-kente-ozlem-bir-antakya-anlatisi", permanent: true },

      // ═══════════════════════════════════════════════════════
      // 2. SAYFALAR
      // ═══════════════════════════════════════════════════════
      { source: "/atolye-seminer", destination: "/atolyeler", permanent: true },
      { source: "/kultur-sanat", destination: "/icerikler/kultur-sanat", permanent: true },
      { source: "/kulturel-miras", destination: "/icerikler", permanent: true },
      { source: "/kent-yasam", destination: "/icerikler/kent-yasam", permanent: true },
      { source: "/odak", destination: "/icerikler/odak", permanent: true },
      { source: "/soylesi", destination: "/icerikler", permanent: true },
      { source: "/zihin-oyun", destination: "/testler", permanent: true },
      { source: "/sanat-ve-estetik-testi", destination: "/testler", permanent: true },
      { source: "/e-bulten", destination: "/", permanent: true },
      { source: "/kanal", destination: "/", permanent: true },
      { source: "/rehber", destination: "/", permanent: true },
      { source: "/ajanda", destination: "/etkinlikler", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/ornek-sayfa", destination: "/", permanent: true },

      // ═══════════════════════════════════════════════════════
      // 3. İZLEME PANELLERİ → Loca
      // ═══════════════════════════════════════════════════════
      { source: "/caravaggio-izleme-paneli", destination: "/club/giris", permanent: true },
      { source: "/modern-sanat-atolyesi-izleme-paneli", destination: "/club/giris", permanent: true },
      { source: "/kapsamli-sanat-tarihi-atolyesi-izleme-paneli", destination: "/club/giris", permanent: true },
      { source: "/ronesans-atolyesi-izleme-paneli", destination: "/club/giris", permanent: true },
      { source: "/sanat-tarihinde-duygular-izleme-paneli", destination: "/club/giris", permanent: true },
      { source: "/ronesans-izleme-odasi", destination: "/club/giris", permanent: true },
      { source: "/ozbekistan-masterclass", destination: "/atolyeler", permanent: true },

      // ═══════════════════════════════════════════════════════
      // 4. ÜYELİK / GİRİŞ / HESAP
      // ═══════════════════════════════════════════════════════
      { source: "/klemense-katil", destination: "/club/giris", permanent: true },
      { source: "/membership-thankyou", destination: "/club/profil", permanent: true },
      { source: "/membership-pricing", destination: "/atolyeler", permanent: true },
      { source: "/my-account/:path*", destination: "/club/giris", permanent: true },
      { source: "/lost-password", destination: "/club/giris", permanent: true },
      { source: "/registration", destination: "/club/giris", permanent: true },
      { source: "/login", destination: "/club/giris", permanent: true },
      { source: "/hesabim", destination: "/club/giris", permanent: true },
      { source: "/sepet", destination: "/club/giris", permanent: true },
      { source: "/cart", destination: "/club/giris", permanent: true },
      { source: "/checkout", destination: "/club/giris", permanent: true },
      { source: "/odeme", destination: "/club/giris", permanent: true },

      // ═══════════════════════════════════════════════════════
      // 5. ÜRÜNLER
      // ═══════════════════════════════════════════════════════
      { source: "/urun/:path*", destination: "/atolyeler", permanent: true },
      { source: "/product/:path*", destination: "/atolyeler", permanent: true },
      { source: "/shop", destination: "/atolyeler", permanent: true },
      { source: "/magaza", destination: "/atolyeler", permanent: true },
      { source: "/urun-kategori/:path*", destination: "/atolyeler", permanent: true },

      // ═══════════════════════════════════════════════════════
      // 6. KATEGORİLER
      // ═══════════════════════════════════════════════════════
      { source: "/category/kultur-sanat", destination: "/icerikler/kultur-sanat", permanent: true },
      { source: "/category/kent-yasam", destination: "/icerikler/kent-yasam", permanent: true },
      { source: "/category/odak", destination: "/icerikler/odak", permanent: true },
      { source: "/category/soylesi", destination: "/icerikler", permanent: true },
      { source: "/category/genel", destination: "/icerikler", permanent: true },
      { source: "/category/anasayfa", destination: "/", permanent: true },
      { source: "/category/:path*", destination: "/icerikler", permanent: true },

      // ═══════════════════════════════════════════════════════
      // 7. YASAL SAYFALAR
      // ═══════════════════════════════════════════════════════
      { source: "/gizlilik-ve-guvenlik", destination: "/", permanent: true },
      { source: "/satis-sozlesmesi", destination: "/", permanent: true },
      { source: "/iptal-ve-iade-kosullari", destination: "/iade-ve-iptal", permanent: true },

      // ═══════════════════════════════════════════════════════
      // 8. ESKİ / GEREKSİZ
      // ═══════════════════════════════════════════════════════
      { source: "/saskin-oyunbazin-okuma-macerasi", destination: "/icerikler", permanent: true },
      { source: "/sanatin-tekel-yonetimi-2", destination: "/icerikler/yazi/sanatin-tekel-yonetimi", permanent: true },
      { source: "/dijital-nostalji-tehlikesi-yapay-zeka-tarihi-fotograflarin-yerini-alabilir-mi-3", destination: "/icerikler/yazi/dijital-nostalji-tehlikesi-yapay-zeka-tarihi-fotograflarin-yerini-alabilir-mi", permanent: true },
      { source: "/klemens-club", destination: "/club/giris", permanent: true },
      { source: "/wp-content/:path*", destination: "/", permanent: true },
      { source: "/download", destination: "/", permanent: true },
      { source: "/etn_category/:path*", destination: "/etkinlikler", permanent: true },
      { source: "/etn-tags/:path*", destination: "/etkinlikler", permanent: true },
      { source: "/etn-speaker-category/:path*", destination: "/etkinlikler", permanent: true },

      // WordPress yazar sayfaları
      { source: "/author/:path*", destination: "/hakkimizda", permanent: true },

      // WordPress checkout / step
      { source: "/step/:path*", destination: "/atolyeler", permanent: true },

      // WordPress video sayfaları
      { source: "/video-tag", destination: "/", permanent: true },
      { source: "/video-tag/:path*", destination: "/", permanent: true },
      { source: "/video-category", destination: "/", permanent: true },
      { source: "/video-category/:path*", destination: "/", permanent: true },
      { source: "/search-videos", destination: "/", permanent: true },

      // WordPress eski home / ajanda
      { source: "/home", destination: "/", permanent: true },
      { source: "/ajanda", destination: "/etkinlikler", permanent: true },
      { source: "/ajanda/:path*", destination: "/etkinlikler", permanent: true },

      // ═══════════════════════════════════════════════════════
      // 9. TARİH ARŞİVLERİ
      // ═══════════════════════════════════════════════════════
      { source: "/2016/:path*", destination: "/icerikler", permanent: true },
      { source: "/2024/:path*", destination: "/icerikler", permanent: true },
      { source: "/2025/:path*", destination: "/icerikler", permanent: true },
      { source: "/2026/:path*", destination: "/icerikler", permanent: true },

      // ═══════════════════════════════════════════════════════
      // 10. GENEL WORDPRESS KALIPLARI (en sona — wildcard)
      // ═══════════════════════════════════════════════════════
      { source: "/blog/:slug", destination: "/icerikler/yazi/:slug", permanent: true },
      { source: "/blog", destination: "/icerikler", permanent: true },
      { source: "/about", destination: "/hakkimizda", permanent: true },
      { source: "/about-us", destination: "/hakkimizda", permanent: true },
      { source: "/iletisim", destination: "/", permanent: true },
      { source: "/contact", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
