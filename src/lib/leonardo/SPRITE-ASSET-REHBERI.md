# Leonardo Sprite Sheet Asset Rehberi

## Genel Strateji

### Tutarlılık İçin Altın Kurallar
1. **Önce 1 referans kare üret** (idle frame 1) — tüm diğer kareler buna dayansın
2. **Aynı prompt yapısını koru** — sadece poz/ifade değişsin
3. **ChatGPT DALL-E** kullanıyorsan: aynı thread'de kal, "modify the previous image" de
4. **Midjourney** kullanıyorsan: `--sref` (style reference) ve `--cref` (character reference) kullan
5. **Flux** kullanıyorsan: img2img ile referans kareyi baz al

### Teknik Spesifikasyonlar
- **Kare boyutu:** 480×720px (2:3 oran)
- **Arka plan:** Koyu kahve, düz renk `#1a1714` (oyun arka planıyla uyumlu)
- **Karakter:** Belden yukarı, merkezde, kenarlardan en az 40px boşluk
- **Stil:** Dijital illüstrasyon, yarı-karikatür, sıcak renk paleti
- **Format:** PNG (şeffaf veya koyu arka plan), sonra WebP'ye çevrilecek

---

## 0. REFERANS KARE (İlk Önce Bunu Üret!)

Bu kare tüm animasyonların temelini oluşturur.

### ChatGPT / DALL-E Prompt:
```
A friendly, warm digital illustration of Leonardo da Vinci as a game character.
Half-body portrait (waist up), centered in frame.

Character details:
- Age ~55, long wavy silver-gray hair, neatly trimmed beard
- Wearing a rich brown Renaissance robe with golden trim
- A soft brown beret/cap
- Warm, wise eyes with slight smile lines
- Hands visible at waist level, relaxed pose

Style: Clean digital art, slightly stylized/cartoon proportions (not photorealistic),
warm color palette (browns, golds, creams), soft ambient lighting from upper left.

Background: Solid dark brown (#1a1714), no objects or textures.

Dimensions: 480x720 pixels, PNG format.
```

### Midjourney Prompt:
```
/imagine friendly Leonardo da Vinci game character, half-body portrait waist up,
long silver-gray wavy hair, trimmed beard, brown Renaissance robe with gold trim,
brown beret, warm wise expression, slight smile, hands visible at waist,
clean digital illustration style, warm browns and golds, soft lighting,
solid dark brown background #1a1714 --ar 2:3 --s 250 --style raw
```

> **ÖNEMLİ:** Bu kareyi kaydet. Bundan sonraki tüm prompt'larda referans olarak kullan.

---

## 1. IDLE — Nefes Alma & Göz Kırpma (6 kare)

Döngüsel, sakin bir bekleme animasyonu. Sürekli oynar.

| Kare | Açıklama | Prompt Farkı |
|------|----------|-------------|
| 1 | Nötr duruş, gözler açık | Referans kare ile aynı |
| 2 | Hafif göğüs yükselişi (nefes) | "slight inhale, chest slightly raised" |
| 3 | Göğüs tam yukarıda | "deep breath, chest fully risen, peaceful expression" |
| 4 | Göğüs iniyor | "exhaling, chest lowering, relaxed" |
| 5 | Göz kırpma başlangıcı | "eyes half-closed, gentle blink, relaxed pose" |
| 6 | Gözler kapalı | "eyes fully closed in a gentle blink, calm expression" |

### ChatGPT Seri Prompt:
```
(Referans kareyi yükle, sonra sırayla:)

"Create a variation of this Leonardo character. Everything identical except:
[KARE FARKI BURAYA]. Keep exact same outfit, proportions, background, and style."
```

### Midjourney (--cref ile):
```
/imagine Leonardo da Vinci game character, half-body, [KARE FARKI],
brown robe gold trim, brown beret, solid dark brown bg #1a1714,
digital illustration --ar 2:3 --cref [REFERANS_URL] --cw 100 --s 250
```

---

## 2. TALKING — Konuşma (8 kare)

Ağız açılıp kapanması + hafif el jesti. Sürekli döngü.

| Kare | Açıklama |
|------|----------|
| 1 | Ağız kapalı, sağ el göğüs hizasında |
| 2 | Ağız hafif açık, el yukarı hareket başlıyor |
| 3 | Ağız açık konuşma pozisyonu, el göğüs üstünde |
| 4 | Ağız yarı açık (ünlü harf), el hafif ileri |
| 5 | Ağız kapalı (ünsüz), el geri |
| 6 | Ağız açık, el tekrar yukarı |
| 7 | Ağız yarı açık, el aşağı dönüyor |
| 8 | Ağız kapalı, el başlangıç pozisyonuna dönüyor |

### Prompt Şablonu:
```
"Leonardo da Vinci game character speaking animatedly.
[KARE_DETAYI]
Right hand raised to chest level in an explanatory gesture.
Same outfit, proportions, and dark brown background as reference."
```

