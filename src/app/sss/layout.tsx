import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description:
    "Klemens Art hakkında merak ettiğiniz her şey: platform, kültür haritası, atölyeler, dijital sergi, etkinlikler ve daha fazlası.",
  keywords: [
    "klemens art sss",
    "sık sorulan sorular",
    "kültür haritası nasıl çalışır",
    "atölye kayıt",
    "dijital sergi",
    "klemens art nedir",
  ],
  alternates: { canonical: "/sss" },
  openGraph: {
    title: "Sık Sorulan Sorular — Klemens",
    description:
      "Klemens Art hakkında merak ettiğiniz her şey: platform, kültür haritası, atölyeler, dijital sergi ve daha fazlası.",
    url: "https://klemensart.com/sss",
  },
};

export default function SSSLayout({ children }: { children: React.ReactNode }) {
  return children;
}
