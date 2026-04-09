import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";

// Kayıtlı bülten taslakları — src/emails/bulten-*.html dosyalarını listeler
const DRAFTS_DIR = path.join(process.cwd(), "src/emails");

type DraftMeta = {
  slug: string;
  title: string;
  subject: string;
};

// Dosya adından başlık ve konu çıkaran yardımcı harita
const DRAFT_META: Record<string, Omit<DraftMeta, "slug">> = {
  "bulten-yalnizlik-content": {
    title: "Yalnızlık Bülteni #1",
    subject: "Klemens Bülten — Yalnızlık",
  },
  "bulten-tuz-content": {
    title: "Tuz Bülteni #2",
    subject: "Klemens Bülten — Tuz",
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  try {
    if (slug) {
      // Tek taslağın HTML içeriğini döndür
      const filePath = path.join(DRAFTS_DIR, `${slug}.html`);
      const html = await readFile(filePath, "utf-8");
      const meta = DRAFT_META[slug];
      return NextResponse.json({
        slug,
        title: meta?.title ?? slug,
        subject: meta?.subject ?? "",
        html,
      });
    }

    // Tüm taslakları listele
    const files = await readdir(DRAFTS_DIR);
    const drafts: DraftMeta[] = files
      .filter((f) => f.startsWith("bulten-") && f.endsWith(".html"))
      .map((f) => {
        const s = f.replace(".html", "");
        const meta = DRAFT_META[s];
        return {
          slug: s,
          title: meta?.title ?? s,
          subject: meta?.subject ?? "",
        };
      });

    return NextResponse.json({ drafts });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Taslak okunamadı" },
      { status: 500 },
    );
  }
}
