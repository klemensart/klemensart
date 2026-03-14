import * as THREE from "three";
import { ROOMS, getRoomCenter, ROOM_SIZE } from "./data";
import type { RoomConfig } from "./types";

const HALF = ROOM_SIZE / 2;

/**
 * Determine which room the camera is currently in.
 * Returns the room config, or null if outside all rooms.
 */
export function getActiveRoom(
  cameraPos: THREE.Vector3
): RoomConfig | null {
  let bestRoom: RoomConfig | null = null;
  let bestDist = Infinity;

  for (const room of ROOMS) {
    const [cx, , cz] = getRoomCenter(room);
    // Check if camera is inside this room's bounds
    if (
      cameraPos.x >= cx - HALF &&
      cameraPos.x <= cx + HALF &&
      cameraPos.z >= cz - HALF &&
      cameraPos.z <= cz + HALF
    ) {
      const dx = cameraPos.x - cx;
      const dz = cameraPos.z - cz;
      const dist = dx * dx + dz * dz;
      if (dist < bestDist) {
        bestDist = dist;
        bestRoom = room;
      }
    }
  }

  // Fallback: if in a doorway (between rooms), find nearest room center
  if (!bestRoom) {
    for (const room of ROOMS) {
      const [cx, , cz] = getRoomCenter(room);
      const dx = cameraPos.x - cx;
      const dz = cameraPos.z - cz;
      const dist = dx * dx + dz * dz;
      if (dist < bestDist) {
        bestDist = dist;
        bestRoom = room;
      }
    }
  }

  return bestRoom;
}

/**
 * Get neighboring room IDs for texture preloading.
 */
export function getNeighborRoomIds(roomId: number): number[] {
  const neighbors: number[] = [];
  const room = ROOMS[roomId];
  if (!room) return neighbors;

  for (const other of ROOMS) {
    if (other.id === roomId) continue;
    const [cx1, , cz1] = getRoomCenter(room);
    const [cx2, , cz2] = getRoomCenter(other);
    const dx = Math.abs(cx1 - cx2);
    const dz = Math.abs(cz1 - cz2);
    // Adjacent = exactly one room apart in one axis
    if ((dx === ROOM_SIZE && dz === 0) || (dx === 0 && dz === ROOM_SIZE)) {
      neighbors.push(other.id);
    }
  }

  return neighbors;
}
