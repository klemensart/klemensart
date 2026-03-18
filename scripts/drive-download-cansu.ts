import { google } from "googleapis";
import * as fs from "fs";

const auth = new google.auth.GoogleAuth({
  keyFile: "/Volumes/PortableSSD/klemensart/gsc-key.json",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

async function main() {
  const drive = google.drive({ version: "v3", auth });

  // Direct folder ID — 07_CansuKul_Konusma.docx inside 03_INSTAGRAM_FINALLER
  const cansuFolderId = "1rePY-Yr5u2B6iIZ4x7J-s_gh9r4fhpBF";
  console.log("Cansu folder ID:", cansuFolderId);

  // List files in Cansu folder
  const files = await drive.files.list({
    q: `'${cansuFolderId}' in parents and trashed = false`,
    pageSize: 20,
    fields: "files(id,name,mimeType,size)",
    orderBy: "name",
  });

  console.log("\nDosyalar:");
  const outputDir = "/tmp/cansu-ig";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  for (const f of files.data.files ?? []) {
    console.log(`  ${f.name} (${f.mimeType}, ${f.size ? Math.round(parseInt(f.size)/1024) + 'KB' : '?'})`);

    // Download each file
    const dest = `${outputDir}/${f.name}`;
    const res = await drive.files.get(
      { fileId: f.id!, alt: "media" },
      { responseType: "stream" }
    );

    const ws = fs.createWriteStream(dest);
    await new Promise<void>((resolve, reject) => {
      (res.data as any).pipe(ws);
      ws.on("finish", resolve);
      ws.on("error", reject);
    });

    console.log(`  → İndirildi: ${dest}`);
  }

  console.log("\nTüm dosyalar indirildi!");
}

main().catch(console.error);
