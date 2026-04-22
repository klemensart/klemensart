"use client";

import NewsletterFormAeon from "@/components/NewsletterFormAeon";

export default function Bulten() {
  return (
    <section id="bulten" className="py-24 px-6 bg-warm-900">
      <div className="max-w-xl mx-auto">
        <NewsletterFormAeon source="homepage" />
      </div>
    </section>
  );
}
