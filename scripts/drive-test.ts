import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "/Volumes/PortableSSD/klemensart/gsc-key.json",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

async function main() {
  const drive = google.drive({ version: "v3", auth });
  const r = await drive.files.list({
    pageSize: 20,
    fields: "files(id,name,mimeType)",
    orderBy: "modifiedTime desc",
  });

  const files = r.data.files ?? [];
  console.log(`${files.length} dosya bulundu:`);
  for (const f of files) {
    console.log(`${f.name} | ${f.mimeType} | ${f.id}`);
  }
}

main().catch(console.error);
