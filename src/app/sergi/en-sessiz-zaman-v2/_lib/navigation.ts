import * as THREE from "three";
import type { WalkRect } from "./types";
import { isInWalkableArea } from "./room-layout";

export type NavState = {
  keys: Record<string, boolean>;
  isDragging: boolean;
  lastMouse: { x: number; y: number };
  yaw: number;
  pitch: number;
  velocity: THREE.Vector3;
  bobPhase: number;
  pinchDist: number;
  dragEndTime: number;
};

export function createNavState(): NavState {
  return {
    keys: {},
    isDragging: false,
    lastMouse: { x: 0, y: 0 },
    yaw: 0, // looking south (-Z)
    pitch: 0,
    velocity: new THREE.Vector3(),
    bobPhase: 0,
    pinchDist: 0,
    dragEndTime: 0,
  };
}

const MAX_SPEED = 0.12;
const ACCEL_LERP = 0.1;
const DECEL_FACTOR = 0.92;
const SOFT_BOUNDARY = 1.5;
const EYE_HEIGHT = 1.7;

/**
 * Update camera position and orientation each frame.
 */
export function updateNavigation(
  nav: NavState,
  camera: THREE.PerspectiveCamera,
  walkRects: WalkRect[],
  artMeshes: THREE.Mesh[],
  overlayOpen: boolean
): { nearestArtIdx: number | null; nearestDist: number } {
  if (overlayOpen) {
    nav.velocity.multiplyScalar(0);
    const euler = new THREE.Euler(nav.pitch, nav.yaw, 0, "YXZ");
    camera.quaternion.setFromEuler(euler);
    return findNearestArt(camera, artMeshes);
  }

  // Movement direction from camera
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.y = 0;
  dir.normalize();
  const right = new THREE.Vector3().crossVectors(
    dir,
    new THREE.Vector3(0, 1, 0)
  );

  // Target velocity from keys
  const targetVel = new THREE.Vector3();
  if (nav.keys["w"] || nav.keys["arrowup"])
    targetVel.addScaledVector(dir, MAX_SPEED);
  if (nav.keys["s"] || nav.keys["arrowdown"])
    targetVel.addScaledVector(dir, -MAX_SPEED);
  if (nav.keys["a"] || nav.keys["arrowleft"])
    targetVel.addScaledVector(right, -MAX_SPEED);
  if (nav.keys["d"] || nav.keys["arrowright"])
    targetVel.addScaledVector(right, MAX_SPEED);

  if (targetVel.lengthSq() > 0) {
    nav.velocity.lerp(targetVel, ACCEL_LERP);
  } else {
    nav.velocity.multiplyScalar(DECEL_FACTOR);
  }

  // Q/E rotation
  if (nav.keys["q"]) nav.yaw += 0.025;
  if (nav.keys["e"]) nav.yaw -= 0.025;

  // Soft boundary collision
  applySoftBoundary(nav, camera, walkRects);

  // Apply velocity
  const nextPos = camera.position.clone().add(nav.velocity);
  if (isInWalkableArea(nextPos.x, nextPos.z, walkRects)) {
    camera.position.copy(nextPos);
  } else {
    // Try sliding along axes
    const slideX = camera.position.clone();
    slideX.x += nav.velocity.x;
    if (isInWalkableArea(slideX.x, slideX.z, walkRects)) {
      camera.position.x = slideX.x;
    }
    const slideZ = camera.position.clone();
    slideZ.z += nav.velocity.z;
    if (isInWalkableArea(slideZ.x, slideZ.z, walkRects)) {
      camera.position.z = slideZ.z;
    }
    nav.velocity.multiplyScalar(0.5);
  }

  // Head bob
  const velMag = nav.velocity.length();
  if (velMag > 0.001) {
    nav.bobPhase += velMag * 8;
  } else {
    nav.bobPhase *= 0.9;
  }
  camera.position.y = EYE_HEIGHT + Math.sin(nav.bobPhase) * 0.005;

  // Snap assist — soft yaw towards nearest artwork
  const { nearestArtIdx, nearestDist } = findNearestArt(camera, artMeshes);
  if (
    !nav.isDragging &&
    performance.now() - nav.dragEndTime > 500 &&
    velMag < 0.04 &&
    nearestArtIdx !== null &&
    nearestDist < 4
  ) {
    const lookDir = new THREE.Vector3();
    camera.getWorldDirection(lookDir);
    lookDir.y = 0;
    lookDir.normalize();

    const toArt = new THREE.Vector3()
      .subVectors(artMeshes[nearestArtIdx].position, camera.position);
    toArt.y = 0;
    const toArtN = toArt.clone().normalize();
    const angle = Math.acos(
      Math.min(1, Math.max(-1, lookDir.dot(toArtN)))
    );

    if (angle < Math.PI / 3) {
      const targetYaw = Math.atan2(-toArt.x, -toArt.z);
      let diff = targetYaw - nav.yaw;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      nav.yaw += diff * 0.06;
    }
  }

  // Apply rotation
  const euler = new THREE.Euler(nav.pitch, nav.yaw, 0, "YXZ");
  camera.quaternion.setFromEuler(euler);

  // FOV zoom near artwork
  const targetFov =
    nearestDist < 2
      ? 50
      : nearestDist < 4
        ? 50 + (nearestDist - 2) * 5
        : 60;
  camera.fov += (targetFov - camera.fov) * 0.03;
  camera.updateProjectionMatrix();

  return { nearestArtIdx, nearestDist };
}

