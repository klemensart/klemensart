import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "/Volumes/PortableSSD/klemensart/gsc-key.json",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

async function buildPathMap(drive: any): Promise<Map<string, string>> {
  // Fetch all folders to build a parent→name map for path resolution
  const pathMap = new Map<string, string>();
  let pageToken: string | undefined;

  do {
    const r = await drive.files.list({
      q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      pageSize: 500,
      fields: "nextPageToken, files(id, name, parents)",
      pageToken,
    });
    for (const f of r.data.files ?? []) {
      pathMap.set(f.id!, JSON.stringify({ name: f.name, parent: f.parents?.[0] }));
    }
    pageToken = r.data.nextPageToken;
  } while (pageToken);

  return pathMap;
}

function resolvePath(id: string, pathMap: Map<string, string>): string {
  const parts: string[] = [];
  let current = id;
  let depth = 0;
  while (current && depth < 20) {
    const entry = pathMap.get(current);
    if (!entry) break;
    const { name, parent } = JSON.parse(entry);
    parts.unshift(name);
    current = parent;
    depth++;
  }
  return parts.length ? "/" + parts.join("/") : "(root)";
}

async function main() {
  const drive = google.drive({ version: "v3", auth });

  console.log("=== Google Drive: CansuKul & INSTAGRAM_FINALLER Arama ===\n");

  // Build folder path map
  console.log("Klasor ağacı yükleniyor...");
  const pathMap = await buildPathMap(drive);
  console.log(`  ${pathMap.size} klasör indekslendi.\n`);

  // ── 1. Search for anything with "CansuKul" in the name ──
  console.log('--- "CansuKul" araması ---');
  const cansuResults = await drive.files.list({
    q: "name contains 'CansuKul' and trashed = false",
    pageSize: 100,
    fields: "files(id, name, mimeType, size, parents, webViewLink, webContentLink)",
  });

  for (const f of cansuResults.data.files ?? []) {
    const isFolder = f.mimeType === "application/vnd.google-apps.folder";
    const parentPath = f.parents?.[0] ? resolvePath(f.parents[0], pathMap) : "(root)";
    const fullPath = `${parentPath}/${f.name}`;
    const sizeStr = f.size ? `${(parseInt(f.size) / 1024).toFixed(0)} KB` : "";

    console.log(`  ${isFolder ? "[KLASOR]" : "[DOSYA]"} ${fullPath}`);
    console.log(`    ID: ${f.id}`);
    console.log(`    MimeType: ${f.mimeType}`);
    if (sizeStr) console.log(`    Size: ${sizeStr}`);
    if (f.webViewLink) console.log(`    View: ${f.webViewLink}`);
    if (f.webContentLink) console.log(`    Download: ${f.webContentLink}`);
    console.log();
  }

  if ((cansuResults.data.files ?? []).length === 0) {
    console.log("  (sonuç yok)\n");
  }

  // ── 2. Search for "INSTAGRAM_FINALLER" ──
  console.log('--- "INSTAGRAM_FINALLER" araması ---');
  const igResults = await drive.files.list({
    q: "name contains 'INSTAGRAM_FINALLER' and trashed = false",
    pageSize: 100,
    fields: "files(id, name, mimeType, parents, webViewLink)",
  });

  for (const f of igResults.data.files ?? []) {
    const isFolder = f.mimeType === "application/vnd.google-apps.folder";
    const parentPath = f.parents?.[0] ? resolvePath(f.parents[0], pathMap) : "(root)";
    const fullPath = `${parentPath}/${f.name}`;

    console.log(`  ${isFolder ? "[KLASOR]" : "[DOSYA]"} ${fullPath}`);
    console.log(`    ID: ${f.id}`);
    console.log(`    MimeType: ${f.mimeType}`);
    if (f.webViewLink) console.log(`    View: ${f.webViewLink}`);
    console.log();
  }

  if ((igResults.data.files ?? []).length === 0) {
    console.log("  (sonuç yok)\n");
  }

  // ── 3. Also try broader search: "Cansu" ──
  console.log('--- "Cansu" (geniş arama) ---');
  const cansuBroad = await drive.files.list({
    q: "name contains 'Cansu' and trashed = false",
    pageSize: 100,
    fields: "files(id, name, mimeType, size, parents, webViewLink, webContentLink)",
  });

  for (const f of cansuBroad.data.files ?? []) {
    const isFolder = f.mimeType === "application/vnd.google-apps.folder";
    const parentPath = f.parents?.[0] ? resolvePath(f.parents[0], pathMap) : "(root)";
    const fullPath = `${parentPath}/${f.name}`;
    const sizeStr = f.size ? `${(parseInt(f.size) / 1024).toFixed(0)} KB` : "";

    console.log(`  ${isFolder ? "[KLASOR]" : "[DOSYA]"} ${fullPath}`);
    console.log(`    ID: ${f.id}`);
    console.log(`    MimeType: ${f.mimeType}`);
    if (sizeStr) console.log(`    Size: ${sizeStr}`);
    if (f.webViewLink) console.log(`    View: ${f.webViewLink}`);
    if (f.webContentLink) console.log(`    Download: ${f.webContentLink}`);
    console.log();
  }

  if ((cansuBroad.data.files ?? []).length === 0) {
    console.log("  (sonuç yok)\n");
  }

  // ── 4. If INSTAGRAM_FINALLER found, list ALL its subfolders and files recursively ──
  const igFolder = (igResults.data.files ?? []).find(
    (f: any) => f.mimeType === "application/vnd.google-apps.folder"
  );

  if (igFolder) {
    console.log(`\n=== 03_INSTAGRAM_FINALLER içeriği (ID: ${igFolder.id}) ===\n`);
    await listFolderRecursive(drive, igFolder.id!, igFolder.name!, pathMap, "");
  }

  // ── 5. Try to find the specific Cansu folder inside INSTAGRAM_FINALLER and list download info ──
  if (igFolder) {
    const subs = await drive.files.list({
      q: `'${igFolder.id}' in parents and trashed = false`,
      pageSize: 100,
      fields: "files(id, name, mimeType)",
    });

    const cansuSub = (subs.data.files ?? []).find(
      (f: any) => f.name.includes("Cansu") || f.name.includes("cansu")
    );

    if (cansuSub) {
      console.log(`\n=== Cansu Kul Klasörü Detay ===`);
      console.log(`Klasör: ${cansuSub.name}`);
      console.log(`Klasör ID: ${cansuSub.id}\n`);

      const cansuFiles = await drive.files.list({
        q: `'${cansuSub.id}' in parents and trashed = false`,
        pageSize: 50,
        fields: "files(id, name, mimeType, size, webViewLink, webContentLink)",
        orderBy: "name",
      });

      console.log("Dosyalar ve indirme bilgileri:");
      for (const f of cansuFiles.data.files ?? []) {
        const sizeStr = f.size ? `${(parseInt(f.size) / (1024 * 1024)).toFixed(1)} MB` : "?";
        console.log(`  ${f.name}`);
        console.log(`    File ID: ${f.id}`);
        console.log(`    MimeType: ${f.mimeType}`);
        console.log(`    Size: ${sizeStr}`);
        console.log(`    Direct download: https://drive.google.com/uc?export=download&id=${f.id}`);
        console.log(`    API download: https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`);
        if (f.webViewLink) console.log(`    View: ${f.webViewLink}`);
        if (f.webContentLink) console.log(`    webContentLink: ${f.webContentLink}`);
        console.log();
      }
    } else {
      console.log("\nCansu alt klasörü INSTAGRAM_FINALLER içinde bulunamadı.");
      console.log("Mevcut alt klasörler:", (subs.data.files ?? []).map((f: any) => f.name).join(", "));
    }
  }
}

async function listFolderRecursive(
  drive: any,
  folderId: string,
  folderName: string,
  pathMap: Map<string, string>,
  indent: string
) {
  const r = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    pageSize: 200,
    fields: "files(id, name, mimeType, size)",
    orderBy: "name",
  });

  for (const f of r.data.files ?? []) {
    const isFolder = f.mimeType === "application/vnd.google-apps.folder";
    const sizeStr = f.size ? `(${(parseInt(f.size) / 1024).toFixed(0)} KB)` : "";
    const typeTag = isFolder ? "[KLASOR]" : "[DOSYA]";
    console.log(`${indent}${typeTag} ${f.name} ${sizeStr}  ID: ${f.id}`);

    if (isFolder) {
      await listFolderRecursive(drive, f.id!, f.name!, pathMap, indent + "  ");
    }
  }
}

main().catch(console.error);
