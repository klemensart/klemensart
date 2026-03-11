import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Görsel Algı Testi",
  description:
    "Sanat eserlerini ne kadar dikkatli gözlemliyorsunuz? Görsel algınızı test edin.",
  alternates: { canonical: "/testler/gorsel-algi" },
  openGraph: {
    title: "Görsel Algı Testi — Klemens",
    description:
      "Sanat eserlerini ne kadar dikkatli gözlemliyorsunuz? Görsel algınızı test edin.",
  },
};

export default function GorselAlgiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
