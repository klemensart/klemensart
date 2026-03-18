/**
 * Webhook'u gerçek bir lead ile test et
 * Meta'nın göndereceği payload'u simüle eder
 */
import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });
import { createHmac } from "crypto";

const appSecret = process.env.META_APP_SECRET!;

async function main() {
  // Meta'nın gönderdiği formatta bir webhook payload
  // Gerçek bir lead ID kullanacağız — en son lead'i çekelim
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN!;
  const proof = createHmac("sha256", appSecret).update(pageToken).digest("hex");

  // En son lead'i al
  const leadRes = await fetch(
    `https://graph.facebook.com/v21.0/1427804195378942/leads?fields=id&limit=1&access_token=${pageToken}&appsecret_proof=${proof}`
  );
  const leadData = await leadRes.json();
  const lastLeadId = leadData.data?.[0]?.id;

  if (!lastLeadId) {
    console.log("Lead bulunamadı");
    return;
  }

  console.log("Test lead ID:", lastLeadId);

  // Webhook payload oluştur
  const payload = JSON.stringify({
    object: "page",
    entry: [
      {
        id: "110198542171215",
        time: Date.now(),
        changes: [
          {
            field: "leadgen",
            value: {
              leadgen_id: lastLeadId,
              form_id: "1427804195378942",
              page_id: "110198542171215",
            },
          },
        ],
      },
    ],
  });

  // HMAC imza oluştur
  const signature =
    "sha256=" + createHmac("sha256", appSecret).update(payload).digest("hex");

  console.log("Webhook'a POST gönderiliyor...");
  const res = await fetch(
    "https://klemensart.com/api/webhooks/meta/leadgen",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": signature,
      },
      body: payload,
    }
  );

  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${text}`);
}

main();
