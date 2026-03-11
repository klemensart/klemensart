"use client";

import { useEffect, useRef } from "react";
import { Transformer } from "react-konva";
import type Konva from "konva";
import { useDesignStore } from "../hooks/useDesignStore";

export default function SelectionTransformer() {
  const trRef = useRef<Konva.Transformer>(null);
  const selectedId = useDesignStore((s) => s.selectedId);

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const stage = tr.getStage();
    if (!stage) return;

    if (selectedId) {
      const node = stage.findOne("#" + selectedId);
      if (node) {
        tr.nodes([node]);
        tr.getLayer()?.batchDraw();
        return;
      }
    }
    tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedId]);

  return (
    <Transformer
      ref={trRef}
      rotateEnabled
      enabledAnchors={[
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "middle-left",
        "middle-right",
      ]}
      boundBoxFunc={(oldBox, newBox) => {
        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
          return oldBox;
        }
        return newBox;
      }}
      borderStroke="#FF6D60"
      anchorStroke="#FF6D60"
      anchorFill="#fff"
      anchorSize={10}
      anchorCornerRadius={2}
    />
  );
}
