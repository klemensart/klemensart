"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";

type Artwork = {
  id: number;
  title: string;
  location: string;
  photographer: string;
  note: string;
  info: string;
  color: string;
  accent: string;
  image: string;
};

/* ── Sergi Mottosu ──
 * "En Sessiz Zaman" — Theo Atay
 *
 * TR:
 * Binlerce yıl öncesinin sesleri aniden kayboluyor, kuşların, ağaçların,
 * doğanın ve benim sesimle karışıyor. Ve bu sessizlik anlarında, aramızda
 * hiçbir fark olmadığını, bir ve aynı olduğumuzu hissediyorum. Aynı doğanın
 * imgeleri olarak var olmaya ve yok olmaya devam ediyoruz.
 *
 * EN:
 * The sounds of thousands of years ago suddenly disappear, mingling with the
 * sounds of birds, trees, nature and me. And in such moments of silence, I
 * feel that there is no difference between us, that we are one and the same.
 * We continue to exist and disappear as images of the same nature.
 */
const EXHIBITION_MOTTO = {
  title: { tr: "En Sessiz Zaman", en: "The Quietest Time" },
  artist: "Theo Atay",
  text: {
    tr: "Binlerce yıl öncesinin sesleri aniden kayboluyor, kuşların, ağaçların, doğanın ve benim sesimle karışıyor. Ve bu sessizlik anlarında, aramızda hiçbir fark olmadığını, bir ve aynı olduğumuzu hissediyorum. Aynı doğanın imgeleri olarak var olmaya ve yok olmaya devam ediyoruz.",
    en: "The sounds of thousands of years ago suddenly disappear, mingling with the sounds of birds, trees, nature and me. And in such moments of silence, I feel that there is no difference between us, that we are one and the same. We continue to exist and disappear as images of the same nature.",
  },
};

// Suppress unused var warning until we integrate the motto into the UI
void EXHIBITION_MOTTO;

