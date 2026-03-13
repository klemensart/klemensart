"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import type Konva from "konva";
import { useDesignStore } from "./hooks/useDesignStore";
import CanvasText from "./canvas/CanvasText";
import CanvasImage from "./canvas/CanvasImage";
import CanvasShape from "./canvas/CanvasShape";
import SelectionTransformer from "./canvas/SelectionTransformer";

type Props = {
  stageRef: React.RefObject<Konva.Stage | null>;
};

export default function DesignCanvas({ stageRef }: Props) {
  const width = useDesignStore((s) => s.width);
  const height = useDesignStore((s) => s.height);
  const backgroundColor = useDesignStore((s) => s.backgroundColor);
  const objects = useDesignStore((s) => s.objects);
  const setSelectedId = useDesignStore((s) => s.setSelectedId);
  const deleteObject = useDesignStore((s) => s.deleteObject);
  const selectedId = useDesignStore((s) => s.selectedId);
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Fontlar yüklendikten sonra canvas'ı yeniden çiz
  // (auto-story fontları async yükleniyor, Konva yazıları boş render edebilir)
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsReady(true);
      stageRef.current?.batchDraw();
    });
  }, [stageRef]);

  // objects değiştiğinde fontlar yeniden kontrol edilsin
  useEffect(() => {
    if (!fontsReady) return;
    // Fontlar zaten yüklüyse kısa bir gecikme ile redraw (yeni fontlar için)
    const timer = setTimeout(() => {
      document.fonts.ready.then(() => stageRef.current?.batchDraw());
    }, 100);
    return () => clearTimeout(timer);
  }, [objects, fontsReady, stageRef]);

  // fit canvas to container
  const fitCanvas = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const padding = 40;
    const availW = container.clientWidth - padding * 2;
    const availH = container.clientHeight - padding * 2;
    const s = Math.min(availW / width, availH / height, 1);
    setScale(s);
  }, [width, height]);

  useEffect(() => {
    fitCanvas();
    window.addEventListener("resize", fitCanvas);
    return () => window.removeEventListener("resize", fitCanvas);
  }, [fitCanvas]);

  // keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // don't capture when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          deleteObject(selectedId);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedId, deleteObject, undo, redo]);

  // click on empty area => deselect
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage() || e.target.attrs.id === "bg-rect") {
      setSelectedId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-warm-100 flex items-center justify-center overflow-hidden relative"
    >
      <div
        style={{
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          scaleX={scale}
          scaleY={scale}
          style={{
            width: width * scale,
            height: height * scale,
          }}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* Background */}
            <Rect
              id="bg-rect"
              x={0}
              y={0}
              width={width}
              height={height}
              fill={backgroundColor}
              listening={true}
            />

            {/* Objects */}
            {objects.map((obj) => {
              switch (obj.type) {
                case "text":
                  return <CanvasText key={obj.id} obj={obj} />;
                case "image":
                  return <CanvasImage key={obj.id} obj={obj} />;
                case "shape":
                  return <CanvasShape key={obj.id} obj={obj} />;
                default:
                  return null;
              }
            })}

            {/* Selection transformer */}
            <SelectionTransformer />
          </Layer>
        </Stage>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-warm-900/60 font-medium">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
