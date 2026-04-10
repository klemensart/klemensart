import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { render } from "@react-email/render";
import KlemensNewsletter from "../src/emails/KlemensNewsletter";

config({ path: ".env.local" });

async function main() {
  const filePath = path.join(process.cwd(), "src/emails/bulten-tuz-content.html");
  const htmlContent = await readFile(filePath, "utf-8");
  const html = await render(
    KlemensNewsletter({ subject: "test", htmlContent, previewText: "test" })
  );
  const sizeKB = (Buffer.byteLength(html, "utf-8") / 1024).toFixed(1);
  console.log("İçerik HTML:", (Buffer.byteLength(htmlContent, "utf-8") / 1024).toFixed(1), "KB");
  console.log("Render edilmiş HTML:", sizeKB, "KB");
  console.log("Gmail limit: 102 KB");
  console.log(Buffer.byteLength(html, "utf-8") > 102400 ? "⚠️  LİMİT AŞILDI — Gmail kırpacak!" : "✅ Limit altında");
}

main().catch((e) => { console.error(e); process.exit(1); });
