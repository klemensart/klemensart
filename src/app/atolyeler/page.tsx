import type { Metadata } from "next";
import AtolyelerClient from "./AtolyelerClient";

export const metadata: Metadata = {
  title: "Atölyeler",
  description:
    "Canlı Zoom atölyeleri ve tekli oturumlar ile sanat tarihine derinlemesine dalış. Sanat Tarihinde Duygular, Modern Sanat, Rönesans ve daha fazlası.",
  alternates: { canonical: "/atolyeler" },
  openGraph: {
    title: "Sanat Tarihi Atölyeleri — Klemens",
    description:
      "Canlı Zoom atölyeleri ve tekli oturumlar ile sanat tarihine derinlemesine dalış.",
    url: "https://klemensart.com/atolyeler",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanat Tarihi Atölyeleri — Klemens",
    description:
      "Canlı Zoom atölyeleri ve tekli oturumlar ile sanat tarihine derinlemesine dalış.",
  },
};

export default function AtolyelerPage() {
  return <AtolyelerClient />;
}
