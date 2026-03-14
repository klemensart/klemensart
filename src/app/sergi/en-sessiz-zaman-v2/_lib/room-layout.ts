import * as THREE from "three";
import {
  ROOMS,
  DOORS,
  ROOM_SIZE,
  WALL_HEIGHT,
  DOOR_WIDTH,
  DOOR_HEIGHT,
  getRoomCenter,
} from "./data";
import type { WalkRect, WallSide } from "./types";
import type { SceneContext } from "./scene-setup";
import { addRoomLighting } from "./scene-setup";

const HALF = ROOM_SIZE / 2;
const DOOR_HALF = DOOR_WIDTH / 2;

/**
 * Build all 6 procedural rooms with walls, floors, ceilings, and door openings.
 */
export function buildAllRooms(ctx: SceneContext): THREE.Group[] {
  const roomGroups: THREE.Group[] = [];

  // Pre-compute which walls have doors per room
  const roomDoors = new Map<number, Set<WallSide>>();
  for (const room of ROOMS) {
    roomDoors.set(room.id, new Set());
  }
  for (const door of DOORS) {
    roomDoors.get(door.roomA)!.add(door.wallSideA);
    roomDoors.get(door.roomB)!.add(door.wallSideB);
  }

  // Shared geometries
  const floorGeo = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);
  const ceilGeo = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);

  for (const room of ROOMS) {
    const [cx, , cz] = getRoomCenter(room);
    const group = new THREE.Group();
    group.position.set(cx, 0, cz);
    group.userData.roomId = room.id;

    // Floor
    const floor = new THREE.Mesh(floorGeo, ctx.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Ceiling
    const ceil = new THREE.Mesh(ceilGeo, ctx.ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = WALL_HEIGHT;
    group.add(ceil);

    // Walls — 4 sides, each possibly with a door
    const doors = roomDoors.get(room.id)!;
    buildWall(group, "north", doors.has("north"), ctx);
    buildWall(group, "south", doors.has("south"), ctx);
    buildWall(group, "east", doors.has("east"), ctx);
    buildWall(group, "west", doors.has("west"), ctx);

    // Baseboard trim
    addBaseboard(group, doors, ctx);

    // Klemens embossed plaque
    addKlemensPlaque(group);

    ctx.scene.add(group);
    roomGroups.push(group);

    // Room lighting
    addRoomLighting(ctx.scene, cx, cz);
  }

  // Build door frames between rooms
  for (const door of DOORS) {
    const roomA = ROOMS[door.roomA];
    const roomB = ROOMS[door.roomB];
    const [ax, , az] = getRoomCenter(roomA);
    const [bx, , bz] = getRoomCenter(roomB);
    const mx = (ax + bx) / 2;
    const mz = (az + bz) / 2;
    const isEW = door.wallSideA === "east" || door.wallSideA === "west";
    buildDoorFrame(ctx, mx, mz, isEW, roomA.name, roomB.name);

    // Door accent lights — warm, strong enough to see the doorway
    const doorLight1 = new THREE.PointLight(0xffd9a0, 0.6, 8);
    doorLight1.position.set(mx, DOOR_HEIGHT - 0.5, mz);
    ctx.scene.add(doorLight1);

    // Floor guide light near door (subtle glow on the floor)
    const floorLight = new THREE.PointLight(0xffe0b2, 0.3, 4);
    floorLight.position.set(mx, 0.1, mz);
    ctx.scene.add(floorLight);
  }

  // Entrance door on north side (between rooms 0 and 1)
  const entranceDoor = buildEntranceDoor(ctx);
  ctx.scene.add(entranceDoor);

  return roomGroups;
}

function buildWall(
  group: THREE.Group,
  side: WallSide,
  hasDoor: boolean,
  ctx: SceneContext
): void {
  if (!hasDoor) {
    // Full wall
    const geo = new THREE.PlaneGeometry(ROOM_SIZE, WALL_HEIGHT);
    const wall = new THREE.Mesh(geo, ctx.wallMat);
    positionWall(wall, side);
    group.add(wall);
    return;
  }

  // Wall with door opening: left segment, right segment, lintel above door
  const sideW = (ROOM_SIZE - DOOR_WIDTH) / 2;

  // Left segment
  const leftGeo = new THREE.PlaneGeometry(sideW, WALL_HEIGHT);
  const left = new THREE.Mesh(leftGeo, ctx.wallMat);
  positionWallSegment(left, side, -HALF + sideW / 2, WALL_HEIGHT / 2);
  group.add(left);

  // Right segment
  const rightGeo = new THREE.PlaneGeometry(sideW, WALL_HEIGHT);
  const right = new THREE.Mesh(rightGeo, ctx.wallMat);
  positionWallSegment(right, side, HALF - sideW / 2, WALL_HEIGHT / 2);
  group.add(right);

  // Lintel above door
  const lintelH = WALL_HEIGHT - DOOR_HEIGHT;
  if (lintelH > 0) {
    const lintelGeo = new THREE.PlaneGeometry(DOOR_WIDTH, lintelH);
    const lintel = new THREE.Mesh(lintelGeo, ctx.wallMat);
    positionWallSegment(lintel, side, 0, DOOR_HEIGHT + lintelH / 2);
    group.add(lintel);
  }
}

function positionWall(mesh: THREE.Mesh, side: WallSide): void {
  const h = WALL_HEIGHT / 2;
  switch (side) {
    case "north":
      mesh.position.set(0, h, HALF);
      mesh.rotation.y = Math.PI;
      break;
    case "south":
      mesh.position.set(0, h, -HALF);
      mesh.rotation.y = 0;
      break;
    case "east":
      mesh.position.set(HALF, h, 0);
      mesh.rotation.y = -Math.PI / 2;
      break;
    case "west":
      mesh.position.set(-HALF, h, 0);
      mesh.rotation.y = Math.PI / 2;
      break;
  }
}

function positionWallSegment(
  mesh: THREE.Mesh,
  side: WallSide,
  offset: number,
  yPos: number
): void {
  switch (side) {
    case "north":
      mesh.position.set(offset, yPos, HALF);
      mesh.rotation.y = Math.PI;
      break;
    case "south":
      mesh.position.set(offset, yPos, -HALF);
      mesh.rotation.y = 0;
      break;
    case "east":
      mesh.position.set(HALF, yPos, offset);
      mesh.rotation.y = -Math.PI / 2;
      break;
    case "west":
      mesh.position.set(-HALF, yPos, offset);
      mesh.rotation.y = Math.PI / 2;
      break;
  }
}

function addBaseboard(
  group: THREE.Group,
  doors: Set<WallSide>,
  ctx: SceneContext
): void {
  const bbH = 0.12;
  const bbD = 0.04;
  const sides: WallSide[] = ["north", "south", "east", "west"];

  for (const side of sides) {
    if (doors.has(side)) continue; // skip sides with doors (baseboard would block)
    const isNS = side === "north" || side === "south";
    const geo = isNS
      ? new THREE.BoxGeometry(ROOM_SIZE, bbH, bbD)
      : new THREE.BoxGeometry(bbD, bbH, ROOM_SIZE);
    const bb = new THREE.Mesh(geo, ctx.darkTrimMat);
    const inset = 0.02;
    switch (side) {
      case "north":
        bb.position.set(0, bbH / 2, HALF - inset);
        break;
      case "south":
        bb.position.set(0, bbH / 2, -HALF + inset);
        break;
      case "east":
        bb.position.set(HALF - inset, bbH / 2, 0);
        break;
      case "west":
        bb.position.set(-HALF + inset, bbH / 2, 0);
        break;
    }
    group.add(bb);
  }
}

function buildDoorFrame(
  ctx: SceneContext,
  x: number,
  z: number,
  isEastWest: boolean,
  roomAName: string,
  roomBName: string
): void {
  const postW = 0.2;
  const postD = 0.2;
  const postH = DOOR_HEIGHT;

  // Emissive door frame material — visible in dim lighting
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x4a3c30,
    roughness: 0.5,
    metalness: 0.3,
    emissive: 0x1a1208,
    emissiveIntensity: 0.5,
  });

  // Two vertical posts
  const postGeo = new THREE.BoxGeometry(
    isEastWest ? postD : postW,
    postH,
    isEastWest ? postW : postD
  );

  const offAxis = DOOR_HALF + postW / 2;

  const post1 = new THREE.Mesh(postGeo, frameMat);
  const post2 = new THREE.Mesh(postGeo, frameMat);

  if (isEastWest) {
    post1.position.set(x, postH / 2, z - offAxis);
    post2.position.set(x, postH / 2, z + offAxis);
  } else {
    post1.position.set(x - offAxis, postH / 2, z);
    post2.position.set(x + offAxis, postH / 2, z);
  }

  ctx.scene.add(post1, post2);

  // Horizontal lintel beam
  const lintelW = DOOR_WIDTH + postW * 2;
  const lintelGeo = new THREE.BoxGeometry(
    isEastWest ? postD : lintelW,
    postW,
    isEastWest ? lintelW : postD
  );
  const lintel = new THREE.Mesh(lintelGeo, frameMat);
  lintel.position.set(x, DOOR_HEIGHT + postW / 2, z);
  ctx.scene.add(lintel);

  // Emissive accent strip on lintel (warm glow)
  const stripGeo = new THREE.BoxGeometry(
    isEastWest ? 0.05 : lintelW - 0.1,
    0.06,
    isEastWest ? lintelW - 0.1 : 0.05
  );
  const stripMat = new THREE.MeshStandardMaterial({
    color: 0xffd9a0,
    emissive: 0xffd9a0,
    emissiveIntensity: 0.8,
  });
  const strip = new THREE.Mesh(stripGeo, stripMat);
  strip.position.set(x, DOOR_HEIGHT - 0.05, z);
  ctx.scene.add(strip);

  // Room name labels above door (one on each side)
  addDoorLabel(ctx, x, z, isEastWest, roomBName, 1);
  addDoorLabel(ctx, x, z, isEastWest, roomAName, -1);

  // Floor threshold strip
  const threshGeo = new THREE.BoxGeometry(
    isEastWest ? 0.3 : DOOR_WIDTH,
    0.02,
    isEastWest ? DOOR_WIDTH : 0.3
  );
  const threshMat = new THREE.MeshStandardMaterial({
    color: 0x6b5b4a,
    metalness: 0.5,
    roughness: 0.3,
  });
  const thresh = new THREE.Mesh(threshGeo, threshMat);
  thresh.position.set(x, 0.01, z);
  ctx.scene.add(thresh);
}

