import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Düzenleyici Platform Kullanım Koşulları",
  description: "Klemens platformunda düzenleyiciler için kullanım koşulları.",
};

export default function DuzenleyiciKosullariPage() {
  return (
    <>
      <Navbar solid />
      <main className="bg-cream min-h-screen">
        <section className="max-w-3xl mx-auto px-6 pt-28 pb-20">
          <h1 className="text-3xl font-extrabold text-warm-900 mb-6">
            Düzenleyici Platform Kullanım Koşulları
          </h1>
          <div className="bg-white rounded-2xl border border-warm-100 p-8">
            <p className="text-warm-900/60 leading-relaxed">
              Bu sayfa hazırlanma aşamasındadır. Yakında yayımlanacaktır.
              Soru ve önerileriniz için:{" "}
              <a
                href="mailto:info@klemensart.com"
                className="text-coral hover:underline"
              >
                info@klemensart.com
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
