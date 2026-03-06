import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Hizmetler from "@/components/Hizmetler";
import DunyamiziBolum from "@/components/DunyamiziBolum";
import IceriklerSection from "@/components/IceriklerSection";
import HaritaBanner from "@/components/HaritaBanner";
import Manifesto from "@/components/Manifesto";
import Etkinlikler from "@/components/Etkinlikler";
import Bulten from "@/components/Bulten";
import Footer from "@/components/Footer";

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
