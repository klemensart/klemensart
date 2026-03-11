import { NextRequest, NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/markdown";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}
