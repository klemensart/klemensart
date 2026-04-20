"use client";

import NewsletterFormAeon from "@/components/NewsletterFormAeon";

export default function ArticleNewsletterCTA({ darkMode: _darkMode }: { darkMode: boolean }) {
  return (
    <div className="mx-auto px-6 mb-16" style={{ maxWidth: "720px" }}>
      <NewsletterFormAeon source="article" />
    </div>
  );
}
