"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Editor, EditorContent, useEditor, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { ReactNodeViewProps } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { SuggestionExtension, findTextInDoc } from "@/lib/tiptap-suggestions";
import type { Suggestion } from "@/lib/tiptap-suggestions";
import SuggestionPopover from "./SuggestionPopover";

/* ── Types ── */
type Props = {
  content: string;
  onChange: (markdown: string) => void;
  onUploadImage: (file: File) => Promise<string | null>;
  uploading?: boolean;
  placeholder?: string;
  /* Suggestion system */
  articleId?: string;
  suggestions?: Suggestion[];
  onSuggestionsChange?: (suggestions: Suggestion[]) => void;
  currentUserId?: string;
  currentUserRole?: string;
  currentUserName?: string;
};

/* ── Custom Image extension with data-size attribute ── */
const ResizableImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-size": {
        default: "large",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-size") || "large",
        renderHTML: (attrs: Record<string, string>) => ({
          "data-size": attrs["data-size"],
        }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

/* ── Image Node View (caption + size controls) ── */
function ImageNodeView({
  node,
  updateAttributes,
  selected,
  editor,
  getPos,
}: ReactNodeViewProps) {
  const src = node.attrs.src ?? "";
  const alt = node.attrs.alt ?? "";
  const title = node.attrs.title ?? "";
  const dataSize = node.attrs["data-size"] ?? "large";
  const isPlaceholder = src.startsWith("data:image/svg+xml");

  return (
    <NodeViewWrapper className="image-node-view" data-size={dataSize}>
      {selected && !isPlaceholder && (
        <div className="image-size-controls">
          <span className="image-size-label">Boyut:</span>
          {[
            { key: "small", label: "Küçük" },
            { key: "medium", label: "Orta" },
            { key: "large", label: "Büyük" },
          ].map((s) => (
            <button
              key={s.key}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => updateAttributes({ "data-size": s.key })}
              className={`image-size-btn ${dataSize === s.key ? "active" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <img src={src} alt={alt} draggable={false} />
      {!isPlaceholder && (
        <input
          className="image-caption-input"
          value={title}
          placeholder="Açıklama ekle..."
          onChange={(e) => updateAttributes({ title: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Tab") {
              e.preventDefault();
              const pos = getPos();
              if (pos != null) {
                editor.chain().focus().setTextSelection(pos + node.nodeSize).run();
              }
            }
          }}
        />
      )}
    </NodeViewWrapper>
  );
}

/* ── Image optimization helpers ── */
const TR_CHAR_MAP: Record<string, string> = {
  ö: "o", ü: "u", ş: "s", ı: "i", ç: "c", ğ: "g",
  Ö: "O", Ü: "U", Ş: "S", İ: "I", Ç: "C", Ğ: "G",
};

function cleanFileName(name: string, ext = "webp"): string {
  const base = name.replace(/\.[^.]+$/, "");
  const cleaned = base
    .split("")
    .map((c) => TR_CHAR_MAP[c] || c)
    .join("")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${cleaned || "gorsel"}.${ext}`;
}

function altFromFileName(name: string): string {
  return (
    name.replace(/\.[^.]+$/, "").replace(/-/g, " ").replace(/\s+/g, " ").trim() || "görsel"
  );
}

async function optimizeImage(file: File): Promise<File> {
  // GIFs may be animated — skip conversion, just clean the name
  if (file.type === "image/gif") {
    return new File([file], cleanFileName(file.name, "gif"), { type: file.type });
  }
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > 1600) {
        h = Math.round(h * (1600 / w));
        w = 1600;
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          resolve(
            blob
              ? new File([blob], cleanFileName(file.name), { type: "image/webp" })
              : file
          );
        },
        "image/webp",
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

/* ── Inline SVG icons ── */
const I = {
  bold: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  ),
  italic: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  quote: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" />
    </svg>
  ),
  ol: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" /><path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  ),
  ul: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  ),
  link: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  image: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  hr: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  ),
  highlight: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
    </svg>
  ),
  youtube: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  ),
  footnote: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="13" y2="11" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

/* ── Toolbar button ── */
function TBtn({
  children,
  title,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-0.5 p-1.5 rounded-lg transition disabled:opacity-40 ${
        active
          ? "bg-warm-200/80 text-warm-900"
          : "text-warm-900/50 hover:bg-warm-200/60 hover:text-warm-900/80"
      }`}
    >
      {children}
    </button>
  );
}

function TSep() {
  return <div className="w-px h-5 bg-warm-200 mx-0.5" />;
}

/* ── "+" insert menu (always visible, top-right) ── */
function InsertMenu({
  editor,
  onImageClick,
  uploading,
}: {
  editor: Editor;
  onImageClick: () => void;
  uploading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = [
    {
      label: "Görsel Ekle",
      icon: I.image,
      disabled: uploading,
      action: () => {
        onImageClick();
        setOpen(false);
      },
    },
    {
      label: "Ayraç Çizgisi",
      icon: I.hr,
      action: () => {
        editor.chain().focus().setHorizontalRule().run();
        setOpen(false);
      },
    },
    {
      label: "YouTube Video",
      icon: I.youtube,
      action: () => {
        const url = prompt("YouTube URL girin:");
        if (url) {
          // Insert as raw HTML text that the markdown pipeline processes
          editor.chain().focus().insertContent(`<youtube>${url}</youtube>`).run();
        }
        setOpen(false);
      },
    },
    {
      label: "Dipnot",
      icon: I.footnote,
      action: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const md = (editor.storage as any).markdown.getMarkdown() as string;
        const matches = md.match(/\[\^\d+\]/g) ?? [];
        const usedNums = matches.map((m: string) => parseInt(m.replace(/\D/g, ""), 10));
        const next = usedNums.length > 0 ? Math.max(...usedNums) + 1 : 1;
        editor.chain().focus().insertContent(`[^${next}]`).run();
        // Append definition at end
        editor.commands.insertContentAt(editor.state.doc.content.size, {
          type: "paragraph",
          content: [{ type: "text", text: `[^${next}]: Açıklama` }],
        });
        setOpen(false);
      },
    },
  ];

  return (
    <div ref={menuRef} className="absolute top-3 right-3 z-20">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-8 h-8 flex items-center justify-center rounded-full border transition shadow-sm ${
          open
            ? "bg-coral text-white border-coral"
            : "bg-white text-warm-900/40 border-warm-200 hover:text-warm-900/70 hover:border-warm-300"
        }`}
        title="Ekle"
      >
        {I.plus}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-warm-100 py-1 min-w-[160px]">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={item.action}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-warm-900/70 hover:bg-warm-50 transition disabled:opacity-40"
            >
              <span className="text-warm-900/40">{item.icon}</span>
              {item.label}
            </button>
          ))}
          {uploading && (
            <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs text-coral border-t border-warm-100 mt-1">
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Yükleniyor...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Editor styles ── */
const EDITOR_CSS = `
  .ProseMirror {
    min-height: 400px;
    padding: 1.25rem 1.5rem;
    padding-right: 3.5rem;
    color: rgba(45,41,38,0.8);
    font-size: 15px;
    line-height: 1.7;
  }
  .ProseMirror:focus { outline: none; }

  /* Placeholder — all empty nodes with placeholder text */
  .ProseMirror .is-empty::before {
    content: attr(data-placeholder);
    float: left;
    color: rgba(140,133,126,0.4);
    pointer-events: none;
    height: 0;
  }

  /* Headings */
  .ProseMirror h2 {
    font-size: 1.5em;
    font-weight: 700;
    color: #2D2926;
    margin-top: 1em;
    margin-bottom: 0.5em;
    line-height: 1.3;
  }
  .ProseMirror h3 {
    font-size: 1.25em;
    font-weight: 700;
    color: #2D2926;
    margin-top: 0.8em;
    margin-bottom: 0.4em;
    line-height: 1.4;
  }

  /* Paragraphs */
  .ProseMirror p {
    margin-bottom: 0.75em;
  }

  /* Bold, italic & highlight */
  .ProseMirror strong { font-weight: 700; color: #2D2926; }
  .ProseMirror em { font-style: italic; }
  .ProseMirror mark {
    background: rgba(255, 109, 96, 0.2);
    color: inherit;
    border-radius: 2px;
    padding: 0.05em 0.15em;
  }

  /* Blockquote — centered with coral dividers */
  .ProseMirror blockquote {
    border-left: none;
    text-align: center;
    font-style: italic;
    color: rgba(45,41,38,0.55);
    font-size: 0.95em;
    margin: 1.5em 2em;
    padding: 1.2em 0.5em;
    position: relative;
    background: none;
  }
  .ProseMirror blockquote::before,
  .ProseMirror blockquote::after {
    content: '';
    display: block;
    width: 40px;
    height: 2px;
    background: #FF6D60;
    margin: 0 auto;
  }
  .ProseMirror blockquote::before { margin-bottom: 0.8em; }
  .ProseMirror blockquote::after  { margin-top: 0.8em; }
  .ProseMirror blockquote p {
    margin-bottom: 0.3em;
  }

  /* Lists */
  .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5em;
    margin-bottom: 0.75em;
  }
  .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin-bottom: 0.75em;
  }
  .ProseMirror li {
    margin-bottom: 0.25em;
  }
  .ProseMirror li p {
    margin-bottom: 0.25em;
  }

  /* Links — coral double underline */
  .ProseMirror a {
    color: #FF6D60;
    text-decoration: underline;
    text-decoration-style: double;
    text-decoration-color: #FF6D60;
    text-underline-offset: 2px;
    cursor: pointer;
    transition: text-decoration-color 0.15s;
  }
  .ProseMirror a:hover {
    text-decoration-color: #e5564b;
    text-decoration-thickness: 2px;
  }

  /* Horizontal rule */
  .ProseMirror hr {
    border: none;
    border-top: 1px solid rgba(140,133,126,0.3);
    margin: 1.5em 0;
  }

  /* Images — NodeView wrapper */
  .ProseMirror .image-node-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0.75em auto;
    position: relative;
  }
  .ProseMirror .image-node-view[data-size="small"]  { max-width: 33%; }
  .ProseMirror .image-node-view[data-size="medium"] { max-width: 66%; }
  .ProseMirror .image-node-view[data-size="large"]  { max-width: 100%; }
  .ProseMirror .image-node-view img {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
    cursor: pointer;
    border-radius: 0.75rem;
    display: block;
    transition: outline 0.15s;
  }
  .ProseMirror .image-node-view.ProseMirror-selectednode img {
    outline: 2px solid #FF6D60;
  }
  .ProseMirror .image-node-view img[src^="data:image/svg+xml"] {
    animation: pulse-placeholder 1.5s ease-in-out infinite;
    max-height: 80px;
    pointer-events: none;
  }
  @keyframes pulse-placeholder {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Image size controls (inside NodeView) */
  .image-size-controls {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    border: 1px solid #FAF3EE;
    font-size: 12px;
  }
  .image-size-label {
    color: rgba(44,35,25,0.4);
    font-weight: 500;
  }
  .image-size-btn {
    padding: 2px 8px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.15s;
    background: #FAF3EE;
    color: rgba(44,35,25,0.6);
    border: none;
    cursor: pointer;
  }
  .image-size-btn:hover { background: #F0E4D9; }
  .image-size-btn.active { background: #FF6D60; color: white; }

  /* Image caption input */
  .image-caption-input {
    width: 100%;
    text-align: center;
    font-style: italic;
    font-size: 0.8rem;
    color: #8a8279;
    border: none;
    outline: none;
    background: transparent;
    padding: 4px 8px;
    margin-top: 4px;
    transition: background 0.15s;
  }
  .image-caption-input:focus {
    background: rgba(245, 240, 235, 0.5);
    border-radius: 6px;
  }
  .image-caption-input::placeholder {
    color: rgba(138, 130, 121, 0.4);
  }

  /* Code */
  .ProseMirror code {
    background: rgba(140,133,126,0.1);
    border-radius: 0.25rem;
    padding: 0.15em 0.35em;
    font-size: 0.9em;
    font-family: ui-monospace, monospace;
  }
  .ProseMirror pre {
    background: #2D2926;
    color: #F5F0EB;
    border-radius: 0.5rem;
    padding: 0.75em 1em;
    margin: 0.75em 0;
    overflow-x: auto;
  }
  .ProseMirror pre code {
    background: none;
    padding: 0;
    color: inherit;
    font-size: 0.85em;
  }

  /* Suggestion highlights */
  .ProseMirror .suggestion-highlight {
    background: rgba(251, 191, 36, 0.25);
    border-bottom: 2px solid #f59e0b;
    cursor: pointer;
    transition: background 0.15s;
    border-radius: 2px;
  }
  .ProseMirror .suggestion-highlight:hover {
    background: rgba(251, 191, 36, 0.4);
  }
`;

/* ── Main editor component ── */
export default function TiptapEditor({
  content,
  onChange,
  onUploadImage,
  uploading,
  placeholder,
  articleId,
  suggestions = [],
  onSuggestionsChange,
  currentUserId,
  currentUserRole,
  currentUserName,
}: Props) {
  const lastMdRef = useRef(content);
  const onUploadRef = useRef(onUploadImage);
  onUploadRef.current = onUploadImage;
  const editorRef = useRef<Editor | null>(null);
  const suggestionsRef = useRef(suggestions);
  suggestionsRef.current = suggestions;

  const [optimizing, setOptimizing] = useState(false);
  const [suggestionMode, setSuggestionMode] = useState(false);
  // Mini = small "Öneri Bırak" button near selection; create/review = full popover
  const [popover, setPopover] = useState<{
    mode: "mini";
    selectedText: string;
    rect: DOMRect;
  } | {
    mode: "create";
    selectedText: string;
    rect: DOMRect;
  } | {
    mode: "review";
    suggestion: Suggestion;
    rect: DOMRect;
  } | null>(null);

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;

  // Sync suggestions to extension storage
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed || ed.isDestroyed) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ed.storage as any).suggestion.suggestions = suggestions;
    // Force decoration recalculation
    ed.view.dispatch(ed.state.tr.setMeta("suggestion-update", true));
  }, [suggestions]);

  // Handle suggestion create
  const handleSuggestionCreate = useCallback(async (data: {
    original_text: string;
    suggested_text: string;
    context_before: string;
    context_after: string;
    note: string;
  }) => {
    if (!articleId) return;

    // Get context from editor
    const ed = editorRef.current;
    if (ed && !ed.isDestroyed) {
      const match = findTextInDoc(ed.state.doc, data.original_text, "", "");
      if (match) {
        // Extract context_before and context_after from surrounding text
        const textBefore: string[] = [];
        ed.state.doc.nodesBetween(0, match.from, (node) => {
          if (node.isText && node.text) textBefore.push(node.text);
        });
        const textAfter: string[] = [];
        ed.state.doc.nodesBetween(match.to, ed.state.doc.content.size, (node) => {
          if (node.isText && node.text) textAfter.push(node.text);
        });
        data.context_before = textBefore.join("").slice(-80);
        data.context_after = textAfter.join("").slice(0, 80);
      }
    }

    const res = await fetch(`/api/admin/articles/${articleId}/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const { suggestion } = await res.json();
      onSuggestionsChange?.([...suggestions, suggestion]);
    }
  }, [articleId, suggestions, onSuggestionsChange]);

  // Handle accept
  const handleSuggestionAccept = useCallback(async (suggestion: Suggestion) => {
    if (!articleId) return;

    // Replace text in editor
    const ed = editorRef.current;
    if (ed && !ed.isDestroyed) {
      const match = findTextInDoc(
        ed.state.doc,
        suggestion.original_text,
        suggestion.context_before,
        suggestion.context_after
      );
      if (match) {
        ed.chain()
          .focus()
          .setTextSelection({ from: match.from, to: match.to })
          .insertContent(suggestion.suggested_text)
          .run();
      }
    }

    // Update API
    const res = await fetch(
      `/api/admin/articles/${articleId}/suggestions/${suggestion.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      }
    );

    if (res.ok) {
      onSuggestionsChange?.(
        suggestions.map((s) =>
          s.id === suggestion.id ? { ...s, status: "accepted" as const } : s
        )
      );
    }
  }, [articleId, suggestions, onSuggestionsChange]);

  // Handle reject
  const handleSuggestionReject = useCallback(async (suggestion: Suggestion) => {
    if (!articleId) return;

    const res = await fetch(
      `/api/admin/articles/${articleId}/suggestions/${suggestion.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      }
    );

    if (res.ok) {
      onSuggestionsChange?.(
        suggestions.map((s) =>
          s.id === suggestion.id ? { ...s, status: "rejected" as const } : s
        )
      );
    }
  }, [articleId, suggestions, onSuggestionsChange]);

  const handleImageUpload = async (file: File) => {
    const ed = editorRef.current;
    if (!ed || ed.isDestroyed) return;

    // Pre-optimization size check (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Dosya boyutu 10MB'dan büyük olamaz");
      return;
    }

    // Client-side optimization: resize + WebP conversion
    setOptimizing(true);
    const optimized = await optimizeImage(file);
    setOptimizing(false);

    const altText = altFromFileName(optimized.name);

    // Insert placeholder image + empty paragraph (no forced italic)
    const placeholderId = `upload-${Date.now()}`;
    ed.chain()
      .focus()
      .insertContent([
        {
          type: "image",
          attrs: {
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='80'%3E%3Crect width='400' height='80' rx='12' fill='%23f5f0eb'/%3E%3Ctext x='200' y='45' text-anchor='middle' fill='%238c857e' font-size='14' font-family='system-ui'%3EGörsel yükleniyor...%3C/text%3E%3C/svg%3E",
            alt: placeholderId,
          },
        },
        { type: "paragraph" },
      ])
      .run();

    const url = await onUploadRef.current(optimized);

    if (ed.isDestroyed) return;

    // Find and replace the placeholder
    let replaced = false;
    ed.state.doc.descendants((node, pos) => {
      if (replaced) return false;
      if (node.type.name === "image" && node.attrs.alt === placeholderId) {
        if (url) {
          ed.chain()
            .setNodeSelection(pos)
            .setImage({ src: url, alt: altText })
            .run();
        } else {
          // Upload failed — remove placeholder
          ed.chain().setNodeSelection(pos).deleteSelection().run();
        }
        replaced = true;
        return false;
      }
    });

    // Fallback: if placeholder wasn't found but upload succeeded
    if (!replaced && url) {
      ed.chain()
        .focus()
        .insertContent([
          { type: "image", attrs: { src: url, alt: altText } },
          { type: "paragraph" },
        ])
        .run();
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ResizableImage.configure({ inline: false }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({
        showOnlyCurrent: false,
        placeholder: ({ node, editor: ed }) => {
          if (node.type.name !== "paragraph" || node.childCount > 0) return "";
          if (
            ed.state.doc.childCount === 1 &&
            ed.state.doc.firstChild?.childCount === 0
          ) {
            return placeholder || "İçerik yazın...";
          }
          return "";
        },
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      SuggestionExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (editor.storage as any).markdown.getMarkdown() as string;
      lastMdRef.current = md;
      onChange(md);
    },
    editorProps: {
      handleClick(view, _pos, event) {
        const target = event.target as HTMLElement;
        const suggEl = target.closest("[data-suggestion-id]") as HTMLElement | null;
        if (suggEl) {
          const sid = suggEl.getAttribute("data-suggestion-id");
          const s = suggestionsRef.current.find((sg) => sg.id === sid);
          if (s && s.status === "pending") {
            const rect = suggEl.getBoundingClientRect();
            setPopover({ mode: "review", suggestion: s, rect: DOMRect.fromRect(rect) });
            return true;
          }
        }
        return false;
      },
      handleDrop(_view, event, _slice, moved) {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file && /^image\//.test(file.type)) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste(_view, event) {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) handleImageUpload(file);
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  // Keep ref in sync
  useEffect(() => {
    editorRef.current = editor ?? null;
  }, [editor]);

  // Sync external content changes (e.g., after fetch)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (content !== lastMdRef.current) {
      editor.commands.setContent(content);
      lastMdRef.current = content;
    }
  }, [content, editor]);

  // Handle text selection in suggestion mode — show mini button
  useEffect(() => {
    if (!editor || editor.isDestroyed || !suggestionMode) return;
    let timer: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Don't overwrite an open create/review popover
        if (popover?.mode === "create" || popover?.mode === "review") return;

        const { from, to } = editor.state.selection;
        if (from === to) { setPopover(null); return; }
        const selectedText = editor.state.doc.textBetween(from, to, "");
        if (!selectedText.trim()) { setPopover(null); return; }

        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) return;
        const rect = domSelection.getRangeAt(0).getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        setPopover({
          mode: "mini",
          selectedText,
          rect: DOMRect.fromRect(rect),
        });
      }, 80);
    };

    const editorEl = editor.view.dom;
    editorEl.addEventListener("mouseup", handler);
    // Also clear mini when selection changes to empty
    const selHandler = () => {
      if (popover?.mode === "mini") {
        const { from, to } = editor.state.selection;
        if (from === to) setPopover(null);
      }
    };
    editorEl.addEventListener("mousedown", selHandler);
    return () => {
      clearTimeout(timer);
      editorEl.removeEventListener("mouseup", handler);
      editorEl.removeEventListener("mousedown", selHandler);
    };
  }, [editor, suggestionMode, popover?.mode]);

  const fileRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const addLink = () => {
    const choice = prompt(
      "Link türü seçin:\n1 = Dış link (URL girin)\n2 = Site içi yazı linki (/icerikler/yazi/slug)\n\nURL veya numara girin:"
    );
    if (!choice) return;
    let url = choice.trim();
    if (url === "2") {
      const slug = prompt("Yazı slug'ını girin (örn: medeanin-intikami):");
      if (!slug) return;
      url = `/icerikler/yazi/${slug.trim()}`;
    } else if (url === "1") {
      const u = prompt("URL girin:");
      if (!u) return;
      url = u.trim();
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="relative border border-warm-200 rounded-xl overflow-hidden bg-white">
      <style>{EDITOR_CSS}</style>

      {/* Static toolbar — always visible at top */}
      <div className="flex items-center gap-0.5 flex-wrap bg-white border-b border-warm-200 px-2 py-1.5 sticky top-0 z-10">
        <TBtn
          title="Başlık 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <span className="text-xs font-bold leading-none">H2</span>
        </TBtn>
        <TBtn
          title="Başlık 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          <span className="text-xs font-bold leading-none">H3</span>
        </TBtn>
        <TBtn
          title="Normal Metin"
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph") && !editor.isActive("heading")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 4v16" /><path d="M17 4v16" /><path d="M19 4H9.5a4.5 4.5 0 1 0 0 9H13" />
          </svg>
        </TBtn>
        <TSep />
        <TBtn
          title="Kalın"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          {I.bold}
        </TBtn>
        <TBtn
          title="İtalik"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          {I.italic}
        </TBtn>
        <TBtn
          title="Vurgula"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
        >
          {I.highlight}
        </TBtn>
        <TSep />
        <TBtn
          title="Alıntı"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          {I.quote}
        </TBtn>
        <TBtn
          title="Sıralı Liste"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          {I.ol}
        </TBtn>
        <TBtn
          title="Sırasız Liste"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          {I.ul}
        </TBtn>
        <TSep />
        <TBtn title="Link" onClick={addLink} active={editor.isActive("link")}>
          {I.link}
        </TBtn>
        <TBtn title="Görsel Ekle" onClick={() => fileRef.current?.click()} disabled={uploading || optimizing}>
          {I.image}
        </TBtn>
        <TBtn
          title="Ayraç Çizgisi"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          {I.hr}
        </TBtn>
        {(uploading || optimizing) && (
          <>
            <TSep />
            <span className="flex items-center gap-1.5 text-xs text-coral">
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {optimizing ? "Optimize ediliyor..." : "Yükleniyor..."}
            </span>
          </>
        )}
        {articleId && (
          <>
            <TSep />
            <button
              type="button"
              title="Öneri Modu"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setSuggestionMode((p) => !p);
                setPopover(null);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition ${
                suggestionMode
                  ? "bg-amber-100 text-amber-700"
                  : "text-warm-900/40 hover:bg-warm-200/60 hover:text-warm-900/70"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Öneri
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* Floating BubbleMenu — appears on text selection */}
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor: e, from, to }) => {
          if (from === to) return false;
          if (e.isActive("image")) return false;
          return true;
        }}
      >
        <div className="flex items-center gap-0.5 bg-white rounded-xl shadow-lg border border-warm-100 p-1">
          <TBtn
            title="Başlık 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          >
            <span className="text-xs font-bold leading-none">H2</span>
          </TBtn>
          <TBtn
            title="Başlık 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
          >
            <span className="text-xs font-bold leading-none">H3</span>
          </TBtn>
          <TBtn
            title="Normal Metin"
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph") && !editor.isActive("heading")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 4v16" /><path d="M17 4v16" /><path d="M19 4H9.5a4.5 4.5 0 1 0 0 9H13" />
            </svg>
          </TBtn>
          <TSep />
          <TBtn
            title="Kalın"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            {I.bold}
          </TBtn>
          <TBtn
            title="İtalik"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            {I.italic}
          </TBtn>
          <TBtn
            title="Vurgula"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive("highlight")}
          >
            {I.highlight}
          </TBtn>
          <TSep />
          <TBtn
            title="Alıntı"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          >
            {I.quote}
          </TBtn>
          <TBtn
            title="Sıralı Liste"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            {I.ol}
          </TBtn>
          <TBtn
            title="Sırasız Liste"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            {I.ul}
          </TBtn>
          <TSep />
          <TBtn
            title="Link"
            onClick={addLink}
            active={editor.isActive("link")}
          >
            {I.link}
          </TBtn>
        </div>
      </BubbleMenu>

      {/* "+" insert menu — always visible top-right */}
      <InsertMenu
        editor={editor}
        onImageClick={() => fileRef.current?.click()}
        uploading={uploading || optimizing}
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = "";
        }}
      />
      <EditorContent editor={editor} />

      {/* Mini "Öneri Bırak" button — appears near selection */}
      {popover?.mode === "mini" && (
        <button
          type="button"
          className="fixed z-50 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg shadow-lg hover:bg-amber-600 transition"
          style={{
            top: popover.rect.bottom + 6,
            left: popover.rect.left + popover.rect.width / 2 - 60,
          }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            // Upgrade mini → full create popover, re-snapshot the selection rect
            const domSelection = window.getSelection();
            let rect = popover.rect;
            if (domSelection && domSelection.rangeCount > 0) {
              const r = domSelection.getRangeAt(0).getBoundingClientRect();
              if (r.width > 0) rect = DOMRect.fromRect(r);
            }
            setPopover({
              mode: "create",
              selectedText: popover.selectedText,
              rect,
            });
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Öneri Bırak
        </button>
      )}

      {/* Suggestion Popover */}
      {popover?.mode === "create" && (
        <SuggestionPopover
          mode="create"
          selectedText={popover.selectedText}
          anchorRect={popover.rect}
          onSubmit={handleSuggestionCreate}
          onClose={() => setPopover(null)}
        />
      )}
      {popover?.mode === "review" && (
        <SuggestionPopover
          mode="review"
          suggestion={popover.suggestion}
          anchorRect={popover.rect}
          onAccept={handleSuggestionAccept}
          onReject={handleSuggestionReject}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
