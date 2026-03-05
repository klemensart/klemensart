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
};

const ARTWORKS: Artwork[] = [
  {
    id: 1,
    title: "Efes'te Yalnızlık",
    location: "Efes Antik Kenti, İzmir",
    photographer: "Sergi Sanatçısı",
    note: "Binlerce yıllık sütunların arasında, kalabalıklar çekildiğinde geriye kalan sessizlik... Efes'in taşlarında yankılanan yalnızlık.",
    info: "Efes, MÖ 10. yüzyılda kurulan ve antik dünyanın en büyük şehirlerinden biri olan İyon kentidir. Artemis Tapınağı ile dünyanın yedi harikasından birine ev sahipliği yapmıştır.",
    color: "#8B6914",
    accent: "#D4A843"
  },
  {
    id: 2,
    title: "Apollon'un Gölgesi",
    location: "Didim Apollon Tapınağı, Aydın",
    photographer: "Sergi Sanatçısı",
    note: "Devasa sütunların gölgesinde küçülmek... Tanrıların evinde insan olmanın o ezici ama huzurlu yalnızlığı.",
    info: "Apollon Tapınağı, antik çağın en büyük tapınaklarından biridir. 120 adet 20 metre yüksekliğindeki İon sütunuyla inşa edilmiş, kehanet merkezi olarak kullanılmıştır.",
    color: "#4A6741",
    accent: "#7BA370"
  },
  {
    id: 3,
    title: "Patara'da Akşam",
    location: "Patara Antik Kenti, Antalya",
    photographer: "Sergi Sanatçısı",
    note: "Akdeniz'in son ışıkları antik tiyatronun taşlarına düşerken, zaman durur. Burada yalnızlık bir lüks değil, bir armağan.",
    info: "Patara, Likya Birliği'nin başkenti ve antik dünyanın önemli liman şehirlerinden biriydi. Noel Baba olarak bilinen Aziz Nikolaos'un doğum yeridir.",
    color: "#8B4513",
    accent: "#CD853F"
  },
  {
    id: 4,
    title: "Afrodisias Sessizliği",
    location: "Afrodisias Antik Kenti, Aydın",
    photographer: "Sergi Sanatçısı",
    note: "UNESCO'nun koruması altındaki bu kent, adını aşk tanrıçasından alıyor. Ama burada aşktan çok, taşa işlenmiş bir sessizlik var.",
    info: "Afrodisias, antik dönemde heykeltraşlık okuluyla ünlüydü. 2017'de UNESCO Dünya Mirası listesine alınmış olup, stadyumu antik dünyanın en iyi korunmuş örneklerinden biridir.",
    color: "#5B3A6B",
    accent: "#9B6BB0"
  },
  {
    id: 5,
    title: "Ani Harabeleri",
    location: "Ani Antik Kenti, Kars",
    photographer: "Sergi Sanatçısı",
    note: "Bin kilisenin şehri, şimdi rüzgarın şehri. Anadolu'nun en doğusunda, medeniyetin en çıplak yalnızlığı.",
    info: "Ani, 10-11. yüzyıllarda Bagratuni Ermeni Krallığı'nın başkentiydi. 100.000'den fazla nüfusuyla dönemin en büyük şehirlerinden biriydi. Bugün sınır boyundaki harabeleri UNESCO koruma altındadır.",
    color: "#6B4423",
    accent: "#A0724D"
  },
  {
    id: 6,
    title: "Hasankeyf'in Vedası",
    location: "Hasankeyf, Batman",
    photographer: "Sergi Sanatçısı",
    note: "12.000 yıllık bir kenti sular altında bırakmak... Bu fotoğraf, kaybedilen bir yalnızlığın son tanığı.",
    info: "Hasankeyf, Dicle Nehri kıyısında 12.000 yıllık kesintisiz yerleşim tarihiyle dünyanın en eski yaşam alanlarından biriydi. Ilısu Barajı nedeniyle 2020'de sular altında kalmıştır.",
    color: "#2F4F4F",
    accent: "#5F8F8F"
  }
];