function addDoorLabel(
  ctx: SceneContext,
  x: number,
  z: number,
  isEastWest: boolean,
  roomName: string,
  direction: number // +1 or -1 (which side of the door to place the label)
): void {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "rgba(0,0,0,0)";
  c.clearRect(0, 0, 512, 64);
  c.fillStyle = "#FF6D60";
  c.font = "bold 28px sans-serif";
  c.textAlign = "center";
  c.fillText(roomName, 256, 40);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
  });
  const labelW = 2.5;
  const labelH = 0.3;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(labelW, labelH),
    mat
  );

  // Position label above door, facing TOWARD the viewer on that side
  const labelY = DOOR_HEIGHT + 0.6;
  if (isEastWest) {
    mesh.position.set(x + direction * 0.15, labelY, z);
    // direction +1 = room B side → face +X (toward viewer in room B)
    // direction -1 = room A side → face -X (toward viewer in room A)
    mesh.rotation.y = (Math.PI / 2) * direction;
  } else {
    mesh.position.set(x, labelY, z + direction * 0.15);
    // direction +1 = room A side → face +Z (toward viewer in room A)
    // direction -1 = room B side → face -Z (toward viewer in room B)
    mesh.rotation.y = direction > 0 ? 0 : Math.PI;
  }

  ctx.scene.add(mesh);
}

