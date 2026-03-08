export type Platform = {
  id: string;
  label: string;
  width: number;
  height: number;
};

export const PLATFORMS: Platform[] = [
  { id: "instagram-post", label: "Instagram Post (4:3)", width: 1080, height: 1440 },
  { id: "instagram-story", label: "Instagram Story", width: 1080, height: 1920 },
  { id: "x-post", label: "X/Twitter Post", width: 1200, height: 675 },
  { id: "youtube-thumbnail", label: "YouTube Thumbnail", width: 1280, height: 720 },
  { id: "linkedin-post", label: "LinkedIn Post", width: 1200, height: 627 },
  { id: "web-banner", label: "Web Banner", width: 1440, height: 480 },
  { id: "custom", label: "Özel", width: 1080, height: 1080 },
];

export function getPlatform(id: string): Platform {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
}
