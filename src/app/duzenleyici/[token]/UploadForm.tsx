"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Application = {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  workshop_topic: string;
  workshop_description: string;
  contact_channel: string;
  contact_channel_detail: string;
  whatsapp_number: string | null;
  proposed_dates: string | null;
};

type Props = {
  application: Application;
  token: string;
};

type FileWithPreview = {
  file: File;
  preview: string;
  error: string | null;
};

// ─── Constants ──────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const ACCEPTED_EXT = ".jpg,.jpeg,.png,.webp";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Görsel okunamadı"));
    };
    img.src = url;
  });
}

/** Canvas ile görseli sıkıştır — max 1920px, JPEG %85 kalite */
function compressImage(file: File, maxDim = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    // Zaten küçükse dokunma
    if (file.size <= 500 * 1024) {
      resolve(file);
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);

      let { naturalWidth: w, naturalHeight: h } = img;

      // Boyut küçültme
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Görsel sıkıştırılamadı"));
    };
    img.src = url;
  });
}

async function validateImageFile(
  file: File,
  minW: number,
  minH: number,
): Promise<string | null> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Sadece JPG, PNG ve WebP kabul edilir";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Dosya boyutu en fazla 5 MB olabilir";
  }
  try {
    const dims = await getImageDimensions(file);
    if (dims.width < minW || dims.height < minH) {
      return `En az ${minW}x${minH} piksel olmalı (mevcut: ${dims.width}x${dims.height})`;
    }
  } catch {
    return "Görsel boyutu okunamadı";
  }
  return null;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function UploadForm({ application, token }: Props) {
  const app = application;

  // ── State ─────────────────────────────────────────────────────────────

  const [cover, setCover] = useState<FileWithPreview | null>(null);
  const [profile, setProfile] = useState<FileWithPreview | null>(null);
  const [venue, setVenue] = useState<FileWithPreview | null>(null);
  const [gallery, setGallery] = useState<FileWithPreview[]>([]);

  const [bio, setBio] = useState("");
  const [detailedBio, setDetailedBio] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [proposedDatesFinal, setProposedDatesFinal] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const coverRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLInputElement>(null);
  const venueRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // ── Dirty tracking / beforeunload ─────────────────────────────────────

  const isDirty = !!(cover || profile || bio || city || maxParticipants || proposedDatesFinal);

  useEffect(() => {
    if (!isDirty || submitted) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, submitted]);

  // ── File handlers ─────────────────────────────────────────────────────

  const handleSingleFile = useCallback(
    async (
      file: File,
      minW: number,
      minH: number,
      setter: (f: FileWithPreview | null) => void,
      fieldKey: string,
    ) => {
      const err = await validateImageFile(file, minW, minH);
      const preview = URL.createObjectURL(file);
      setter({ file, preview, error: err });
      setErrors((prev) => {
        const next = { ...prev };
        if (err) next[fieldKey] = err;
        else delete next[fieldKey];
        return next;
      });
    },
    [],
  );

  const handleCoverChange = useCallback(
    (files: FileList | null) => {
      if (!files?.[0]) return;
      handleSingleFile(files[0], 1200, 800, setCover, "cover");
    },
    [handleSingleFile],
  );

  const handleProfileChange = useCallback(
    (files: FileList | null) => {
      if (!files?.[0]) return;
      handleSingleFile(files[0], 600, 600, setProfile, "profile");
    },
    [handleSingleFile],
  );

  const handleVenueChange = useCallback(
    (files: FileList | null) => {
      if (!files?.[0]) return;
      handleSingleFile(files[0], 0, 0, setVenue, "venue");
    },
    [handleSingleFile],
  );

  const handleGalleryChange = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const newFiles: FileWithPreview[] = [];
      const total = gallery.length + files.length;
      if (total > 5) {
        setErrors((prev) => ({ ...prev, gallery: "En fazla 5 görsel yüklenebilir" }));
        return;
      }
      for (const file of Array.from(files)) {
        const err = await validateImageFile(file, 0, 0);
        newFiles.push({ file, preview: URL.createObjectURL(file), error: err });
      }
      setGallery((prev) => [...prev, ...newFiles]);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.gallery;
        return next;
      });
    },
    [gallery.length],
  );

  const removeGalleryItem = (idx: number) => {
    setGallery((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].preview);
      copy.splice(idx, 1);
      return copy;
    });
  };

  // ── Validation ────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!cover) errs.cover = "Kapak görseli zorunludur";
    else if (cover.error) errs.cover = cover.error;

    if (!profile) errs.profile = "Profil fotoğrafı zorunludur";
    else if (profile.error) errs.profile = profile.error;

    if (!bio.trim()) errs.bio = "Biyografi zorunludur";
    else if (bio.trim().length < 100) errs.bio = "En az 100 karakter gerekli";
    else if (bio.trim().length > 1000) errs.bio = "En fazla 1000 karakter";

    if (!city.trim()) errs.city = "Şehir zorunludur";

    if (!maxParticipants || parseInt(maxParticipants) < 1) {
      errs.max_participants = "Geçerli bir kontenjan sayısı girin";
    }

    if (!proposedDatesFinal.trim()) {
      errs.proposed_dates_final = "Tarih bilgisi zorunludur";
    }

    // Gallery item errors
    for (const g of gallery) {
      if (g.error) {
        errs.gallery = "Bazı galeri görselleri uygun değil";
        break;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const allRequiredFilled =
    !!cover && !cover.error &&
    !!profile && !profile.error &&
    bio.trim().length >= 100 &&
    !!city.trim() &&
    !!maxParticipants && parseInt(maxParticipants) >= 1 &&
    !!proposedDatesFinal.trim();

  // ── Submit ────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      setProgress("Görseller optimize ediliyor...");

      // Görselleri sıkıştır (Vercel 4.5MB body limit)
      const [compCover, compProfile] = await Promise.all([
        compressImage(cover!.file),
        compressImage(profile!.file),
      ]);

      const compVenue = venue ? await compressImage(venue.file) : null;

      const compGallery: File[] = [];
      for (const g of gallery) {
        if (!g.error) {
          compGallery.push(await compressImage(g.file));
        }
      }

      setProgress("Form hazırlanıyor...");

      const fd = new FormData();
      fd.append("cover", compCover);
      fd.append("profile", compProfile);
      fd.append("bio", bio.trim());
      fd.append("city", city.trim());
      fd.append("max_participants", maxParticipants);
      fd.append("proposed_dates_final", proposedDatesFinal.trim());

      if (detailedBio.trim()) fd.append("detailed_bio", detailedBio.trim());
      if (district.trim()) fd.append("district", district.trim());
      if (venueName.trim()) fd.append("venue_name", venueName.trim());
      if (venueAddress.trim()) fd.append("venue_address", venueAddress.trim());
      if (compVenue) fd.append("venue", compVenue);
      for (const g of compGallery) {
        fd.append("gallery", g);
      }

      setProgress("Materyaller yükleniyor...");

      const res = await fetch(`/api/duzenleyici/${token}/upload`, {
        method: "POST",
        body: fd,
      });

      // Non-JSON yanıt koruması (Vercel 413 hatası vb.)
      let data: { error?: string; success?: boolean };
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          res.status === 413
            ? "Dosya boyutu çok büyük. Lütfen daha küçük görseller deneyin."
            : `Sunucu hatası (${res.status}): ${text.slice(0, 100)}`,
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Yükleme başarısız");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSubmitting(false);
      setProgress("");
    }
  };

  // ── Success screen ────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="bg-white rounded-2xl border border-warm-200 p-8 sm:p-12">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-warm-900 mb-4">
            Teşekkürler, {app.applicant_name}!
          </h1>
          <p className="text-warm-900/60 leading-relaxed mb-4">
            Materyalleriniz başarıyla alındı. Atölye sayfanız 1-2 iş günü içinde yayına alınacak ve size e-posta ile haber vereceğiz.
          </p>
          <p className="text-warm-900/40 text-sm">
            Sorularınız için{" "}
            <a href="mailto:info@klemensart.com" className="text-coral hover:underline">
              info@klemensart.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── Shared classes ────────────────────────────────────────────────────

  const inputCn =
    "w-full px-3.5 py-2.5 text-sm border border-warm-200 rounded-xl bg-white text-warm-900 placeholder:text-warm-900/30 focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors";
  const labelCn = "block text-sm font-medium text-warm-900/70 mb-1.5";
  const helperCn = "text-xs text-warm-900/40 mt-1";
  const errorCn = "text-xs text-red-500 mt-1";

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hoşgeldin bloğu */}
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-warm-900 mb-2">
          Hoş geldiniz, {app.applicant_name}
        </h1>
        <p className="text-lg text-warm-900/60 mb-2">
          <strong className="text-warm-900/80">&ldquo;{app.workshop_topic}&rdquo;</strong> atölyesi için materyalleri tamamlayın
        </p>
        <p className="text-sm text-warm-900/40 max-w-lg mx-auto">
          Aşağıdaki bilgi ve görselleri yükledikten sonra atölye sayfanız 1-2 iş günü içinde yayına alınacak.
        </p>
      </div>

      <div className="space-y-6">
        {/* ── ZORUNLU MATERYALLER ─────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-warm-200 p-5 sm:p-7 space-y-6">
          <h2 className="text-xs font-semibold text-coral uppercase tracking-wider">
            Zorunlu Materyaller
          </h2>

          {/* Kapak görseli */}
          <div>
            <label className={labelCn}>
              Atölye Kapak Görseli <span className="text-red-400">*</span>
            </label>
            <DropZone
              file={cover}
              onFiles={handleCoverChange}
              onClear={() => { setCover(null); setErrors((p) => { const n = { ...p }; delete n.cover; return n; }); }}
              inputRef={coverRef}
              accept={ACCEPTED_EXT}
              aspect="aspect-[16/9]"
              disabled={submitting}
            />
            <p className={helperCn}>Yatay, en az 1200x800 px, JPG/PNG/WebP, maks. 5 MB</p>
            {errors.cover && <p className={errorCn}>{errors.cover}</p>}
          </div>

          {/* Profil fotoğrafı */}
          <div>
            <label className={labelCn}>
              Profil Fotoğrafı <span className="text-red-400">*</span>
            </label>
            <div className="max-w-[200px]">
              <DropZone
                file={profile}
                onFiles={handleProfileChange}
                onClear={() => { setProfile(null); setErrors((p) => { const n = { ...p }; delete n.profile; return n; }); }}
                inputRef={profileRef}
                accept={ACCEPTED_EXT}
                aspect="aspect-square"
                disabled={submitting}
              />
            </div>
            <p className={helperCn}>Kare format, en az 600x600 px</p>
            {errors.profile && <p className={errorCn}>{errors.profile}</p>}
          </div>

          {/* Biyografi */}
          <div>
            <label className={labelCn}>
              Kısa Biyografi <span className="text-red-400">*</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`${inputCn} min-h-[120px] resize-y ${errors.bio ? "border-red-300" : ""}`}
              placeholder="2-4 cümle ile kendinizi tanıtın. Eğitim, deneyim ve neden bu atölyeleri düzenlediğinize dair kısa bir not."
              maxLength={1000}
              disabled={submitting}
            />
            <div className="flex justify-between mt-1">
              {errors.bio ? (
                <p className={errorCn}>{errors.bio}</p>
              ) : bio.length > 0 && bio.length < 100 ? (
                <p className="text-xs text-amber-600">En az 100 karakter gerekli ({100 - bio.length} karakter kaldı)</p>
              ) : (
                <span />
              )}
              <span className={`text-xs ${bio.length < 100 ? "text-warm-900/30" : bio.length > 950 ? "text-red-400" : "text-warm-900/30"}`}>
                {bio.length}/1000
              </span>
            </div>
          </div>

          {/* Şehir + İlçe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCn}>
                Şehir <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`${inputCn} ${errors.city ? "border-red-300" : ""}`}
                placeholder="Ankara, İstanbul, İzmir vb."
                disabled={submitting}
              />
              {errors.city && <p className={errorCn}>{errors.city}</p>}
            </div>
            <div>
              <label className={labelCn}>İlçe</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={inputCn}
                placeholder="Çankaya, Beşiktaş vb."
                disabled={submitting}
              />
            </div>
          </div>

          {/* Mekan Adı */}
          <div>
            <label className={labelCn}>Mekan Adı</label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className={inputCn}
              placeholder="Örn: İkbal Özpınar Atölyesi"
              disabled={submitting}
            />
          </div>

          {/* Mekan Adresi */}
          <div>
            <label className={labelCn}>Mekan Adresi</label>
            <textarea
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              className={`${inputCn} min-h-[60px] resize-y`}
              placeholder="Örn: Cinnah Caddesi No:35/9, Çankaya"
              disabled={submitting}
            />
          </div>

          {/* Kontenjan */}
          <div className="max-w-[200px]">
            <label className={labelCn}>
              Atölye Kontenjanı <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              className={`${inputCn} ${errors.max_participants ? "border-red-300" : ""}`}
              placeholder="Kaç kişi?"
              min={1}
              max={100}
              disabled={submitting}
            />
            {errors.max_participants && <p className={errorCn}>{errors.max_participants}</p>}
          </div>

          {/* Tarih */}
          <div>
            <label className={labelCn}>
              Atölye Tarih(leri) <span className="text-red-400">*</span>
            </label>
            {app.proposed_dates && (
              <p className="text-xs text-warm-900/40 mb-2 bg-warm-50 px-3 py-2 rounded-lg">
                Başvurunuzdaki öneri: <em>{app.proposed_dates}</em>
              </p>
            )}
            <textarea
              value={proposedDatesFinal}
              onChange={(e) => setProposedDatesFinal(e.target.value)}
              className={`${inputCn} min-h-[80px] resize-y ${errors.proposed_dates_final ? "border-red-300" : ""}`}
              placeholder="Örn: 10 Mayıs Cumartesi 14:00 - 17:00"
              disabled={submitting}
            />
            {errors.proposed_dates_final && <p className={errorCn}>{errors.proposed_dates_final}</p>}
          </div>
        </section>

        {/* ── OPSİYONEL MATERYALLER ──────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-warm-200 p-5 sm:p-7 space-y-6">
          <h2 className="text-xs font-semibold text-warm-900/40 uppercase tracking-wider">
            Opsiyonel Materyaller
          </h2>

          {/* Süreç fotoğrafları */}
          <div>
            <label className={labelCn}>Süreç Fotoğrafları</label>
            <p className={helperCn + " mb-2"}>
              Atölye sırasından 2-5 kare — çalışma anları, malzemeler, bitmiş ürünler. (Maks. 5)
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {gallery.map((g, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-warm-200 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.preview} alt="" className="w-full h-full object-cover" />
                  {g.error && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <span className="text-[10px] text-white bg-red-500 px-1.5 py-0.5 rounded">Hata</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(i)}
                    disabled={submitting}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {gallery.length < 5 && (
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  disabled={submitting}
                  className="aspect-square rounded-lg border-2 border-dashed border-warm-200 hover:border-coral/40 flex items-center justify-center text-warm-900/20 hover:text-coral/40 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              )}
            </div>
            <input
              ref={galleryRef}
              type="file"
              accept={ACCEPTED_EXT}
              multiple
              className="hidden"
              onChange={(e) => handleGalleryChange(e.target.files)}
            />
            {errors.gallery && <p className={errorCn}>{errors.gallery}</p>}
          </div>

          {/* Mekan fotoğrafı */}
          <div>
            <label className={labelCn}>Mekan Fotoğrafı</label>
            <div className="max-w-xs">
              <DropZone
                file={venue}
                onFiles={handleVenueChange}
                onClear={() => { setVenue(null); setErrors((p) => { const n = { ...p }; delete n.venue; return n; }); }}
                inputRef={venueRef}
                accept={ACCEPTED_EXT}
                aspect="aspect-[4/3]"
                disabled={submitting}
              />
            </div>
            <p className={helperCn}>Stüdyo veya mekanın atmosferini gösteren bir görsel</p>
            {errors.venue && <p className={errorCn}>{errors.venue}</p>}
          </div>

          {/* Detaylı bio */}
          <div>
            <label className={labelCn}>Detaylı Biyografi</label>
            <textarea
              value={detailedBio}
              onChange={(e) => setDetailedBio(e.target.value)}
              className={`${inputCn} min-h-[100px] resize-y`}
              placeholder="Eğitim, sertifikalar, sergiler, daha önce düzenlenen atölyeler. 'Düzenleyen Hakkında' bölümünde gösterilir."
              maxLength={3000}
              disabled={submitting}
            />
            <p className={`${helperCn} text-right`}>{detailedBio.length}/3000</p>
          </div>
        </section>

        {/* ── SUBMIT ─────────────────────────────────────────────────── */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {submitError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !allRequiredFilled}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold transition-all ${
              submitting
                ? "bg-coral/60 text-white cursor-wait"
                : allRequiredFilled
                  ? "bg-coral text-white hover:bg-coral/90 active:scale-[0.98]"
                  : "bg-warm-200 text-warm-900/30 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {progress || "Yükleniyor..."}
              </span>
            ) : (
              "Materyalleri Gönder"
            )}
          </button>
          {!allRequiredFilled && !submitting && (
            <p className="text-xs text-warm-900/30">
              Tüm zorunlu alanları (*) doldurun
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DropZone sub-component ─────────────────────────────────────────────────

function DropZone({
  file,
  onFiles,
  onClear,
  inputRef,
  accept,
  aspect,
  disabled,
}: {
  file: FileWithPreview | null;
  onFiles: (files: FileList | null) => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  aspect: string;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled && e.dataTransfer.files.length > 0) {
      onFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      className={`relative ${aspect} rounded-xl border-2 border-dashed overflow-hidden cursor-pointer transition-colors ${
        dragging
          ? "border-coral bg-coral/5"
          : file?.error
            ? "border-red-300 bg-red-50/30"
            : file
              ? "border-warm-200"
              : "border-warm-200 hover:border-coral/40"
      }`}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {file ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={file.preview}
            alt="Önizleme"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              disabled={disabled}
              className="opacity-0 hover:opacity-100 px-3 py-1.5 bg-white/90 text-warm-900 text-xs font-medium rounded-lg shadow-sm transition-opacity"
            >
              Değiştir
            </button>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-warm-900/20 gap-1.5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className="text-xs">Sürükle veya tıkla</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
        disabled={disabled}
      />
    </div>
  );
}