function buildEntranceDoor(ctx: SceneContext): THREE.Group {
  const entranceGroup = new THREE.Group();

  // Title panel on the wall above entrance (north wall between rooms 0 and 1)
  const titleCanvas = document.createElement("canvas");
  titleCanvas.width = 1024;
  titleCanvas.height = 256;
  const tctx = titleCanvas.getContext("2d")!;
  tctx.fillStyle = "#2a2622";
  tctx.fillRect(0, 0, 1024, 256);
  tctx.fillStyle = "#FF6D60";
  tctx.font = "italic 48px sans-serif";
  tctx.textAlign = "center";
  tctx.fillText("En Sessiz Zaman", 512, 100);
  tctx.fillStyle = "#888888";
  tctx.font = "24px sans-serif";
  tctx.fillText("klemens \u00d7 Theo Atay", 512, 160);
  tctx.fillStyle = "#666666";
  tctx.font = "18px sans-serif";
  tctx.fillText("Antik Topraklarda Bir Fotograf Sergisi", 512, 210);

  const titleTex = new THREE.CanvasTexture(titleCanvas);
  const titleMat = new THREE.MeshBasicMaterial({ map: titleTex });
  const titleMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 1.5),
    titleMat
  );
  titleMesh.position.set(ROOM_SIZE / 2, WALL_HEIGHT - 1, HALF + 0.05);
  titleMesh.rotation.y = Math.PI;
  entranceGroup.add(titleMesh);

  return entranceGroup;
}

