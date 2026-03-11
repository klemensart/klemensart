import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Kültür Testleri",
  description:
    "Sanat, sinema ve kültür bilginizi eğlenceli testlerle ölçün. Görsel algı testi ve daha fazlası.",
  alternates: { canonical: "/testler" },
  openGraph: {
    title: "Kültür Testleri — Klemens",
    description:
      "Sanat, sinema ve kültür bilginizi eğlenceli testlerle ölçün.",
  },
};

export default function TestlerLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://klemensart.com" },
      { "@type": "ListItem", position: 2, name: "Testler", item: "https://klemensart.com/testler" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
