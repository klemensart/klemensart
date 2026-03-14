import * as THREE from "three";
import { ROOMS, ARTWORKS, ROOM_SIZE, getRoomCenter } from "./data";
import type { Artwork, ArtworkSlot, WallSide } from "./types";

const HALF = ROOM_SIZE / 2;
const FRAME_W = 2.5;
const FRAME_H = 1.4;
const CANVAS_W = 2.2;
const CANVAS_H = 1.15;
const PP_W = CANVAS_W + 0.25;
const PP_H = CANVAS_H + 0.2;
const WALL_OFFSET = 0.07; // distance from wall surface

export type ArtMeshInfo = {
  mesh: THREE.Mesh;
  artwork: Artwork;
  artworkIndex: number; // index into ARTWORKS array
  roomId: number;
};

/**
 * Place all artworks in all rooms. Returns array of art mesh info for interaction.
 */
export function placeAllArtworks(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
): ArtMeshInfo[] {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const allArtMeshes: ArtMeshInfo[] = [];

  // Shared geometry & materials (created once)
  const sharedFrameGeo = new THREE.BoxGeometry(FRAME_W, FRAME_H, 0.12);
  const sharedFrameMat = new THREE.MeshStandardMaterial({
    color: 0x3a2e28,
    metalness: 0.1,
    roughness: 0.7,
  });
  const sharedCanvasGeo = new THREE.PlaneGeometry(CANVAS_W, CANVAS_H);
  const sharedLabelGeo = new THREE.PlaneGeometry(1.8, 0.22);
  const sharedPPGeo = new THREE.PlaneGeometry(PP_W, PP_H);
  const sharedPPMat = createPassepartoutMaterial();

  for (const room of ROOMS) {
    const [cx, , cz] = getRoomCenter(room);

    room.artworkIds.forEach((artId, slotIdx) => {
      const artwork = ARTWORKS.find((a) => a.id === artId);
      if (!artwork) return;
      const artworkIndex = ARTWORKS.indexOf(artwork);
      const slot = room.slots[slotIdx];
      if (!slot) return;

      const { position, rotation } = getSlotWorldPosition(
        cx,
        cz,
        slot
      );

      // Frame
      const frame = new THREE.Mesh(sharedFrameGeo, sharedFrameMat);
      frame.castShadow = true;
      frame.position.copy(position);
      frame.rotation.y = rotation;
      scene.add(frame);

      // Passepartout
      const ppMesh = new THREE.Mesh(sharedPPGeo, sharedPPMat);
      const ppOffset = getWallNormalOffset(slot.wallSide, WALL_OFFSET + 0.001);
      ppMesh.position.copy(position).add(ppOffset);
      ppMesh.rotation.y = rotation;
      scene.add(ppMesh);

      // Photo canvas (lazy loaded)
      const canvasMat = new THREE.MeshBasicMaterial({ color: 0x2a2622 });
      const artCanvas = new THREE.Mesh(sharedCanvasGeo, canvasMat);
      const canvasOffset = getWallNormalOffset(
        slot.wallSide,
        WALL_OFFSET + 0.002
      );
      artCanvas.position.copy(position).add(canvasOffset);
      artCanvas.rotation.y = rotation;
      artCanvas.userData.loaded = false;
      artCanvas.userData.imageSrc = artwork.image;
      artCanvas.userData.maxAniso = maxAniso;
      scene.add(artCanvas);

      // Per-artwork museum spotlight
      const spotLight = new THREE.SpotLight(0xffe4c4, 1.5, 8, Math.PI / 6, 0.5, 1);
      const lightOffset = getWallNormalOffset(slot.wallSide, 2.0);
      spotLight.position
        .copy(position)
        .add(lightOffset)
        .setY(slot.height + 2.0);
      spotLight.target.position.copy(position);
      scene.add(spotLight);
      scene.add(spotLight.target);

      // Label
      const labelMesh = createLabel(artwork, sharedLabelGeo);
      const labelOffset = getWallNormalOffset(
        slot.wallSide,
        WALL_OFFSET - 0.01
      );
      labelMesh.position
        .copy(position)
        .add(labelOffset)
        .setY(slot.height - FRAME_H / 2 - 0.25);
      labelMesh.rotation.y = rotation;
      scene.add(labelMesh);

      allArtMeshes.push({
        mesh: artCanvas,
        artwork,
        artworkIndex,
        roomId: room.id,
      });
    });
  }

  return allArtMeshes;
}

