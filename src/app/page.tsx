import { Suspense } from "react";
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
const MuzeRehberBanner = dynamic(() => import("@/components/MuzeRehberBanner"));

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  keywords: [
    "kültür sanat platformu",
    "sanat tarihi atölyeleri",
    "Ankara kültür etkinlikleri",
    "sanat testleri",
    "interaktif kültür haritası",
    "dijital sergi",
    "sanat yazıları",
    "klemens art",
  ],
  openGraph: {
    title: "Klemens — Yeni Nesil Kültür, Sanat ve Düşünce Ekosistemi",
    description:
      "Yeni nesil kültür, sanat ve düşünce ekosistemi. Sanat tarihi atölyeleri, kültür testleri, interaktif harita, dijital sergiler ve derinlemesine içerikler.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Klemens — Yeni Nesil Kültür, Sanat ve Düşünce Ekosistemi",
    description:
      "Sanat tarihi atölyeleri, kültür testleri, interaktif harita, dijital sergiler ve derinlemesine içerikler.",
  },
};

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Suspense fallback={<div className="h-64 bg-warm-50 animate-pulse" />}>
        <HaritaBanner />
      </Suspense>
      <Hizmetler />
      <Suspense fallback={<div className="h-96 bg-warm-50 animate-pulse" />}>
        <DunyamiziBolum />
      </Suspense>
      <IceriklerSection />
      <Manifesto />
      <Etkinlikler />
      <Suspense fallback={<div className="h-64 bg-warm-50 animate-pulse" />}>
        <Bulten />
      </Suspense>
      <Footer />
      <MuzeRehberBanner />
    </main>
  );
}
