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
  cover_caption?: string | null;
  cover_video_url?: string | null;
  cover_video_duration?: number | null;
  hero_overlay_enabled?: boolean;
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
