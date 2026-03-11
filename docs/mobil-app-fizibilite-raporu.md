# Klemens Art — Mobil Uygulama Fizibilite Raporu

**Tarih:** 11 Mart 2026
**Hazırlayan:** Claude Code (Opus 4.6)
**Kapsam:** Mevcut Next.js web uygulamasinin tamaminin mobil uygulamaya donusturulmesi

---

## 1. MEVCUT SİSTEM ENVANTERİ

### Genel Bilgiler

| Metrik | Deger |
|--------|-------|
| Framework | Next.js 16.1.6 (App Router) + TypeScript 5 + Tailwind CSS 4 |
| Toplam TypeScript/TSX | ~31.600 satir |
| Toplam dosya | 6.893 |
| Sayfa rota sayisi | 34 |
| API endpoint | 40+ |
| Client bilesen ("use client") | 50 adet |
| Server bilesen | geri kalan (cogunluk) |
| Public asset boyutu | 149 MB (220 dosya) |
| Markdown icerik | 90+ makale |
| E-posta sablonu | 11 adet |

### Dis Servisler

| Servis | Amac | Entegrasyon |
|--------|------|-------------|
| Supabase | Auth + PostgreSQL DB | @supabase/ssr v0.9.0 (implicit OAuth) |
| Google OAuth | Giris | Redirect: {origin}/auth/callback |
| PayTR | Odeme | HMAC-SHA256 imzali token + webhook |
| Bunny Stream | Video CDN | Library ID 596471, iframe embed |
| Resend | E-posta | resend@6.9.3 |
| Vercel Analytics | Analitik | @vercel/analytics + speed-insights |
| Anthropic Claude | AI icerik | @anthropic-ai/sdk (admin) |

---

## 2. TUM SAYFALAR — TEK TEK ANALİZ

### 2.1 Sunucu Bilesenler (Server Components) — Sorunsuz Tasinir

| Sayfa | Satir | Web API | Mobil Uyum |
|-------|-------|---------|------------|
| `/` (Ana Sayfa) | 48 | Yok (3 lazy bilesen) | MUKEMMEL |
| `/hakkimizda` | 48 | Yok | MUKEMMEL |
| `/harita/layout.tsx` | 153 | Yok (SEO JSON-LD) | MUKEMMEL |
| `/etkinlikler` | 92 | Yok (Supabase admin) | IYI |
| `/etkinlikler/[id]` | 280 | Yok (inline SVG) | IYI |
| `/icerikler` | 99 | Yok (Suspense) | MUKEMMEL |
| `/icerikler/[slug]` | 135 | Yok (SSG) | MUKEMMEL |
| `/icerikler/yazi/[slug]` | 111 | Yok (Markdown) | MUKEMMEL |
| `/atolyeler` | 90 | Yok (JSON-LD) | MUKEMMEL |
| `/testler` | 228 | Yok (inline SVG) | MUKEMMEL |
| `/kvkk` | ~150 | Yok | MUKEMMEL |
| `/iade-ve-iptal` | ~150 | Yok | MUKEMMEL |
| `/abonelik-iptal` | ~100 | Yok | MUKEMMEL |
| `/club/odeme/basarili` | 48 | Yok | MUKEMMEL |
| `/club/odeme/basarisiz` | 47 | Yok | MUKEMMEL |

**Sonuc:** 15 sayfa sorunsuz tasinir. Toplam ~1.770 satir.

---

### 2.2 Client Bilesenler — Adaptasyon Gerekir

#### `/club/giris` (Login) — 170 satir
- **Web API:** `location.origin` (2 yer — OAuth redirect URL icin)
- **Durum:** useState (email, loading, error, success, googleLoading)
- **Mobil Sorun:** `location.origin` deep link ile degismeli
- **Zorluk:** DUSUK — 1-2 gun

