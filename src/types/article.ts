import type { PersonSummary } from "./people";

/** Makale metadata — listeleme ve SEO için */
export type ArticleMeta = {
  title: string;
  description: string;
  author: string;
  authorIg?: string;
  authorEmail?: string;
  date: string;
  category: string;
  tags: string[];
  image: string;
  readTime: string;
  slug: string;
  /* FK — people tablosuna */
  author_id?: string | null;
  author_person?: PersonSummary | null;
};

/** Parse edilmiş makale — detay sayfası için */
export type ParsedArticle = {
  meta: ArticleMeta;
  contentHtml: string;
};