const ARTWORKS: Artwork[] = [
  // ── Afrodisias (4) ──
  {
    id: 1,
    title: "Afrodisias'ta Sessizlik",
    location: "Afrodisias, Aydın",
    photographer: "Theo Atay",
    note: "UNESCO Dünya Mirası'nın mermer sokakları, binlerce yıllık heykeltraşların ellerinden çıkmış izleri taşıyor. Burada taşlar konuşuyor, insanlar susuyor.",
    info: "Afrodisias, antik dönemin en ünlü heykeltraşlık okuluna ev sahipliği yapmış bir kenttir. 2017'de UNESCO Dünya Mirası listesine alınmıştır. Stadyumu 30.000 kişi kapasitesiyle antik dünyanın en iyi korunmuş örneklerinden biridir.",
    color: "#5B3A6B",
    accent: "#9B6BB0",
    image: "/sergi/yalnizlik/afrodisias-1.jpg",
  },
  {
    id: 2,
    title: "Mermer Avlu",
    location: "Afrodisias, Aydın",
    photographer: "Theo Atay",
    note: "Tetrapylon'un dört sütunu arasında rüzgâr bile yavaşlıyor. Aşk tanrıçasının kentinde, yalnızlık bile zarif.",
    info: "Afrodisias Tetrapylon'u, kentin anıtsal giriş kapısıdır. Dört sütun grubundan oluşan bu yapı, MS 2. yüzyılda inşa edilmiştir ve kabartmalarıyla ünlüdür.",
    color: "#6B5B3A",
    accent: "#B09B6B",
    image: "/sergi/yalnizlik/afrodisias-2.jpg",
  },
  {
    id: 3,
    title: "Stadyumda Yankı",
    location: "Afrodisias, Aydın",
    photographer: "Theo Atay",
    note: "Otuz bin kişilik stadyumda tek bir ses: rüzgâr. Tribünler bomboş, ama taşlar hâlâ tezahürat bekliyor.",
    info: "Afrodisias Stadyumu, 262 metre uzunluğu ve 59 metre genişliğiyle Roma döneminin en büyük ve en iyi korunmuş stadyumlarından biridir.",
    color: "#3A5B6B",
    accent: "#6B9BB0",
    image: "/sergi/yalnizlik/afrodisias-3.jpg",
  },
  {
    id: 4,
    title: "Heykeltraşın Mirası",
    location: "Afrodisias, Aydın",
    photographer: "Theo Atay",
    note: "Mermer bloklardan yüzler, bedenler doğmuş bir zamanlar. Şimdi yarım kalmış heykeller, tamamlanmayı bekleyen hikâyeler gibi duruyor.",
    info: "Afrodisias heykeltraşlık okulu, Roma İmparatorluğu'nun en önemli mermer işleme merkeziydi. Üretilen heykeller Roma'dan İskenderiye'ye kadar geniş bir coğrafyaya ihraç edilirdi.",
    color: "#6B3A5B",
    accent: "#B06B9B",
    image: "/sergi/yalnizlik/afrodisias-4.jpg",
  },
  // ── Aizanoi (3) ──
  {
    id: 5,
    title: "Zeus'un Evi",
    location: "Aizanoi, Kütahya",
    photographer: "Theo Atay",
    note: "Anadolu'nun en iyi korunmuş Zeus Tapınağı, iki bin yıldır gökyüzüne bakıyor. Tanrılar gitti, tapınak kaldı.",
    info: "Aizanoi Zeus Tapınağı, Anadolu'daki en iyi korunmuş Roma tapınağıdır. Benzersiz bir özelliği, alt katında Kybele'ye adanmış bir mağara tapınağı barındırmasıdır.",
    color: "#8B6914",
    accent: "#D4A843",
    image: "/sergi/yalnizlik/aizanoi-1.jpg",
  },
  {
    id: 6,
    title: "Stadyum ve Tiyatro",
    location: "Aizanoi, Kütahya",
    photographer: "Theo Atay",
    note: "Dünyanın bilinen tek stadyum-tiyatro kompleksi. İki amacı tek yapıda birleştiren mühendislik harikası, şimdi sessizliğe teslim.",
    info: "Aizanoi, dünyada stadyum ve tiyatronun iç içe geçtiği tek antik kenttir. Bu benzersiz yapı, 2012'de UNESCO Dünya Mirası geçici listesine alınmıştır.",
    color: "#4A6741",
    accent: "#7BA370",
    image: "/sergi/yalnizlik/aizanoi-2.jpg",
  },
  {
    id: 7,
    title: "Penkalas Kıyısında",
    location: "Aizanoi, Kütahya",
    photographer: "Theo Atay",
    note: "Antik köprünün altından akan Penkalas Çayı, iki bin yıldır aynı şarkıyı söylüyor. Değişen yalnızca dinleyenler.",
    info: "Aizanoi'nin antik köprüleri, kenti ikiye bölen Penkalas Çayı (günümüzde Kocaçay) üzerinde inşa edilmiştir. Roma döneminin mühendislik başarılarından biridir.",
    color: "#5B6B3A",
    accent: "#9BB06B",
    image: "/sergi/yalnizlik/aizanoi-3.jpg",
  },
  // ── Asklepion (1) ──
  {
    id: 8,
    title: "Şifanın Sessizliği",
    location: "Asklepion, Bergama",
    photographer: "Theo Atay",
    note: "Antik dünyanın en ünlü şifa merkezi. Hastalar burada rüyalarıyla iyileşirdi. Şimdi rüya gören yalnızca rüzgâr.",
    info: "Bergama Asklepion'u, antik çağın en önemli sağlık merkezlerinden biriydi. Hastaların su sesi, müzik ve telkinle tedavi edildiği bu merkez, modern psikoterapinin öncüsü sayılır.",
    color: "#3A6B5B",
    accent: "#6BB09B",
    image: "/sergi/yalnizlik/asklepion-1.jpg",
  },
  // ── Assos (1) ──
  {
    id: 9,
    title: "Athena'nın Bakışı",
    location: "Assos, Çanakkale",
    photographer: "Theo Atay",
    note: "Ege'nin üzerinde yükselen Athena Tapınağı'ndan Midilli Adası'na bakış. Aristoteles burada bir okul kurmuştu; şimdi yalnızca martılar ders veriyor.",
    info: "Assos Athena Tapınağı, Arkaik dönemde inşa edilen tek Dor tapınağıdır. Aristoteles MÖ 347-345 yıllarında burada bir felsefe okulu kurmuştur.",
    color: "#14698B",
    accent: "#43A8D4",
    image: "/sergi/yalnizlik/assos-1.jpg",
  },
  // ── Blaundus (1) ──
  {
    id: 10,
    title: "Kanyonun Kıyısında",
    location: "Blaundus, Uşak",
    photographer: "Theo Atay",
    note: "Ulubey Kanyonu'nun kenarında, uçurumla yarışan sütunlar. Dünyanın unuttuğu bir kent, kendini uçurumda hatırlıyor.",
    info: "Blaundus, Uşak'ın Ulubey ilçesinde, kanyonun kenarında kurulmuş antik bir kenttir. Makedonyalılar tarafından kurulmuş, Roma döneminde önemli bir merkez olmuştur.",
    color: "#8B4513",
    accent: "#CD853F",
    image: "/sergi/yalnizlik/blaundus-1.jpg",
  },
  // ── Çatalhöyük (2) ──
  {
    id: 11,
    title: "İlk Ev",
    location: "Çatalhöyük, Konya",
    photographer: "Theo Atay",
    note: "Dünyanın en eski yerleşimlerinden biri. Kapısı olmayan evler, damdan girilen odalar. İnsanlığın ilk 'mahalle'si, dokuz bin yıldır sessiz.",
    info: "Çatalhöyük, MÖ 7500-5700 yıllarına tarihlenen, dünyanın en eski ve en büyük Neolitik yerleşimlerinden biridir. 2012'de UNESCO Dünya Mirası listesine alınmıştır.",
    color: "#6B5B4A",
    accent: "#B09B8A",
    image: "/sergi/yalnizlik/catalhoyuk-1.jpg",
  },
  {
    id: 12,
    title: "Neolitik Katmanlar",
    location: "Çatalhöyük, Konya",
    photographer: "Theo Atay",
    note: "Her katman bir nesil, her duvar bir hikâye. Binlerce yıl üst üste yaşamış insanların izleri, toprağın altında saklı.",
    info: "Çatalhöyük'te 18 yerleşim katmanı tespit edilmiştir. En kalabalık döneminde 8.000'e kadar insanın yaşadığı tahmin edilen kentte, evlerin duvarları boğa başları ve av sahneleriyle süslenmiştir.",
    color: "#5B4A3A",
    accent: "#9B8A6B",
    image: "/sergi/yalnizlik/catalhoyuk-2.jpg",
  },
  // ── Kibyra (2) ──
  {
    id: 13,
    title: "Gladyatörün Arenası",
    location: "Kibyra, Burdur",
    photographer: "Theo Atay",
    note: "Gladyatörlerin kanıyla sulanan arena, şimdi kırlangıçlara ev sahipliği yapıyor. Savaş naralarının yerini kuş cıvıltıları aldı.",
    info: "Kibyra, Burdur'un Gölhisar ilçesinde yer alan antik kenttir. 2015 yılında keşfedilen gladyatör mozaikleriyle dünya gündemine oturmuştur. Medusa kabartmaları ve stadyumuyla dikkat çeker.",
    color: "#6B3A3A",
    accent: "#B06B6B",
    image: "/sergi/yalnizlik/kibyra-1.jpg",
  },
  {
    id: 14,
    title: "Medusa'nın Gözleri",
    location: "Kibyra, Burdur",
    photographer: "Theo Atay",
    note: "Taşa dönmüş yüzler, zamana meydan okuyor. Medusa'nın bakışı bile buranın yalnızlığını kıramadı.",
    info: "Kibyra'nın Medusa kabartmaları, Roma döneminin en etkileyici taş işçiliği örnekleri arasındadır. Kent, dört dil konuşulan kozmopolit bir merkez olarak bilinirdi.",
    color: "#4A3A6B",
    accent: "#8A6BB0",
    image: "/sergi/yalnizlik/kibyra-2.jpg",
  },
  // ── Laodikeia (4) ──
  {
    id: 15,
    title: "Yedi Kiliseden Biri",
    location: "Laodikeia, Denizli",
    photographer: "Theo Atay",
    note: "Kutsal Kitap'ın yedi kilisesinden biri buradaydı. Binlerce yıl önce inanç dolu cemaatler toplanan bu mekân, şimdi rüzgâra vaaz veriyor.",
    info: "Laodikeia, Vahiy Kitabı'nda adı geçen yedi kiliseden biridir. Denizli'de yer alan kent, tekstil, tıp ve bankacılıkla zenginleşmiş önemli bir Roma şehriydi.",
    color: "#3A4A6B",
    accent: "#6B8AB0",
    image: "/sergi/yalnizlik/laodikeia-1.jpg",
  },
  {
    id: 16,
    title: "Antik Cadde",
    location: "Laodikeia, Denizli",
    photographer: "Theo Atay",
    note: "Sütunlu caddenin sonunda ne var? İki bin yıl önce bir pazar, bir hamam, bir yaşam. Şimdi yalnızca ufuk çizgisi.",
    info: "Laodikeia'nın sütunlu caddesi, kentin ana arteriydi. Her iki yanında dükkanlar ve kamu binaları sıralanan bu cadde, Roma kentsel planlamasının güzel bir örneğidir.",
    color: "#6B4A3A",
    accent: "#B08A6B",
    image: "/sergi/yalnizlik/laodikeia-2.jpg",
  },
  {
    id: 17,
    title: "Stadyumda Gölgeler",
    location: "Laodikeia, Denizli",
    photographer: "Theo Atay",
    note: "Güneş alçaldıkça stadyumun gölgeleri uzuyor. Seyirciler çoktan gitti, ama gölgeler hâlâ tribünlerde oturuyor.",
    info: "Laodikeia Stadyumu, 250 metre uzunluğuyla antik dünyanın büyük stadyumlarından biriydi. Atletizm yarışmaları ve gladyatör dövüşlerine ev sahipliği yapardı.",
    color: "#4A6B3A",
    accent: "#8AB06B",
    image: "/sergi/yalnizlik/laodikeia-3.jpg",
  },
  {
    id: 18,
    title: "Nymphaeum Suları",
    location: "Laodikeia, Denizli",
    photographer: "Theo Atay",
    note: "Çeşmenin suyu çoktan kurudu, ama havuzun mermer kenarları hâlâ pırıl pırıl. Su gitmiş, güzellik kalmış.",
    info: "Laodikeia'daki anıtsal çeşmeler (nymphaeum), kentin su sisteminin görkemini yansıtır. Kent, antik dönemde özel bir su kanalı sistemiyle Denizli'nin sıcak kaynaklarından beslenirdi.",
    color: "#3A6B4A",
    accent: "#6BB08A",
    image: "/sergi/yalnizlik/laodikeia-4.jpg",
  },
  // ── Sagalassos (3) ──
  {
    id: 19,
    title: "Dağın Zirvesinde Roma",
    location: "Sagalassos, Burdur",
    photographer: "Theo Atay",
    note: "1.500 metre yükseklikte, bulutların arasında bir Roma kenti. Burada yalnızlık bir tercih değil, coğrafyanın dayattığı bir kader.",
    info: "Sagalassos, Burdur'un Ağlasun ilçesinde, Toros Dağları'nın eteklerinde kurulmuş antik bir kenttir. 'Dağların Roma'sı' olarak anılır ve son yıllarda yoğun arkeolojik kazılarla gün yüzüne çıkarılmaktadır.",
    color: "#3A5B6B",
    accent: "#6B9BB0",
    image: "/sergi/yalnizlik/sagalassos-1.jpg",
  },
  {
    id: 20,
    title: "Antoninler Çeşmesi",
    location: "Sagalassos, Burdur",
    photographer: "Theo Atay",
    note: "İki bin yıl sonra yeniden akan su. Arkeologlar çeşmeyi restore etti ve su, sanki hiç durmamış gibi akmaya başladı.",
    info: "Antoninler Çeşmesi, MS 2. yüzyılda İmparator Marcus Aurelius döneminde inşa edilmiştir. 2010'da restore edilerek yeniden suyla buluşmuş, antik dünyanın yeniden canlanan simgesi olmuştur.",
    color: "#5B3A4A",
    accent: "#9B6B8A",
    image: "/sergi/yalnizlik/sagalassos-2.jpg",
  },
  {
    id: 21,
    title: "Bulutların Altında",
    location: "Sagalassos, Burdur",
    photographer: "Theo Atay",
    note: "Sagalassos'un tiyatrosu bulutlara o kadar yakın ki, sahneye çıkan aktörler gökyüzüne dokunabilirmiş gibi. Şimdi seyirci yalnızca bulutlar.",
    info: "Sagalassos Tiyatrosu, 9.000 kişi kapasitesiyle dağ yamacına oyulmuştur. Tiyatrodan Burdur Gölü'ne uzanan muhteşem manzara, antik dünyada eşsiz bir sahne dekoruydu.",
    color: "#4A5B3A",
    accent: "#8A9B6B",
    image: "/sergi/yalnizlik/sagalassos-3.jpg",
  },
];

