"use client";

import { useState } from "react";

export default function SinemaKlubuAdmin() {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("20:30 (TSI)");
  const [zoomLink, setZoomLink] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSend(isTest: boolean) {
    if (!eventTitle || !eventDate || !zoomLink) {
      setResult({ ok: false, message: "Tum alanlar doldurulmali." });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: isTest ? "test" : "cinema-club",
          testEmail: isTest ? "hunkerem@gmail.com" : undefined,
          template: "SeminerHatirlatici",
          templateProps: {
            eventTitle,
            eventDate,
            eventTime,
            zoomLink,
          },
          subject: `Hatirlatma: ${eventTitle} — Klemens Sinema Klubu`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ ok: false, message: data.error || "Bir hata olustu." });
      } else {
        setResult({
          ok: true,
          message: isTest
            ? "Test maili gonderildi."
            : `${data.sent} kisi(ye) basariyla gonderildi.`,
        });
      }
    } catch {
      setResult({ ok: false, message: "Ag hatasi." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#2D2926" }}>
        Sinema Klubu — Zoom Linki Gonder
      </h1>
      <p style={{ fontSize: 14, color: "#888", marginBottom: 32 }}>
        Aktif sinema klubu uyelerine Zoom hatirlatma maili gonderir.
      </p>

      <label style={labelStyle}>Etkinlik Basligi</label>
      <input
        type="text"
        value={eventTitle}
        onChange={(e) => setEventTitle(e.target.value)}
        placeholder="Ornek: Stalker (1979) — Tarkovski"
        style={inputStyle}
      />

      <label style={labelStyle}>Tarih</label>
      <input
        type="text"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        placeholder="Ornek: 25 Nisan 2026, Cuma"
        style={inputStyle}
      />

      <label style={labelStyle}>Saat</label>
      <input
        type="text"
        value={eventTime}
        onChange={(e) => setEventTime(e.target.value)}
        placeholder="20:30 (TSI)"
        style={inputStyle}
      />

      <label style={labelStyle}>Zoom Linki</label>
      <input
        type="url"
        value={zoomLink}
        onChange={(e) => setZoomLink(e.target.value)}
        placeholder="https://zoom.us/j/..."
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button
          onClick={() => handleSend(true)}
          disabled={sending}
          style={{
            ...btnBase,
            background: "#fff",
            color: "#2D2926",
            border: "1px solid #ddd",
          }}
        >
          {sending ? "Gonderiliyor..." : "Test Gonder"}
        </button>
        <button
          onClick={() => handleSend(false)}
          disabled={sending}
          style={{
            ...btnBase,
            background: "#FF6D60",
            color: "#fff",
            border: "1px solid #FF6D60",
          }}
        >
          {sending ? "Gonderiliyor..." : "Tum Uyelere Gonder"}
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: "14px 18px",
            borderRadius: 8,
            fontSize: 14,
            background: result.ok ? "#E8F5E9" : "#FFEBEE",
            color: result.ok ? "#2E7D32" : "#C62828",
          }}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#555",
  marginBottom: 6,
  marginTop: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: 15,
  border: "1px solid #ddd",
  borderRadius: 8,
  outline: "none",
  boxSizing: "border-box",
};

const btnBase: React.CSSProperties = {
  padding: "12px 24px",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 8,
  cursor: "pointer",
  flex: 1,
};