#### `/club/profil` (Profil) — 926 satir (EN BUYUK DOSYA)
- **Web API:** useRouter, useCallback, useEffect, Date (tr-TR locale)
- **Durum:** 15+ useState (user, loading, tabs, workshops, videos, gamification)
- **Alt Bilesenler:** VideoModal (Escape key listener), Badge, ProgressBar, PdfButton, SessionList
- **Animasyon:** animate-spin, transition-all, rotate-180
- **Mobil Sorun:** Modal sistemi, iframe video player, tab navigation
- **Zorluk:** ORTA — 3-5 gun

#### `/auth/callback` (OAuth Callback) — 42 satir
- **Web API:** Supabase onAuthStateChange, router navigation
- **Mobil Sorun:** Hash fragment (#access_token) okuma, deep link
- **Zorluk:** DUSUK — 1 gun (PKCE flow'a geciste dahil)

#### `/club/odeme/[workshopId]` (Odeme) — 250 satir
- **Web API:**
  - `document.createElement("script")` — PayTR JS SDK yukleme
  - `window.iFrameResize` — PayTR iframe boyutlandirma
  - `useRef` — iframe DOM erisimi
- **Mobil Sorun:** PayTR iframe WebView gerektiriyor, script injection
- **Zorluk:** ORTA — 3-5 gun (WebView ile cozulur)

#### `/testler/gorsel-algi` (Gorsel Algi Testi) — 278 satir
- **Web API:** `window.scrollTo()`, setTimeout
- **Durum:** Quiz faz yonetimi (intro, quiz, result), cevap gecmisi
- **Animasyon:** cubic-bezier, fade in/out, scale transition
- **Mobil Sorun:** Minimal — scrollTo yerine ScrollView kullanilir
- **Zorluk:** DUSUK — 2 gun

---

### 2.3 KRITIK SAYFALAR — Ciddi Yeniden Yazim

#### `/harita` (Kultur Haritasi) — 1.400+ satir
**Mevcut Ozellikler:**
- Leaflet.js interaktif harita (90+ mekan, 13 rota)
- Custom HTML marker'lar (divIcon ile inline SVG + glow animasyonu)
- Tile layer switching (gunduz Voyager / gece Dark)
- Rota polyline'lari + ozel efektler (xray, noir, neon, rock, grayscale)
- Geolocation (watchPosition — surekli konum takibi)
- GPS check-in sistemi (200m yaricap, haversine)
- Rozet + unvan + yildiz sistemi
- Mekan yorumlari (5+ yildiz kullanicilara)
- Draggable bottom sheet (mobile panel)
- Etkinlik entegrasyonu (mekana yaklaşan etkinlikler)

**Kullanilan Web API'lari:**
```
- import("leaflet") — dinamik import
- Leaf.map(container) — DOM'a map baglama
- Leaf.divIcon({ html: `...` }) — HTML marker'lar
- Leaf.tileLayer() — tile katmani
- Leaf.polyline() — rota cizimi
- Leaf.circle() — accuracy circle
- Leaf.marker().bindPopup() — popup
- map.locate() — konum bulma
- map.flyTo() — animasyonlu hareket
- map.fitBounds() — sinir ayari
- map.latLngToContainerPoint() — koordinat donusumu
- navigator.geolocation.watchPosition() — surekli GPS
- document.createElement("style") — CSS injection
- document.createElement("link") — Leaflet CSS yukleme
- container.querySelector(".leaflet-tile-pane") — DOM sorgusu
```

**Mobil Donusum:**

| Web Ozelligi | React Native Karsiligi | Zorluk |
|-------------|------------------------|--------|
| Leaflet harita | react-native-maps (MapView) | ORTA |
| Custom HTML divIcon | Custom Marker + SVG | ORTA |
| Tile switching (dark/light) | Google Maps customMapStyle JSON | KOLAY |
| Rota polyline | Polyline bilesen | KOLAY |
| Rota efektleri (neon, xray, noir) | Animated SVG overlay veya Lottie | ZOR |
| Geolocation watchPosition | expo-location watchPositionAsync | KOLAY |
| Check-in (200m GPS) | expo-location + haversine (ayni kod) | KOLAY |
| Bottom sheet panel | @gorhom/bottom-sheet | KOLAY |
| Marker glow animasyonu | react-native-reanimated | ORTA |
| Etkinlik kartlari | FlatList + custom card | KOLAY |

**Tahmini Sure:** 3-4 hafta (efektler basitlestirilirse), 5-6 hafta (tam parite)

---

#### `/sergi/en-sessiz-zaman` (3D Sergi) — 1.647 satir

**Arsitektur:**
- Three.js tam 3D galeri (70m x 18m koridor)
- 21 eser (Afrodisias, Aizanoi, Catalhoyuk, Sagalassos vb.)
- FPS kamera kontrolu (WASD + mouse/touch)
- Momentum bazli hareket + head bob
- Proximity detection (raycasting ile en yakin eser)
- Slideshow modu (eser yakininda)

**3D Nesneler:**
- Floor: Procedural canvas texture (512x512, 8x8 blok grid)
- Walls: Procedural plaster texture (3.000 noise dot)
- Ceiling: Dark absorber
- 21x Frame: BoxGeometry (5.0x2.0x0.15m) — paylasilan geometri
- 21x Passepartout: Canvas texture (grain + vignette)
- 21x Canvas: PlaneGeometry (4.6x1.8m) — texture-mapped
- 21x Label: Canvas-rendered text
- Mimari detay: Surtme, tavan pervazi, pilaster, aydinlatma rayi

**Web Audio API:**
- AudioContext + BiquadFilter (bandpass 300-500 Hz)
- Procedural ayak sesi (noise buffer)
- Ambient ses opsiyonu

**Mobil Optimizasyon (MEVCUT):**
- `antialias: !mobile`
- `pixelRatio: Math.min(dpr, mobile ? 1.5 : 2)`
- `shadowMap.enabled: !mobile`
- Touch detection: `"ontouchstart" in window`

**Mobil Donusum Secenekleri:**

| Secenek | Aciklama | Sure | Kalite |
|---------|----------|------|--------|
| A) expo-three + expo-gl | Three.js'i React Native'de calistir | 4-6 hafta | %80 |
| B) react-native-webview | Mevcut web kodu WebView'da | 1 hafta | %60 (performans kotu) |
| C) 2D Galeri | Foto galeri + swipe + ses | 2 hafta | %40 (farkli deneyim) |
| D) Unity/Unreal embed | Profesyonel 3D motor | 8-12 hafta | %100 |

