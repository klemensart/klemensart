"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

const CORAL_DARK = "#C74B3A";

type SubscriberData = {
  email: string;
  weekly_subscribed: boolean;
  thematic_subscribed: boolean;
};

export default function TercihForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [subscriber, setSubscriber] = useState<SubscriberData | null>(null);
  const [weekly, setWeekly] = useState(false);
  const [thematic, setThematic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribed, setUnsubscribed] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`/api/subscribe/preferences?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSubscriber(data);
          setWeekly(data.weekly_subscribed);
          setThematic(data.thematic_subscribed);
        }
      })
      .catch(() => setError("Bağlantı hatası."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/subscribe/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, weekly, thematic }),
      });
      const data = await res.json();
      if (res.ok) {
        if (!weekly && !thematic) {
          setUnsubscribed(true);
        } else {
          setSaved(true);
        }
      } else {
        setError(data.error || "Bir sorun oluştu.");
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  }

  // No token
  if (!token) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1
            className="text-2xl font-black text-warm-900 mb-4"
            style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
          >
            Geçersiz Link
          </h1>
          <p className="text-warm-900/60 text-sm mb-6">
            Bu sayfa sadece e-postadaki tercih linkiyle erişilebilir.
          </p>
          <Link href="/bulten" className="text-sm font-semibold text-coral hover:underline">
            Bültene abone ol
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error loading subscriber
  if (error && !subscriber) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1
            className="text-2xl font-black text-warm-900 mb-4"
            style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
          >
            Link Bulunamadı
          </h1>
          <p className="text-warm-900/60 text-sm mb-6">{error}</p>
          <Link href="/bulten" className="text-sm font-semibold text-coral hover:underline">
            Bültene abone ol
          </Link>
        </div>
      </div>
    );
  }

  // Unsubscribed state
  if (unsubscribed) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-warm-200/50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8C857E" strokeWidth="2" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1
            className="text-2xl font-black text-warm-900 mb-3"
            style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
          >
            Aboneliğin iptal edildi
          </h1>
          <p className="text-warm-900/60 text-sm mb-6">
            Artık Klemens bültenlerini almayacaksın. Dilediğin zaman tekrar abone olabilirsin.
          </p>
          <Link href="/" className="text-sm font-semibold text-coral hover:underline">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-8 md:p-10" style={{ backgroundColor: "#FCE8E0" }}>
          <h1
            className="text-3xl font-black text-warm-900 mb-2"
            style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
          >
            Bülten Tercihlerin
          </h1>
          <p className="text-warm-900/55 text-sm mb-8">
            <span className="font-medium text-warm-900/70">{subscriber?.email}</span> için bülten tercihlerini düzenle.
          </p>

          <div className="space-y-4 mb-8">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={weekly}
                onChange={(e) => { setWeekly(e.target.checked); setSaved(false); }}
                className="mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 border-warm-300 text-coral focus:ring-coral/30 accent-coral"
              />
              <span className="text-sm">
                <span className="font-semibold text-warm-900">Haftalık Bülten</span>
                <span className="text-warm-900/50"> — Pazar sabahları, gündemin en iyi kültür-sanat okumaları</span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={thematic}
                onChange={(e) => { setThematic(e.target.checked); setSaved(false); }}
                className="mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 border-warm-300 text-coral focus:ring-coral/30 accent-coral"
              />
              <span className="text-sm">
                <span className="font-semibold text-warm-900">Tematik Bülten</span>
                <span className="text-warm-900/50"> — İki ayda bir, tek bir tema etrafında yaratıcı incelemeler</span>
              </span>
            </label>
          </div>

          {!weekly && !thematic && (
            <p className="text-sm text-warm-900/50 mb-4">
              Her iki kutucuğu kaldırırsan aboneliğin tamamen iptal edilir.
            </p>
          )}

          {error && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
              {error}
            </div>
          )}

          {saved && (
            <div className="mb-5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3">
              Tercihlerin güncellendi!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: !weekly && !thematic ? "#6B7280" : CORAL_DARK }}
          >
            {saving
              ? "Kaydediliyor..."
              : !weekly && !thematic
              ? "Aboneliği İptal Et"
              : "Tercihleri Kaydet"}
          </button>
        </div>

        <p className="text-center text-xs text-warm-900/35 mt-6">
          <Link href="/" className="hover:text-warm-900/60 underline underline-offset-2">
            klemensart.com
          </Link>
        </p>
      </div>
    </div>
  );
}
