'use client';

import { useState } from 'react';

export default function ArtworkArchivePage() {
  const [artistName, setArtistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchArtworks = async () => {
    if (!artistName) {
      setMessage('Lütfen bir sanatçı adı girin.');
      return;
    }
    
    setLoading(true);
    setMessage('Müze arşivlerine bağlanılıyor, lütfen bekleyin... 🏛️');

    try {
      const res = await fetch('/api/admin/artworks/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || data.message || 'Bir hata oluştu.');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Müzeyle bağlantı kurulurken bir hata yaşandı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-serif text-gray-900 mb-2">Sanat Eseri Arşivi</h1>
      <p className="text-gray-500 mb-8 font-light">
        Metropolitan Sanat Müzesi (Met) açık erişim koleksiyonundan yüksek çözünürlüklü eserleri arayın ve veritabanınıza ekleyin.
      </p>

      <form onSubmit={(e) => { e.preventDefault(); fetchArtworks(); }} className="flex gap-4 mb-8">
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
          {loading ? 'Arşiv Taranıyor...' : 'Eserleri Çek ✨'}
        </button>
      </form>

      {message && (
        <div className="p-5 bg-gray-50 border-l-4 border-[#FF6D60] text-gray-700 font-medium rounded-r-xl">
          {message}
        </div>
      )}
    </div>
  );
}