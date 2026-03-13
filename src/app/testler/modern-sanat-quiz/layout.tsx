import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modern Sanat Quizi — Klemens",
  description:
    "Empresyonizmden soyut sanata: modern sanatın başyapıtlarını ne kadar tanıyorsunuz? 10 soruda kendinizi test edin.",
  alternates: { canonical: "/testler/modern-sanat-quiz" },
  openGraph: {
    title: "Modern Sanat Quizi — Klemens",
    description:
      "Empresyonizmden soyut sanata: modern sanatın başyapıtlarını ne kadar tanıyorsunuz? 10 soruda kendinizi test edin.",
    url: "https://klemensart.com/testler/modern-sanat-quiz",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
