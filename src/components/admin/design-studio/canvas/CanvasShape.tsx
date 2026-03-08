"use client";

import { Rect, Circle, Line } from "react-konva";
import type Konva from "konva";
import { useDesignStore, type CanvasObject } from "../hooks/useDesignStore";

export default function CanvasShape({ obj }: { obj: CanvasObject }) {
  const updateObject = useDesignStore((s) => s.updateObject);
  const setSelectedId = useDesignStore((s) => s.setSelectedId);
  const pushHistory = useDesignStore((s) => s.pushHistory);

  const common = {
    id: obj.id,
    x: obj.x,
    y: obj.y,
    opacity: obj.opacity ?? 1,
    rotation: obj.rotation || 0,
    draggable: true,
    onClick: () => setSelectedId(obj.id),
    onTap: () => setSelectedId(obj.id),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      updateObject(obj.id, { x: e.target.x(), y: e.target.y() });
      pushHistory();
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      updateObject(obj.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, (obj.width || 100) * node.scaleX()),
        height: Math.max(5, (obj.height || 100) * node.scaleY()),
        rotation: node.rotation(),
      });
      node.scaleX(1);
      node.scaleY(1);
      pushHistory();
    },
  };

  if (obj.shapeType === "circle") {
    const radius = (obj.width || 100) / 2;
    return (
      <Circle
        {...common}
        radius={radius}
        fill={obj.fill || "#FF6D60"}
        stroke={obj.stroke}
        strokeWidth={obj.strokeWidth}
      />
    );
  }

  if (obj.shapeType === "line") {
    const w = obj.width || 200;
    return (
      <Line
        {...common}
        points={[0, 0, w, 0]}
        stroke={obj.stroke || obj.fill || "#2D2926"}
        strokeWidth={obj.strokeWidth || 3}
      />
    );
  }

  // default: rect
  return (
    <Rect
      {...common}
      width={obj.width || 200}
      height={obj.height || 200}
      fill={obj.fill || "#FF6D60"}
      stroke={obj.stroke}
      strokeWidth={obj.strokeWidth}
      cornerRadius={obj.cornerRadius || 0}
    />
  );
}
