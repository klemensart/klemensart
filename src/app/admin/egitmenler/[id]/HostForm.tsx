"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

type PersonData = {
  id?: string;
  name: string;
  slug: string;
  avatar_url: string | null;
  short_bio: string | null;
  bio: string | null;
  expertise: string[];
  email: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  website: string | null;
  metadata?: { phone?: string | null };
};

type Props = {
  initialData?: PersonData;
  isModal?: boolean;
  onSuccess?: (person: PersonData) => void;
};

function slugify(text: string): string {
  const TR_MAP: Record<string, string> = {
    ğ: "g", Ğ: "G", ü: "u", Ü: "U", ş: "s", Ş: "S",
    ı: "i", İ: "I", ö: "o", Ö: "O", ç: "c", Ç: "C",
  };
  let s = text;
  for (const [from, to] of Object.entries(TR_MAP)) {
    s = s.replaceAll(from, to);
  }
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export default function HostForm({ initialData, isModal, onSuccess }: Props) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!initialData?.slug);
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url ?? "");
  const [shortBio, setShortBio] = useState(initialData?.short_bio ?? "");
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [expertise, setExpertise] = useState<string[]>(initialData?.expertise ?? []);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.metadata?.phone ?? "");
  const [instagram, setInstagram] = useState(initialData?.instagram ?? "");
  const [twitter, setTwitter] = useState(initialData?.twitter ?? "");
  const [linkedin, setLinkedin] = useState(initialData?.linkedin ?? "");
  const [website, setWebsite] = useState(initialData?.website ?? "");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManual) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugManual(true);
    setSlug(slugify(val));
  };

  // Avatar upload
  const handleAvatarUpload = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, avatar: "Dosya çok büyük, en fazla 5MB olmalı." }));
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((e) => ({ ...e, avatar: "Sadece JPG, PNG, WebP kabul edilir." }));
      return;
    }

    setUploading(true);
    setErrors((e) => { const { avatar, ...rest } = e; return rest; });

    const fd = new FormData();
    fd.append("file", file);
    if (initialData?.id) fd.append("personId", initialData.id);

    try {
      const res = await fetch("/api/admin/upload/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvatarUrl(data.url);
    } catch (err: any) {
      setErrors((e) => ({ ...e, avatar: err.message || "Yükleme hatası" }));
    } finally {
      setUploading(false);
    }
  }, [initialData?.id]);

  // Expertise tag handling
  const addTag = () => {
    const tag = expertiseInput.trim();
    if (tag && !expertise.includes(tag)) {
      setExpertise([...expertise, tag]);
    }
    setExpertiseInput("");
  };

  const removeTag = (tag: string) => {
    setExpertise(expertise.filter((t) => t !== tag));
  };

  // Validate
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = "Ad Soyad zorunludur (en az 2 karakter)";
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Geçerli bir e-posta girin";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const payload: any = {
      name: name.trim(),
      slug,
      avatar_url: avatarUrl || null,
      short_bio: shortBio || null,
      bio: bio || null,
      expertise,
      email: email || null,
      instagram: instagram || null,
      twitter: twitter || null,
      linkedin: linkedin || null,
      website: website || null,
      phone: phone || null,
    };

    try {
      const url = isEdit
        ? `/api/admin/people/${initialData!.id}`
        : "/api/admin/people";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes("slug")) {
          setErrors({ slug: data.error });
        } else {
          setErrors({ form: data.error });
        }
        return;
      }

      if (onSuccess) {
        onSuccess(data.person);
      } else {
        router.push("/admin/egitmenler");
        router.refresh();
      }
    } catch (err: any) {
      setErrors({ form: err.message || "Bir hata oluştu" });
    } finally {
      setSaving(false);
    }
  };

  // Drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleAvatarUpload(file);
  };

  return (
    <form onSubmit={handleSubmit} className={isModal ? "space-y-4" : "space-y-6"}>
      {errors.form && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {errors.form}
        </div>
      )}

      <div className={isModal ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-2 gap-8"}>
        {/* Sol kolon */}
        <div className="space-y-5">
          {/* Avatar */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-2">Fotoğraf</label>
            <div
              className="relative w-24 h-24 rounded-xl border-2 border-dashed border-warm-200 hover:border-coral/40 transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-warm-50"
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
              ) : avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-900/20">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
              />
            </div>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl("")}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Kaldır
              </button>
            )}
            {errors.avatar && <p className="text-xs text-red-500 mt-1">{errors.avatar}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-1.5">
              Ad Soyad <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors ${errors.name ? "border-red-300" : "border-warm-200"}`}
              placeholder="Theo Atay"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-1.5">Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-warm-900/30">/egitmenler/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`flex-1 px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors ${errors.slug ? "border-red-300" : "border-warm-200"}`}
                placeholder="theo-atay"
              />
            </div>
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
          </div>

          {/* Short bio */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-1.5">Kısa Açıklama</label>
            <input
              type="text"
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors"
              placeholder="Sokak fotoğrafçısı ve eğitmen"
              maxLength={200}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-1.5">Biyografi</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={isModal ? 3 : 5}
              className="w-full px-3 py-2.5 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors resize-none"
              placeholder="Detaylı açıklama..."
            />
          </div>
        </div>

        {/* Sağ kolon */}
        <div className="space-y-5">
          {/* Expertise */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-1.5">Uzmanlık Alanları</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {expertise.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs bg-coral/10 text-coral px-2.5 py-1 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addTag(); }
                  if (e.key === "," && expertiseInput.trim()) { e.preventDefault(); addTag(); }
                }}
                className="flex-1 px-3 py-2.5 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors"
                placeholder="Enter ile etiket ekle"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2.5 text-sm bg-warm-100 text-warm-900/60 rounded-xl hover:bg-warm-200 transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-1.5">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors ${errors.email ? "border-red-300" : "border-warm-200"}`}
              placeholder="ornek@email.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-1.5">Telefon</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors"
              placeholder="(5XX) XXX XX XX"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-1.5">Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors"
              placeholder="https://ornek.com"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-1.5">Instagram</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-warm-900/30">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
                className="flex-1 px-3 py-2.5 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors"
                placeholder="kullaniciadi"
              />
            </div>
          </div>

          {/* Twitter */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-1.5">Twitter / X</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-warm-900/30">@</span>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value.replace(/^@/, ""))}
                className="flex-1 px-3 py-2.5 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors"
                placeholder="kullaniciadi"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-xs font-medium text-warm-900/60 mb-1.5">LinkedIn</label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors"
              placeholder="linkedin.com/in/kullaniciadi veya kullaniciadi"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className={isModal ? "pt-2" : "sticky bottom-0 bg-white border-t border-warm-100 -mx-8 px-8 py-4 mt-8"}>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3 bg-coral text-white text-sm font-semibold rounded-xl hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Eğitmen Oluştur"}
        </button>
      </div>
    </form>
  );
}
