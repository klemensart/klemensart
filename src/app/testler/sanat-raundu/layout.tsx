import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanat Raundu — Klemens",
  description:
    "Rönesans'tan modern sanata, Türk sanatından dünya başyapıtlarına: bilginizi süreli trivia oyunuyla test edin!",
  alternates: { canonical: "/testler/sanat-raundu" },
  openGraph: {
    title: "Sanat Raundu — Klemens",
    description:
      "Rönesans'tan modern sanata, Türk sanatından dünya başyapıtlarına: bilginizi süreli trivia oyunuyla test edin!",
    url: "https://klemensart.com/testler/sanat-raundu",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
