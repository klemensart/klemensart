/**
 * Instagram'daki mevcut müze rehberi postunu reklam kreatifi olarak kullan
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });

const token = process.env.META_ACCESS_TOKEN!;
const accountId = process.env.META_AD_ACCOUNT_ID!;
const API = "https://graph.facebook.com/v21.0";

async function api(path: string, method = "GET", body?: Record<string, string>) {
  const url = `${API}/${path}`;
  if (body) {
    body.access_token = token;
    return fetch(url, { method, body: new URLSearchParams(body) }).then((r) => r.json());
  }
  const sep = path.includes("?") ? "&" : "?";
  return fetch(`${url}${sep}access_token=${token}`).then((r) => r.json());
}

async function main() {
  // Instagram müze rehberi video postu: 18094242725051026
  // "Bugün hava müze gezmek için harika!..."
  const igMediaId = "18094242725051026";

  console.log("=== IG Post ile Kreatif Denemesi ===\n");

  // Yöntem 1: source_instagram_media_id
  console.log("Yöntem 1: source_instagram_media_id...");
  const c1 = await api(`${accountId}/adcreatives`, "POST", {
    name: "Muze_Rehberi_LP_IG_Creative",
    source_instagram_media_id: igMediaId,
    call_to_action: JSON.stringify({
      type: "LEARN_MORE",
      value: { link: "https://klemensart.com/rehber" },
    }),
  });
  console.log("Sonuç:", JSON.stringify(c1, null, 2));

  if (c1.error) {
    // Yöntem 2: object_story_spec + source_instagram_media_id
    console.log("\nYöntem 2: object_story_spec ile...");
    const c2 = await api(`${accountId}/adcreatives`, "POST", {
      name: "Muze_Rehberi_LP_IG_Creative_v2",
      object_story_spec: JSON.stringify({
        page_id: "110198542171215",
        instagram_user_id: "17841460410904663",
        link_data: {
          link: "https://klemensart.com/rehber",
          message: "Müze Gezme Rehberi! Ücretsiz indirmek için linke tıklayın.",
          call_to_action: {
            type: "LEARN_MORE",
            value: { link: "https://klemensart.com/rehber" },
          },
        },
      }),
      source_instagram_media_id: igMediaId,
    });
    console.log("Sonuç:", JSON.stringify(c2, null, 2));

    if (!c2.error) {
      // Ad oluştur
      console.log("\nReklam oluşturuluyor...");
      const ad = await api(`${accountId}/ads`, "POST", {
        name: "Muze_Rehberi_LP_Ad",
        adset_id: "120245734629290728",
        creative: JSON.stringify({ creative_id: c2.id }),
        status: "PAUSED",
      });
      console.log("Ad:", JSON.stringify(ad, null, 2));
    }
  } else {
    // Ad oluştur
    console.log("\nReklam oluşturuluyor...");
    const ad = await api(`${accountId}/ads`, "POST", {
      name: "Muze_Rehberi_LP_Ad",
      adset_id: "120245734629290728",
      creative: JSON.stringify({ creative_id: c1.id }),
      status: "PAUSED",
    });
    console.log("Ad:", JSON.stringify(ad, null, 2));
  }
}

main();