function getSlotWorldPosition(
  cx: number,
  cz: number,
  slot: ArtworkSlot
): { position: THREE.Vector3; rotation: number } {
  const range = HALF - 0.8; // usable wall length (margin from corners)
  const offsetDist = slot.offset * range;

  let x: number, z: number, rot: number;
  switch (slot.wallSide) {
    case "north":
      x = cx + offsetDist;
      z = cz + HALF - WALL_OFFSET;
      rot = Math.PI;
      break;
    case "south":
      x = cx + offsetDist;
      z = cz - HALF + WALL_OFFSET;
      rot = 0;
      break;
    case "east":
      x = cx + HALF - WALL_OFFSET;
      z = cz + offsetDist;
      rot = -Math.PI / 2;
      break;
    case "west":
      x = cx - HALF + WALL_OFFSET;
      z = cz + offsetDist;
      rot = Math.PI / 2;
      break;
  }

  return {
    position: new THREE.Vector3(x, slot.height, z),
    rotation: rot,
  };
}

function getWallNormalOffset(side: WallSide, dist: number): THREE.Vector3 {
  switch (side) {
    case "north":
      return new THREE.Vector3(0, 0, -dist);
    case "south":
      return new THREE.Vector3(0, 0, dist);
    case "east":
      return new THREE.Vector3(-dist, 0, 0);
    case "west":
      return new THREE.Vector3(dist, 0, 0);
  }
}

function createLabel(
  art: Artwork,
  geo: THREE.PlaneGeometry
): THREE.Mesh {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = "#cccccc";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(art.title, 256, 24);
  ctx.fillStyle = "#888888";
  ctx.font = "14px sans-serif";
  ctx.fillText(art.location, 256, 48);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  return new THREE.Mesh(geo, mat);
}

function createPassepartoutMaterial(): THREE.MeshStandardMaterial {
  const ppPxW = 512;
  const ppPxH = Math.round(512 * (PP_H / PP_W));
  const canvas = document.createElement("canvas");
  canvas.width = ppPxW;
  canvas.height = ppPxH;
  const ctx = canvas.getContext("2d")!;

  // Base cream color
  ctx.fillStyle = "#f0ebe4";
  ctx.fillRect(0, 0, ppPxW, ppPxH);

  // Subtle grain
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * ppPxW;
    const y = Math.random() * ppPxH;
    ctx.globalAlpha = 0.03 + Math.random() * 0.03;
    ctx.fillStyle = Math.random() > 0.5 ? "#ddd8d0" : "#f8f4ef";
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  ctx.globalAlpha = 1;

  // Inner opening groove
  const openL = ((PP_W - CANVAS_W) / 2 / PP_W) * ppPxW;
  const openR = ppPxW - openL;
  const openT = ((PP_H - CANVAS_H) / 2 / PP_H) * ppPxH;
  const openB = ppPxH - openT;
  const gw = 2;
  ctx.fillStyle = "#8a8078";
  ctx.fillRect(openL - gw, openT - gw, openR - openL + gw * 2, gw);
  ctx.fillRect(openL - gw, openB, openR - openL + gw * 2, gw);
  ctx.fillRect(openL - gw, openT, gw, openB - openT);
  ctx.fillRect(openR, openT, gw, openB - openT);

  const tex = new THREE.CanvasTexture(canvas);
  return new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.95,
    metalness: 0,
  });
}

// Singleton loader — reused across all frames
const sharedLoader = new THREE.TextureLoader();

function loadArtTexture(info: ArtMeshInfo): void {
  if (info.mesh.userData.loaded) return;
  info.mesh.userData.loaded = true;
  const tex = sharedLoader.load(info.mesh.userData.imageSrc);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = info.mesh.userData.maxAniso || 1;
  (info.mesh.material as THREE.MeshBasicMaterial).map = tex;
  (info.mesh.material as THREE.MeshBasicMaterial).color.set(0xffffff);
  (info.mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
}

/**
 * Preload artworks for a specific room immediately.
 */
export function preloadRoom(
  artMeshes: ArtMeshInfo[],
  roomId: number
): void {
  for (const info of artMeshes) {
    if (info.roomId === roomId) loadArtTexture(info);
  }
}

/**
 * Lazy-load artwork textures when camera is near.
 */
export function checkLazyLoad(
  artMeshes: ArtMeshInfo[],
  camera: THREE.PerspectiveCamera,
  frameCounter: number,
  loadDist: number = 18
): void {
  // Check 3 artworks per frame
  for (let c = 0; c < 3; c++) {
    const idx = (frameCounter * 3 + c) % artMeshes.length;
    const info = artMeshes[idx];
    if (info.mesh.userData.loaded) continue;
    const dist = camera.position.distanceTo(info.mesh.position);
    if (dist < loadDist) loadArtTexture(info);
  }
}