// ── Walkable area definition ──

export function getWalkableRects(): WalkRect[] {
  const rects: WalkRect[] = [];
  const inset = 0.3;

  // Room interiors
  for (const room of ROOMS) {
    const [cx, , cz] = getRoomCenter(room);
    rects.push({
      minX: cx - HALF + inset,
      maxX: cx + HALF - inset,
      minZ: cz - HALF + inset,
      maxZ: cz + HALF - inset,
    });
  }

  // Door bridges (thin corridors connecting rooms through shared walls)
  for (const door of DOORS) {
    const roomA = ROOMS[door.roomA];
    const roomB = ROOMS[door.roomB];
    const [ax, , az] = getRoomCenter(roomA);
    const [bx, , bz] = getRoomCenter(roomB);
    const isEW = door.wallSideA === "east" || door.wallSideA === "west";

    if (isEW) {
      // Horizontal door: bridge in X, constrained in Z
      const minX = Math.min(ax, bx) + HALF - inset;
      const maxX = Math.max(ax, bx) - HALF + inset;
      rects.push({
        minX,
        maxX,
        minZ: ((az + bz) / 2) - DOOR_HALF,
        maxZ: ((az + bz) / 2) + DOOR_HALF,
      });
    } else {
      // Vertical door: bridge in Z, constrained in X
      const minZ = Math.min(az, bz) + HALF - inset;
      const maxZ = Math.max(az, bz) - HALF + inset;
      rects.push({
        minX: ((ax + bx) / 2) - DOOR_HALF,
        maxX: ((ax + bx) / 2) + DOOR_HALF,
        minZ,
        maxZ,
      });
    }
  }

  return rects;
}

export function isInWalkableArea(
  x: number,
  z: number,
  rects: WalkRect[]
): boolean {
  return rects.some(
    (r) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ
  );
}

// ── Klemens cut-letter wall logo ──

// Shared logo resources — loaded once, reused in all rooms
let sharedLogoMat: THREE.MeshBasicMaterial | null = null;
const sharedLogoGeo = new THREE.PlaneGeometry(0.8, 0.8 / 1.7);

function addKlemensPlaque(group: THREE.Group): void {
  if (!sharedLogoMat) {
    const tex = new THREE.TextureLoader().load("/logos/logo-wide-transparent.PNG");
    tex.colorSpace = THREE.SRGBColorSpace;
    sharedLogoMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }

  const mesh = new THREE.Mesh(sharedLogoGeo, sharedLogoMat);
  mesh.position.set(HALF - 0.8, 0.9, -HALF + 0.02);
  group.add(mesh);
}