**Oneri:** Faz 1'de WebView wrapper (B), Faz 2'de expo-three (A)

---

#### `/oyun/sanat-tahmini` (Sanat Tahmin Oyunu) — 1.265 satir

**Oyun Mekanigi:**
- 4 eser (Mona Lisa, Yildizli Gece, Atina Okulu, Ciglik)
- 3D galeri (24x18m oda, Three.js)
- FPS kamera kontrolu (WASD + mouse)
- Proximity bazli quiz paneli
- 4 secenekli coktan secmeli
- Ipucu sistemi (yarim puan)
- Skor: dogru=1, ipuculu dogru=0.5, yanlis=0

**3D Nesneler:**
- Floor: Procedural stone (512x512)
- Walls: Procedural concrete (256x256)
- 4x Frame: BoxGeometry (3.6x2.6x0.08m)
- 4x Canvas: PlaneGeometry (3.2x2.2m)
- 4x Label: Canvas-rendered (512x80)
- Gallery title: Canvas texture (1024x512)
- Aydinlatma: Ambient 1.8 + DirectionalLight 0.5

**Mobil Donusum:** Sergi ile ayni secenekler gecerli. 2D alternatifte quiz mantigi ayni kalir, sadece 3D galeri yerine foto/swipe UI olur.

---

## 3. TUM BILESENLER ANALİZİ

### Layout & Navigation

| Bilesen | Satir | "use client" | Web API | Mobil Uyum |
|---------|-------|-------------|---------|------------|
| Navbar.tsx | 190 | EVET | window.scrollY, addEventListener | IYI (hamburger mevcut) |
| Footer.tsx | 82 | Hayir | Yok | MUKEMMEL |
| Hero.tsx | 69 | Hayir | Yok (framer-motion lazy) | IYI |

