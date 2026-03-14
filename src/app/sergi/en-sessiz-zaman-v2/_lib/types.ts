export type Artwork = {
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

export type WallSide = "north" | "south" | "east" | "west";

export type ArtworkSlot = {
  wallSide: WallSide;
  offset: number; // -1..1 horizontal position along wall
  height: number; // y position
};

export type RoomConfig = {
  id: number;
  name: string;
  subtitle: string;
  artworkIds: number[];
  slots: ArtworkSlot[];
  gridCol: number;
  gridRow: number;
};

export type DoorConnection = {
  roomA: number;
  roomB: number;
  wallSideA: WallSide;
  wallSideB: WallSide;
};

export type WalkRect = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};
