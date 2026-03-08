"use client";

import { useRef, useEffect, useCallback } from "react";
import { Text } from "react-konva";
import type Konva from "konva";
import { useDesignStore, type CanvasObject } from "../hooks/useDesignStore";

export default function CanvasText({ obj }: { obj: CanvasObject }) {
  const textRef = useRef<Konva.Text>(null);
  const updateObject = useDesignStore((s) => s.updateObject);
  const setSelectedId = useDesignStore((s) => s.setSelectedId);
  const pushHistory = useDesignStore((s) => s.pushHistory);

  useEffect(() => {
    // sync width after font loads
    const node = textRef.current;
    if (node && obj.width) {
      node.width(obj.width);
    }
  }, [obj.width]);

  const handleDblClick = useCallback(() => {
    const node = textRef.current;
    if (!node) return;
    const stage = node.getStage();
    if (!stage) return;
    const container = stage.container();
    const stageBox = container.getBoundingClientRect();
    const absPos = node.getAbsolutePosition();
    const scale = node.getAbsoluteScale();

    // hide text node
    node!.hide();
    const layer = node!.getLayer();
    layer?.batchDraw();

    const textarea = document.createElement("textarea");
    container.appendChild(textarea);

    const areaLeft = stageBox.left + absPos.x * (stageBox.width / stage.width());
    const areaTop = stageBox.top + absPos.y * (stageBox.height / stage.height());

    textarea.value = obj.text || "";
    textarea.style.position = "fixed";
    textarea.style.left = `${areaLeft}px`;
    textarea.style.top = `${areaTop}px`;
    textarea.style.width = `${(obj.width || 200) * scale.x * (stageBox.width / stage.width())}px`;
    textarea.style.fontSize = `${(obj.fontSize || 24) * scale.x * (stageBox.width / stage.width())}px`;
    textarea.style.fontFamily = obj.fontFamily || "Plus Jakarta Sans";
    textarea.style.color = obj.fill || "#000";
    textarea.style.border = "2px solid #FF6D60";
    textarea.style.borderRadius = "4px";
    textarea.style.padding = "4px";
    textarea.style.margin = "0";
    textarea.style.overflow = "hidden";
    textarea.style.background = "rgba(255,255,255,0.95)";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.lineHeight = "1.3";
    textarea.style.zIndex = "1000";
    textarea.style.minHeight = "1.5em";
    textarea.rows = 1;

    // auto-height
    function adjustHeight() {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
    adjustHeight();
    textarea.addEventListener("input", adjustHeight);

    textarea.focus();

    function handleBlur() {
      const newText = textarea.value;
      container.removeChild(textarea);
      node!.show();
      layer?.batchDraw();
      if (newText !== obj.text) {
        updateObject(obj.id, { text: newText });
        pushHistory();
      }
    }

    textarea.addEventListener("blur", handleBlur);
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        textarea.blur();
      }
      if (e.key === "Enter" && !e.shiftKey) {
        textarea.blur();
      }
    });
  }, [obj, updateObject, pushHistory]);

  return (
    <Text
      ref={textRef}
      id={obj.id}
      x={obj.x}
      y={obj.y}
      width={obj.width}
      text={obj.text || ""}
      fontSize={obj.fontSize || 24}
      fontFamily={obj.fontFamily || "Plus Jakarta Sans"}
      fontStyle={obj.fontStyle || "normal"}
      fill={obj.fill || "#000000"}
      align={obj.align || "left"}
      letterSpacing={obj.letterSpacing || 0}
      lineHeight={obj.lineHeight || 1.2}
      opacity={obj.opacity ?? 1}
      rotation={obj.rotation || 0}
      draggable
      onClick={() => setSelectedId(obj.id)}
      onTap={() => setSelectedId(obj.id)}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      onDragEnd={(e) => {
        updateObject(obj.id, { x: e.target.x(), y: e.target.y() });
        pushHistory();
      }}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Text;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        updateObject(obj.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * scaleX),
          fontSize: Math.max(8, (obj.fontSize || 24) * scaleY),
          rotation: node.rotation(),
        });
        pushHistory();
      }}
    />
  );
}
