import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanat Tahmini Oyunu",
  description:
    "Hangi sanatçının eseri? Sanat tarihindeki ünlü tabloları tanıyın, bilginizi test edin.",
  alternates: { canonical: "/oyun/sanat-tahmini" },
  openGraph: {
    title: "Sanat Tahmini Oyunu — Klemens",
    description: "Hangi sanatçının eseri? Sanat bilginizi test edin.",
    url: "https://klemensart.com/oyun/sanat-tahmini",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanat Tahmini Oyunu",
    description: "Hangi sanatçının eseri? Sanat bilginizi test edin.",
  },
};

export default function OyunLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
