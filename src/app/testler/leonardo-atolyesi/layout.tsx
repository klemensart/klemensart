import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leonardo'nun Atölyesi — Klemens",
  description:
    "Leonardo da Vinci'nin atölyesinde 5 oda, 25 soru! Rönesans dehasının dünyasını interaktif bir görsel roman deneyimiyle keşfedin.",
  alternates: { canonical: "/testler/leonardo-atolyesi" },
  openGraph: {
    title: "Leonardo'nun Atölyesi — Klemens",
    description:
      "Leonardo da Vinci'nin atölyesinde 5 oda, 25 soru! Rönesans dehasının dünyasını interaktif bir görsel roman deneyimiyle keşfedin.",
    url: "https://klemensart.com/testler/leonardo-atolyesi",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
