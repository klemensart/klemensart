import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "/Volumes/PortableSSD/klemensart/gsc-key.json",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

async function listFolder(drive: any, folderId: string, prefix = "") {
  const r = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    pageSize: 100,
    fields: "files(id,name,mimeType,size,modifiedTime)",
    orderBy: "name",
  });

  const files = r.data.files ?? [];
  for (const f of files) {
    const size = f.size ? `${(parseInt(f.size) / 1024).toFixed(0)}KB` : "";
    const date = f.modifiedTime ? f.modifiedTime.slice(0, 10) : "";
    const type = f.mimeType?.includes("folder") ? "[KLASOR]" :
                 f.mimeType?.includes("document") ? "[DOC]" :
                 f.mimeType?.includes("spreadsheet") ? "[SHEET]" :
                 f.mimeType?.includes("presentation") ? "[SLIDES]" :
                 f.mimeType?.includes("image") ? "[IMG]" :
                 f.mimeType?.includes("video") ? "[VID]" :
                 f.mimeType?.includes("word") ? "[DOCX]" :
                 `[${f.mimeType?.split("/").pop()?.slice(0, 8)}]`;

    console.log(`${prefix}${type} ${f.name}  ${size}  ${date}`);

    if (f.mimeType === "application/vnd.google-apps.folder") {
      await listFolder(drive, f.id!, prefix + "  ");
    }
  }
}

async function main() {
  const drive = google.drive({ version: "v3", auth });

  // Root level files
  const root = await drive.files.list({
    q: "trashed = false and 'root' in parents",
    pageSize: 50,
    fields: "files(id,name,mimeType,size,modifiedTime)",
    orderBy: "name",
  });

  // Shared with me (root level)
  const shared = await drive.files.list({
    q: "trashed = false",
    pageSize: 50,
    fields: "files(id,name,mimeType,size,modifiedTime)",
    orderBy: "modifiedTime desc",
  });

  // Get unique top-level folders
  const folders = (shared.data.files ?? []).filter(
    (f: any) => f.mimeType === "application/vnd.google-apps.folder"
  );

  console.log("=== KLASOR YAPISI ===\n");

  for (const folder of folders) {
    console.log(`[KLASOR] ${folder.name}  ${folder.modifiedTime?.slice(0, 10)}`);
    await listFolder(drive, folder.id!, "  ");
    console.log("");
  }

  // Root level non-folder files
  const rootFiles = (shared.data.files ?? []).filter(
    (f: any) => f.mimeType !== "application/vnd.google-apps.folder"
  );

  if (rootFiles.length > 0) {
    console.log("=== KOK DIZIN DOSYALARI ===\n");
    for (const f of rootFiles) {
      const size = f.size ? `${(parseInt(f.size) / 1024).toFixed(0)}KB` : "";
      const type = f.mimeType?.includes("image") ? "[IMG]" :
                   f.mimeType?.includes("video") ? "[VID]" :
                   f.mimeType?.includes("word") ? "[DOCX]" :
                   `[${f.mimeType?.split("/").pop()?.slice(0, 10)}]`;
      console.log(`${type} ${f.name}  ${size}  ${f.modifiedTime?.slice(0, 10)}`);
    }
  }
}

main().catch(console.error);
