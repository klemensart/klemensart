import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const GLB_PATH = "/sergi/en-sessiz-zaman-v2/gallery-room.glb";

export type GLBResult = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
};

/**
 * Attempt to load the Sketchfab GLB model.
 * Returns null if the file doesn't exist or fails to load.
 */
export async function loadGLBModel(): Promise<GLBResult | null> {
  const loader = new GLTFLoader();
  try {
    const gltf = await loader.loadAsync(GLB_PATH);
    return { scene: gltf.scene, animations: gltf.animations };
  } catch {
    console.warn(
      "[v2 gallery] GLB model not found at",
      GLB_PATH,
      "— using procedural rooms"
    );
    return null;
  }
}

/**
 * Clone a loaded GLB scene for instancing multiple rooms.
 */
export function cloneGLBForRoom(
  source: THREE.Group,
  cx: number,
  cz: number
): THREE.Group {
  const clone = source.clone(true);
  clone.position.set(cx, 0, cz);

  // Traverse and enable shadows
  clone.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return clone;
}

/**
 * Hide wall meshes where doors should be.
 * Searches for meshes by name patterns or bounding box intersection with door area.
 */
export function hideWallForDoor(
  roomGroup: THREE.Group,
  wallSide: "north" | "south" | "east" | "west",
  roomSize: number
): void {
  const half = roomSize / 2;
  const doorHalfW = 1.4; // half of 2.8m door

  roomGroup.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const box = new THREE.Box3().setFromObject(child);
    const center = new THREE.Vector3();
    box.getCenter(center);
    // Convert to local room coords
    center.sub(roomGroup.position);

    const isWall = box.max.y - box.min.y > 1; // tall enough to be a wall
    if (!isWall) return;

    let match = false;
    switch (wallSide) {
      case "north":
        match = center.z > half - 0.5 && Math.abs(center.x) < doorHalfW + 0.5;
        break;
      case "south":
        match =
          center.z < -half + 0.5 && Math.abs(center.x) < doorHalfW + 0.5;
        break;
      case "east":
        match = center.x > half - 0.5 && Math.abs(center.z) < doorHalfW + 0.5;
        break;
      case "west":
        match =
          center.x < -half + 0.5 && Math.abs(center.z) < doorHalfW + 0.5;
        break;
    }

    if (match) {
      child.visible = false;
    }
  });
}