### Gorsel Bilesenler

| Bilesen | Satir | "use client" | Web API | Mobil Uyum |
|---------|-------|-------------|---------|------------|
| SynapseNetwork.tsx | 229 | EVET | Yok (pure SVG + framer-motion) | ORTA (lg altinda gizli) |
| HaritaBanner.tsx | 199 | EVET | Canvas API, requestAnimationFrame, window.innerWidth | ZOR (canvas yeniden yazilmali) |
| CountdownTimer.tsx | 83 | EVET | setInterval, Date | KOLAY |
| ArticleCard.tsx | 88 | Hayir | Yok | MUKEMMEL |

### Icerik Bilesenleri

| Bilesen | Satir | "use client" | Web API | Mobil Uyum |
|---------|-------|-------------|---------|------------|
| Hizmetler.tsx | 114 | Hayir | Yok | MUKEMMEL |
| Etkinlikler.tsx | 146 | Hayir | Supabase server | MUKEMMEL |
| Manifesto.tsx | 85 | Hayir | Yok | MUKEMMEL |
| IceriklerSection.tsx | 127 | Hayir | Yok | MUKEMMEL |
| ArticleReader.tsx | ~100 | EVET | window.location (paylasim) | IYI |
| HakkimizdaClient.tsx | 610 | EVET | Yok (framer-motion) | IYI |
| Bulten.tsx | ~80 | EVET | Yok (form) | MUKEMMEL |
| SatinAlButton.tsx | 66 | EVET | Supabase, router | IYI |
| DunyamiziBolum.tsx | ~100 | Hayir | document.getElementById (scroll) | IYI |

### Admin Bilesenleri (dusuk oncelik — mobilde gerekli degil)

| Bilesen | Satir | Web API | Mobil Uyum |
|---------|-------|---------|------------|
| TiptapEditor.tsx | 970 | File API, Canvas, DOM | ZOR |
| AdminShell.tsx | 218 | Yok | ORTA |
| Design Studio (5+ dosya) | 1.200+ | Konva.js, Canvas API | COK ZOR |

---

## 4. TUM API ROUTE'LARI

### Herkese Acik (Public)

| Endpoint | Metod | Satir | Islem |
|----------|-------|-------|-------|
| `/api/subscribe` | POST | ~50 | Newsletter kayit |
| `/api/unsubscribe` | POST | ~40 | Abonelik iptal |
| `/api/scraper` | POST | ~100 | Etkinlik tarama |

### Harita (Gamification)

| Endpoint | Metod | Satir | Islem |
|----------|-------|-------|-------|
| `/api/harita/check-in` | POST | 188 | GPS dogrulama + rozet + yildiz |
| `/api/harita/stats` | GET | ~70 | Kullanici istatistikleri |
| `/api/harita/reviews` | GET/POST | ~100 | Yorum okuma/yazma |

### Odeme

| Endpoint | Metod | Satir | Islem |
|----------|-------|-------|-------|
| `/api/payment/create-token` | POST | 128 | PayTR HMAC token olusturma |
| `/api/payment/callback` | POST | 122 | PayTR webhook (odeme dogrulama) |

### Auth

| Endpoint | Metod | Satir | Islem |
|----------|-------|-------|-------|
| `/api/auth/migrate-purchases` | POST | ~80 | Satin alma goci |

### Webhook

| Endpoint | Metod | Satir | Islem |
|----------|-------|-------|-------|
| `/api/webhooks/resend` | POST | ~50 | E-posta servisi webhook |

### Cron

| Endpoint | Metod | Satir | Islem |
|----------|-------|-------|-------|
| `/api/cron/curate` | GET | ~80 | CRON_SECRET ile icerik kurasyonu |

### Admin (25+ endpoint — tumu isAdmin() kontrollu)

Makaleler, etkinlikler, kullanicilar, atolyeler, tasarimlar, newsletter, aboneler, istatistik, tarayici, kurasyon, upload vb.

