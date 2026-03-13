import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rönesans Sanat Quizi — Klemens",
  description:
    "Rönesans döneminin 10 ünlü başyapıtını ne kadar tanıyorsunuz? Sanat bilginizi test edin.",
  alternates: { canonical: "/testler/ronesans-quiz" },
  openGraph: {
    title: "Rönesans Sanat Quizi — Klemens",
    description:
      "Rönesans döneminin 10 ünlü başyapıtını ne kadar tanıyorsunuz? Sanat bilginizi test edin.",
    url: "https://klemensart.com/testler/ronesans-quiz",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
