import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Kültür Testleri",
  description:
    "Sanat, sinema ve kültür bilginizi eğlenceli testlerle ölçün. Görsel algı testi ve daha fazlası.",
  alternates: { canonical: "/testler" },
};

export default function TestlerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
