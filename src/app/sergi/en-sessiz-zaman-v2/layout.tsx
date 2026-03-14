import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "En Sessiz Zaman v2 — Cok Odali 3D Sanal Galeri",
  description:
    "Theo Atay'in 'En Sessiz Zaman' sergisi. 6 odali, cok odali 3D sanal galeri deneyimi. 21 eser, 9 antik Anadolu sehrinden.",
  alternates: { canonical: "/sergi/en-sessiz-zaman-v2" },
  openGraph: {
    title: "En Sessiz Zaman v2 — Cok Odali Sanal Galeri — Klemens",
    description:
      "6 odali 3D sanal galeri. 21 fotograf, 9 antik Anadolu sehrinden. Theo Atay'in objektifinden.",
    url: "https://klemensart.com/sergi/en-sessiz-zaman-v2",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "En Sessiz Zaman v2 — Cok Odali Sanal Galeri",
    description:
      "6 odali 3D sanal galeri. 21 fotograf, 9 antik Anadolu sehrinden.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default function SergiV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
