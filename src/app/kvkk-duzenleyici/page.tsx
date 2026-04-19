import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni — Düzenleyiciler",
  description:
    "Klemens platformunda düzenleyiciler için KVKK aydınlatma metni.",
};

export default function KvkkDuzenleyiciPage() {
  return (
    <>
      <Navbar solid />
      <main className="bg-cream min-h-screen">
        <section className="max-w-3xl mx-auto px-6 pt-28 pb-20">
          <h1 className="text-3xl font-extrabold text-warm-900 mb-6">
            KVKK Aydınlatma Metni — Düzenleyiciler
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
