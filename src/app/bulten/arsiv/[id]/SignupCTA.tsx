"use client";

import NewsletterFormAeon from "@/components/NewsletterFormAeon";

export default function SignupCTA() {
  return (
    <section className="py-20 px-6 bg-warm-50">
      <div className="max-w-xl mx-auto">
        <NewsletterFormAeon source="archive" />
      </div>
    </section>
  );
}
