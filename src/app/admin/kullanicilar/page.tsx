"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: string | null;
  purchase_count: number;
};

type Purchase = {
  id: string;
  workshop_id: string | null;
  single_video_id: string | null;
  purchased_at: string;
  expires_at: string | null;
  title: string;
  type: "workshop" | "video";
};

type UserDetail = {
  user: Omit<User, "role" | "purchase_count">;
  purchases: Purchase[];
  role: string | null;
};

type Workshop = { id: string; title: string };
type Video = { id: string; title: string };

/* ──────────────────────────── helpers ──────────────────────────── */

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return <span className="text-warm-900/30 text-xs">Kullanıcı</span>;
  const colors: Record<string, string> = {
    admin: "bg-coral/10 text-coral",
    editor: "bg-blue-50 text-blue-600",
  };
  const cls = colors[role] ?? "bg-warm-100 text-warm-600";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

/* ─────────────────────────── component ─────────────────────────── */

export default function AdminKullanicilarPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Detail modal
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Assignment form
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [assignType, setAssignType] = useState<"workshop" | "video">("workshop");
  const [assignId, setAssignId] = useState("");
  const [assignExpires, setAssignExpires] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  // Role form
  const [showRole, setShowRole] = useState(false);
  const [roleValue, setRoleValue] = useState("");
  const [settingRole, setSettingRole] = useState(false);

  const [actionMsg, setActionMsg] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ── fetch users ── */
  const fetchUsers = useCallback(
    async (s: string, p: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (s) params.set("search", s);
        const res = await fetch(`/api/admin/users?${params}`);
        const data = await res.json();
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers(search, page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(val, 1);
    }, 300);
  };

  /* ── fetch detail ── */
  const openDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setDetailLoading(true);
    setDetail(null);
    setShowAssign(false);
    setShowRole(false);
    setActionMsg("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      setDetail(data);
      setRoleValue(data.role ?? "");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedUserId(null);
    setDetail(null);
  };

  /* ── fetch workshops & videos for assignment ── */
  const openAssignForm = async () => {
    setShowAssign(true);
    setShowRole(false);
    if (workshops.length === 0) {
      const admin = await import("@/lib/supabase").then((m) => m.createClient());
      const [wRes, vRes] = await Promise.all([
        admin.from("workshops").select("id, title").order("title"),
        admin.from("single_videos").select("id, title").order("title"),
      ]);
      setWorkshops(wRes.data ?? []);
      setVideos(vRes.data ?? []);
    }
  };

  /* ── assign ── */
  const handleAssign = async () => {
    if (!assignId || !selectedUserId) return;
    setAssigning(true);
    setActionMsg("");
    try {
      const body: Record<string, string> = {
        action: assignType === "workshop" ? "assign_workshop" : "assign_video",
        user_id: selectedUserId,
        ...(assignType === "workshop"
          ? { workshop_id: assignId }
          : { single_video_id: assignId }),
      };
      if (assignExpires) body.expires_at = assignExpires;
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setActionMsg("Atama yapıldı!");
        setAssignId("");
        setAssignExpires("");
        setShowAssign(false);
        // Refresh detail
        openDetail(selectedUserId);
        fetchUsers(search, page);
      } else {
        const err = await res.json();
        setActionMsg(`Hata: ${err.error}`);
      }
    } finally {
      setAssigning(false);
    }
  };

  /* ── role ── */
  const handleRole = async () => {
    if (!selectedUserId) return;
    setSettingRole(true);
    setActionMsg("");
    try {
      const action = roleValue ? "set_role" : "remove_role";
      const body: Record<string, string> = { action, user_id: selectedUserId };
      if (roleValue) body.role = roleValue;
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setActionMsg("Rol güncellendi!");
        setShowRole(false);
        openDetail(selectedUserId);
        fetchUsers(search, page);
      } else {
        const err = await res.json();
        setActionMsg(`Hata: ${err.error}`);
      }
    } finally {
      setSettingRole(false);
    }
  };

  /* ── pagination ── */
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
          <h1 className="text-2xl font-bold text-warm-900">Kullanıcılar</h1>
        </div>
        <p className="text-sm text-warm-900/50">
          Toplam: <span className="font-semibold text-warm-900">{total}</span>
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Email ile ara..."
          className="bg-white border border-warm-200 rounded-xl px-4 py-2.5 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-warm-50 text-warm-900/50 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Kullanıcı</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Kayıt</th>
              <th className="text-left px-5 py-3 font-medium">Son Giriş</th>
              <th className="text-left px-5 py-3 font-medium">Rol</th>
              <th className="text-right px-5 py-3 font-medium">Satın Alma</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-warm-900/30">
                  Yükleniyor...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-warm-900/30">
                  Kullanıcı bulunamadı
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => openDetail(u.id)}
                  className="hover:bg-warm-50 cursor-pointer transition-colors border-t border-warm-100"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-warm-900/40 text-xs font-bold">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-warm-900 truncate max-w-[160px]">
                        {u.name || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-warm-900/70">{u.email}</td>
                  <td className="px-5 py-3 text-sm text-warm-900/50">{fmtDate(u.created_at)}</td>
                  <td className="px-5 py-3 text-sm text-warm-900/50">{fmtDate(u.last_sign_in_at)}</td>
                  <td className="px-5 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-5 py-3 text-right text-sm text-warm-900/70">{u.purchase_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                p === page
                  ? "bg-coral text-white"
                  : "bg-white border border-warm-200 text-warm-900/60 hover:bg-warm-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {selectedUserId && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {detailLoading || !detail ? (
              <div className="p-12 text-center text-warm-900/30">Yükleniyor...</div>
            ) : (
              <div className="p-6">
                {/* User info header */}
                <div className="flex items-center gap-4 mb-6">
                  {detail.user.avatar ? (
                    <img
                      src={detail.user.avatar}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center text-warm-900/40 text-lg font-bold">
                      {(detail.user.name || detail.user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-warm-900 truncate">
                      {detail.user.name || "İsimsiz Kullanıcı"}
                    </h2>
                    <p className="text-sm text-warm-900/60">{detail.user.email}</p>
                    <div className="flex gap-4 mt-1 text-xs text-warm-900/40">
                      <span>Kayıt: {fmtDate(detail.user.created_at)}</span>
                      <span>Son giriş: {fmtDate(detail.user.last_sign_in_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <RoleBadge role={detail.role} />
                    <button
                      onClick={closeModal}
                      className="text-warm-900/30 hover:text-warm-900/60 text-xl leading-none mt-1"
                    >
                      &times;
                    </button>
                  </div>
                </div>

                {/* Action message */}
                {actionMsg && (
                  <div
                    className={`text-sm px-4 py-2 rounded-xl mb-4 ${
                      actionMsg.startsWith("Hata")
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {actionMsg}
                  </div>
                )}

                {/* Purchases */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-warm-900 mb-3">
                    Satın Almalar ({detail.purchases.length})
                  </h3>
                  {detail.purchases.length === 0 ? (
                    <p className="text-sm text-warm-900/30">Henüz satın alma yok</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.purchases.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between bg-warm-50 rounded-xl px-4 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-medium text-warm-900">{p.title}</p>
                            <p className="text-xs text-warm-900/40">
                              {p.type === "workshop" ? "Atölye" : "Video"} &middot;{" "}
                              {fmtDate(p.purchased_at)}
                            </p>
                          </div>
                          {p.expires_at && (
                            <span className="text-xs text-warm-900/40">
                              Bitiş: {fmtDate(p.expires_at)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={openAssignForm}
                    className="px-4 py-2 text-sm font-medium bg-coral text-white rounded-xl hover:bg-coral/90 transition"
                  >
                    Ücretsiz Eğitim Ata
                  </button>
                  <button
                    onClick={() => {
                      setShowRole(true);
                      setShowAssign(false);
                    }}
                    className="px-4 py-2 text-sm font-medium bg-warm-100 text-warm-900 rounded-xl hover:bg-warm-200 transition"
                  >
                    Rol Değiştir
                  </button>
                </div>

                {/* Assign form */}
                {showAssign && (
                  <div className="bg-warm-50 rounded-xl p-4 mb-4 space-y-3">
                    <h4 className="text-sm font-semibold text-warm-900">Eğitim Ata</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setAssignType("workshop");
                          setAssignId("");
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg transition ${
                          assignType === "workshop"
                            ? "bg-coral text-white"
                            : "bg-white border border-warm-200 text-warm-900/60"
                        }`}
                      >
                        Atölye
                      </button>
                      <button
                        onClick={() => {
                          setAssignType("video");
                          setAssignId("");
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg transition ${
                          assignType === "video"
                            ? "bg-coral text-white"
                            : "bg-white border border-warm-200 text-warm-900/60"
                        }`}
                      >
                        Video
                      </button>
                    </div>
                    <select
                      value={assignId}
                      onChange={(e) => setAssignId(e.target.value)}
                      className="w-full bg-white border border-warm-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
                    >
                      <option value="">Seçiniz...</option>
                      {(assignType === "workshop" ? workshops : videos).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                    <div>
                      <label className="text-xs text-warm-900/50 mb-1 block">
                        Bitiş Tarihi (opsiyonel)
                      </label>
                      <input
                        type="date"
                        value={assignExpires}
                        onChange={(e) => setAssignExpires(e.target.value)}
                        className="bg-white border border-warm-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAssign}
                        disabled={!assignId || assigning}
                        className="px-4 py-2 text-sm font-medium bg-coral text-white rounded-xl hover:bg-coral/90 transition disabled:opacity-50"
                      >
                        {assigning ? "Atanıyor..." : "Ata"}
                      </button>
                      <button
                        onClick={() => setShowAssign(false)}
                        className="px-4 py-2 text-sm text-warm-900/50 hover:text-warm-900 transition"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* Role form */}
                {showRole && (
                  <div className="bg-warm-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-warm-900">Rol Değiştir</h4>
                    <select
                      value={roleValue}
                      onChange={(e) => setRoleValue(e.target.value)}
                      className="w-full bg-white border border-warm-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
                    >
                      <option value="">Kullanıcı (rol yok)</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRole}
                        disabled={settingRole}
                        className="px-4 py-2 text-sm font-medium bg-coral text-white rounded-xl hover:bg-coral/90 transition disabled:opacity-50"
                      >
                        {settingRole ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                      <button
                        onClick={() => setShowRole(false)}
                        className="px-4 py-2 text-sm text-warm-900/50 hover:text-warm-900 transition"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