function findNearestArt(
  camera: THREE.PerspectiveCamera,
  artMeshes: THREE.Mesh[]
): { nearestArtIdx: number | null; nearestDist: number } {
  let minDist = Infinity;
  let closestIdx: number | null = null;
  for (let i = 0; i < artMeshes.length; i++) {
    const d = camera.position.distanceTo(artMeshes[i].position);
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
    }
  }
  return {
    nearestArtIdx: minDist < 4 ? closestIdx : null,
    nearestDist: minDist,
  };
}

function applySoftBoundary(
  nav: NavState,
  camera: THREE.PerspectiveCamera,
  walkRects: WalkRect[]
): void {
  // Find the closest boundary edge and dampen velocity towards it
  let minDistToEdge = Infinity;

  for (const r of walkRects) {
    if (
      camera.position.x >= r.minX &&
      camera.position.x <= r.maxX &&
      camera.position.z >= r.minZ &&
      camera.position.z <= r.maxZ
    ) {
      // Inside this rect — check distance to each edge
      const dLeft = camera.position.x - r.minX;
      const dRight = r.maxX - camera.position.x;
      const dBottom = camera.position.z - r.minZ;
      const dTop = r.maxZ - camera.position.z;

      if (dLeft < SOFT_BOUNDARY && nav.velocity.x < 0) {
        nav.velocity.x *= Math.max(0, dLeft / SOFT_BOUNDARY);
      }
      if (dRight < SOFT_BOUNDARY && nav.velocity.x > 0) {
        nav.velocity.x *= Math.max(0, dRight / SOFT_BOUNDARY);
      }
      if (dBottom < SOFT_BOUNDARY && nav.velocity.z < 0) {
        nav.velocity.z *= Math.max(0, dBottom / SOFT_BOUNDARY);
      }
      if (dTop < SOFT_BOUNDARY && nav.velocity.z > 0) {
        nav.velocity.z *= Math.max(0, dTop / SOFT_BOUNDARY);
      }

      minDistToEdge = Math.min(dLeft, dRight, dBottom, dTop);
    }
  }

  void minDistToEdge; // used for dampening above
}

// ── Event handlers ──

export function setupKeyboardEvents(
  nav: NavState,
  overlayOpenRef: { current: boolean }
): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    if (overlayOpenRef.current) return;
    nav.keys[e.key.toLowerCase()] = true;
  };
  const onKeyUp = (e: KeyboardEvent) => {
    nav.keys[e.key.toLowerCase()] = false;
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
}

export function setupMouseEvents(
  nav: NavState,
  domElement: HTMLElement
): () => void {
  const onMouseDown = (e: MouseEvent) => {
    if (e.target === domElement) {
      nav.isDragging = true;
      nav.lastMouse = { x: e.clientX, y: e.clientY };
    }
  };
  const onMouseMove = (e: MouseEvent) => {
    if (nav.isDragging) {
      const dx = e.clientX - nav.lastMouse.x;
      const dy = e.clientY - nav.lastMouse.y;
      nav.yaw += dx * 0.003;
      nav.pitch += dy * 0.003;
      nav.pitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, nav.pitch));
      nav.lastMouse = { x: e.clientX, y: e.clientY };
    }
  };
  const onMouseUp = () => {
    nav.isDragging = false;
    nav.dragEndTime = performance.now();
  };

  domElement.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  return () => {
    domElement.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
}

export function setupTouchEvents(
  nav: NavState,
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement
): () => void {
  const getTouchDist = (e: TouchEvent) => {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      nav.isDragging = true;
      nav.lastMouse = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      nav.isDragging = false;
      nav.pinchDist = getTouchDist(e);
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && nav.isDragging) {
      const dx = e.touches[0].clientX - nav.lastMouse.x;
      const dy = e.touches[0].clientY - nav.lastMouse.y;
      nav.yaw += dx * 0.003;
      nav.pitch += dy * 0.003;
      nav.pitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, nav.pitch));
      nav.lastMouse = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2 && nav.pinchDist > 0) {
      const newDist = getTouchDist(e);
      const delta = (newDist - nav.pinchDist) * 0.014;
      const d = new THREE.Vector3();
      camera.getWorldDirection(d);
      d.y = 0;
      d.normalize();
      camera.position.addScaledVector(d, delta);
      nav.pinchDist = newDist;
    }
  };

  const onTouchEnd = () => {
    nav.isDragging = false;
    nav.pinchDist = 0;
    nav.dragEndTime = performance.now();
  };

  const onGestureStart = (e: Event) => {
    e.preventDefault();
  };

  domElement.addEventListener("touchstart", onTouchStart, { passive: false });
  domElement.addEventListener("touchmove", onTouchMove, { passive: false });
  domElement.addEventListener("touchend", onTouchEnd);
  document.addEventListener("gesturestart", onGestureStart, { passive: false });

  return () => {
    domElement.removeEventListener("touchstart", onTouchStart);
    domElement.removeEventListener("touchmove", onTouchMove);
    domElement.removeEventListener("touchend", onTouchEnd);
    document.removeEventListener("gesturestart", onGestureStart);
  };
}
