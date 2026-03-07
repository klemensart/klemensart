"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

/* ── Editor CSS ── */
const EDITOR_CSS = `
  .newsletter-editor .ProseMirror {
    min-height: 400px;
    padding: 1.25rem 1.5rem;
    color: rgba(45,41,38,0.8);
    font-size: 15px;
    line-height: 1.7;
  }
  .newsletter-editor .ProseMirror:focus { outline: none; }
  .newsletter-editor .ProseMirror .is-empty::before {
    content: attr(data-placeholder);
    float: left;
    color: rgba(140,133,126,0.4);
    pointer-events: none;
    height: 0;
  }
  .newsletter-editor .ProseMirror h2 {
    font-size: 1.4em; font-weight: 700; color: #2D2926;
    margin-top: 1em; margin-bottom: 0.5em;
  }
  .newsletter-editor .ProseMirror h3 {
    font-size: 1.2em; font-weight: 700; color: #2D2926;
    margin-top: 0.8em; margin-bottom: 0.4em;
  }
  .newsletter-editor .ProseMirror p { margin-bottom: 0.75em; }
  .newsletter-editor .ProseMirror strong { font-weight: 700; color: #2D2926; }
  .newsletter-editor .ProseMirror em { font-style: italic; }
  .newsletter-editor .ProseMirror mark {
    background: rgba(255,109,96,0.2); border-radius: 2px; padding: 0.05em 0.15em;
  }
  .newsletter-editor .ProseMirror blockquote {
    border-left: 3px solid #FF6D60; padding-left: 1em;
    color: rgba(45,41,38,0.6); font-style: italic; margin: 1em 0;
  }
  .newsletter-editor .ProseMirror ul { list-style: disc; padding-left: 1.5em; }
  .newsletter-editor .ProseMirror ol { list-style: decimal; padding-left: 1.5em; }
  .newsletter-editor .ProseMirror a { color: #FF6D60; text-decoration: underline; }
  .newsletter-editor .ProseMirror hr {
    border: none; border-top: 1px solid rgba(140,133,126,0.3); margin: 1.5em 0;
  }
`;

