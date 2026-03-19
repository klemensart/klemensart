import { useCallback } from "react";
import type Konva from "konva";

export function useCanvasExport(stageRef: React.RefObject<Konva.Stage | null>) {
  const exportImage = useCallback(
    (format: "png" | "jpeg" = "png", quality = 1) => {
      const stage = stageRef.current;
      if (!stage) return null;

      // Scale'i geçici olarak 1'e çek — aksi halde
      // içerik küçültülmüş hâliyle export edilir (sol üst köşeye sıkışır)
      const prevScaleX = stage.scaleX();
      const prevScaleY = stage.scaleY();
      stage.scaleX(1);
      stage.scaleY(1);

      // pixelRatio: 1 — 1080×1920 çıktı, Instagram Story için ideal boyut.
      // pixelRatio: 2 gereksiz 2160×3840 üretiyordu → Instagram işleme sorunları.
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
    (filename: string, format: "png" | "jpeg" = "png") => {
      const uri = exportImage(format, format === "jpeg" ? 0.95 : 1);
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
    (maxSize = 400) => {
      const stage = stageRef.current;
      if (!stage) return null;

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