**ONEMLI:** Tum API route'lari HTTP endpoint olarak mobil uygulamadan dogrudan cagrilabilir. Backend degisikligi GEREKMEZ.

---

## 5. YARDIMCI MODULLER (src/lib/)

| Dosya | Satir | Server/Shared | RN Uyumlu | Not |
|-------|-------|---------------|-----------|-----|
| supabase.ts | 15 | Shared (browser) | EVET (adaptasyon) | implicit flow → PKCE |
| supabase-server.ts | 30 | Server-only | HAYIR (next/headers) | API route'larda kalir |
| supabase-admin.ts | 14 | Server-only | HAYIR (service role) | API route'larda kalir |
| admin-check.ts | ~20 | Server-only | HAYIR | API route'larda kalir |
| harita-data.ts | 500+ | Shared | EVET (%100) | PLACES, ROUTES verisi |
| harita-gamification.ts | 130 | Shared | EVET (%100) | slug, haversine, rank, badge |
| icons.tsx | 196 | Shared | EVET (%90) | SVG → react-native-svg |
| category-styles.ts | 46 | Shared | EVET (Tailwind → StyleSheet) | Renk haritasi |
| atolyeler-config.ts | 64 | Shared | EVET (%100) | Atolye konfigurasyonu |
| markdown.ts | 257 | Shared | KISMEN | YouTube embed, HTML islem |
| icerikler.ts | 144 | Server | HAYIR (admin client) | API route uzerinden |
| send-thank-you.ts | 34 | Server | HAYIR (Resend) | API route'da kalir |

**Yeniden Kullanim Orani:** Shared moduller ~%70 dogrudan kullanilabilir.

---

## 6. GLOBAL STILLER VE ANİMASYONLAR

### Tailwind Tema (globals.css — 325 satir)

```
--color-coral: #FF6D60
--color-cream: #FFFBF7
--color-brand-dark: #2D2926
--color-brand-warm: #8C857E
--color-brand-light: #F5F0EB
```

### Animasyonlar

| Animasyon | Sure | Kullanim | RN Karsiligi |
|-----------|------|----------|--------------|
| float-a | 14s | blob hareket | Animated.loop |
| float-b | 18s | blob hareket | Animated.loop |
| spin-slow | 32s | donen orb | Animated.loop + rotate |
| fade-up (0-4) | 0.75s | giris animasyonu | Animated.timing + translateY |
| bounce-y | 2.5s | ziplayan ok | Animated.sequence |
| livePulse | 1.5s | opacity pulse | Animated.loop + opacity |

### Prose Stilleri (.prose-klemens)
- Tipografi: 18px body, 22px/700 h2
- Ozel elemanlar: spot-quote, warning-box, inline-quote, durak-block, oneri-block
- YouTube embed: 16:9 container
- **Mobilde:** react-native-render-html veya WebView ile gosterilir

---

## 7. KONFİGURASYON

