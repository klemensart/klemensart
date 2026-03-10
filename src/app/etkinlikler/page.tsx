import type { Metadata } from "next";
import EtkinliklerClient from "./EtkinliklerClient";

export const metadata: Metadata = {
  title: "Kültür & Sanat Takvimi",
  description:
    "Ankara ve çevresindeki sergi, konser, tiyatro, söyleşi ve festival etkinliklerini keşfedin.",
  alternates: { canonical: "/etkinlikler" },
  openGraph: {
    title: "Kültür & Sanat Takvimi — Klemens",
    description:
      "Ankara ve çevresindeki sergi, konser, tiyatro, söyleşi ve festival etkinliklerini keşfedin.",
    url: "https://klemensart.com/etkinlikler",
  },
};

export default function EtkinliklerPage() {
  return <EtkinliklerClient />;
}
