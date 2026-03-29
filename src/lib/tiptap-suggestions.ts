import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

/* ── Types ── */
export type Suggestion = {
  id: string;
  article_id: string;
  original_text: string;
  suggested_text: string;
  context_before: string;
  context_after: string;
  created_by: string;
  created_by_name: string;
  created_by_role: string;
  note: string;
  status: "pending" | "accepted" | "rejected";
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
};

/* ── Text extraction (used by scoreContextMatch) ── */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractPlainText(doc: ProseMirrorNode): string {
  const parts: string[] = [];
  doc.descendants((node) => {
    if (node.isText && node.text) {
      parts.push(node.text);
    } else if (node.isBlock && parts.length > 0 && parts[parts.length - 1] !== "\n") {
      parts.push("\n");
    }
  });
  return parts.join("");
}

/* ── Find text position in document ── */
type TextMatch = { from: number; to: number };

function findAllOccurrences(doc: ProseMirrorNode, searchText: string): TextMatch[] {
  const matches: TextMatch[] = [];
  if (!searchText) return matches;

  // Walk through the document collecting text with positions
  const textRuns: { text: string; pos: number }[] = [];
  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      textRuns.push({ text: node.text, pos });
    }
  });

  // Build a combined text with position mapping
  let combined = "";
  const posMap: { combinedIdx: number; docPos: number }[] = [];
  for (const run of textRuns) {
    for (let i = 0; i < run.text.length; i++) {
      posMap.push({ combinedIdx: combined.length + i, docPos: run.pos + i });
    }
    combined += run.text;
  }

  // Find all occurrences in combined text
  let startIdx = 0;
  while (startIdx <= combined.length - searchText.length) {
    const idx = combined.indexOf(searchText, startIdx);
    if (idx === -1) break;

    const fromEntry = posMap[idx];
    const toEntry = posMap[idx + searchText.length - 1];
    if (fromEntry && toEntry) {
      matches.push({ from: fromEntry.docPos, to: toEntry.docPos + 1 });
    }
    startIdx = idx + 1;
  }

  return matches;
}

/* ── Context-based disambiguation ── */
function scoreContextMatch(doc: ProseMirrorNode, match: TextMatch, contextBefore: string, contextAfter: string): number {
  // We need to map match.from/to to plaintext indices
  // Approximate: extract text around the match directly from the doc
  let score = 0;

  // Get text before match in doc
  const beforeParts: string[] = [];
  doc.nodesBetween(0, match.from, (node) => {
    if (node.isText && node.text) beforeParts.push(node.text);
  });
  const textBeforeMatch = beforeParts.join("");

  // Get text after match in doc
  const afterParts: string[] = [];
  doc.nodesBetween(match.to, doc.content.size, (node) => {
    if (node.isText && node.text) afterParts.push(node.text);
  });
  const textAfterMatch = afterParts.join("");

  if (contextBefore) {
    const tail = textBeforeMatch.slice(-contextBefore.length);
    if (tail === contextBefore) score += 10;
    else if (tail.includes(contextBefore.slice(-20))) score += 5;
  }

  if (contextAfter) {
    const head = textAfterMatch.slice(0, contextAfter.length);
    if (head === contextAfter) score += 10;
    else if (head.includes(contextAfter.slice(0, 20))) score += 5;
  }

  // Bonus if no context needed (single occurrence)
  if (!contextBefore && !contextAfter) score += 1;

  return score;
}

export function findTextInDoc(
  doc: ProseMirrorNode,
  originalText: string,
  contextBefore: string,
  contextAfter: string
): TextMatch | null {
  const occurrences = findAllOccurrences(doc, originalText);

  if (occurrences.length === 0) return null;
  if (occurrences.length === 1) return occurrences[0];

  // Multiple occurrences — use context to disambiguate
  let bestMatch = occurrences[0];
  let bestScore = -1;

  for (const match of occurrences) {
    const score = scoreContextMatch(doc, match, contextBefore, contextAfter);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = match;
    }
  }

  return bestMatch;
}

/* ── Plugin key ── */
export const suggestionPluginKey = new PluginKey("suggestions");

/* ── Extension ── */
export const SuggestionExtension = Extension.create({
  name: "suggestion",

  addStorage() {
    return {
      suggestions: [] as Suggestion[],
      suggestionMode: false,
      activeSuggestionId: null as string | null,
    };
  },

  addProseMirrorPlugins() {
    const extensionStorage = this.storage;

    return [
      new Plugin({
        key: suggestionPluginKey,

        state: {
          init() {
            return DecorationSet.empty;
          },

          apply(tr, oldSet, _oldState, newState) {
            const suggestions: Suggestion[] = extensionStorage.suggestions;
            const pending = suggestions.filter((s) => s.status === "pending");

            if (pending.length === 0) return DecorationSet.empty;

            const decorations: Decoration[] = [];

            for (const s of pending) {
              const match = findTextInDoc(
                newState.doc,
                s.original_text,
                s.context_before,
                s.context_after
              );
              if (!match) continue;

              decorations.push(
                Decoration.inline(match.from, match.to, {
                  class: "suggestion-highlight",
                  "data-suggestion-id": s.id,
                })
              );
            }

            return DecorationSet.create(newState.doc, decorations);
          },
        },

        props: {
          decorations(state) {
            return this.getState(state) ?? DecorationSet.empty;
          },
        },
      }),
    ];
  },
});
