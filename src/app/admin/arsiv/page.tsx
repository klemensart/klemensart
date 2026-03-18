'use client';

import { useState, useEffect, useCallback } from 'react';

type Artwork = {
  id: string;
  artist_name: string;
  artwork_title: string;
  year: string;
  medium: string;
  image_url: string;
  museum: string;
  created_at: string;
};

const SOURCES = [
  { key: 'met', label: 'Met Museum' },
  { key: 'aic', label: 'Art Institute of Chicago' },
  { key: 'cma', label: 'Cleveland Museum of Art' },
  { key: 'smithsonian', label: 'Smithsonian' },
  { key: 'harvard', label: 'Harvard Art Museums' },
  { key: 'va', label: 'V&A Museum' },
];

const MUSEUMS = [
  'Metropolitan Museum of Art',
  'Art Institute of Chicago',
  'Cleveland Museum of Art',
  'Smithsonian Institution',
  'Harvard Art Museums',
  'Victoria and Albert Museum',
];

export default function ArtworkArchivePage() {
  const [artistName, setArtistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sources, setSources] = useState<string[]>(['met', 'aic', 'cma', 'smithsonian', 'harvard', 'va']);

  // Artwork listing state
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [museumFilter, setMuseumFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [listLoading, setListLoading] = useState(false);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  const loadArtworks = useCallback(async () => {
    setListLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (museumFilter) params.set('museum', museumFilter);
      const res = await fetch(`/api/admin/artworks?${params}`);
      const data = await res.json();
      if (res.ok) {
        setArtworks(data.artworks);
        setTotal(data.total);
      }
    } catch {
      // silent
    } finally {
      setListLoading(false);
    }
  }, [page, museumFilter]);

  useEffect(() => {
    loadArtworks();
  }, [loadArtworks]);

  const toggleSource = (key: string) => {
    setSources((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const fetchArtworks = async () => {
    if (!artistName) {
      setMessage('Lütfen bir sanatçı adı girin.');
      return;
    }
    if (sources.length === 0) {
      setMessage('En az bir kaynak seçin.');
      return;
    }

    setLoading(true);
    setMessage('Müze arşivlerine bağlanılıyor, lütfen bekleyin...');

    try {
      const res = await fetch('/api/admin/artworks/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName, sources }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Bir hata oluştu.');
      } else {
        let msg = data.message;
        if (data.breakdown) {
          const parts = Object.entries(data.breakdown as Record<string, { found: number; error?: string }>)
            .map(([key, val]) => {
              const label = SOURCES.find((s) => s.key === key)?.label || key;
              if (val.error) return `${label}: ${val.error}`;
              return `${label}: ${val.found} eser`;
            });
          msg += '\n' + parts.join(' · ');
        }
        setMessage(msg);
        // Refresh the table
        setPage(1);
        loadArtworks();
      }
    } catch {
      setMessage('Müzeyle bağlantı kurulurken bir hata yaşandı.');
    } finally {
      setLoading(false);
    }
  };

  const deleteArtwork = async (id: string, title: string) => {
    if (!confirm(`"${title}" eserini silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch('/api/admin/artworks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        loadArtworks();
      }
    } catch {
      // silent
    }
  };

  // Client-side search filter
  const filtered = artworks.filter((a) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      a.artist_name.toLowerCase().includes(q) ||
      a.artwork_title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-10 max-w-6xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-serif text-gray-900 mb-2">Sanat Eseri Arşivi</h1>
      <p className="text-gray-500 mb-6 font-light">
        Müze açık erişim koleksiyonlarından yüksek çözünürlüklü eserleri arayın ve veritabanınıza ekleyin.
      </p>

      {/* Source checkboxes */}
      <div className="flex flex-wrap gap-4 mb-4">
        {SOURCES.map((src) => (
          <label key={src.key} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sources.includes(src.key)}
              onChange={() => toggleSource(src.key)}
              className="w-4 h-4 accent-[#FF6D60]"
            />
            <span className="text-gray-700 text-sm">{src.label}</span>
          </label>
        ))}
      </div>

      {/* Search form */}
      <form onSubmit={(e) => { e.preventDefault(); fetchArtworks(); }} className="flex gap-4 mb-6">
        <input
          type="text"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          placeholder="Sanatçı adı (Örn: Caravaggio, Rembrandt)"
          className="flex-1 border border-gray-200 p-4 rounded-xl focus:outline-none focus:border-[#FF6D60] transition-colors text-gray-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#FF6D60] text-white px-8 py-4 font-medium rounded-xl hover:bg-[#e85e52] transition-colors disabled:opacity-50"
        >
          {loading ? 'Arşiv Taranıyor...' : 'Eserleri Çek'}
        </button>
      </form>

      {message && (
        <div className="p-5 bg-gray-50 border-l-4 border-[#FF6D60] text-gray-700 font-medium rounded-r-xl mb-8 whitespace-pre-line">
          {message}
        </div>
      )}

      {/* ── Artwork Table ─────────────────────────── */}
      <div className="border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-xl font-serif text-gray-900">Kayıtlı Eserler ({total})</h2>
          <div className="flex gap-3">
            <select
              value={museumFilter}
              onChange={(e) => { setMuseumFilter(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#FF6D60]"
            >
              <option value="">Tüm Müzeler</option>
              {MUSEUMS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Sanatçı veya eser ara..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 w-56 focus:outline-none focus:border-[#FF6D60]"
            />
          </div>
        </div>

        {listLoading ? (
          <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Henüz eser yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="py-3 pr-3 font-medium w-[60px]"></th>
                  <th className="py-3 pr-3 font-medium">Eser</th>
                  <th className="py-3 pr-3 font-medium">Sanatçı</th>
                  <th className="py-3 pr-3 font-medium">Yıl</th>
                  <th className="py-3 pr-3 font-medium">Müze</th>
                  <th className="py-3 font-medium w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((art) => (
                  <tr key={art.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2 pr-3">
                      <img
                        src={art.image_url}
                        alt={art.artwork_title}
                        className="w-[60px] h-[60px] object-cover rounded"
                        loading="lazy"
                      />
                    </td>
                    <td className="py-2 pr-3 text-gray-800 max-w-[200px] truncate">
                      {art.artwork_title}
                    </td>
                    <td className="py-2 pr-3 text-gray-600">{art.artist_name}</td>
                    <td className="py-2 pr-3 text-gray-500">{art.year}</td>
                    <td className="py-2 pr-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {art.museum}
                      </span>
                    </td>
                    <td className="py-2 flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(art.image_url);
                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
                            a.download = `${art.artist_name} - ${art.artwork_title}.${ext}`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } catch {
                            window.open(art.image_url, '_blank');
                          }
                        }}
                        className="text-blue-400 hover:text-blue-600 transition-colors text-xs"
                        title="İndir"
                      >
                        İndir
                      </button>
                      <button
                        onClick={() => deleteArtwork(art.id, art.artwork_title)}
                        className="text-red-400 hover:text-red-600 transition-colors text-xs"
                        title="Sil"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
            >
              &larr;
            </button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
            >
              &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
