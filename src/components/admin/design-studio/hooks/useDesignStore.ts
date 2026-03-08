import { create } from "zustand";

export type CanvasObject = {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  opacity: number;
  // text
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string; // "normal" | "bold" | "italic" | "bold italic"
  fill?: string;
  align?: string;
  letterSpacing?: number;
  lineHeight?: number;
  // image
  src?: string;
  // shape
  shapeType?: "rect" | "circle" | "line";
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
};

type DesignState = {
  // meta
  designId: string | null;
  designName: string;
  platform: string;
  width: number;
  height: number;
  backgroundColor: string;

  // objects
  objects: CanvasObject[];
  selectedId: string | null;

  // history
  history: CanvasObject[][];
  historyIndex: number;

  // actions
  setMeta: (m: Partial<Pick<DesignState, "designId" | "designName" | "platform" | "width" | "height" | "backgroundColor">>) => void;
  setSelectedId: (id: string | null) => void;
  addObject: (obj: Omit<CanvasObject, "id">) => void;
  updateObject: (id: string, attrs: Partial<CanvasObject>) => void;
  deleteObject: (id: string) => void;
  moveLayer: (id: string, direction: "up" | "down" | "top" | "bottom") => void;
  loadObjects: (objs: CanvasObject[]) => void;

  // history
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
};

let _idCounter = 0;
function newId() {
  _idCounter += 1;
  return `obj_${Date.now()}_${_idCounter}`;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  designId: null,
  designName: "İsimsiz Tasarım",
  platform: "instagram-post",
  width: 1080,
  height: 1080,
  backgroundColor: "#ffffff",

  objects: [],
  selectedId: null,

  history: [[]],
  historyIndex: 0,

  setMeta: (m) => set(m),

  setSelectedId: (id) => set({ selectedId: id }),

  addObject: (obj) => {
    const id = newId();
    const newObj: CanvasObject = { ...obj, id };
    set((s) => {
      const objs = [...s.objects];
      if (obj.type === "image") {
        // Görselleri metinlerin arkasına ekle (shape'lerden sonra, text'lerden önce)
        const firstTextIdx = objs.findIndex((o) => o.type === "text");
        if (firstTextIdx !== -1) {
          objs.splice(firstTextIdx, 0, newObj);
        } else {
          objs.push(newObj);
        }
      } else {
        objs.push(newObj);
      }
      return { objects: objs, selectedId: id };
    });
    get().pushHistory();
  },

  updateObject: (id, attrs) => {
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, ...attrs } : o)),
    }));
  },

  deleteObject: (id) => {
    set((s) => ({
      objects: s.objects.filter((o) => o.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
    get().pushHistory();
  },

  moveLayer: (id, direction) => {
    set((s) => {
      const objs = [...s.objects];
      const idx = objs.findIndex((o) => o.id === id);
      if (idx === -1) return s;
      switch (direction) {
        case "up":
          if (idx < objs.length - 1) [objs[idx], objs[idx + 1]] = [objs[idx + 1], objs[idx]];
          break;
        case "down":
          if (idx > 0) [objs[idx], objs[idx - 1]] = [objs[idx - 1], objs[idx]];
          break;
        case "top": {
          const [item] = objs.splice(idx, 1);
          objs.push(item);
          break;
        }
        case "bottom": {
          const [item] = objs.splice(idx, 1);
          objs.unshift(item);
          break;
        }
      }
      return { objects: objs };
    });
    get().pushHistory();
  },

  loadObjects: (objs) => {
    set({ objects: objs, selectedId: null, history: [objs], historyIndex: 0 });
  },

  pushHistory: () => {
    set((s) => {
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push([...s.objects]);
      // limit to 50 steps
      if (newHistory.length > 50) newHistory.shift();
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },

  undo: () => {
    set((s) => {
      if (s.historyIndex <= 0) return s;
      const newIndex = s.historyIndex - 1;
      return { objects: [...s.history[newIndex]], historyIndex: newIndex, selectedId: null };
    });
  },

  redo: () => {
    set((s) => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const newIndex = s.historyIndex + 1;
      return { objects: [...s.history[newIndex]], historyIndex: newIndex, selectedId: null };
    });
  },
}));