### next.config.ts
- 240+ yonlendirme kurali (WordPress legacy URL'ler)
- Gorsel: AVIF + WebP, Supabase remote pattern
- Experimental: framer-motion optimize

### Middleware (54 satir)
- WordPress URL yonlendirme
- Supabase session refresh
- Protected route'lar (/club/profil, /club/giris)
- **Mobilde:** React Navigation guard ile karslanir

---

## 8. ODEME AKISI — TAM ANALIZ

```
Kullanici "Satin Al" tiklar
    |
    v
1. Frontend: /club/odeme/[workshopId]
   - Tutar ve kayit son tarihi kontrolu
   - /api/payment/create-token cagrilir

2. Backend: /api/payment/create-token (128 satir)
   - merchant_oid = "KLM" + timestamp + 4 hex
   - HMAC-SHA256 imza:
     hashStr = merchant_id + user_ip + merchant_oid + email
             + payment_amount + user_basket + ... + merchant_salt
     paytr_token = HMAC-SHA256(hashStr, merchant_key).base64
   - PayTR API: https://www.paytr.com/odeme/api/get-token
   - payment_intents tablosuna kayit
   - Return: { token, merchant_oid }

3. Frontend: PayTR iframe odeme formu
   - Kart/odeme yontemi secimi
   - Basari → /club/odeme/basarili
   - Basarisiz → /club/odeme/basarisiz

4. Backend: /api/payment/callback (122 satir)
   - PayTR webhook (form-encoded POST)
   - HMAC dogrulama:
     expected = HMAC-SHA256(merchant_oid + salt + status + amount, key)
   - Basarili ise:
     * purchases tablosuna kayit (6 ay gecerlilik)
     * Tesekkur e-postasi gonder
     * payment_intents sil
   - Return: "OK"
```

**Mobil Icin:** PayTR iframe WebView icerisinde acilir. Deep link ile basari/basarisizlik sayfasina yonlendirilir. Backend degismez.

---

## 9. AUTH AKISI — TAM ANALIZ

### Mevcut (Web — Implicit Flow)

```
1. Kullanici "Google ile Giris" tiklar
2. Supabase OAuth URL'e redirect
3. Google giris ekrani
4. Basarili → {origin}/auth/callback#access_token=xxx
5. onAuthStateChange("SIGNED_IN") tetiklenir
6. Token cookie'ye yazilir
7. /club/profil'e yonlendirilir
```

### Mobil Icin Gerekli Degisiklikler

```
1. Implicit flow → PKCE flow'a gecis
2. OAuth redirect → Deep link (klemensart://auth/callback)
3. Cookie → SecureStore (expo-secure-store)
4. Supabase client config:
   - AsyncStorage adapter
   - Custom URL scheme
5. Info.plist (iOS) + AndroidManifest (Android):
   - URL scheme: klemensart://
   - Universal links: klemensart.com/auth/callback
```

**Tahmini Sure:** 1-2 hafta

---

## 10. ADMIN PANELİ — DETAY

| Sayfa | Satir | Ozellikler |
|-------|-------|------------|
| Dashboard | 169 | 4 istatistik karti + hizli islemler |
| Icerikler | 236 | Tablo, 50/sayfa, yayinla/taslak, sil |
| Etkinlikler | 305 | 3 sekme (bekleyen/onaylanan/reddedilen), AI yorum |
| Kullanicilar | 558 | Arama, detay modal, atolye/video ata, rol yonetimi |
| Atolyeler | 13 | Placeholder "Yakinda" |
| Tasarim | ? | Konva.js canvas editoru |
| Aboneler | ? | CSV import, segment |
| Bulten | ? | Kampanya olustur/gonder, onizleme |
| Arsiv | ? | Arsivlenmis icerikler |

**Rol Sistemi:**
- `admin`: Tam erisim
- `editor`: Sadece Icerikler

**KARAR:** Admin paneli mobil uygulamaya dahil edilmemeli. Web'de kalsin. Gerekirse gelecekte basitleftirilmis bir mobil admin eklenebilir.

---

## 11. E-POSTA SİSTEMİ

11 sablon, React Email ile render, Resend ile gonderim. Tamamen server-side. Mobil uygulamayi ETKILEMEZ.

---

## 12. MoBİL DONUSUM STRATEJİSİ

### Secenek A: React Native + Expo (ONERILEN)

**Avantajlar:**
- Hizli gelistirme (hot reload, OTA update)
- expo-location (GPS), expo-av (video), expo-secure-store (auth)
- react-native-maps (Google/Apple Maps)
- @gorhom/bottom-sheet (harita paneli)
- react-native-reanimated (animasyonlar)
- Tek codebase → iOS + Android
- Supabase'in resmi React Native destegi var

**Dezavantajlar:**
- 3D icin sinirli (expo-three var ama performans?)
- Bazi native moduller ek konfigrasyon
- Build suresi Expo EAS'ta 10-20 dk

### Secenek B: WebView Wrapper (Capacitor/Ionic)

**Avantajlar:**
- 2-3 haftada store'a cik
- Mevcut kodu neredeyse oldugu gibi kullan
- Harita dahil her sey calisir (web tarayicida)

**Dezavantajlar:**
- Performans KOTU (60fps degil, ~30fps)
- Native his YOK
- Harita kaydirma laggy
- App Store red riski ("bu bir web wrapper")
- Push notification zorlu

### Secenek C: Flutter

**Avantajlar:**
- En iyi native performans
- google_maps_flutter paketi mukemmel
- Kendi render motoru (Skia) → tutarli goruntu

**Dezavantajlar:**
- Dart dili — mevcut TypeScript kodu yeniden yazilmali
- Supabase Flutter SDK daha az olgun
- Gelistirici bulmak zor (TR'de)
- Sifirdan yazim

**KARAR: Secenek A (React Native + Expo)**
- Mevcut TypeScript/JS bilgisi transferi
- En hizli time-to-market
- Harita icin yeterli

---

## 13. YENIDEN KULLANIM MATRİSİ

| Modul | Yeniden Kullanim | Aciklama |
|-------|------------------|----------|
| Tum API route'lari | %100 | HTTP endpoint, degismez |
| harita-gamification.ts | %100 | Pure TypeScript, platform bagimsiz |
| harita-data.ts | %100 | Veri dosyasi, platform bagimsiz |
| TypeScript tipleri | %100 | Ayni tipler kullanilir |
| Is mantigi (rozet, unvan, mesafe) | %100 | Platform bagimsiz |
| icons.tsx | %90 | SVG → react-native-svg donusumu |
| category-styles.ts | %80 | Tailwind → StyleSheet donusumu |
| atolyeler-config.ts | %100 | Veri dosyasi |
| Supabase client | %70 | AsyncStorage + PKCE adaptasyonu |
| UI bilesenleri | %0 | Tamamen yeniden yazilmali |
| CSS/Tailwind | %0 | RN StyleSheet'e donusturulmeli |
| Markdown islem | %50 | react-native-render-html ile |

---

## 14. FAZ FAZ UYGULAMA PLANI

### FAZ 1 — Temel (Hafta 1-4)

| Hafta | Is | Cikti |
|-------|-----|-------|
| 1 | Expo proje setup, navigation (React Navigation), tema, font | Iskelet app |
| 2 | Auth: Supabase PKCE + Google OAuth + deep link + SecureStore | Giris/cikis calisiyor |
| 3 | Icerik sayfalari: Ana sayfa, hakkimizda, icerikler, etkinlikler | Okunakilir icerik |
| 4 | Atolyeler listesi, atolye detay, profil (Loca tab) | Satin alinan icerikler gorunur |

### FAZ 2 — Harita (Hafta 5-8) *** CRITICAL ***

| Hafta | Is | Cikti |
|-------|-----|-------|
| 5 | react-native-maps setup, PLACES marker'lari, filtre UI | Temel harita |
| 6 | Info panel (bottom-sheet), etkinlik kartlari, yol tarifi | Mekan detay paneli |
| 7 | GPS check-in, rozet sistemi, unvan UI, ziyaret isaretleri | Gamification calisiyor |
| 8 | Rota modu, polyline, durak paneli, rota check-in | Rotalar calisiyor |

**Not:** Rota efektleri (neon, noir, xray) bu fazda BASITLESTIRILIR. Polyline renk + dash pattern yeterli.

### FAZ 3 — Odeme & Video (Hafta 9-10)

| Hafta | Is | Cikti |
|-------|-----|-------|
| 9 | PayTR WebView entegrasyonu, deep link redirect | Odeme calisiyor |
| 10 | Video player (expo-av veya react-native-video), profil Kesflerim tab | Video + profil tam |

### FAZ 4 — Ekstralar (Hafta 11-13)

| Hafta | Is | Cikti |
|-------|-----|-------|
| 11 | Testler (gorsel algi), newsletter kayit | Testler calisiyor |
| 12 | Push notification (expo-notifications), offline cache | Bildirimler aktif |
| 13 | 3D sergi WebView wrapper VEYA 2D galeri | Sergi deneyimi |

### FAZ 5 — Polish & Yayinlama (Hafta 14-16)

| Hafta | Is | Cikti |
|-------|-----|-------|
| 14 | Performance optimizasyonu, cihaz testi (iPhone SE → iPad, eski Android) | Stabil performans |
| 15 | App Store Connect + Google Play Console, asset hazirligi, store gorselleri | Store hazir |
| 16 | Beta test (TestFlight + Internal Testing), bug fix, store submit | STORE'DA |

---

## 15. RİSK MATRİSİ

| Risk | Olasilik | Etki | Azaltma |
|------|----------|------|---------|
| Leaflet → react-native-maps gecisi beklenenden zor | ORTA | YUKSEK | Hafta 5'te prototype, erken test |
| PayTR mobil WebView'da calismaz | DUSUK | YUKSEK | Stripe/iyzico alternatifi hazir tut |
| Three.js 3D dusuk performans | YUKSEK | ORTA | WebView fallback veya 2D galeri |
| OAuth deep link iOS'ta problem | ORTA | YUKSEK | Universal Links + fallback |
| App Store red (icerik politikasi) | DUSUK | YUKSEK | Review guidelines kontrol |
| 149 MB asset boyutu (bundle) | YUKSEK | ORTA | CDN'den lazy load, bundle'a EKLEME |
| Rota efektleri (neon/noir) kayip | KESIN | DUSUK | Farkli ama guzel native animasyonlar |
| iOS konum izni reddedilir | ORTA | ORTA | Graceful degradation, check-in devre disi |

---

## 16. MALİYET TAHMİNİ

### Solo Gelistirici (Sen)

| Kalem | Sure | Not |
|-------|------|-----|
| Toplam gelistirme | 14-16 hafta | Tam zamanli |
| Apple Developer hesabi | $99/yil | App Store icin zorunlu |
| Google Play hesabi | $25 (tek seferlik) | Play Store icin zorunlu |
| Expo EAS Build | $0-29/ay | Free tier yeterli baslangic icin |
| Test cihazlari | Mevcut | iPhone + Android telefon |

### Dis Kaynak (2 Gelistirici + 1 QA)

| Kalem | Sure | Tahmini Maliyet |
|-------|------|----------------|
| Toplam gelistirme | 8-10 hafta | Ekip hizina bagli |
| QA & Test | 2 hafta | Paralel calisir |

---

## 17. KARAR OZETI

### Yapilabilir mi?
**EVET.** Teknik olarak tamamen mumkun.

### Ne kadar is?
**14-16 hafta** (solo, tam zamanli)

### En zor kisim?
1. **Harita** (3-4 hafta) — ama cozulebilir
2. **3D Sergi/Oyun** (karar noktasi: basitlestirilmeli)
3. **OAuth + Odeme** (2 hafta) — standart is

### Ne kaybolur?
- Rota efektleri (neon, noir, xray) → basitlesir ama farkli guzel olur
- 3D sergi → WebView veya 2D galeri (tam kalite icin +4-6 hafta)
- Admin paneli → web'de kalir
- WordPress redirect'leri → mobilde gereksiz

### Ne KAZANILIR?
- Push notification (mekana yaklasinca bildirim!)
- Arka planda konum takibi (walk & check-in)
- Native performans (60fps harita)
- Offline cache (internet olmadan icerik okuma)
- App Store/Play Store gorunurlugu
- Kamera entegrasyonu (gelecekte: AR deneyim, foto check-in)

---

## 18. SONRAKI ADIM

Bu raporu inceledikten sonra:

1. **Harita oncelikli mi, yoksa tum site mi?** — Sadece harita + profil + auth bir MVP olarak 6-8 haftada cikar.
2. **3D sergi ne olacak?** — WebView, 2D galeri, yoksa native 3D?
3. **Admin mobilde gerekli mi?** — Onerilen: Hayir.
4. **Butce/zaman siniri var mi?** — Buna gore faz plani ayarlanir.