Kare detayları:
- Frame 1: `mouth closed, right hand resting near waist, about to speak`
- Frame 2: `mouth slightly open starting to speak, right hand rising`
- Frame 3: `mouth open mid-speech vowel sound, right hand at chest level palm up`
- Frame 4: `mouth wide open speaking passionately, hand extended forward slightly`
- Frame 5: `mouth closed briefly between words, hand pulling back`
- Frame 6: `mouth open again continuing speech, hand rising again`
- Frame 7: `mouth half-open finishing a word, hand lowering`
- Frame 8: `mouth closing, hand returning to rest position near waist`

---

## 3. HAPPY — Sevinç & Alkış (6 kare)

Tek seferlik animasyon, son karede kalır.

| Kare | Açıklama |
|------|----------|
| 1 | Şaşkınlık başlangıcı — kaşlar kalkar |
| 2 | Geniş gülümseme oluşuyor |
| 3 | Eller birbirine yaklaşıyor (alkış başlangıcı) |
| 4 | Eller bir araya gelmiş (alkış) |
| 5 | Eller hafif açılmış, yüzde neşeli ifade |
| 6 | Onaylayan gülümseme, baş hafif öne eğik (hold) |

### Prompt Şablonu:
```
"Leonardo da Vinci game character showing delight and approval.
[KARE_DETAYI]
Warm, proud expression like a teacher pleased with a student.
Same outfit, proportions, and dark brown background."
```

Kare detayları:
- Frame 1: `surprised raised eyebrows, eyes wide, mouth slightly open in pleasant surprise`
- Frame 2: `broad warm smile forming, eyes crinkling with joy`
- Frame 3: `hands coming together at chest level, about to clap, beaming smile`
- Frame 4: `hands pressed together in a single clap, joyful expression`
- Frame 5: `hands slightly apart after clap, proud happy expression`
- Frame 6: `gentle approving smile, head tilted slightly forward in a nod, hands relaxed`

---

## 4. SAD — Üzüntü (4 kare)

Tek seferlik, nazik bir hayal kırıklığı. Kırıcı değil, öğretici.

| Kare | Açıklama |
|------|----------|
| 1 | Hafif şaşkınlık — kaşlar hafif çatık |
| 2 | Omuzlar düşmeye başlıyor |
| 3 | Baş hafif yana eğik, üzgün ama şefkatli bakış |
| 4 | Hafif gülümsemeyle "olsun" ifadesi (hold) |

### Prompt Şablonu:
```
"Leonardo da Vinci game character showing gentle disappointment, NOT harsh.
[KARE_DETAYI]
Expression of a patient teacher, not angry.
Same outfit, proportions, and dark brown background."
```

Kare detayları:
- Frame 1: `slight surprise, eyebrows slightly furrowed, oh-no expression`
- Frame 2: `shoulders dropping slightly, sympathetic expression, looking down briefly`
- Frame 3: `head tilted to one side, compassionate sad eyes, gentle frown`
- Frame 4: `small encouraging half-smile despite disappointment, "it's okay" expression, slight head nod`

---

## 5. THINKING — Düşünme (6 kare)

Sürekli döngü. Sakal okşama + yukarı bakış.

| Kare | Açıklama |
|------|----------|
| 1 | Nötr bakış, sağ el çeneye yaklaşıyor |
| 2 | Sağ el sakalı tutuyor, bakış sola |
| 3 | Sakal okşama, bakış yukarı sola (düşünüyor) |
| 4 | Kaşlar hafif kalkmış, gözler yukarıda |
| 5 | Bakış tekrar düzleşiyor, el hâlâ sakalda |
| 6 | El aşağı iniyor, nötre dönüş |

### Prompt Şablonu:
```
"Leonardo da Vinci game character deep in thought, contemplating.
[KARE_DETAYI]
Scholarly, curious expression.
Same outfit, proportions, and dark brown background."
```

Kare detayları:
- Frame 1: `neutral gaze, right hand rising toward chin, beginning to think`
- Frame 2: `right hand stroking beard, eyes looking slightly to the left`
- Frame 3: `hand on beard stroking thoughtfully, eyes looking up and to the left, pondering`
- Frame 4: `eyebrows slightly raised in curiosity, eyes gazing upward, hand still on beard`
- Frame 5: `gaze returning to center, thoughtful half-smile, hand still near beard`
- Frame 6: `hand lowering from beard, returning to neutral contemplative expression`

---

## 6. POINTING — Esere İşaret Etme (6 kare)

Tek seferlik. Leonardo sağ eliyle bir şeye işaret ediyor.

| Kare | Açıklama |
|------|----------|
| 1 | Nötr duruş, bakış izleyiciye |
| 2 | Sağ kol yükselmeye başlıyor |
| 3 | Kol yarı uzanmış, işaret parmağı açılıyor |
| 4 | Kol tam uzanmış, sağa işaret ediyor |
| 5 | İşaret pozisyonunda, bakış işaret yönüne |
| 6 | İşaret pozisyonunda, bakış izleyiciye döndü, "bakın!" ifadesi (hold) |

### Prompt Şablonu:
```
"Leonardo da Vinci game character pointing at something off to the right.
[KARE_DETAYI]
Enthusiastic, inviting gesture like showing a masterpiece.
Same outfit, proportions, and dark brown background."
```

