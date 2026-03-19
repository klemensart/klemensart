import { useCallback } from "react";
import type Konva from "konva";

/**
 * Canvas'taki tüm Image node'larının piksel verisinin decode edilmiş
 * olduğunu garanti eder. Progressive JPEG'lerde onload tetiklense de
 * piksel verisi hazır olmayabiliyor → toDataURL() siyah çıkıyor.
 */
async function waitForAllImages(stage: Konva.Stage) {
  const images = stage.find("Image") as Konva.Image[];
  const promises: Promise<void>[] = [];

  for (const img of images) {
    const htmlImg = img.image() as HTMLImageElement | undefined;
    if (htmlImg && typeof htmlImg.decode === "function") {
      promises.push(htmlImg.decode().catch(() => {}));
    }
  }

  if (promises.length > 0) {
    await Promise.all(promises);
    stage.batchDraw();
  }
}

export function useCanvasExport(stageRef: React.RefObject<Konva.Stage | null>) {
  const exportImage = useCallback(
    async (format: "png" | "jpeg" = "png", quality = 1) => {
      const stage = stageRef.current;
      if (!stage) return null;

      // Tüm görsellerin tamamen decode olmasını bekle
      await waitForAllImages(stage);

      // Scale'i geçici olarak 1'e çek — aksi halde
      // içerik küçültülmüş hâliyle export edilir (sol üst köşeye sıkışır)
      const prevScaleX = stage.scaleX();
      const prevScaleY = stage.scaleY();
      stage.scaleX(1);
      stage.scaleY(1);

      // pixelRatio: 1 — 1080×1920 çıktı, Instagram Story için ideal boyut.
      const uri = stage.toDataURL({
        mimeType: format === "png" ? "image/png" : "image/jpeg",
        quality,
        pixelRatio: 1,
      });

      stage.scaleX(prevScaleX);
      stage.scaleY(prevScaleY);
      stage.batchDraw();

      return uri;
    },
    [stageRef]
  );

  const downloadImage = useCallback(
    async (filename: string, format: "png" | "jpeg" = "png") => {
      const uri = await exportImage(format, format === "jpeg" ? 0.95 : 1);
      if (!uri) return;
      const link = document.createElement("a");
      link.download = `${filename}.${format === "jpeg" ? "jpg" : "png"}`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [exportImage]
  );

  const getThumbnail = useCallback(
    async (maxSize = 400) => {
      const stage = stageRef.current;
      if (!stage) return null;

      await waitForAllImages(stage);

      const prevScaleX = stage.scaleX();
      const prevScaleY = stage.scaleY();

      stage.scaleX(1);
      stage.scaleY(1);

      const thumbScale = Math.min(maxSize / stage.width(), maxSize / stage.height());

      const uri = stage.toDataURL({
        mimeType: "image/jpeg",
        quality: 0.7,
        pixelRatio: thumbScale,
      });

      stage.scaleX(prevScaleX);
      stage.scaleY(prevScaleY);
      stage.batchDraw();

      return uri;
    },
    [stageRef]
  );

  return { exportImage, downloadImage, getThumbnail };
}
