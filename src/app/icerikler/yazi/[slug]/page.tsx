import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/markdown";
import ArticleReader from "@/components/ArticleReader";

// Dynamic rendering — yazılar artık Supabase'den geliyor
export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Bulunamadı" };

  const ogImage = article.meta.image
    ? { url: article.meta.image, width: 1200, height: 630, alt: article.meta.title }
    : undefined;

  return {
    title: article.meta.title,
    description: article.meta.description,
    alternates: { canonical: `/icerikler/yazi/${slug}` },
    openGraph: {
      type: "article",
      title: article.meta.title,
      description: article.meta.description,
      ...(ogImage && { images: [ogImage] }),
      publishedTime: article.meta.date || undefined,
      authors: article.meta.author ? [article.meta.author] : undefined,
      tags: article.meta.tags.length > 0 ? article.meta.tags : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.meta.title,
      description: article.meta.description,
      ...(article.meta.image && { images: [article.meta.image] }),
    },
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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.meta.title,
    description: article.meta.description,
    ...(article.meta.image && { image: article.meta.image }),
    ...(article.meta.date && { datePublished: article.meta.date }),
    ...(article.meta.author && {
      author: { "@type": "Person", name: article.meta.author },
    }),
    publisher: {
      "@type": "Organization",
      name: "Klemens Art",
      logo: { "@type": "ImageObject", url: "https://klemensart.com/logos/logo-wide-dark.PNG" },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "İçerikler", item: "https://klemensart.com/icerikler" },
      { "@type": "ListItem", position: 3, name: article.meta.title },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ArticleReader article={article} />
    </>
  );
}
