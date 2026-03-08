"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

/* ── Template registry (client-side metadata only) ── */
type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "email";
};

type ArrayFieldDef = {
  key: string;
  label: string;
  type: "array";
  itemFields: { key: string; label: string; type: "text" | "textarea" | "url" }[];
};

type TemplateConfig = {
  name: string;
  label: string;
  description: string;
  icon: string;
  defaultSubject: string;
  fields: (FieldDef | ArrayFieldDef)[];
  defaults: Record<string, unknown>;
};

const TEMPLATES: TemplateConfig[] = [
  {
    name: "DuyuruBulteni",
    label: "Duyuru Bülteni",
    description: "Genel duyuru ve kampanya e-postası",
    icon: "📢",
    defaultSubject: "Klemens Art'tan Yeni Duyuru",
    fields: [
      { key: "headline", label: "Başlık", type: "text" },
      { key: "body1", label: "Birinci Paragraf", type: "textarea" },
      { key: "body2", label: "İkinci Paragraf", type: "textarea" },
      { key: "buttonText", label: "Buton Metni", type: "text" },
      { key: "buttonUrl", label: "Buton URL", type: "url" },
    ],
    defaults: {
      headline: "Yeni Bir Keşif Sizi Bekliyor",
      body1: "Klemens Art olarak bu sezon, kültür ve düşünce dünyasını yeniden şekillendiren bir program hazırladık.",
      body2: "Detayları keşfetmek ve yerinizi ayırtmak için aşağıdaki butona tıklayın.",
      buttonText: "Detayları Keşfedin",
      buttonUrl: "https://klemensart.com",
    },
  },
  {
    name: "SeminerHatirlatici",
    label: "Seminer Hatırlatıcı",
    description: "Etkinlik öncesi hatırlatma e-postası",
    icon: "🔔",
    defaultSubject: "Hatırlatma: Yarın Buluşuyoruz",
    fields: [
      { key: "eventTitle", label: "Etkinlik Adı", type: "text" },
      { key: "eventDate", label: "Tarih", type: "text" },
      { key: "eventTime", label: "Saat", type: "text" },
      { key: "zoomLink", label: "Zoom Linki", type: "url" },
      { key: "calendarUrl", label: "Takvim URL", type: "url" },
    ],
    defaults: {
      eventTitle: "Caravaggio ve Karanlığın Estetiği",
      eventDate: "9 Mart 2026, Pazartesi",
      eventTime: "20:30 (TSİ)",
      zoomLink: "https://zoom.us/j/123456789",
      calendarUrl: "https://klemensart.com/takvim",
    },
  },
  {
    name: "EtkinlikTesekkur",
    label: "Etkinlik Teşekkür",
    description: "Etkinlik sonrası teşekkür ve kayıt paylaşımı",
    icon: "🙏",
    defaultSubject: "Teşekkürler — Kayıt ve Bibliyografya",
    fields: [
      { key: "eventTitle", label: "Etkinlik Adı", type: "text" },
      { key: "replayUrl", label: "Kayıt URL", type: "url" },
      {
        key: "bibliography",
        label: "Bibliyografya",
        type: "array",
        itemFields: [
          { key: "title", label: "Eser Adı", type: "text" },
          { key: "author", label: "Yazar", type: "text" },
          { key: "type", label: "Tür (Kitap/Film/vb.)", type: "text" },
        ],
      },
    ],
    defaults: {
      eventTitle: "Caravaggio ve Karanlığın Estetiği",
      replayUrl: "https://klemensart.com/arsiv",
      bibliography: [
        { title: "Caravaggio: A Life Sacred and Profane", author: "Andrew Graham-Dixon", type: "Kitap" },
      ],
    },
  },
  {
    name: "AtolyeHazirlik",
    label: "Atölye Hazırlık",
    description: "Atölye öncesi hazırlık kiti ve program",
    icon: "📚",
    defaultSubject: "Atölye Hazırlık Kiti",
    fields: [
      { key: "workshopTitle", label: "Atölye Adı", type: "text" },
      { key: "instructorName", label: "Eğitmen Adı", type: "text" },
      { key: "contactEmail", label: "İletişim E-posta", type: "email" },
      {
        key: "weeks",
        label: "Haftalık Program",
        type: "array",
        itemFields: [
          { key: "week", label: "Hafta", type: "text" },
          { key: "title", label: "Konu", type: "text" },
          { key: "material", label: "Ön Materyal", type: "text" },
        ],
      },
    ],
    defaults: {
      workshopTitle: "Modern Sanatın Kırılma Noktaları",
      instructorName: "Klemens Art Eğitmeni",
      contactEmail: "info@klemensart.com",
      weeks: [
        { week: "1. Hafta", title: "Empresyonizmden Soyut'a Geçiş", material: "John Berger — Görme Biçimleri" },
      ],
    },
  },
  {
    name: "AylikAjanda",
    label: "Aylık Ajanda",
    description: "Aylık etkinlik takvimi ve editör seçimi",
    icon: "📅",
    defaultSubject: "Bu Ay Klemens Art'ta",
    fields: [
      { key: "monthName", label: "Ay Adı", type: "text" },
      { key: "editorialIntro", label: "Giriş Yazısı", type: "textarea" },
      {
        key: "events",
        label: "Etkinlikler",
        type: "array",
        itemFields: [
          { key: "date", label: "Tarih", type: "text" },
          { key: "title", label: "Başlık", type: "text" },
          { key: "tag", label: "Etiket", type: "text" },
        ],
      },
      { key: "editorPickTitle", label: "Editör Seçimi — Başlık", type: "text" },
      { key: "editorPickDescription", label: "Editör Seçimi — Açıklama", type: "textarea" },
      { key: "editorPickImageUrl", label: "Editör Seçimi — Görsel URL", type: "url" },
      { key: "editorPickUrl", label: "Editör Seçimi — Link", type: "url" },
    ],
    defaults: {
      monthName: "Mart 2026",
      editorialIntro: "Bu ay, karanlığın ve ışığın sanat tarihindeki dansını keşfediyoruz.",
      events: [
        { date: "12 Mart, Çarşamba", title: "Caravaggio ve Karanlığın Estetiği", tag: "Seminer" },
      ],
      editorPickTitle: "Görme Biçimleri — John Berger",
      editorPickDescription: "Görsel kültürün nasıl inşa edildiğini sorgulayan bu kısa ve keskin kitap.",
      editorPickImageUrl: "",
      editorPickUrl: "https://klemensart.com",
    },
  },
  {
    name: "YarimKalanKayit",
    label: "Yarım Kalan Kayıt",
    description: "Tamamlanmamış kayıtlar için hatırlatma",
    icon: "⏳",
    defaultSubject: "Kaydınızı Tamamlayın",
    fields: [
      { key: "eventTitle", label: "Etkinlik Adı", type: "text" },
      { key: "registerUrl", label: "Kayıt URL", type: "url" },
      { key: "contactEmail", label: "İletişim E-posta", type: "email" },
    ],
    defaults: {
      eventTitle: "Modern Sanatın Kırılma Noktaları",
      registerUrl: "https://klemensart.com/kayit",
      contactEmail: "info@klemensart.com",
    },
  },
];

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
  // ── Mode: "freetext" or "template" ──
  const [pageMode, setPageMode] = useState<"freetext" | "template">("freetext");

  // ── Free-text state ──
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  // ── Template state ──
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [templateProps, setTemplateProps] = useState<Record<string, unknown>>({});
  const [templateSubject, setTemplateSubject] = useState("");
  const [templatePreviewHtml, setTemplatePreviewHtml] = useState("");
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Shared state ──
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [excludeInactive, setExcludeInactive] = useState(false);

  // Workshop targeting
  type Workshop = {
    id: string;
    title: string;
    description: string | null;
    next_session_date: string | null;
    zoom_link: string | null;
    is_live: boolean;
    slug: string | null;
    url: string | null;
  };
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState("");
  const [workshopParticipantCount, setWorkshopParticipantCount] = useState<number | null>(null);
  const [showWorkshopConfirm, setShowWorkshopConfirm] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [abandonedCount, setAbandonedCount] = useState<number | null>(null);
  const [showAbandonedConfirm, setShowAbandonedConfirm] = useState(false);
  const [loadingAbandoned, setLoadingAbandoned] = useState(false);

  // Segment targeting
  type Segment = { id: string; label: string; description: string; count: number; category: string };
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [showSegmentConfirm, setShowSegmentConfirm] = useState(false);

  // Stats
  type Campaign = { subject: string; sent: number; opened: number; clicked: number; bounced: number; lastSent: string };
  const [stats, setStats] = useState<{
    campaigns: Campaign[];
    totalActive: number;
    openedLast60Days: number;
    inactiveLast60Days: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/newsletter/stats")
      .then((r) => r.json())
      .then((d) => { if (d.campaigns) setStats(d); })
      .catch(() => {});
  }, [sending]);

  // Fetch workshops for dropdown
  useEffect(() => {
    fetch("/api/admin/workshops")
      .then((r) => r.json())
      .then((d) => { if (d.workshops) setWorkshops(d.workshops); })
      .catch(() => {});
  }, []);

  // Fetch audience segments
  useEffect(() => {
    fetch("/api/admin/newsletter/segments")
      .then((r) => r.json())
      .then((d) => { if (d.segments) setSegments(d.segments); })
      .catch(() => {});
  }, [sending]);

  // Auto-fill template fields when workshop is selected
  useEffect(() => {
    if (!selectedWorkshopId) return;
    const w = workshops.find((ws) => ws.id === selectedWorkshopId);
    if (!w) return;

    // Freetext mode: only auto-fill subject if empty
    if (pageMode === "freetext") {
      if (!subject.trim() && w.title) {
        setSubject(`${w.title} — Klemens Art`);
      }
      return;
    }

    if (!selectedTemplate) return;

    const formatDate = (iso: string) => {
      const d = new Date(iso);
      const gun = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });
      return gun;
    };
    const formatTime = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) + " (TSİ)";
    };

    // Map of template field keys → workshop data
    const fieldMap: Record<string, string> = {};

    // Title fields
    if (w.title) {
      fieldMap["eventTitle"] = w.title;
      fieldMap["workshopTitle"] = w.title;
    }

    // Date/time fields
    if (w.next_session_date) {
      fieldMap["eventDate"] = formatDate(w.next_session_date);
      fieldMap["eventTime"] = formatTime(w.next_session_date);
    }

    // Zoom link
    if (w.zoom_link) {
      fieldMap["zoomLink"] = w.zoom_link;
    }

    // Workshop URL for register/replay links
    if (w.url) {
      fieldMap["registerUrl"] = w.url;
      fieldMap["replayUrl"] = w.url;
      fieldMap["buttonUrl"] = w.url;
    }

    // Only fill fields that exist in the current template
    const templateFieldKeys = new Set(
      selectedTemplate.fields.flatMap((f) =>
        f.type === "array" ? [] : [f.key]
      )
    );

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fieldMap)) {
      if (templateFieldKeys.has(key) && value) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length > 0) {
      setTemplateProps((prev) => ({ ...prev, ...updates }));
    }

    // Auto-fill subject with workshop title
    if (w.title && selectedTemplate.defaultSubject) {
      const subjectMap: Record<string, string> = {
        SeminerHatirlatici: `Hatırlatma: ${w.title}`,
        EtkinlikTesekkur: `Teşekkürler — ${w.title}`,
        AtolyeHazirlik: `Atölye Hazırlık Kiti — ${w.title}`,
        YarimKalanKayit: `Kaydınızı Tamamlayın — ${w.title}`,
        DuyuruBulteni: `${w.title} — Klemens Art`,
      };
      const autoSubject = subjectMap[selectedTemplate.name];
      if (autoSubject) {
        setTemplateSubject(autoSubject);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkshopId]);

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
        placeholder: "E-bülten içeriğinizi buraya yazın...",
      }),
    ],
    onUpdate: ({ editor }) => {
      setHtmlContent(editor.getHTML());
    },
  });

  // ── Template selection ──
  const selectTemplate = (tmpl: TemplateConfig) => {
    setSelectedTemplate(tmpl);
    setTemplateProps(structuredClone(tmpl.defaults));
    setTemplateSubject(tmpl.defaultSubject);
    setTemplatePreviewHtml("");
    setMessage("");
  };

  // ── Update a simple prop ──
  const updateProp = (key: string, value: unknown) => {
    setTemplateProps((prev) => ({ ...prev, [key]: value }));
  };

  // ── Array field helpers ──
  const addArrayItem = (key: string, itemFields: { key: string }[]) => {
    const empty: Record<string, string> = {};
    itemFields.forEach((f) => (empty[f.key] = ""));
    setTemplateProps((prev) => ({
      ...prev,
      [key]: [...((prev[key] as Record<string, string>[]) || []), empty],
    }));
  };

  const removeArrayItem = (key: string, index: number) => {
    setTemplateProps((prev) => ({
      ...prev,
      [key]: ((prev[key] as Record<string, string>[]) || []).filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (key: string, index: number, field: string, value: string) => {
    setTemplateProps((prev) => {
      const arr = [...((prev[key] as Record<string, string>[]) || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [key]: arr };
    });
  };

  // ── Template preview (debounced) ──
  useEffect(() => {
    if (!selectedTemplate) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/newsletter/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            template: selectedTemplate.name,
            templateProps,
          }),
        });
        const data = await res.json();
        if (res.ok && data.html) {
          setTemplatePreviewHtml(data.html);
        }
      } catch {
        // silently fail preview
      }
    }, 600);
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [selectedTemplate, templateProps]);

  // ── Send newsletter ──
  const sendNewsletter = useCallback(
    async (mode: "test" | "all" | "workshop" | "abandoned" | "segment") => {
      if (pageMode === "freetext") {
        if (!subject.trim()) {
          setMessage("Konu başlığı gerekli.");
          return;
        }
        if (!htmlContent || htmlContent === "<p></p>") {
          setMessage("İçerik boş olamaz.");
          return;
        }
      } else {
        if (!selectedTemplate) {
          setMessage("Lütfen bir şablon seçin.");
          return;
        }
      }

      if (mode === "test" && !testEmail.trim()) {
        setMessage("Test e-posta adresi girin.");
        return;
      }

      setSending(true);
      setMessage("");

      try {
        const body =
          pageMode === "template"
            ? {
                mode,
                template: selectedTemplate!.name,
                templateProps,
                subject: templateSubject || selectedTemplate!.defaultSubject,
                testEmail: mode === "test" ? testEmail.trim() : undefined,
                excludeInactive: mode === "all" ? excludeInactive : undefined,
                workshopId: (mode === "workshop" || mode === "abandoned") ? selectedWorkshopId : undefined,
                segmentId: mode === "segment" ? selectedSegmentId : undefined,
              }
            : {
                mode,
                subject: subject.trim(),
                htmlContent,
                testEmail: mode === "test" ? testEmail.trim() : undefined,
                excludeInactive: mode === "all" ? excludeInactive : undefined,
                workshopId: (mode === "workshop" || mode === "abandoned") ? selectedWorkshopId : undefined,
                segmentId: mode === "segment" ? selectedSegmentId : undefined,
              };

        const res = await fetch("/api/admin/newsletter/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (res.ok) {
          setMessage(data.message);
        } else {
          setMessage(data.error || "Gönderi başarısız.");
        }
      } catch {
        setMessage("Bağlantı hatası.");
      } finally {
        setSending(false);
        setShowConfirm(false);
        setShowWorkshopConfirm(false);
        setShowAbandonedConfirm(false);
        setShowSegmentConfirm(false);
      }
    },
    [pageMode, subject, htmlContent, testEmail, excludeInactive, selectedTemplate, templateProps, templateSubject, selectedWorkshopId, selectedSegmentId]
  );

  const handleSendAll = async () => {
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

  const handleSendWorkshop = async () => {
    if (!selectedWorkshopId) {
      setMessage("Lütfen bir atölye seçin.");
      return;
    }
    // Validate content
    if (pageMode === "freetext") {
      if (!subject.trim()) { setMessage("Konu başlığı gerekli."); return; }
      if (!htmlContent || htmlContent === "<p></p>") { setMessage("İçerik boş olamaz."); return; }
    } else {
      if (!selectedTemplate) { setMessage("Lütfen bir şablon seçin."); return; }
    }
    setLoadingParticipants(true);
    try {
      // Get participant count by doing a dry query via the workshops purchases
      const res = await fetch(`/api/admin/workshops/participants?workshopId=${selectedWorkshopId}`);
      const data = await res.json();
      setWorkshopParticipantCount(data.count ?? 0);
    } catch {
      setWorkshopParticipantCount(null);
    } finally {
      setLoadingParticipants(false);
    }
    setShowWorkshopConfirm(true);
  };

  const handleSendSegment = () => {
    if (!selectedSegmentId) {
      setMessage("Lütfen bir hedef kitle seçin.");
      return;
    }
    // Validate content
    if (pageMode === "freetext") {
      if (!subject.trim()) { setMessage("Konu başlığı gerekli."); return; }
      if (!htmlContent || htmlContent === "<p></p>") { setMessage("İçerik boş olamaz."); return; }
    } else {
      if (!selectedTemplate) { setMessage("Lütfen bir şablon seçin."); return; }
    }
    setShowSegmentConfirm(true);
  };

  const handleSendAbandoned = async () => {
    if (!selectedWorkshopId) {
      setMessage("Lütfen bir atölye seçin.");
      return;
    }
    if (!selectedTemplate) {
      setMessage("Lütfen bir şablon seçin.");
      return;
    }
    setLoadingAbandoned(true);
    try {
      const res = await fetch(`/api/admin/workshops/abandoned?workshopId=${selectedWorkshopId}`);
      const data = await res.json();
      setAbandonedCount(data.count ?? 0);
    } catch {
      setAbandonedCount(null);
    } finally {
      setLoadingAbandoned(false);
    }
    setShowAbandonedConfirm(true);
  };

  const addLink = () => {
    if (!editor) return;
    const url = prompt("URL girin:");
    if (url) editor.chain().focus().setLink({ href: url.trim() }).run();
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto bg-white min-h-screen">
      <style>{EDITOR_CSS}</style>

      {/* ── Page Header ── */}
      <h1 className="text-3xl font-serif text-gray-900 mb-1">E-Bülten Gönder</h1>
      <p className="text-gray-400 text-sm mb-8">
        İçerik oluşturun, önizleyin ve abonelerinize gönderin.
      </p>

      {/* ── Stats Overview ── */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="border border-gray-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-semibold text-[#2D2926]">{stats.totalActive}</div>
            <div className="text-xs text-[#8C857E] mt-1">Aktif Abone</div>
          </div>
          <div className="border border-gray-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-semibold text-emerald-600">{stats.openedLast60Days}</div>
            <div className="text-xs text-[#8C857E] mt-1">Son 60 Gün Açan</div>
          </div>
          <div className="border border-gray-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-semibold text-amber-500">{stats.inactiveLast60Days}</div>
            <div className="text-xs text-[#8C857E] mt-1">60 Gündür Açmayan</div>
          </div>
        </div>
      )}

      {/* ── Mode Tabs ── */}
      <div className="flex gap-1 mb-8 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => { setPageMode("freetext"); setMessage(""); }}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            pageMode === "freetext"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Serbest Metin
        </button>
        <button
          onClick={() => { setPageMode("template"); setMessage(""); }}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            pageMode === "template"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Hazır Şablon
        </button>
      </div>

      {/* ══════════════ FREE TEXT MODE ══════════════ */}
      {pageMode === "freetext" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left: Editor ── */}
          <div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Konu başlığı"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 mb-4 focus:outline-none focus:border-[#FF6D60] text-sm"
            />

            <div className="newsletter-editor border border-gray-200 rounded-xl overflow-hidden">
              {editor && (
                <div className="flex items-center gap-0.5 flex-wrap bg-gray-50 border-b border-gray-200 px-2 py-1.5">
                  <TBtn title="Başlık 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
                    <span className="font-bold">H2</span>
                  </TBtn>
                  <TBtn title="Başlık 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
                    <span className="font-bold">H3</span>
                  </TBtn>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  <TBtn title="Kalın" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
                    <span className="font-bold">B</span>
                  </TBtn>
                  <TBtn title="İtalik" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
                    <span className="italic">I</span>
                  </TBtn>
                  <TBtn title="Vurgula" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")}>
                    <span className="bg-yellow-200 px-0.5">H</span>
                  </TBtn>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  <TBtn title="Alıntı" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
                    &ldquo;
                  </TBtn>
                  <TBtn title="Sıralı Liste" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
                    1.
                  </TBtn>
                  <TBtn title="Liste" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
                    &bull;
                  </TBtn>
                  <TBtn title="Ayraç" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    &mdash;
                  </TBtn>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  <TBtn title="Link" onClick={addLink} active={editor.isActive("link")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </TBtn>
                </div>
              )}
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* ── Right: Live Preview ── */}
          <div>
            <div className="text-xs text-gray-400 mb-2 font-medium">CANLI ÖNİZLEME</div>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-[#f7f5f2] max-h-[calc(100vh-200px)] overflow-y-auto">
              <div style={{ maxWidth: 600, margin: "0 auto", backgroundColor: "#ffffff" }}>
                {/* Header */}
                <div style={{ textAlign: "center", padding: "40px 40px 0 40px" }}>
                  <div style={{ fontSize: 28, letterSpacing: 6, color: "#2D2926", fontFamily: "Georgia, serif" }}>KLEMENS</div>
                  <div style={{ fontSize: 11, letterSpacing: 3, color: "#8C857E", textTransform: "uppercase", marginTop: 6 }}>art &amp; culture</div>
                </div>
                <hr style={{ border: "none", borderTop: "1px solid #e8e4df", margin: "24px 40px" }} />
                {subject && (
                  <div style={{ padding: "0 40px", textAlign: "center", fontFamily: "Georgia, serif" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#2D2926", lineHeight: "1.4", marginBottom: 24 }}>{subject}</div>
                  </div>
                )}
                <div
                  style={{ padding: "0 40px 32px 40px", fontSize: 16, lineHeight: "1.7", color: "#3d3833", fontFamily: "Georgia, serif" }}
                  dangerouslySetInnerHTML={{ __html: htmlContent || '<p style="color:#b0a99f">İçerik burada görünecek...</p>' }}
                />
                <hr style={{ border: "none", borderTop: "1px solid #e8e4df", margin: "0 40px" }} />
                <div style={{ textAlign: "center", padding: "24px 40px 32px 40px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#2D2926" }}>Klemens Art</div>
                  <div style={{ fontSize: 11, color: "#8C857E", marginTop: 4 }}>Ankara, Türkiye</div>
                  <div style={{ fontSize: 12, marginTop: 16 }}>
                    <span style={{ color: "#FF6D60" }}>Instagram</span>&nbsp;&middot;&nbsp;
                    <span style={{ color: "#FF6D60" }}>YouTube</span>&nbsp;&middot;&nbsp;
                    <span style={{ color: "#FF6D60" }}>Web</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#b0a99f", marginTop: 16, lineHeight: "1.6" }}>
                    Bu e-postayı klemensart.com üzerinden abone olduğunuz için alıyorsunuz.
                    <br />
                    <span style={{ color: "#8C857E", textDecoration: "underline" }}>Abonelikten çıkmak için tıklayın</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TEMPLATE MODE ══════════════ */}
      {pageMode === "template" && (
        <>
          {!selectedTemplate ? (
            /* ── Template Cards Grid ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  onClick={() => selectTemplate(tmpl)}
                  className="text-left border border-gray-200 rounded-xl p-5 hover:border-[#FF6D60] hover:shadow-sm transition-all group"
                >
                  <div className="text-2xl mb-3">{tmpl.icon}</div>
                  <div className="font-semibold text-gray-900 group-hover:text-[#FF6D60] transition-colors">
                    {tmpl.label}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{tmpl.description}</div>
                </button>
              ))}
            </div>
          ) : (
            /* ── Selected Template: Form + Preview ── */
            <div>
              {/* Back button + template name */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => { setSelectedTemplate(null); setTemplatePreviewHtml(""); setMessage(""); }}
                  className="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                  </svg>
                  Şablonlara Dön
                </button>
                <div className="text-sm text-gray-300">|</div>
                <div className="text-sm font-medium text-gray-800">
                  {selectedTemplate.icon} {selectedTemplate.label}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── Left: Dynamic Form ── */}
                <div>
                  {/* Subject override */}
                  <input
                    type="text"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="E-posta konusu (isteğe bağlı)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 mb-4 focus:outline-none focus:border-[#FF6D60] text-sm"
                  />

                  <div className="space-y-4">
                    {selectedTemplate.fields.map((field) => {
                      if (field.type === "array") {
                        const af = field as ArrayFieldDef;
                        const items = (templateProps[af.key] as Record<string, string>[]) || [];
                        return (
                          <div key={af.key}>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              {af.label}
                            </label>
                            <div className="space-y-3">
                              {items.map((item, idx) => (
                                <div key={idx} className="border border-gray-100 rounded-lg p-3 bg-gray-50 relative">
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem(af.key, idx)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors text-xs"
                                    title="Kaldır"
                                  >
                                    ✕
                                  </button>
                                  <div className="space-y-2 pr-6">
                                    {af.itemFields.map((sf) => (
                                      <div key={sf.key}>
                                        <label className="block text-xs text-gray-400 mb-0.5">{sf.label}</label>
                                        <input
                                          type={sf.type === "url" ? "url" : "text"}
                                          value={item[sf.key] || ""}
                                          onChange={(e) => updateArrayItem(af.key, idx, sf.key, e.target.value)}
                                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF6D60]"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => addArrayItem(af.key, af.itemFields)}
                              className="mt-2 text-sm text-[#FF6D60] hover:text-[#e85e52] font-medium transition-colors"
                            >
                              + Ekle
                            </button>
                          </div>
                        );
                      }

                      // Simple fields
                      const sf = field as FieldDef;
                      return (
                        <div key={sf.key}>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            {sf.label}
                          </label>
                          {sf.type === "textarea" ? (
                            <textarea
                              value={(templateProps[sf.key] as string) || ""}
                              onChange={(e) => updateProp(sf.key, e.target.value)}
                              rows={3}
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF6D60] resize-y"
                            />
                          ) : (
                            <input
                              type={sf.type}
                              value={(templateProps[sf.key] as string) || ""}
                              onChange={(e) => updateProp(sf.key, e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF6D60]"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Right: Template Preview ── */}
                <div>
                  <div className="text-xs text-gray-400 mb-2 font-medium">ŞABLON ÖNİZLEME</div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-[#f7f5f2] max-h-[calc(100vh-200px)] overflow-y-auto">
                    {templatePreviewHtml ? (
                      <iframe
                        srcDoc={templatePreviewHtml}
                        title="Şablon Önizleme"
                        className="w-full border-0"
                        style={{ minHeight: 600 }}
                        sandbox="allow-same-origin"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                        Önizleme yükleniyor...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════ SEND SECTION ══════════════ */}
      {(pageMode === "freetext" || selectedTemplate) && (
        <div className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-serif text-[#2D2926] mb-6">Gönderim Ayarları</h2>

          <div className="max-w-2xl space-y-4">
            {/* ── Test Gönderimi ── */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Test Gönderimi</div>
              <div className="flex gap-2">
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
                  {sending ? "Gönderiyor..." : "Kendime Test Gönder"}
                </button>
              </div>
            </div>

            {/* ── Toplu Gönderim ── */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Toplu Gönderim</div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none mb-4">
                <input
                  type="checkbox"
                  checked={excludeInactive}
                  onChange={(e) => setExcludeInactive(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6D60] rounded"
                />
                <span className="text-sm text-gray-600">
                  Son 60 günde açmayanlara <span className="font-medium">gönderme</span>
                  {stats && stats.inactiveLast60Days > 0 && (
                    <span className="text-xs text-[#8C857E]"> ({stats.inactiveLast60Days} kişi hariç)</span>
                  )}
                </span>
              </label>

              <button
                onClick={handleSendAll}
                disabled={sending}
                className="w-full px-6 py-2.5 bg-[#FF6D60] text-white rounded-xl text-sm font-medium hover:bg-[#e85e52] transition-colors disabled:opacity-50"
              >
                Tüm Abonelere Gönder
              </button>
            </div>

            {/* ── Atölye Katılımcılarına Gönder ── */}
            {workshops.length > 0 && (
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Atölye Katılımcılarına Gönder</div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedWorkshopId}
                    onChange={(e) => setSelectedWorkshopId(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF6D60] bg-white"
                  >
                    <option value="">Atölye seçin...</option>
                    {workshops.map((w) => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleSendWorkshop}
                    disabled={sending || !selectedWorkshopId || loadingParticipants}
                    className="px-6 py-2.5 bg-[#2D2926] text-white rounded-xl text-sm font-medium hover:bg-[#3d3833] transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {loadingParticipants ? "Kontrol ediliyor..." : "Katılımcılara Gönder"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Yarım Kalan Kayıtlara Gönder (only for YarimKalanKayit template) ── */}
            {selectedTemplate?.name === "YarimKalanKayit" && workshops.length > 0 && (
              <div className="border border-amber-200 rounded-xl p-5 bg-amber-50/50">
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Yarım Kalan Kayıtlara Gönder</div>
                <p className="text-xs text-amber-600 mb-3">
                  Ödeme sayfasına girip satın almayı tamamlamayan kullanıcılara hatırlatma gönderir.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedWorkshopId}
                    onChange={(e) => setSelectedWorkshopId(e.target.value)}
                    className="flex-1 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="">Atölye seçin...</option>
                    {workshops.map((w) => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleSendAbandoned}
                    disabled={sending || !selectedWorkshopId || loadingAbandoned}
                    className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {loadingAbandoned ? "Kontrol ediliyor..." : "Hatırlatma Gönder"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Hedef Kitleye Gönder ── */}
            {segments.length > 0 && (
              <div className="border border-indigo-200 rounded-xl p-5 bg-indigo-50/30">
                <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-3">Hedef Kitleye Gönder</div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedSegmentId}
                    onChange={(e) => setSelectedSegmentId(e.target.value)}
                    className="flex-1 border border-indigo-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 bg-white"
                  >
                    <option value="">Hedef kitle seçin...</option>
                    {(() => {
                      const categories = [...new Set(segments.map((s) => s.category))];
                      return categories.map((cat) => (
                        <optgroup key={cat} label={cat}>
                          {segments.filter((s) => s.category === cat).map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label} ({s.count} kişi)
                            </option>
                          ))}
                        </optgroup>
                      ));
                    })()}
                  </select>
                  <button
                    onClick={handleSendSegment}
                    disabled={sending || !selectedSegmentId}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    Hedef Kitleye Gönder
                  </button>
                </div>
                {selectedSegmentId && (
                  <p className="mt-2 text-xs text-indigo-600">
                    {segments.find((s) => s.id === selectedSegmentId)?.description}
                  </p>
                )}
              </div>
            )}

            {/* ── Message ── */}
            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                message.includes("gönderildi")
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Campaign History ── */}
      {stats && stats.campaigns.length > 0 && (
        <div className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-xl font-serif text-[#2D2926] mb-4">Gönderim Geçmişi</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="py-3 pr-4 font-medium">Konu</th>
                  <th className="py-3 pr-4 font-medium text-center">Gönderildi</th>
                  <th className="py-3 pr-4 font-medium text-center">Açıldı</th>
                  <th className="py-3 pr-4 font-medium text-center">Tıklandı</th>
                  <th className="py-3 pr-4 font-medium text-center">Bounce</th>
                  <th className="py-3 font-medium text-center">Açılma Oranı</th>
                </tr>
              </thead>
              <tbody>
                {stats.campaigns.map((c, i) => {
                  const openRate = c.sent > 0 ? Math.round((c.opened / c.sent) * 100) : 0;
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 text-gray-800">
                        <div>{c.subject}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(c.lastSent).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-center text-gray-600">{c.sent}</td>
                      <td className="py-3 pr-4 text-center text-emerald-600 font-medium">{c.opened}</td>
                      <td className="py-3 pr-4 text-center text-blue-600">{c.clicked}</td>
                      <td className="py-3 pr-4 text-center text-red-400">{c.bounced}</td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          openRate >= 40
                            ? "bg-emerald-50 text-emerald-600"
                            : openRate >= 20
                              ? "bg-amber-50 text-amber-600"
                              : "bg-gray-100 text-gray-500"
                        }`}>
                          %{openRate}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
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

      {/* ── Workshop Confirmation Modal ── */}
      {showWorkshopConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
            <div className="px-8 pt-8 pb-0 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#2D2926]/10 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D2926" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-lg font-serif font-semibold text-[#2D2926] mb-2">
                Atölye Katılımcılarına Gönder
              </h3>
              <p className="text-[#8C857E] text-sm leading-relaxed mb-2">
                <span className="font-semibold text-[#2D2926]">
                  {workshops.find((w) => w.id === selectedWorkshopId)?.title}
                </span>
              </p>
              <p className="text-[#8C857E] text-sm leading-relaxed mb-6">
                Bu e-posta{" "}
                {workshopParticipantCount !== null ? (
                  <span className="font-semibold text-[#2D2926]">{workshopParticipantCount} kişiye</span>
                ) : (
                  "katılımcılara"
                )}{" "}
                gönderilecektir.
                <br />
                Bu işlem geri alınamaz. Onaylıyor musunuz?
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowWorkshopConfirm(false)}
                className="flex-1 py-3.5 text-sm font-medium text-[#8C857E] hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                İptal
              </button>
              <button
                onClick={() => sendNewsletter("workshop")}
                disabled={sending}
                className="flex-1 py-3.5 text-sm font-semibold text-[#2D2926] hover:bg-[#2D2926]/5 transition-colors disabled:opacity-50"
              >
                {sending ? "Gönderiliyor..." : "Evet, Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Abandoned Checkout Confirmation Modal ── */}
      {showAbandonedConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
            <div className="px-8 pt-8 pb-0 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-lg font-serif font-semibold text-[#2D2926] mb-2">
                Yarım Kalan Kayıtlara Gönder
              </h3>
              <p className="text-[#8C857E] text-sm leading-relaxed mb-2">
                <span className="font-semibold text-[#2D2926]">
                  {workshops.find((w) => w.id === selectedWorkshopId)?.title}
                </span>
              </p>
              <p className="text-[#8C857E] text-sm leading-relaxed mb-6">
                Ödeme sayfasına girip satın almayı tamamlamayan{" "}
                {abandonedCount !== null ? (
                  <span className="font-semibold text-[#2D2926]">{abandonedCount} kişiye</span>
                ) : (
                  "kullanıcılara"
                )}{" "}
                hatırlatma gönderilecektir.
                <br />
                Bu işlem geri alınamaz. Onaylıyor musunuz?
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowAbandonedConfirm(false)}
                className="flex-1 py-3.5 text-sm font-medium text-[#8C857E] hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                İptal
              </button>
              <button
                onClick={() => sendNewsletter("abandoned")}
                disabled={sending}
                className="flex-1 py-3.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                {sending ? "Gönderiliyor..." : "Evet, Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Segment Confirmation Modal ── */}
      {showSegmentConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
            <div className="px-8 pt-8 pb-0 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-lg font-serif font-semibold text-[#2D2926] mb-2">
                Hedef Kitleye Gönder
              </h3>
              <p className="text-[#8C857E] text-sm leading-relaxed mb-2">
                <span className="font-semibold text-[#2D2926]">
                  {segments.find((s) => s.id === selectedSegmentId)?.label}
                </span>
              </p>
              <p className="text-[#8C857E] text-xs leading-relaxed mb-2">
                {segments.find((s) => s.id === selectedSegmentId)?.description}
              </p>
              <p className="text-[#8C857E] text-sm leading-relaxed mb-6">
                Bu e-posta{" "}
                <span className="font-semibold text-[#2D2926]">
                  {segments.find((s) => s.id === selectedSegmentId)?.count} kişiye
                </span>{" "}
                gönderilecektir.
                <br />
                Bu işlem geri alınamaz. Onaylıyor musunuz?
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowSegmentConfirm(false)}
                className="flex-1 py-3.5 text-sm font-medium text-[#8C857E] hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                İptal
              </button>
              <button
                onClick={() => sendNewsletter("segment")}
                disabled={sending}
                className="flex-1 py-3.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                {sending ? "Gönderiliyor..." : "Evet, Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
