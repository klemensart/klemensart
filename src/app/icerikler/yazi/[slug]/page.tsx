import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAllArticleSlugs, getRelatedArticles } from "@/lib/markdown";
import ArticleReader from "@/components/ArticleReader";

export const revalidate = 60;

// Build-time'da bilinen slug'ları üret, yeni yazılar on-demand ISR ile oluşturulur
export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Bulunamadı" };

  const BASE = "https://klemensart.com";
  const articleUrl = `${BASE}/icerikler/yazi/${slug}`;
  const absImage = article.meta.image
    ? article.meta.image.startsWith("http") ? article.meta.image : `${BASE}${article.meta.image}`
    : undefined;

  // Görsel yoksa dinamik OG image oluştur
  const dynamicOgUrl = `${BASE}/api/og?title=${encodeURIComponent(article.meta.title)}&subtitle=${encodeURIComponent(article.meta.description.slice(0, 120))}&category=${encodeURIComponent(article.meta.category)}`;
  const ogImage = absImage
    ? { url: absImage, width: 1200, height: 630, alt: article.meta.title }
    : { url: dynamicOgUrl, width: 1200, height: 630, alt: article.meta.title };

  const keywords = [
    article.meta.category,
    ...article.meta.tags.slice(0, 5),
    "klemens art",
    "sanat yazısı",
  ];

  return {
    title: article.meta.title,
    description: article.meta.description,
    keywords,
    alternates: { canonical: articleUrl },
    openGraph: {
      type: "article",
      url: articleUrl,
      title: article.meta.title,
      description: article.meta.description,
      siteName: "Klemens",
      locale: "tr_TR",
      images: [ogImage],
      publishedTime: article.meta.date || undefined,
      authors: article.meta.author ? [article.meta.author] : undefined,
      tags: article.meta.tags.length > 0 ? article.meta.tags : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.meta.title,
      description: article.meta.description,
      images: [absImage || dynamicOgUrl],
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

  const relatedArticles = await getRelatedArticles(slug, article.meta.category);

  const absImg = article.meta.image
    ? article.meta.image.startsWith("http") ? article.meta.image : `https://klemensart.com${article.meta.image}`
    : undefined;
  const artUrl = `https://klemensart.com/icerikler/yazi/${slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.meta.title,
    description: article.meta.description,
    url: artUrl,
    ...(absImg && { image: absImg }),
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
      <ArticleReader article={article} relatedArticles={relatedArticles} />
    </>
  );
}
