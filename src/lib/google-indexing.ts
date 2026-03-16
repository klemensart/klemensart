import { google } from "googleapis";

/**
 * Google Indexing API — URL bildirimi (fire-and-forget)
 * Credentials yoksa sessizce atlar, hata fırlatmaz.
 */
export async function notifyGoogleIndex(
  url: string,
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
): Promise<boolean> {
  try {
    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyJson) return false;

    const credentials = JSON.parse(keyJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/indexing"],
    });

    const authClient = await auth.getClient();
    const indexing = google.indexing({ version: "v3", auth: authClient as any });
    await indexing.urlNotifications.publish({
      requestBody: { url, type },
    });
    console.log(`[Indexing API] ${type}: ${url}`);
    return true;
  } catch (err) {
    console.error(`[Indexing API] Hata: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}
