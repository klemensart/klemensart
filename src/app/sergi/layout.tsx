import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "En Sessiz Zaman — Dijital Sergi",
  description:
    "Antik topraklarda bir fotoğraf sergisi. Theo Atay'ın objektifinden 3D galeri deneyimi.",
  alternates: { canonical: "/sergi/en-sessiz-zaman" },
  openGraph: {
    title: "En Sessiz Zaman — Dijital Sergi",
    description: "Antik topraklarda bir fotoğraf sergisi. Theo Atay'ın objektifinden 3D galeri deneyimi.",
  },
};

export default function SergiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
