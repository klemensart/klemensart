"use client";

import { useEffect, useRef, useState } from "react";
import { Image } from "react-konva";
import type Konva from "konva";
import { useDesignStore, type CanvasObject } from "../hooks/useDesignStore";

export default function CanvasImage({ obj }: { obj: CanvasObject }) {
  const imageRef = useRef<Konva.Image>(null);
  const [image, setImage] = useState<HTMLImageElement | undefined>();
  const updateObject = useDesignStore((s) => s.updateObject);
  const setSelectedId = useDesignStore((s) => s.setSelectedId);
  const pushHistory = useDesignStore((s) => s.pushHistory);

  useEffect(() => {
    if (!obj.src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = obj.src;
    img.onload = () => {
      setImage(img);
    };
  }, [obj.src]);

  return (
    <Image
      ref={imageRef}
      image={image}
      id={obj.id}
      x={obj.x}
      y={obj.y}
      width={obj.width || 300}
      height={obj.height || 300}
      opacity={obj.opacity ?? 1}
      rotation={obj.rotation || 0}
      cornerRadius={obj.cornerRadius || 0}
      draggable
      onClick={() => setSelectedId(obj.id)}
      onTap={() => setSelectedId(obj.id)}
      onDragEnd={(e) => {
        updateObject(obj.id, { x: e.target.x(), y: e.target.y() });
        pushHistory();
      }}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Image;
        updateObject(obj.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * node.scaleX()),
          height: Math.max(20, node.height() * node.scaleY()),
          rotation: node.rotation(),
        });
        node.scaleX(1);
        node.scaleY(1);
        pushHistory();
      }}
    />
  );
}
