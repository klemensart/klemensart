"use client";

import { useEffect, useRef, useState } from "react";
import type { Suggestion } from "@/lib/tiptap-suggestions";

/* ── Types ── */
type CreateMode = {
  mode: "create";
  selectedText: string;
  anchorRect: DOMRect;
  onSubmit: (data: {
    original_text: string;
    suggested_text: string;
    context_before: string;
    context_after: string;
    note: string;
  }) => Promise<void>;
  onClose: () => void;
};

type ReviewMode = {
  mode: "review";
  suggestion: Suggestion;
  anchorRect: DOMRect;
  onAccept: (suggestion: Suggestion) => Promise<void>;
  onReject: (suggestion: Suggestion) => Promise<void>;
  onClose: () => void;
};

type Props = CreateMode | ReviewMode;

/* ── Helper: format relative time ── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

/* ── Position popover near anchor rect ── */
function calcPosition(anchorRect: DOMRect, popoverEl: HTMLDivElement) {
  const MARGIN = 8;
  const popRect = popoverEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Prefer below the selection
  let top = anchorRect.bottom + MARGIN;
  let left = anchorRect.left;

  // If it overflows bottom, show above
  if (top + popRect.height > vh - MARGIN) {
    top = anchorRect.top - popRect.height - MARGIN;
  }

  // If it overflows right, shift left
  if (left + popRect.width > vw - MARGIN) {
    left = vw - popRect.width - MARGIN;
  }

  // Don't go off-screen left
  if (left < MARGIN) left = MARGIN;

  // Don't go off-screen top
  if (top < MARGIN) top = MARGIN;

  return { top, left };
}

export default function SuggestionPopover(props: Props) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [suggestedText, setSuggestedText] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Position the popover after first render
  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;
    // Use requestAnimationFrame to ensure layout is done
    requestAnimationFrame(() => {
      setPos(calcPosition(props.anchorRect, el));
    });
  }, [props.anchorRect]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        props.onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 150);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [props.onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [props.onClose]);

  const style: React.CSSProperties = {
    position: "fixed",
    zIndex: 50,
    // Start offscreen, then move into place after measurement
    top: pos ? pos.top : -9999,
    left: pos ? pos.left : -9999,
    opacity: pos ? 1 : 0,
    transition: "opacity 0.1s",
  };

  if (props.mode === "create") {
    const handleSubmit = async () => {
      if (!suggestedText.trim() || suggestedText === props.selectedText) return;
      setSubmitting(true);
      try {
        await props.onSubmit({
          original_text: props.selectedText,
          suggested_text: suggestedText,
          context_before: "",
          context_after: "",
          note,
        });
        props.onClose();
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div
        ref={popoverRef}
        className="w-80 bg-white rounded-xl shadow-xl border border-warm-100 overflow-hidden"
        style={style}
      >
        <div className="px-4 py-3 border-b border-warm-100 bg-warm-50/50">
          <div className="text-xs font-medium text-warm-900/50 mb-1">Seçilen metin</div>
          <div className="text-sm text-warm-900/70 line-clamp-2 italic">
            &ldquo;{props.selectedText}&rdquo;
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-warm-900/50 mb-1">
              Öneriniz
            </label>
            <textarea
              value={suggestedText}
              onChange={(e) => setSuggestedText(e.target.value)}
              placeholder="Düzeltilmiş metni yazın..."
              rows={3}
              autoFocus
              className="w-full text-sm border border-warm-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-warm-900/50 mb-1">
              Not (opsiyonel)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Neden bu değişikliği öneriyorsunuz?"
              className="w-full text-sm border border-warm-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={props.onClose}
              className="px-3 py-1.5 text-xs font-medium text-warm-900/50 hover:text-warm-900 transition"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !suggestedText.trim() || suggestedText === props.selectedText}
              className="px-3 py-1.5 text-xs font-medium bg-coral text-white rounded-lg hover:bg-coral/90 transition disabled:opacity-50"
            >
              {submitting ? "Gönderiliyor..." : "Gönder"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Review mode
  const { suggestion } = props;

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await props.onAccept(suggestion);
      props.onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await props.onReject(suggestion);
      props.onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={popoverRef}
      className="w-80 bg-white rounded-xl shadow-xl border border-warm-100 overflow-hidden"
      style={style}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-warm-100 bg-warm-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-coral/10 text-coral flex items-center justify-center text-xs font-bold">
            {suggestion.created_by_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-medium text-warm-900">
              {suggestion.created_by_name}
            </div>
            <div className="text-[10px] text-warm-900/40">
              {timeAgo(suggestion.created_at)}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
          {suggestion.created_by_role}
        </span>
      </div>

      {/* Diff view */}
      <div className="px-4 py-3 space-y-2">
        <div className="text-sm">
          <span className="line-through text-red-500/70 bg-red-50 px-0.5 rounded">
            {suggestion.original_text}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-green-700 bg-green-50 px-0.5 rounded">
            {suggestion.suggested_text}
          </span>
        </div>

        {suggestion.note && (
          <div className="text-xs text-warm-900/50 italic border-l-2 border-warm-200 pl-2 mt-2">
            {suggestion.note}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-warm-100 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleReject}
          disabled={submitting}
          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
        >
          Reddet
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={submitting}
          className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {submitting ? "..." : "Kabul Et"}
        </button>
      </div>
    </div>
  );
}
