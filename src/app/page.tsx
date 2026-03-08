import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Hizmetler from "@/components/Hizmetler";
import IceriklerSection from "@/components/IceriklerSection";
import Manifesto from "@/components/Manifesto";
import Etkinlikler from "@/components/Etkinlikler";
import Footer from "@/components/Footer";

const HaritaBanner = dynamic(() => import("@/components/HaritaBanner"));
const DunyamiziBolum = dynamic(() => import("@/components/DunyamiziBolum"));
const Bulten = dynamic(() => import("@/components/Bulten"));

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "Klemens — Yeni Nesil Kültür, Sanat ve Düşünce Ekosistemi",
    description:
      "Yeni nesil kültür, sanat ve düşünce ekosistemi. Sanat tarihi atölyeleri, kültür testleri, interaktif harita, dijital sergiler ve derinlemesine içerikler.",
  },
};

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HaritaBanner />
      <Hizmetler />
      <DunyamiziBolum />
      <IceriklerSection />
      <Manifesto />
      <Etkinlikler />
      <Bulten />
      <Footer />
    </main>
  );
}
