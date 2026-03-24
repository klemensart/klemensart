import { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Hero from "@/components/Hero";
import Hizmetler from "@/components/Hizmetler";
import IceriklerSection from "@/components/IceriklerSection";
import Footer from "@/components/Footer";

const HaritaBanner = dynamic(() => import("@/components/HaritaBanner"));
const LeonardoBanner = dynamic(() => import("@/components/LeonardoBanner"));
const DunyamiziBolum = dynamic(() => import("@/components/DunyamiziBolum"));
const Manifesto = dynamic(() => import("@/components/Manifesto"));
const Etkinlikler = dynamic(() => import("@/components/Etkinlikler"));
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
    url: "https://klemensart.com",
    type: "website",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
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
      <AnnouncementBar page="homepage" />
      <Navbar />
      <Hero />
      <Suspense fallback={<div className="h-64 bg-warm-50 animate-pulse" />}>
        <HaritaBanner />
      </Suspense>
      <Hizmetler />
      <Suspense fallback={<div className="h-64 bg-warm-50 animate-pulse" />}>
        <LeonardoBanner />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-warm-50 animate-pulse" />}>
        <DunyamiziBolum />
      </Suspense>
      <IceriklerSection />
      <Suspense fallback={<div className="h-96 bg-warm-50 animate-pulse" />}>
        <Manifesto />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-warm-50 animate-pulse" />}>
        <Etkinlikler />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-warm-50 animate-pulse" />}>
        <Bulten />
      </Suspense>
      <Footer />
      <MuzeRehberBanner />
    </main>
  );
}
