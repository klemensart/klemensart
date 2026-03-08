import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yalnızlık Sergisi",
  description:
    "İnteraktif dijital sergi: Yalnızlığın sanat tarihindeki yansımaları. 3D galeri deneyimi.",
  alternates: { canonical: "/sergi/yalnizlik" },
  openGraph: {
    title: "Yalnızlık — Dijital Sergi",
    description: "Yalnızlığın sanat tarihindeki yansımaları. İnteraktif 3D galeri deneyimi.",
  },
};

export default function SergiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