/* ── Toolbar button ── */
function TBtn({
  children,
  title,
  onClick,
  active,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex items-center gap-0.5 p-1.5 rounded-lg transition text-xs ${
        active
          ? "bg-gray-200 text-gray-900"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export default function BultenGonderPage() {
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank" },
      }),
      Highlight,
      Placeholder.configure({
        placeholder: "E-bulten iceriginizi buraya yazin...",
      }),
    ],
    onUpdate: ({ editor }) => {
      setHtmlContent(editor.getHTML());
    },
  });

  const sendNewsletter = useCallback(
    async (mode: "test" | "all") => {
      if (!subject.trim()) {
        setMessage("Konu basligi gerekli.");
        return;
      }
      if (!htmlContent || htmlContent === "<p></p>") {
        setMessage("Icerik bos olamaz.");
        return;
      }
      if (mode === "test" && !testEmail.trim()) {
        setMessage("Test e-posta adresi girin.");
        return;
      }

      setSending(true);
      setMessage("");

      try {
        const res = await fetch("/api/admin/newsletter/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: subject.trim(),
            htmlContent,
            mode,
            testEmail: mode === "test" ? testEmail.trim() : undefined,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setMessage(data.message);
        } else {
          setMessage(data.error || "Gonderim basarisiz.");
        }
      } catch {
        setMessage("Baglanti hatasi.");
      } finally {
        setSending(false);
        setShowConfirm(false);
      }
    },
    [subject, htmlContent, testEmail]
  );

  const handleSendAll = async () => {
    // Fetch subscriber count for the confirmation modal
    try {
      const res = await fetch("/api/admin/subscribers");
      const data = await res.json();
      const activeCount =
        data.subscribers?.filter((s: { is_active: boolean }) => s.is_active)
          .length ?? 0;
      setSubscriberCount(activeCount);
    } catch {
      setSubscriberCount(null);
    }
    setShowConfirm(true);
  };

  const addLink = () => {
    if (!editor) return;
    const url = prompt("URL girin:");
    if (url) editor.chain().focus().setLink({ href: url.trim() }).run();
  };

  return (
    <div className="p-10 max-w-7xl mx-auto bg-white min-h-screen">
      <style>{EDITOR_CSS}</style>

      <h1 className="text-3xl font-serif text-gray-900 mb-1">E-Bulten Gonder</h1>
      <p className="text-gray-400 text-sm mb-8">
        Icerik olusturun, onizleyin ve abonelerinize gonderin.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left: Editor ── */}
        <div>
          {/* Subject */}
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Konu basligi"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 mb-4 focus:outline-none focus:border-[#FF6D60] text-sm"
          />

          {/* Toolbar + Editor */}
          <div className="newsletter-editor border border-gray-200 rounded-xl overflow-hidden">
            {editor && (
              <div className="flex items-center gap-0.5 flex-wrap bg-gray-50 border-b border-gray-200 px-2 py-1.5">
                <TBtn
                  title="Baslik 2"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  active={editor.isActive("heading", { level: 2 })}
                >
                  <span className="font-bold">H2</span>
                </TBtn>
                <TBtn
                  title="Baslik 3"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  active={editor.isActive("heading", { level: 3 })}
                >
                  <span className="font-bold">H3</span>
                </TBtn>
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <TBtn
                  title="Kalin"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  active={editor.isActive("bold")}
                >
                  <span className="font-bold">B</span>
                </TBtn>
                <TBtn
                  title="Italik"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  active={editor.isActive("italic")}
                >
                  <span className="italic">I</span>
                </TBtn>
                <TBtn
                  title="Vurgula"
                  onClick={() =>
                    editor.chain().focus().toggleHighlight().run()
                  }
                  active={editor.isActive("highlight")}
                >
                  <span className="bg-yellow-200 px-0.5">H</span>
                </TBtn>
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <TBtn
                  title="Alinti"
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  active={editor.isActive("blockquote")}
                >
                  &ldquo;
                </TBtn>
                <TBtn
                  title="Sirali Liste"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  active={editor.isActive("orderedList")}
                >
                  1.
                </TBtn>
                <TBtn
                  title="Liste"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  active={editor.isActive("bulletList")}
                >
                  &bull;
                </TBtn>
                <TBtn
                  title="Ayrac"
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                >
                  &mdash;
                </TBtn>
                <div className="w-px h-5 bg-gray-200 mx-0.5" />
                <TBtn
                  title="Link"
                  onClick={addLink}
                  active={editor.isActive("link")}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </TBtn>
              </div>
            )}
            <EditorContent editor={editor} />
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-1">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@email.com"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF6D60]"
              />
              <button
                onClick={() => sendNewsletter("test")}
                disabled={sending}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {sending ? "Gonderiyor..." : "Kendime Test Gonder"}
              </button>
            </div>
            <button
              onClick={handleSendAll}
              disabled={sending}
              className="px-6 py-2.5 bg-[#FF6D60] text-white rounded-xl text-sm font-medium hover:bg-[#e85e52] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              Tum Abonelere Gonder
            </button>
          </div>

          {message && (
            <div
              className={`mt-4 p-4 rounded-xl text-sm font-medium ${
                message.includes("gonderildi") || message.includes("gönderildi")
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* ── Right: Live Preview ── */}
        <div>
          <div className="text-xs text-gray-400 mb-2 font-medium">CANLI ONIZLEME</div>
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-[#f7f5f2] max-h-[calc(100vh-200px)] overflow-y-auto">
            <div
              style={{
                maxWidth: 600,
                margin: "0 auto",
                backgroundColor: "#ffffff",
              }}
            >
              {/* Header */}
              <div style={{ textAlign: "center", padding: "40px 40px 0 40px" }}>
                <div
                  style={{
                    fontSize: 28,
                    letterSpacing: 6,
                    color: "#2D2926",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  KLEMENS
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 3,
                    color: "#8C857E",
                    textTransform: "uppercase",
                    marginTop: 6,
                  }}
                >
                  art &amp; culture
                </div>
              </div>

              <hr
                style={{
                  borderTop: "1px solid #e8e4df",
                  margin: "24px 40px",
                  border: "none",
                  borderTopWidth: 1,
                  borderTopStyle: "solid",
                  borderTopColor: "#e8e4df",
                }}
              />

              {/* Subject */}
              {subject && (
                <div
                  style={{
                    padding: "0 40px",
                    textAlign: "center",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#2D2926",
                      lineHeight: "1.4",
                      marginBottom: 24,
                    }}
                  >
                    {subject}
                  </div>
                </div>
              )}

              {/* Content */}
              <div
                style={{
                  padding: "0 40px 32px 40px",
                  fontSize: 16,
                  lineHeight: "1.7",
                  color: "#3d3833",
                  fontFamily: "Georgia, serif",
                }}
                dangerouslySetInnerHTML={{
                  __html: htmlContent || '<p style="color:#b0a99f">Icerik burada gorunecek...</p>',
                }}
              />

              {/* Footer */}
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid #e8e4df",
                  margin: "0 40px",
                }}
              />
              <div
                style={{ textAlign: "center", padding: "24px 40px 32px 40px" }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 2,
                    color: "#2D2926",
                  }}
                >
                  Klemens Art
                </div>
                <div style={{ fontSize: 11, color: "#8C857E", marginTop: 4 }}>
                  Ankara, Turkiye
                </div>
                <div style={{ fontSize: 12, marginTop: 16 }}>
                  <span style={{ color: "#FF6D60" }}>Instagram</span>
                  &nbsp;&middot;&nbsp;
                  <span style={{ color: "#FF6D60" }}>YouTube</span>
                  &nbsp;&middot;&nbsp;
                  <span style={{ color: "#FF6D60" }}>Web</span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#b0a99f",
                    marginTop: 16,
                    lineHeight: "1.6",
                  }}
                >
                  Bu e-postayi klemensart.com uzerinden abone oldugunuz icin aliyorsunuz.
                  <br />
                  <span
                    style={{
                      color: "#8C857E",
                      textDecoration: "underline",
                    }}
                  >
                    Abonelikten cikmak icin tiklayin
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-0 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FF6D60]/10 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6D60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              <h3 className="text-lg font-serif font-semibold text-[#2D2926] mb-2">
                Bülteni Göndermek Üzeresiniz
              </h3>
              <p className="text-[#8C857E] text-sm leading-relaxed mb-6">
                Bu bülten veritabanındaki{" "}
                {subscriberCount !== null && (
                  <span className="font-semibold text-[#2D2926]">{subscriberCount}</span>
                )}{" "}
                {subscriberCount !== null ? "" : "tüm "}aktif abonenize gönderilecektir.
                <br />
                Bu işlem geri alınamaz. Onaylıyor musunuz?
              </p>
            </div>
            {/* Modal Actions */}
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3.5 text-sm font-medium text-[#8C857E] hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                İptal
              </button>
              <button
                onClick={() => sendNewsletter("all")}
                disabled={sending}
                className="flex-1 py-3.5 text-sm font-semibold text-[#FF6D60] hover:bg-[#FF6D60]/5 transition-colors disabled:opacity-50"
              >
                {sending ? "Gönderiliyor..." : "Evet, Tümüne Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