Kare detayları:
- Frame 1: `neutral stance, looking at viewer, hands at waist`
- Frame 2: `right arm beginning to rise, anticipatory expression`
- Frame 3: `right arm half-extended to the right, index finger starting to point`
- Frame 4: `right arm fully extended pointing to the right, index finger out, excited expression`
- Frame 5: `maintaining pointing pose, head turned to look in pointing direction`
- Frame 6: `still pointing right, but head turned back to viewer with an excited "look at this!" smile`

---

## 7. GREETING — Karşılama (6 kare)

Tek seferlik. Kollar açılarak sıcak karşılama.

| Kare | Açıklama |
|------|----------|
| 1 | Nötr duruş, hafif gülümseme |
| 2 | Kollar açılmaya başlıyor |
| 3 | Kollar yarı açık, gülümseme genişliyor |
| 4 | Kollar tam açık (hoş geldiniz pozu) |
| 5 | Kollar açık, baş hafif eğik (saygılı selam) |
| 6 | Kollar indiriliyor ama gülümseme devam ediyor (hold) |

### Prompt Şablonu:
```
"Leonardo da Vinci game character warmly welcoming the viewer.
[KARE_DETAYI]
Hospitable, grand welcoming gesture like inviting someone into his workshop.
Same outfit, proportions, and dark brown background."
```

Kare detayları:
- Frame 1: `standing with a slight warm smile, hands together at waist, welcoming expression`
- Frame 2: `arms beginning to open outward, smile growing`
- Frame 3: `arms half-open in welcoming gesture, broad warm smile`
- Frame 4: `arms fully spread open wide in a grand welcome, joyful beaming expression`
- Frame 5: `arms still open, head tilted slightly forward in a respectful bow, warm smile`
- Frame 6: `arms lowering to a comfortable position, maintaining warm welcoming smile, relaxed`

---

## Son İşlemler (Kareler Hazır Olunca)

### 1. Boyut Kontrolü
```bash
# Her kare 480x720 olmalı. Değilse:
magick input.png -resize 480x720! -gravity center -extent 480x720 output.png
```

### 2. Arka Plan Temizleme (gerekirse)
```bash
# Arka planı #1a1714'e çevir
magick input.png -fuzz 15% -fill '#1a1714' -opaque white output.png
```

### 3. Yatay Strip Oluşturma
```bash
cd /Volumes/PortableSSD/klemensart

# idle (6 kare)
magick frames/idle-{1,2,3,4,5,6}.png +append public/images/leonardo/sprites/idle.webp

# talking (8 kare)
magick frames/talk-{1,2,3,4,5,6,7,8}.png +append public/images/leonardo/sprites/talking.webp

# happy (6 kare)
magick frames/happy-{1,2,3,4,5,6}.png +append public/images/leonardo/sprites/happy.webp

# sad (4 kare)
magick frames/sad-{1,2,3,4}.png +append public/images/leonardo/sprites/sad.webp

# thinking (6 kare)
magick frames/think-{1,2,3,4,5,6}.png +append public/images/leonardo/sprites/thinking.webp

# pointing (6 kare)
magick frames/point-{1,2,3,4,5,6}.png +append public/images/leonardo/sprites/pointing.webp

# greeting (6 kare)
magick frames/greet-{1,2,3,4,5,6}.png +append public/images/leonardo/sprites/greeting.webp
```

### 4. Fallback Portrait
```bash
# Referans kareyi fallback olarak da kullan
cp frames/idle-1.png public/images/leonardo/fallback-portrait.webp
# veya dönüştür:
magick frames/idle-1.png public/images/leonardo/fallback-portrait.webp
```

### 5. Boyut Kontrolü
```bash
# Toplam sprite boyutu kontrol (hedef: ~1.4MB)
du -sh public/images/leonardo/sprites/
```

### 6. Oda Arka Planları (Opsiyonel)
```
Prompt: "Renaissance artist workshop interior, [ODA_DETAYI],
atmospheric, moody lighting, oil painting style,
warm browns and golds, 1920x1080"
```

| Dosya | Prompt Detayı |
|-------|--------------|
| bg-salon.webp | "grand salon with famous paintings on walls, marble floor" |
| bg-resim.webp | "painting studio with easels, half-finished canvases, brushes" |
| bg-heykel.webp | "sculpture workshop with marble dust, anatomy drawings, horse statue model" |
| bg-icat.webp | "inventor's workshop with flying machine models, gears, blueprints" |
| bg-kutuphane.webp | "Renaissance library with leather books, scrolls, candlelight" |

---

## Hızlı Başlangıç Sırası

1. **Referans kare** üret (idle-1)
2. **Fallback portrait** olarak kaydet
3. **idle** 6 kareyi tamamla → strip'le → test et
4. **talking** ve **thinking** (en çok görülen)
5. **happy** ve **sad** (cevap tepkileri)
6. **greeting** ve **pointing** (en az görülen)
7. **Oda arka planları** (opsiyonel, gradient zaten çalışıyor)
