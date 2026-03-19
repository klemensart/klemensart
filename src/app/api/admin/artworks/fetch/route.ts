import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/admin-check';

export async function POST(request: Request) {
  try {
    // Admin kontrolü
    const userClient = await createServerSupabaseClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { artistName } = await request.json();

    if (!artistName) {
      return NextResponse.json({ error: 'Sanatçı adı gerekli' }, { status: 400 });
    }

    // 1. Met Müzesi API'sinde sanatçıyı ara (Sadece görselli eserler)
    const searchRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&artistOrCulture=true&q=${encodeURIComponent(artistName)}`);
    const searchData = await searchRes.json();

    if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
      return NextResponse.json({ message: 'Müze arşivinde bu sanatçıya ait eser bulunamadı.' }, { status: 404 });
    }

    // Sistemin yorulmaması için şimdilik ilk 15 eseri çekiyoruz
    const objectIDs = searchData.objectIDs.slice(0, 15);
    const addedArtworks = [];

    const admin = createAdminClient();

    // 2. Eser detaylarını çek ve Klemens Art veritabanına kaydet
    for (const id of objectIDs) {
      const detailRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
      const detailData = await detailRes.json();

      // Sadece ana görseli olan ve sanatçı adıyla eşleşenleri al
      if (detailData.primaryImage && detailData.artistDisplayName?.toLowerCase().includes(artistName.toLowerCase())) {

        const artworkData = {
          artist_name: detailData.artistDisplayName,
          artwork_title: detailData.title,
          year: detailData.objectDate || 'Bilinmiyor',
          medium: detailData.medium || 'Bilinmiyor',
          dimensions: detailData.dimensions || 'Bilinmiyor',
          museum: detailData.repository || 'The Metropolitan Museum of Art',
          image_url: detailData.primaryImage,
          source_url: detailData.objectURL,
          source_api: 'met'
        };

        // Supabase'e ekle (Eğer aynı eser daha önce eklendiyse atla)
        const { data, error } = await admin
          .from('artworks')
          .upsert(artworkData, { onConflict: 'artist_name, artwork_title', ignoreDuplicates: true })
          .select();

        if (!error && data && data.length > 0) {
          addedArtworks.push(artworkData.artwork_title);
        }
      }
    }

    return NextResponse.json({
      message: `${addedArtworks.length} yeni başyapıt Klemens Art arşivine eklendi!`,
      added: addedArtworks
    });

  } catch (error) {
    console.error('API Hatası:', error);
    return NextResponse.json({ error: 'Arşiv bağlantısı sırasında bir hata oluştu.' }, { status: 500 });
  }
}
