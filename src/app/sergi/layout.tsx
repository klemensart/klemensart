import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "En Sessiz Zaman — Dijital Sergi",
  description:
    "Antik topraklarda bir fotoğraf sergisi. Theo Atay'ın objektifinden 3D galeri deneyimi.",
  alternates: { canonical: "/sergi/en-sessiz-zaman" },
  openGraph: {
    title: "En Sessiz Zaman — Dijital Sergi — Klemens",
    description:
      "Antik topraklarda bir fotoğraf sergisi. Theo Atay'ın objektifinden 3D galeri deneyimi.",
    url: "https://klemensart.com/sergi/en-sessiz-zaman",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "En Sessiz Zaman — Dijital Sergi",
    description:
      "Antik topraklarda bir fotoğraf sergisi. Theo Atay'ın objektifinden 3D galeri deneyimi.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default function SergiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div
        aria-hidden="false"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        <h1>En Sessiz Zaman — Dijital Fotoğraf Sergisi</h1>
        <p>
          Theo Atay&apos;ın objektifinden Afrodisias, Efes, Pamukkale ve Kapadokya gibi antik
          toprakların fotoğraf sergisi. 3D galeri deneyimiyle Anadolu&apos;nun kültürel mirasını keşfedin.
        </p>
      </div>
    </>
  );
}
