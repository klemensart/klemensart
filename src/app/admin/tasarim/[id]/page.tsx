"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type Konva from "konva";
import { useDesignStore, type CanvasObject } from "@/components/admin/design-studio/hooks/useDesignStore";
import Toolbar from "@/components/admin/design-studio/Toolbar";
import SidePanel from "@/components/admin/design-studio/SidePanel";
import { useCanvasExport } from "@/components/admin/design-studio/hooks/useCanvasExport";

// Dynamic import to avoid SSR issues with Konva
const DesignCanvas = dynamic(
  () => import("@/components/admin/design-studio/DesignCanvas"),
  { ssr: false }
);

export default function DesignEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const stageRef = useRef<Konva.Stage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setMeta, loadObjects, objects, backgroundColor, designName, platform, width, height } =
    useDesignStore();
  const { getThumbnail } = useCanvasExport(stageRef);

  // Load design data
  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/designs/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          alert("Tasarım bulunamadı.");
          router.push("/admin/tasarim");
          return;
        }
        const design = d.design;
        setMeta({
          designId: design.id,
          designName: design.name,
          platform: design.platform,
          width: design.width,
          height: design.height,
          backgroundColor: design.canvas_data?.backgroundColor || "#ffffff",
        });
        const objs: CanvasObject[] = design.canvas_data?.objects || [];
        loadObjects(objs);
      })
      .finally(() => setLoading(false));
  }, [id, router, setMeta, loadObjects]);

  // Save design
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // Generate thumbnail
      let thumbnailUrl: string | undefined;
      const thumbData = getThumbnail(400);
      if (thumbData) {
        // Upload thumbnail to Supabase
        const { createClient } = await import("@/lib/supabase");
        const supabase = createClient();
        const blob = await fetch(thumbData).then((r) => r.blob());
        const filename = `thumb_${id}.jpg`;
        await supabase.storage
          .from("design-assets")
          .upload(filename, blob, { cacheControl: "3600", upsert: true });
        const { data: urlData } = supabase.storage
          .from("design-assets")
          .getPublicUrl(filename);
        thumbnailUrl = urlData.publicUrl;
      }

      await fetch(`/api/admin/designs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: designName,
          platform,
          width,
          height,
          canvas_data: { objects, backgroundColor },
          thumbnail_url: thumbnailUrl,
        }),
      });
    } catch (err) {
      console.error("Save error:", err);
      alert("Kaydedilirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  }, [id, objects, backgroundColor, designName, platform, width, height, getThumbnail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top toolbar */}
      <Toolbar stageRef={stageRef} onSave={handleSave} saving={saving} />

      {/* Main area: side panel + canvas */}
      <div className="flex-1 flex overflow-hidden">
        <SidePanel />
        <DesignCanvas stageRef={stageRef} />
      </div>
    </div>
  );
}
