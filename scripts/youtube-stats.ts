/**
 * YouTube Data API — Klemens Art kanal istatistikleri
 *
 * Kullanım:
 *   npx tsx scripts/youtube-stats.ts
 */

import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "/Volumes/PortableSSD/klemensart/gsc-key.json",
  scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
});

// Search for channel by name if ID is not known
async function findChannel(yt: any, query: string) {
  const res = await yt.search.list({
    part: "snippet",
    q: query,
    type: "channel",
    maxResults: 5,
  });
  return res.data.items ?? [];
}

async function main() {
  const yt = google.youtube({ version: "v3", auth });

  // 1. Find the Klemens Art channel
  console.log("=== KANAL ARAMA ===\n");
  const channels = await findChannel(yt, "Klemens Art");

  if (channels.length === 0) {
    console.log("Kanal bulunamadı. Handle ile deneyelim...");
    // Try by forHandle
    const byHandle = await yt.channels.list({
      part: "snippet,statistics,contentDetails",
      forHandle: "KlemensArt",
    });
    if (!byHandle.data.items?.length) {
      console.log("KlemensArt handle'ı ile de bulunamadı.");
      return;
    }
    channels.push(...byHandle.data.items);
  }

  // Use first matching channel
  let channelId = channels[0]?.snippet?.channelId || channels[0]?.id;
  if (typeof channelId === "object") channelId = channelId.channelId || channels[0]?.id;
  console.log(`Kanal bulundu: ${channels[0]?.snippet?.title} (${channelId})\n`);

  // 2. Channel stats
  const stats = await yt.channels.list({
    part: "snippet,statistics,brandingSettings",
    id: channelId,
  });

  const ch = stats.data.items?.[0];
  if (!ch) {
    console.log("Kanal detayları alınamadı.");
    return;
  }

  console.log("=== KANAL İSTATİSTİKLERİ ===\n");
  console.log(`Kanal: ${ch.snippet?.title}`);
  console.log(`Açıklama: ${ch.snippet?.description?.slice(0, 120)}...`);
  console.log(`Abone: ${Number(ch.statistics?.subscriberCount).toLocaleString("tr-TR")}`);
  console.log(`Toplam İzlenme: ${Number(ch.statistics?.viewCount).toLocaleString("tr-TR")}`);
  console.log(`Video Sayısı: ${ch.statistics?.videoCount}`);
  console.log(`Oluşturma: ${ch.snippet?.publishedAt?.slice(0, 10)}`);

  // 3. Recent videos
  console.log("\n=== SON VİDEOLAR ===\n");
  const videos = await yt.search.list({
    part: "snippet",
    channelId,
    order: "date",
    maxResults: 10,
    type: "video",
  });

  const videoIds = (videos.data.items ?? [])
    .map((v: any) => v.id?.videoId)
    .filter(Boolean);

  if (videoIds.length > 0) {
    const details = await yt.videos.list({
      part: "snippet,statistics,contentDetails",
      id: videoIds.join(","),
    });

    for (const v of details.data.items ?? []) {
      const views = Number(v.statistics?.viewCount).toLocaleString("tr-TR");
      const likes = Number(v.statistics?.likeCount).toLocaleString("tr-TR");
      const duration = v.contentDetails?.duration?.replace("PT", "").toLowerCase() || "";
      const date = v.snippet?.publishedAt?.slice(0, 10);
      console.log(`${date} | ${views} izlenme | ${likes} beğeni | ${duration} | ${v.snippet?.title}`);
    }
  }

  // 4. Top videos by views
  console.log("\n=== EN ÇOK İZLENEN VİDEOLAR ===\n");
  const popular = await yt.search.list({
    part: "snippet",
    channelId,
    order: "viewCount",
    maxResults: 10,
    type: "video",
  });

  const popIds = (popular.data.items ?? [])
    .map((v: any) => v.id?.videoId)
    .filter(Boolean);

  if (popIds.length > 0) {
    const popDetails = await yt.videos.list({
      part: "snippet,statistics",
      id: popIds.join(","),
    });

    for (const v of popDetails.data.items ?? []) {
      const views = Number(v.statistics?.viewCount).toLocaleString("tr-TR");
      const likes = Number(v.statistics?.likeCount).toLocaleString("tr-TR");
      const date = v.snippet?.publishedAt?.slice(0, 10);
      console.log(`${views} izlenme | ${likes} beğeni | ${date} | ${v.snippet?.title}`);
    }
  }
}

main().catch(console.error);
