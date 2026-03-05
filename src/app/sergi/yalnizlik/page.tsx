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

const ARTWORKS: Artwork[] = [
  {
    id: 1,
    title: "Efes'te Yalnızlık",
    location: "Efes Antik Kenti, İzmir",
    photographer: "Sergi Sanatçısı",
    note: "Binlerce yıllık sütunların arasında, kalabalıklar çekildiğinde geriye kalan sessizlik... Efes'in taşlarında yankılanan yalnızlık.",
    info: "Efes, MÖ 10. yüzyılda kurulan ve antik dünyanın en büyük şehirlerinden biri olan İyon kentidir. Artemis Tapınağı ile dünyanın yedi harikasından birine ev sahipliği yapmıştır.",
    color: "#8B6914",
    accent: "#D4A843",
    image: "/sergi/yalnizlik/eser1.jpg"
  },
  {
    id: 2,
    title: "Apollon'un Gölgesi",
    location: "Didim Apollon Tapınağı, Aydın",
    photographer: "Sergi Sanatçısı",
    note: "Devasa sütunların gölgesinde küçülmek... Tanrıların evinde insan olmanın o ezici ama huzurlu yalnızlığı.",
    info: "Apollon Tapınağı, antik çağın en büyük tapınaklarından biridir. 120 adet 20 metre yüksekliğindeki İon sütunuyla inşa edilmiş, kehanet merkezi olarak kullanılmıştır.",
    color: "#4A6741",
    accent: "#7BA370",
    image: "/sergi/yalnizlik/eser2.jpg"
  },
  {
    id: 3,
    title: "Patara'da Akşam",
    location: "Patara Antik Kenti, Antalya",
    photographer: "Sergi Sanatçısı",
    note: "Akdeniz'in son ışıkları antik tiyatronun taşlarına düşerken, zaman durur. Burada yalnızlık bir lüks değil, bir armağan.",
    info: "Patara, Likya Birliği'nin başkenti ve antik dünyanın önemli liman şehirlerinden biriydi. Noel Baba olarak bilinen Aziz Nikolaos'un doğum yeridir.",
    color: "#8B4513",
    accent: "#CD853F",
    image: "/sergi/yalnizlik/eser3.jpg"
  },
  {
    id: 4,
    title: "Afrodisias Sessizliği",
    location: "Afrodisias Antik Kenti, Aydın",
    photographer: "Sergi Sanatçısı",
    note: "UNESCO'nun koruması altındaki bu kent, adını aşk tanrıçasından alıyor. Ama burada aşktan çok, taşa işlenmiş bir sessizlik var.",
    info: "Afrodisias, antik dönemde heykeltraşlık okuluyla ünlüydü. 2017'de UNESCO Dünya Mirası listesine alınmış olup, stadyumu antik dünyanın en iyi korunmuş örneklerinden biridir.",
    color: "#5B3A6B",
    accent: "#9B6BB0",
    image: "/sergi/yalnizlik/eser4.jpg"
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
  const [isMobile, setIsMobile] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

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
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 1.7, 0);
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

    // Lighting — bright, even illumination
    const ambient = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambient);

    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(0, 5, 5);
    scene.add(fill);

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

    const floorGeo = new THREE.PlaneGeometry(24, 18);
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
    const ceilGeo = new THREE.PlaneGeometry(24, 18);
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

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 5), wallMat);
    backWall.position.set(0, 2.5, -9);
    scene.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 5), wallMat);
    frontWall.position.set(0, 2.5, 9);
    frontWall.rotation.y = Math.PI;
    scene.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 5), wallMat);
    leftWall.position.set(-12, 2.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 5), wallMat);
    rightWall.position.set(12, 2.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    // Create artworks
    const artMeshes: THREE.Mesh[] = [];
    const loader = new THREE.TextureLoader();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // Artwork positions: 2 on back wall, 2 on front wall
    const artPositions = [
      { x: -4, z: -8.93, labelZ: -8.94, facing: 0 },        // back wall left
      { x: 4,  z: -8.93, labelZ: -8.94, facing: 0 },        // back wall right
      { x: -4, z: 8.93,  labelZ: 8.94,  facing: Math.PI },   // front wall left
      { x: 4,  z: 8.93,  labelZ: 8.94,  facing: Math.PI },   // front wall right
    ];

    ARTWORKS.forEach((art, i) => {
      const pos = artPositions[i];
      const frameGeo = new THREE.BoxGeometry(3.6, 2.6, 0.08);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.5,
        roughness: 0.3
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.castShadow = true;
      frame.position.set(pos.x, 1.9, pos.z);
      frame.rotation.y = pos.facing;

      const canvasGeo = new THREE.PlaneGeometry(3.2, 2.2);

      // Load photo texture
      const texture = loader.load(art.image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = maxAniso;
      const canvasMat = new THREE.MeshBasicMaterial({
        map: texture,
      });
      const artCanvas = new THREE.Mesh(canvasGeo, canvasMat);
      const canvasOffset = pos.facing === 0 ? 0.05 : -0.05;
      artCanvas.position.set(pos.x, 1.9, pos.z + canvasOffset);
      artCanvas.rotation.y = pos.facing;

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
      labelMesh.position.set(pos.x, 0.35, pos.labelZ);
      labelMesh.rotation.y = pos.facing;

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

    // Gallery title on left wall
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
    tctx.fillText("klemens \u00d7 sergi sanatçısı", 512, 340);

    const titleTex = new THREE.CanvasTexture(titleCanvas);
    const titleMat = new THREE.MeshBasicMaterial({ map: titleTex });
    const titleMesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), titleMat);
    titleMesh.rotation.y = Math.PI / 2;
    titleMesh.position.set(-11.95, 2.5, 0);
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

      // Q/E rotation
      if (keysRef.current["q"]) yawRef.current += 0.025;
      if (keysRef.current["e"]) yawRef.current -= 0.025;

      camera.position.x = Math.max(-11, Math.min(11, camera.position.x));
      camera.position.z = Math.max(-8, Math.min(8, camera.position.z));
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

      // FOV zoom when close to artwork
      let minDist = Infinity;
      for (const m of artMeshes) {
        const d = camera.position.distanceTo(m.position);
        if (d < minDist) minDist = d;
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
        yawRef.current += dx * 0.004;
        pitchRef.current += dy * 0.004;
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
                  <span style={{ color: "#fff", fontWeight: 600 }}>Eserlere tıkla</span> &mdash; Detay gör
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