export default function YalnizlikSergiPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const artMeshesRef = useRef<THREE.Mesh[]>([]);
  const frameIdRef = useRef<number | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const yawRef = useRef(Math.PI / 2);
  const pitchRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastStepTimeRef = useRef(0);
  const ambientNodesRef = useRef<{ oscs: OscillatorNode[]; gains: GainNode[] } | null>(null);
  const [ambientOn, setAmbientOn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const pinchDistRef = useRef(0);
  const nearestArtIndexRef = useRef<number | null>(null);
  const dragEndTimeRef = useRef(0);
  const [nearestArt, setNearestArt] = useState<Artwork | null>(null);

  function playFootstep(ctx: AudioContext) {
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 300 + Math.random() * 200;
    filter.Q.value = 1;
    const gain = ctx.createGain();
    gain.gain.value = 0.08;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
  }

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1714);
    sceneRef.current = scene;

    // Camera — start at entrance end (+x), looking inward (-x)
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200);
    camera.position.set(32, 1.7, 0);
    cameraRef.current = camera;

    // Renderer
    const mobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsMobile(mobile);
    const renderer = new THREE.WebGLRenderer({ antialias: !mobile });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
    renderer.shadowMap.enabled = !mobile;
    if (!mobile) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting — dim warm ambient for historical atmosphere
    const ambient = new THREE.AmbientLight(0xfff5e6, 0.35);
    scene.add(ambient);

    const fill = new THREE.DirectionalLight(0xfff0dd, 0.15);
    fill.position.set(0, 5, 0);
    scene.add(fill);

    // ── Room dimensions: 70 × 18 corridor ──
    const ROOM_W = 70;
    const ROOM_D = 18;
    const HALF_W = ROOM_W / 2; // 35
    const HALF_D = ROOM_D / 2; // 9

    // Floor — warm polished stone texture
    const floorTexCanvas = document.createElement("canvas");
    floorTexCanvas.width = 512;
    floorTexCanvas.height = 512;
    const fctx = floorTexCanvas.getContext("2d")!;
    fctx.fillStyle = "#302a24";
    fctx.fillRect(0, 0, 512, 512);
    const blockSize = 64;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const variation = Math.floor(Math.random() * 15) - 7;
        const r = 52 + variation;
        const g = 46 + variation;
        const b = 40 + variation;
        fctx.fillStyle = `rgb(${r},${g},${b})`;
        fctx.fillRect(col * blockSize + 2, row * blockSize + 2, blockSize - 4, blockSize - 4);
      }
    }
    fctx.fillStyle = "#241e18";
    for (let i = 0; i <= 8; i++) {
      fctx.fillRect(0, i * blockSize - 1, 512, 2);
      fctx.fillRect(i * blockSize - 1, 0, 2, 512);
    }
    const floorTex = new THREE.CanvasTexture(floorTexCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(8, 3);

    const floorGeo = new THREE.PlaneGeometry(ROOM_W, ROOM_D);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.25,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(ROOM_W, ROOM_D);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x1a1714 });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5;
    scene.add(ceiling);

    // Walls — warm plaster texture
    const wallTexCanvas = document.createElement("canvas");
    wallTexCanvas.width = 256;
    wallTexCanvas.height = 256;
    const wctx = wallTexCanvas.getContext("2d")!;
    wctx.fillStyle = "#2a2622";
    wctx.fillRect(0, 0, 256, 256);
    for (let ni = 0; ni < 3000; ni++) {
      const wx = Math.random() * 256;
      const wy = Math.random() * 256;
      const bright = Math.random() > 0.5;
      wctx.globalAlpha = 0.04 + Math.random() * 0.04;
      wctx.fillStyle = bright ? "#4a4238" : "#1a1612";
      wctx.fillRect(wx, wy, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }
    wctx.globalAlpha = 1;
    const wallTex = new THREE.CanvasTexture(wallTexCanvas);
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(8, 1);

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.95,
    });

    // Back wall (entrance side, z = +HALF_D)
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, 5), wallMat);
    backWall.position.set(0, 2.5, HALF_D);
    backWall.rotation.y = Math.PI;
    scene.add(backWall);

    // Front wall (far end, z = -HALF_D)
    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, 5), wallMat);
    frontWall.position.set(0, 2.5, -HALF_D);
    scene.add(frontWall);

    // Left wall (x = -HALF_W)
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D, 5), wallMat);
    leftWall.position.set(-HALF_W, 2.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    // Right wall (x = +HALF_W)
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D, 5), wallMat);
    rightWall.position.set(HALF_W, 2.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    // Create artworks — corridor layout
    const artMeshes: THREE.Mesh[] = [];
    const loader = new THREE.TextureLoader();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // Panoramic frame & canvas sizes
    const FRAME_W = 5.0;
    const FRAME_H = 2.0;
    const CANVAS_W = 4.6;
    const CANVAS_H = 1.8;

    // ── Shared geometry & materials (created once, reused 21×) ──
    const sharedFrameGeo = new THREE.BoxGeometry(FRAME_W, FRAME_H, 0.15);
    const sharedFrameMat = new THREE.MeshStandardMaterial({
      color: 0x3a2e28,
      metalness: 0.1,
      roughness: 0.7,
    });
    const sharedCanvasGeo = new THREE.PlaneGeometry(CANVAS_W, CANVAS_H);
    const sharedLabelGeo = new THREE.PlaneGeometry(2, 0.25);

    // ── Shared passepartout texture (created once) ──
    const PP_W = CANVAS_W + 0.4;
    const PP_H = CANVAS_H + 0.3;
    const ppTexCanvas = document.createElement("canvas");
    const ppPxW = 512, ppPxH = Math.round(512 * (PP_H / PP_W));
    ppTexCanvas.width = ppPxW;
    ppTexCanvas.height = ppPxH;
    const pctx = ppTexCanvas.getContext("2d")!;
    pctx.fillStyle = "#f0ebe4";
    pctx.fillRect(0, 0, ppPxW, ppPxH);
    for (let gi = 0; gi < 6000; gi++) {
      const gx = Math.random() * ppPxW;
      const gy = Math.random() * ppPxH;
      pctx.globalAlpha = 0.03 + Math.random() * 0.03;
      pctx.fillStyle = Math.random() > 0.5 ? "#ddd8d0" : "#f8f4ef";
      pctx.fillRect(gx, gy, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    pctx.globalAlpha = 0.025;
    pctx.fillStyle = "#c8c0b5";
    for (let ly = 0; ly < ppPxH; ly += 3) {
      pctx.fillRect(0, ly, ppPxW, 1);
    }
    pctx.globalAlpha = 1;
    const edgeGrad = pctx.createRadialGradient(ppPxW / 2, ppPxH / 2, Math.min(ppPxW, ppPxH) * 0.3, ppPxW / 2, ppPxH / 2, Math.max(ppPxW, ppPxH) * 0.55);
    edgeGrad.addColorStop(0, "rgba(0,0,0,0)");
    edgeGrad.addColorStop(1, "rgba(0,0,0,0.08)");
    pctx.fillStyle = edgeGrad;
    pctx.fillRect(0, 0, ppPxW, ppPxH);
    const openL = ((PP_W - CANVAS_W) / 2 / PP_W) * ppPxW;
    const openR = ppPxW - openL;
    const openT = ((PP_H - CANVAS_H) / 2 / PP_H) * ppPxH;
    const openB = ppPxH - openT;
    const grooveW = 2;
    pctx.fillStyle = "#8a8078";
    pctx.fillRect(openL - grooveW, openT - grooveW, openR - openL + grooveW * 2, grooveW);
    pctx.fillRect(openL - grooveW, openB, openR - openL + grooveW * 2, grooveW);
    pctx.fillRect(openL - grooveW, openT, grooveW, openB - openT);
    pctx.fillRect(openR, openT, grooveW, openB - openT);
    pctx.fillStyle = "#faf7f3";
    pctx.fillRect(openL, openT, openR - openL, 1);
    pctx.fillRect(openL, openT, 1, openB - openT);

    const sharedPPTex = new THREE.CanvasTexture(ppTexCanvas);
    const sharedPPGeo = new THREE.PlaneGeometry(PP_W, PP_H);
    const sharedPPMat = new THREE.MeshStandardMaterial({
      map: sharedPPTex,
      roughness: 0.95,
      metalness: 0,
    });

    ARTWORKS.forEach((art, i) => {
      // Front wall (z = -HALF_D): artworks 0-10, Back wall (z = +HALF_D): artworks 11-20
      let wallX: number, wallZ: number, facing: number;
      if (i < 11) {
        wallX = -30 + i * 6;
        wallZ = -HALF_D + 0.07;
        facing = 0;
      } else {
        wallX = -27 + (i - 11) * 6;
        wallZ = HALF_D - 0.07;
        facing = Math.PI;
      }

      // Frame (shared geo & mat)
      const frame = new THREE.Mesh(sharedFrameGeo, sharedFrameMat);
      frame.castShadow = true;
      frame.position.set(wallX, 1.9, wallZ);
      frame.rotation.y = facing;

      // Passepartout (shared geo, mat & texture)
      const matMesh = new THREE.Mesh(sharedPPGeo, sharedPPMat);
      const matOffsetZ = facing === 0 ? 0.079 : -0.079;
      matMesh.position.set(wallX, 1.9, wallZ + matOffsetZ);
      matMesh.rotation.y = facing;

      // Canvas (photo) — unique texture per artwork
      const texture = loader.load(art.image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = maxAniso;
      const canvasMat = new THREE.MeshBasicMaterial({ map: texture });
      const artCanvas = new THREE.Mesh(sharedCanvasGeo, canvasMat);
      const canvasOffsetZ = facing === 0 ? 0.08 : -0.08;
      artCanvas.position.set(wallX, 1.9, wallZ + canvasOffsetZ);
      artCanvas.rotation.y = facing;

      // Per-artwork warm PointLight (much cheaper than SpotLight)
      const artLight = new THREE.PointLight(0xffe4c4, 0.6, 6, 2);
      const lightZ = facing === 0 ? wallZ + 2 : wallZ - 2;
      artLight.position.set(wallX, 3.8, lightZ);

      // Label (unique text per artwork)
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 512;
      labelCanvas.height = 64;
      const lctx = labelCanvas.getContext("2d")!;
      lctx.fillStyle = "#1a1a1a";
      lctx.fillRect(0, 0, 512, 64);
      lctx.fillStyle = "#cccccc";
      lctx.font = "bold 22px sans-serif";
      lctx.textAlign = "center";
      lctx.fillText(art.title, 256, 25);
      lctx.fillStyle = "#888888";
      lctx.font = "16px sans-serif";
      lctx.fillText(art.location, 256, 50);

      const labelTex = new THREE.CanvasTexture(labelCanvas);
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex });
      const labelMesh = new THREE.Mesh(sharedLabelGeo, labelMat);
      const labelOffsetZ = facing === 0 ? 0.06 : -0.06;
      labelMesh.position.set(wallX, 0.6, wallZ + labelOffsetZ);
      labelMesh.rotation.y = facing;

      scene.add(frame);
      scene.add(matMesh);
      scene.add(artCanvas);
      scene.add(artLight);
      scene.add(labelMesh);

      artCanvas.userData = { artworkId: art.id, index: i };
      artMeshes.push(artCanvas);
    });

    artMeshesRef.current = artMeshes;

    // Benches — every 20 units along the corridor (x-axis)
    const benchGeo = new THREE.BoxGeometry(0.8, 0.5, 3);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.3,
    });
    for (let bx = -20; bx <= 20; bx += 20) {
      const bench = new THREE.Mesh(benchGeo, benchMat);
      bench.position.set(bx, 0.25, 0);
      bench.castShadow = true;
      scene.add(bench);
    }

    // Gallery title panel — entrance short wall (x = +HALF_W), facing -x
    const titleCanvas = document.createElement("canvas");
    titleCanvas.width = 1024;
    titleCanvas.height = 512;
    const tctx = titleCanvas.getContext("2d")!;
    tctx.fillStyle = "#ffffff";
    tctx.fillRect(0, 0, 1024, 512);
    tctx.fillStyle = "#FF6D60";
    tctx.font = "bold 64px sans-serif";
    tctx.textAlign = "center";
    tctx.fillText("Y A L N I Z L I K", 512, 180);
    tctx.fillStyle = "#999999";
    tctx.font = "28px sans-serif";
    tctx.fillText("Antik Topraklarda Bir Fotoğraf Sergisi", 512, 280);
    tctx.fillStyle = "#bbbbbb";
    tctx.font = "24px sans-serif";
    tctx.fillText("klemens \u00d7 Theo Atay", 512, 340);

    const titleTex = new THREE.CanvasTexture(titleCanvas);
    const titleMat = new THREE.MeshBasicMaterial({ map: titleTex });
    const titleMesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), titleMat);
    titleMesh.rotation.y = -Math.PI / 2; // face -x (inward)
    titleMesh.position.set(HALF_W - 0.05, 2.5, 0);
    scene.add(titleMesh);

    // Subtle warm corridor fill lights (low intensity, wide spacing)
    for (let li = -30; li <= 30; li += 20) {
      const corridorLight = new THREE.PointLight(0xffe8d0, 0.15, 18);
      corridorLight.position.set(li, 4.5, 0);
      scene.add(corridorLight);
    }

    // Animation
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      const speed = 0.08;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));

      if (keysRef.current["w"] || keysRef.current["arrowup"]) camera.position.addScaledVector(dir, speed);
      if (keysRef.current["s"] || keysRef.current["arrowdown"]) camera.position.addScaledVector(dir, -speed);
      if (keysRef.current["a"] || keysRef.current["arrowleft"]) camera.position.addScaledVector(right, -speed);
      if (keysRef.current["d"] || keysRef.current["arrowright"]) camera.position.addScaledVector(right, speed);

      // Q/E rotation
      if (keysRef.current["q"]) yawRef.current += 0.025;
      if (keysRef.current["e"]) yawRef.current -= 0.025;

      // Movement limits — corridor bounds (x = long axis, z = narrow axis)
      camera.position.x = Math.max(-34, Math.min(34, camera.position.x));
      camera.position.z = Math.max(-7, Math.min(7, camera.position.z));
      camera.position.y = 1.7;

      // Footstep sound
      const moving = keysRef.current["w"] || keysRef.current["s"] || keysRef.current["a"] || keysRef.current["d"]
        || keysRef.current["arrowup"] || keysRef.current["arrowdown"] || keysRef.current["arrowleft"] || keysRef.current["arrowright"];
      if (moving && audioCtxRef.current) {
        const now = performance.now();
        if (now - lastStepTimeRef.current > 350) {
          lastStepTimeRef.current = now;
          playFootstep(audioCtxRef.current);
        }
      }

      // Snap assist — soft yaw towards nearest artwork in view
      if (!isDraggingRef.current && performance.now() - dragEndTimeRef.current > 500) {
        const lookDir = new THREE.Vector3();
        camera.getWorldDirection(lookDir);
        lookDir.y = 0;
        lookDir.normalize();

        // Determine if user is moving (WASD/arrows)
        const moveDir = new THREE.Vector3();
        if (keysRef.current["w"] || keysRef.current["arrowup"]) moveDir.addScaledVector(dir, 1);
        if (keysRef.current["s"] || keysRef.current["arrowdown"]) moveDir.addScaledVector(dir, -1);
        if (keysRef.current["a"] || keysRef.current["arrowleft"]) moveDir.addScaledVector(right, -1);
        if (keysRef.current["d"] || keysRef.current["arrowright"]) moveDir.addScaledVector(right, 1);
        const isMoving = moveDir.lengthSq() > 0;
        if (isMoving) moveDir.normalize();

        const maxAngle = Math.PI / 3; // 60 degrees
        let bestDist = Infinity;
        let bestIdx = -1;

        for (let si = 0; si < artMeshes.length; si++) {
          const toArt = new THREE.Vector3().subVectors(artMeshes[si].position, camera.position);
          toArt.y = 0;
          const sd = toArt.length();
          if (sd >= 5) continue;
          toArt.normalize();

          // Must be within ±60° of look direction
          const lookAngle = Math.acos(Math.min(1, Math.max(-1, lookDir.dot(toArt))));
          if (lookAngle > maxAngle) continue;

          // If moving, prefer artworks aligned with movement direction
          let score = sd;
          if (isMoving) {
            const moveAngle = Math.acos(Math.min(1, Math.max(-1, moveDir.dot(toArt))));
            if (moveAngle < maxAngle) score *= 0.5; // prioritize movement-aligned
          }

          if (score < bestDist) { bestDist = score; bestIdx = si; }
        }

        if (bestIdx >= 0) {
          const toArt = new THREE.Vector3().subVectors(artMeshes[bestIdx].position, camera.position);
          const targetYaw = Math.atan2(-toArt.x, -toArt.z);
          let diff = targetYaw - yawRef.current;
          while (diff > Math.PI) diff -= 2 * Math.PI;
          while (diff < -Math.PI) diff += 2 * Math.PI;
          yawRef.current += diff * 0.02;
        }
      }

      const euler = new THREE.Euler(pitchRef.current, yawRef.current, 0, "YXZ");
      camera.quaternion.setFromEuler(euler);

      // FOV zoom when close to artwork + proximity detection
      let minDist = Infinity;
      let closestIdx: number | null = null;
      for (let mi = 0; mi < artMeshes.length; mi++) {
        const d = camera.position.distanceTo(artMeshes[mi].position);
        if (d < minDist) { minDist = d; closestIdx = mi; }
      }
      const newNearest = minDist < 4 ? closestIdx : null;
      if (newNearest !== nearestArtIndexRef.current) {
        nearestArtIndexRef.current = newNearest;
        setNearestArt(newNearest !== null ? ARTWORKS[newNearest] : null);
      }
      const targetFov = minDist < 2 ? 50 : minDist < 4 ? 50 + (minDist - 2) * 5 : 60;
      camera.fov += (targetFov - camera.fov) * 0.05;
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
    };
    animate();

    setIsLoading(false);

    // Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Keyboard
    const onKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Mouse look
    const onMouseDown = (e: MouseEvent) => {
      if (e.target === renderer.domElement) {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        yawRef.current += dx * 0.003;
        pitchRef.current += dy * 0.003;
        pitchRef.current = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, pitchRef.current));
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = () => { isDraggingRef.current = false; dragEndTimeRef.current = performance.now(); };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);


    // Touch support
    const getTouchDist = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isDraggingRef.current = false;
        pinchDistRef.current = getTouchDist(e);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDraggingRef.current) {
        const dx = e.touches[0].clientX - lastMouseRef.current.x;
        const dy = e.touches[0].clientY - lastMouseRef.current.y;
        yawRef.current += dx * 0.003;
        pitchRef.current += dy * 0.003;
        pitchRef.current = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, pitchRef.current));
        lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && pinchDistRef.current > 0) {
        const newDist = getTouchDist(e);
        const delta = (newDist - pinchDistRef.current) * 0.014;
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        camera.position.addScaledVector(dir, delta);
        pinchDistRef.current = newDist;
      }
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
      pinchDistRef.current = 0;
      dragEndTimeRef.current = performance.now();
    };

    // Block Safari gesture zoom
    const onGestureStart = (e: Event) => { e.preventDefault(); };
    document.addEventListener("gesturestart", onGestureStart, { passive: false });

    renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: false });
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: false });
    renderer.domElement.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("gesturestart", onGestureStart);
      cancelAnimationFrame(frameIdRef.current!);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Initialize AudioContext on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
    };
    window.addEventListener("click", initAudio, { once: true });
    window.addEventListener("touchstart", initAudio, { once: true });
    return () => {
      window.removeEventListener("click", initAudio);
      window.removeEventListener("touchstart", initAudio);
    };
  }, []);

  const toggleAmbient = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    if (ambientOn) {
      // Fade out
      if (ambientNodesRef.current) {
        ambientNodesRef.current.gains.forEach(g => {
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        });
        setTimeout(() => {
          ambientNodesRef.current?.oscs.forEach(o => { try { o.stop(); } catch {} });
          ambientNodesRef.current = null;
        }, 600);
      }
      setAmbientOn(false);
    } else {
      // Start drone
      const freqs = [55, 82.5, 110];
      const volumes = [0.03, 0.03, 0.01];
      const detunes = [3, -2, 1];
      const oscs: OscillatorNode[] = [];
      const gains: GainNode[] = [];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.detune.value = detunes[i];
        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(volumes[i], ctx.currentTime + 1);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        oscs.push(osc);
        gains.push(gain);
      });
      ambientNodesRef.current = { oscs, gains };
      setAmbientOn(true);
    }
  };

  const navBtn = (key: string) => ({
    onMouseDown: () => { keysRef.current[key] = true; },
    onMouseUp: () => { keysRef.current[key] = false; },
    onMouseLeave: () => { keysRef.current[key] = false; },
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); keysRef.current[key] = true; },
    onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); keysRef.current[key] = false; },
    onTouchCancel: () => { keysRef.current[key] = false; },
  });

  return (
    <div style={{ width: "100%", height: "100vh", background: "#ffffff", position: "relative", overflow: "hidden" }}>
      {/* 3D Canvas */}
      <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab", touchAction: "none" }} />

      {/* Vignette overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)"
      }} />

      {/* Loading */}
      {isLoading && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "#1a1a1a", zIndex: 50
        }}>
          <div style={{ textAlign: "center", color: "#FF6D60" }}>
            <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>YALNIZLIK</div>
            <div style={{ fontSize: 14, color: "#888" }}>Sergi yükleniyor...</div>
          </div>
        </div>
      )}

      {/* Back link */}
      <Link
        href="/"
        style={{
          position: "absolute", top: 20, left: 20,
          color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500,
          textDecoration: "none", zIndex: 20,
          transition: "color 0.2s",
        }}
        onMouseOver={(e) => { (e.target as HTMLElement).style.color = "#FF6D60"; }}
        onMouseOut={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
      >
        &larr; Klemens&apos;e D&ouml;n
      </Link>

      {/* Ambient toggle */}
      <button
        onClick={toggleAmbient}
        style={{
          position: "absolute", top: 20, right: 20, zIndex: 20,
          background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, padding: "8px 12px", cursor: "pointer",
          color: "#aaa", fontSize: 18,
        }}
      >
        {ambientOn ? "🔊" : "🔇"}
      </button>

      {/* Gallery title overlay */}
      <div style={{
        position: "absolute", top: 44, left: 20,
        color: "#fff", zIndex: 10
      }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#FF6D60", marginBottom: 4 }}>KLEMENS SANAL SERGİ</div>
        <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: 6 }}>Y A L N I Z L I K</div>
        <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Antik Topraklarda Bir Fotoğraf Sergisi</div>
      </div>

      {/* On-screen navigation controls */}
      <div style={{
        position: "absolute", bottom: 20, right: 20, zIndex: 30,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        userSelect: "none",
      }}>
        {/* Rotation buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <button {...navBtn("q")} style={{
            width: 42, height: 42, borderRadius: 10,
            background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontSize: 16, cursor: "pointer", touchAction: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>&#8634;</button>
          <button {...navBtn("e")} style={{
            width: 42, height: 42, borderRadius: 10,
            background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontSize: 16, cursor: "pointer", touchAction: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>&#8635;</button>
        </div>
        {/* D-pad */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "42px 42px 42px",
          gridTemplateRows: "42px 42px 42px",
          gap: 4,
        }}>
          <div />
          <button {...navBtn("w")} style={{
            width: 42, height: 42, borderRadius: 10,
            background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontSize: 18, cursor: "pointer", touchAction: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>&#9650;</button>
          <div />
          <button {...navBtn("a")} style={{
            width: 42, height: 42, borderRadius: 10,
            background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontSize: 18, cursor: "pointer", touchAction: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>&#9664;</button>
          <button {...navBtn("s")} style={{
            width: 42, height: 42, borderRadius: 10,
            background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontSize: 18, cursor: "pointer", touchAction: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>&#9660;</button>
          <button {...navBtn("d")} style={{
            width: 42, height: 42, borderRadius: 10,
            background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontSize: 18, cursor: "pointer", touchAction: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>&#9654;</button>
        </div>
      </div>

      {/* Intro overlay */}
      {showIntro && !isLoading && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 40, backdropFilter: "blur(6px)",
        }}>
          <div style={{ textAlign: "center", maxWidth: 420, padding: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 6, color: "#FF6D60", marginBottom: 12 }}>
              KLEMENS SANAL SERGİ
            </div>
            <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: 8, color: "#fff", marginBottom: 8 }}>
              Y A L N I Z L I K
            </div>
            <div style={{ fontSize: 14, color: "#888", marginBottom: 32 }}>
              Antik Topraklarda Bir Fotoğraf Sergisi
            </div>
            <div style={{
              background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "20px 24px",
              marginBottom: 32, textAlign: "left",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: 11, color: "#FF6D60", letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>
                KONTROLLER
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ color: "#ccc", fontSize: 13 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>WASD</span> veya <span style={{ color: "#fff", fontWeight: 600 }}>ok tuşları</span> &mdash; Hareket
                </div>
                <div style={{ color: "#ccc", fontSize: 13 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>Q / E</span> &mdash; Sola / sağa bak
                </div>
                <div style={{ color: "#ccc", fontSize: 13 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>Mouse sürükle</span> &mdash; Etrafına bak
                </div>
                <div style={{ color: "#ccc", fontSize: 13 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>Eserlere yaklaş</span> &mdash; Detay gör
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowIntro(false)}
              style={{
                padding: "14px 48px", background: "transparent",
                border: "1px solid #FF6D60", borderRadius: 10,
                color: "#FF6D60", fontSize: 15, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s", letterSpacing: 2,
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.background = "rgba(255,109,96,0.15)";
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              Sergiyi Keşfet
            </button>
          </div>
        </div>
      )}

      {/* Proximity overlay */}
      <div style={{
        position: "absolute", bottom: 90, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        pointerEvents: "none", zIndex: 25,
        opacity: nearestArt ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        <div style={{
          color: "#fff", fontSize: 18, fontWeight: 600, letterSpacing: 2,
          textShadow: "0 2px 8px rgba(0,0,0,0.7)",
          marginBottom: 12,
        }}>
          {nearestArt?.title}
        </div>
        <button
          onClick={() => { if (nearestArt) setSelectedArt(nearestArt); }}
          style={{
            pointerEvents: nearestArt ? "auto" : "none",
            background: "#FF6D60",
            color: "#fff",
            border: "none",
            borderRadius: 24,
            padding: "10px 28px",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 1,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(255,109,96,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            (e.target as HTMLElement).style.transform = "scale(1.05)";
            (e.target as HTMLElement).style.boxShadow = "0 6px 20px rgba(255,109,96,0.5)";
          }}
          onMouseOut={(e) => {
            (e.target as HTMLElement).style.transform = "scale(1)";
            (e.target as HTMLElement).style.boxShadow = "0 4px 16px rgba(255,109,96,0.4)";
          }}
        >
          Keşfet
        </button>
      </div>

      {/* Artwork detail panel */}
      {selectedArt && (
        <div
          style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, backdropFilter: "blur(8px)"
          }}
          onClick={() => setSelectedArt(null)}
        >
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: isMobile ? 0 : 16,
              maxWidth: isMobile ? "100%" : 600,
              width: isMobile ? "100%" : "90%",
              height: isMobile ? "100%" : "auto",
              maxHeight: isMobile ? "100%" : "90vh",
              overflowY: "auto",
              border: isMobile ? "none" : "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Artwork preview */}
            <div style={{ position: "relative" }}>
              <img
                src={selectedArt.image}
                alt={selectedArt.title}
                style={{ width: "100%", display: "block", borderRadius: "16px 16px 0 0" }}
              />
              <div style={{
                position: "absolute", bottom: 16, left: 16, right: 16
              }}>
                <div style={{
                  background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "8px 12px",
                  backdropFilter: "blur(4px)", display: "inline-block"
                }}>
                  <span style={{ color: "#FF6D60", fontSize: 11, letterSpacing: 2 }}>
                    {selectedArt.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: 24 }}>
              <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 600, margin: "0 0 4px 0" }}>
                {selectedArt.title}
              </h2>
              <p style={{ color: "#FF6D60", fontSize: 13, margin: "0 0 16px 0" }}>
                {selectedArt.photographer}
              </p>

              <div style={{
                borderLeft: "2px solid #FF6D60", paddingLeft: 16, marginBottom: 20
              }}>
                <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                  &ldquo;{selectedArt.note}&rdquo;
                </p>
              </div>

              <div style={{
                background: "#222", borderRadius: 10, padding: 16
              }}>
                <div style={{
                  color: "#FF6D60", fontSize: 11, letterSpacing: 2, marginBottom: 8, fontWeight: 600
                }}>
                  MEKAN HAKKINDA
                </div>
                <p style={{ color: "#999", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  {selectedArt.info}
                </p>
              </div>

              <button
                onClick={() => setSelectedArt(null)}
                style={{
                  marginTop: 20, width: "100%", padding: "12px 0",
                  background: "transparent", border: "1px solid rgba(255,109,96,0.3)",
                  borderRadius: 8, color: "#FF6D60", fontSize: 14,
                  cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.background = "rgba(255,109,96,0.1)";
                  (e.target as HTMLElement).style.borderColor = "#FF6D60";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.background = "transparent";
                  (e.target as HTMLElement).style.borderColor = "rgba(255,109,96,0.3)";
                }}
              >
                Sergiye D&ouml;n
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
