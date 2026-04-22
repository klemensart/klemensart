export type VideoProvider = "youtube" | "vimeo" | null;

/** Extract YouTube video ID from various URL formats */
export function extractYouTubeId(url: string): string | null {
  const m =
    url.match(/[?&]v=([\w-]+)/) ??
    url.match(/youtu\.be\/([\w-]+)/) ??
    url.match(/youtube\.com\/embed\/([\w-]+)/) ??
    url.match(/youtube\.com\/shorts\/([\w-]+)/);
  return m ? m[1] : null;
}

export function detectVideoProvider(url: string): VideoProvider {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/vimeo\.com/i.test(url)) return "vimeo";
  return null;
}

export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export function getVideoEmbedUrl(url: string): string | null {
  const provider = detectVideoProvider(url);
  if (provider === "youtube") {
    const id = extractYouTubeId(url);
    return id
      ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
      : null;
  }
  if (provider === "vimeo") {
    const id = extractVimeoId(url);
    return id
      ? `https://player.vimeo.com/video/${id}?autoplay=1`
      : null;
  }
  return null;
}