export default function YalnizlikSergiPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const artMeshesRef = useRef<THREE.Mesh[]>([]);
  const frameIdRef = useRef<number | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastStepTimeRef = useRef(0);
  const ambientNodesRef = useRef<{ oscs: OscillatorNode[]; gains: GainNode[] } | null>(null);
  const [ambientOn, setAmbientOn] = useState(false);

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
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 8, 28);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 1.7, 8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambient);

    // Spot lights for each artwork
    const spotPositions = [
      [-6, 4, -4.5], [-2, 4, -4.5], [2, 4, -4.5],
      [6, 4, -4.5], [-4, 4, 4.5], [4, 4, 4.5]
    ];
    spotPositions.forEach((pos) => {
      const spot = new THREE.SpotLight(0xffeedd, 2.5, 12, Math.PI / 6, 0.5);
      spot.position.set(pos[0], pos[1], pos[2]);
      const targetZ = pos[2] < 0 ? -5 : 5;
      spot.target.position.set(pos[0], 1.7, targetZ);
      spot.castShadow = true;
      scene.add(spot);
      scene.add(spot.target);

      // Light cone
      const coneGeo = new THREE.CylinderGeometry(0.05, 1.5, 4, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xffeedd,
        transparent: true,
        opacity: 0.04,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(pos[0], pos[1] - 2, pos[2]);
      if (pos[2] < 0) {
        cone.rotation.x = -0.15;
      } else {
        cone.rotation.x = 0.15;
      }
      scene.add(cone);
    });

    // Warm point light
    const warm = new THREE.PointLight(0xff6d60, 0.3, 20);
    warm.position.set(0, 3, 0);
    scene.add(warm);

    // Floor — procedural stone texture
    const floorTexCanvas = document.createElement("canvas");
    floorTexCanvas.width = 512;
    floorTexCanvas.height = 512;
    const fctx = floorTexCanvas.getContext("2d")!;
    fctx.fillStyle = "#2a2a2a";
    fctx.fillRect(0, 0, 512, 512);
    const blockSize = 64;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const variation = Math.floor(Math.random() * 20) - 10;
        const base = 42 + variation;
        fctx.fillStyle = `rgb(${base},${base},${base})`;
        fctx.fillRect(col * blockSize + 2, row * blockSize + 2, blockSize - 4, blockSize - 4);
      }
    }
    fctx.fillStyle = "#1a1a1a";
    for (let i = 0; i <= 8; i++) {
      fctx.fillRect(0, i * blockSize - 1, 512, 2);
      fctx.fillRect(i * blockSize - 1, 0, 2, 512);
    }
    const floorTex = new THREE.CanvasTexture(floorTexCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(4, 3);

    const floorGeo = new THREE.PlaneGeometry(20, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.6,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(20, 16);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5;
    scene.add(ceiling);

    // Walls — procedural concrete texture
    const wallTexCanvas = document.createElement("canvas");
    wallTexCanvas.width = 256;
    wallTexCanvas.height = 256;
    const wctx = wallTexCanvas.getContext("2d")!;
    wctx.fillStyle = "#222222";
    wctx.fillRect(0, 0, 256, 256);
    for (let ni = 0; ni < 3000; ni++) {
      const wx = Math.random() * 256;
      const wy = Math.random() * 256;
      const bright = Math.random() > 0.5;
      wctx.globalAlpha = 0.05 + Math.random() * 0.05;
      wctx.fillStyle = bright ? "#444444" : "#111111";
      wctx.fillRect(wx, wy, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }
    wctx.globalAlpha = 1;
    const wallTex = new THREE.CanvasTexture(wallTexCanvas);
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(3, 1);

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.95,
    });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMat);
    backWall.position.set(0, 2.5, -5);
    scene.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMat);
    frontWall.position.set(0, 2.5, 5);
    frontWall.rotation.y = Math.PI;
    scene.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), wallMat);
    leftWall.position.set(-10, 2.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), wallMat);
    rightWall.position.set(10, 2.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    // Create artworks
    const artMeshes: THREE.Mesh[] = [];

    ARTWORKS.forEach((art, i) => {
      const frameGeo = new THREE.BoxGeometry(2.8, 2, 0.08);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.5,
        roughness: 0.3
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.castShadow = true;

      const canvasGeo = new THREE.PlaneGeometry(2.4, 1.6);

      // Create gradient texture
      const canvas2d = document.createElement("canvas");
      canvas2d.width = 512;
      canvas2d.height = 340;
      const ctx = canvas2d.getContext("2d")!;

      const gradient = ctx.createLinearGradient(0, 0, 512, 340);
      gradient.addColorStop(0, art.color);
      gradient.addColorStop(1, art.accent);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 340);

      // Abstract shapes
      ctx.globalAlpha = 0.15;
      for (let j = 0; j < 5; j++) {
        ctx.fillStyle = j % 2 === 0 ? "#ffffff" : "#000000";
        ctx.beginPath();
        ctx.arc(
          100 + Math.sin(i * 3 + j) * 180,
          80 + Math.cos(i * 2 + j) * 120,
          40 + j * 15,
          0, Math.PI * 2
        );
        ctx.fill();
      }

      // Vertical lines (columns effect)
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      for (let j = 0; j < 8; j++) {
        const lx = 40 + j * 62;
        ctx.beginPath();
        ctx.moveTo(lx, 50);
        ctx.lineTo(lx + Math.sin(i + j) * 10, 300);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      const texture = new THREE.CanvasTexture(canvas2d);
      const canvasMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4
      });
      const artCanvas = new THREE.Mesh(canvasGeo, canvasMat);

      let x: number, z: number;
      if (i < 4) {
        x = -4.5 + i * 3;
        z = -4.93;
        artCanvas.position.set(x, 1.9, z + 0.05);
        frame.position.set(x, 1.9, z);
      } else {
        x = -3 + (i - 4) * 6;
        z = 4.93;
        artCanvas.position.set(x, 1.9, z - 0.05);
        artCanvas.rotation.y = Math.PI;
        frame.position.set(x, 1.9, z);
        frame.rotation.y = Math.PI;
      }

      // Label
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
      const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.25), labelMat);

      if (i < 4) {
        labelMesh.position.set(x, 0.65, -4.94);
      } else {
        labelMesh.position.set(x, 0.65, 4.94);
        labelMesh.rotation.y = Math.PI;
      }

      scene.add(frame);
      scene.add(artCanvas);
      scene.add(labelMesh);

      artCanvas.userData = { artworkId: art.id, index: i };
      artMeshes.push(artCanvas);
    });

    artMeshesRef.current = artMeshes;

    // Bench in center
    const benchGeo = new THREE.BoxGeometry(3, 0.5, 0.8);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.3
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, 0.25, 0);
    bench.castShadow = true;
    scene.add(bench);

    // Gallery title on floor
    const titleCanvas = document.createElement("canvas");
    titleCanvas.width = 1024;
    titleCanvas.height = 256;
    const tctx = titleCanvas.getContext("2d")!;
    tctx.fillStyle = "rgba(255, 109, 96, 0.08)";
    tctx.fillRect(0, 0, 1024, 256);
    tctx.fillStyle = "#FF6D60";
    tctx.font = "bold 48px sans-serif";
    tctx.textAlign = "center";
    tctx.fillText("Y A L N I Z L I K", 512, 100);
    tctx.fillStyle = "rgba(255, 109, 96, 0.6)";
    tctx.font = "24px sans-serif";
    tctx.fillText("Antik Topraklarda Bir Fotoğraf Sergisi", 512, 160);
    tctx.fillText("klemens \u00d7 sergi sanatçısı", 512, 200);

    const titleTex = new THREE.CanvasTexture(titleCanvas);
    const titleMat = new THREE.MeshBasicMaterial({
      map: titleTex,
      transparent: true,
      opacity: 0.9
    });
    const titleMesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), titleMat);
    titleMesh.rotation.x = -Math.PI / 2;
    titleMesh.position.set(0, 0.01, 4);
    scene.add(titleMesh);

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

      camera.position.x = Math.max(-9, Math.min(9, camera.position.x));
      camera.position.z = Math.max(-4, Math.min(4, camera.position.z));
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

      const euler = new THREE.Euler(pitchRef.current, yawRef.current, 0, "YXZ");
      camera.quaternion.setFromEuler(euler);

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
        yawRef.current -= dx * 0.003;
        pitchRef.current -= dy * 0.003;
        pitchRef.current = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, pitchRef.current));
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = () => { isDraggingRef.current = false; };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Click on artwork
    const onClick = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(artMeshesRef.current);

      if (intersects.length > 0) {
        const idx = intersects[0].object.userData.index;
        setSelectedArt(ARTWORKS[idx]);
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastMouseRef.current.x;
        const dy = e.touches[0].clientY - lastMouseRef.current.y;
        yawRef.current -= dx * 0.004;
        pitchRef.current -= dy * 0.004;
        pitchRef.current = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, pitchRef.current));
        lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchEnd = () => { isDraggingRef.current = false; };

    renderer.domElement.addEventListener("touchstart", onTouchStart);
    renderer.domElement.addEventListener("touchmove", onTouchMove);
    renderer.domElement.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
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

  return (
    <div style={{ width: "100%", height: "100vh", background: "#1a1a1a", position: "relative", overflow: "hidden" }}>
      {/* 3D Canvas */}
      <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />

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

      {/* Controls hint */}
      <div style={{
        position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.7)", borderRadius: 12, padding: "10px 20px",
        color: "#aaa", fontSize: 12, display: "flex", gap: 16, alignItems: "center",
        backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <span>
          <span style={{ color: "#FF6D60", fontWeight: 600 }}>WASD</span> hareket
        </span>
        <span style={{ color: "#333" }}>|</span>
        <span>
          <span style={{ color: "#FF6D60", fontWeight: 600 }}>S&uuml;r&uuml;kle</span> etrafına bak
        </span>
        <span style={{ color: "#333" }}>|</span>
        <span>
          <span style={{ color: "#FF6D60", fontWeight: 600 }}>Tıkla</span> esere yaklaş
        </span>
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
              background: "#1a1a1a", borderRadius: 16, maxWidth: 600, width: "90%",
              border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Artwork preview */}
            <div style={{
              height: 200, background: `linear-gradient(135deg, ${selectedArt.color}, ${selectedArt.accent})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative"
            }}>
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
