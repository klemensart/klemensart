import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAllArticleSlugs } from "@/lib/markdown";
import ArticleReader from "@/components/ArticleReader";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Bulunamadı — Klemens" };
  return {
    title: `${article.meta.title} — Klemens`,
    description: article.meta.description,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return <ArticleReader article={article} />;
}
