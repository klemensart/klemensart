import * as THREE from "three";
import { ROOM_SIZE, WALL_HEIGHT } from "./data";

export type SceneContext = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  isMobile: boolean;
  floorMat: THREE.MeshStandardMaterial;
  wallMat: THREE.MeshStandardMaterial;
  ceilMat: THREE.MeshStandardMaterial;
  darkTrimMat: THREE.MeshStandardMaterial;
  doorFrameMat: THREE.MeshStandardMaterial;
};

export function createScene(
  container: HTMLDivElement
): SceneContext {
  const w = container.clientWidth;
  const h = container.clientHeight;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1714);
  scene.fog = new THREE.FogExp2(0x1a1714, 0.005);

  // Camera — start inside Room 0 (Afrodisias), near north wall, looking south
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
  camera.position.set(0, 1.7, 3);

  // Renderer
  const mobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const renderer = new THREE.WebGLRenderer({ antialias: !mobile });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
  renderer.shadowMap.enabled = !mobile;
  if (!mobile) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Global ambient — warm museum (bright for visibility)
  const ambient = new THREE.AmbientLight(0xfff5e6, 1.0);
  scene.add(ambient);

  // Directional fill light from above
  const fill = new THREE.DirectionalLight(0xfff0dd, 0.5);
  fill.position.set(5, 10, 0);
  scene.add(fill);

  // Second fill from opposite side
  const fill2 = new THREE.DirectionalLight(0xfff0dd, 0.3);
  fill2.position.set(-5, 8, -10);
  scene.add(fill2);

  // Shared textures & materials
  const floorMat = createFloorMaterial();
  const wallMat = createWallMaterial();
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x2a2520 });
  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x1a1612,
    roughness: 0.8,
  });
  const doorFrameMat = new THREE.MeshStandardMaterial({
    color: 0x2a2420,
    roughness: 0.7,
    metalness: 0.15,
  });

  return {
    scene,
    camera,
    renderer,
    isMobile: mobile,
    floorMat,
    wallMat,
    ceilMat,
    darkTrimMat,
    doorFrameMat,
  };
}

function createFloorMaterial(): THREE.MeshStandardMaterial {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#3e3630";
  ctx.fillRect(0, 0, 512, 512);
  const bs = 64;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const v = Math.floor(Math.random() * 15) - 7;
      ctx.fillStyle = `rgb(${62 + v},${56 + v},${48 + v})`;
      ctx.fillRect(col * bs + 2, row * bs + 2, bs - 4, bs - 4);
    }
  }
  ctx.fillStyle = "#302a22";
  for (let i = 0; i <= 8; i++) {
    ctx.fillRect(0, i * bs - 1, 512, 2);
    ctx.fillRect(i * bs - 1, 0, 2, 512);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.25,
    metalness: 0.15,
  });
}

function createWallMaterial(): THREE.MeshStandardMaterial {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#3e3830";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.globalAlpha = 0.04 + Math.random() * 0.04;
    ctx.fillStyle = Math.random() > 0.5 ? "#5a5048" : "#2e2822";
    ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
}

export function addRoomLighting(
  scene: THREE.Scene,
  cx: number,
  cz: number
): void {
  // Ceiling fill light per room — bright enough to illuminate walls
  const center = new THREE.PointLight(0xffe8d0, 1.2, ROOM_SIZE * 2.5);
  center.position.set(cx, WALL_HEIGHT - 0.3, cz);
  scene.add(center);

  // Secondary fill from lower position for wall illumination
  const low = new THREE.PointLight(0xfff0e0, 0.4, ROOM_SIZE * 1.5);
  low.position.set(cx, 2.0, cz);
  scene.add(low);
}
