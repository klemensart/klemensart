import { useCallback } from "react";
import type Konva from "konva";

export function useCanvasExport(stageRef: React.RefObject<Konva.Stage | null>) {
  const exportImage = useCallback(
    (format: "png" | "jpeg" = "png", quality = 1) => {
      const stage = stageRef.current;
      if (!stage) return null;
      // pixelRatio compensates for display scaling so export is full resolution
      const currentScale = stage.scaleX() || 1;
      const uri = stage.toDataURL({
        mimeType: format === "png" ? "image/png" : "image/jpeg",
        quality,
        pixelRatio: 1 / currentScale,
      });
      return uri;
    },
    [stageRef]
  );

  const downloadImage = useCallback(
    (filename: string, format: "png" | "jpeg" = "png") => {
      const uri = exportImage(format, format === "jpeg" ? 0.92 : 1);
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
      const currentScale = stage.scaleX() || 1;
      const realWidth = stage.width() / currentScale;
      const realHeight = stage.height() / currentScale;
      const thumbScale = Math.min(maxSize / realWidth, maxSize / realHeight);
      return stage.toDataURL({
        mimeType: "image/jpeg",
        quality: 0.7,
        pixelRatio: thumbScale / currentScale,
      });
    },
    [stageRef]
  );

  return { exportImage, downloadImage, getThumbnail };
}
