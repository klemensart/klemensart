/**
 * Instagram/Facebook sayfasında müze rehberi ile ilgili postları bul
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const token = process.env.META_ACCESS_TOKEN!;
const pageId = "110198542171215";
const igUserId = "17841460410904663";
const API = "https://graph.facebook.com/v21.0";

async function api(path: string) {
  const sep = path.includes("?") ? "&" : "?";
  return fetch(`${API}/${path}${sep}access_token=${token}`).then((r) => r.json());
}

async function main() {
  // Facebook page postlarını çek
  console.log("=== Facebook Page Postları ===\n");
  const fbPosts = await api(
    `${pageId}/posts?fields=id,message,created_time,permalink_url&limit=15`
  );

  for (const post of fbPosts.data || []) {
    const msg = post.message?.substring(0, 80) || "(mesaj yok)";
    console.log(`${post.id} | ${post.created_time} | ${msg}`);
  }

  // Instagram postlarını çek
  console.log("\n=== Instagram Postları ===\n");
  const igPosts = await api(
    `${igUserId}/media?fields=id,caption,timestamp,permalink,media_type&limit=15`
  );

  for (const post of igPosts.data || []) {
    const cap = post.caption?.substring(0, 80) || "(caption yok)";
    console.log(`${post.id} | ${post.timestamp} | ${post.media_type} | ${cap}`);
  }

  // Mevcut aktif/paused reklamları listele
  console.log("\n=== Mevcut Reklamlar ===\n");
  const ads = await api(
    `${process.env.META_AD_ACCOUNT_ID}/ads?fields=id,name,status,creative{id,effective_object_story_id}&limit=20&effective_status=["ACTIVE","PAUSED","PENDING_REVIEW"]`
  );

  for (const ad of ads.data || []) {
    console.log(`${ad.id} | ${ad.status} | ${ad.name}`);
    if (ad.creative) {
      console.log(`  Creative: ${ad.creative.id} | Story: ${ad.creative.effective_object_story_id}`);
    }
  }
}

main();
