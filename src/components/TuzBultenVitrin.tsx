import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "13", label: "Yazı" },
  { value: "9", label: "Yazar" },
  { value: "1", label: "Tema" },
];

export default function TuzBultenVitrin() {
  return (
    <section className="bg-warm-50 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* İllüstrasyon */}
        <div className="flex justify-center order-1">
          <div>
            <div className="md:rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <a
                href="https://www.instagram.com/delikli.iliskiler/"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl overflow-hidden border border-warm-200 shadow-lg"
              >
                <Image
                  src="https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/email-assets/tuz-bulten-vitrin.jpg"
                  alt="Tuz Bülteni illüstrasyon — Delikli İlişkiler"
                  width={480}
                  height={510}
                  className="block"
                  priority
                  quality={75}
                />
              </a>
            </div>
            <p className="text-xs text-warm-900/30 mt-3 text-center italic">
              Çizim:{" "}
              <a
                href="https://www.instagram.com/delikli.iliskiler/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral/60 hover:text-coral transition-colors"
              >
                @delikli.iliskiler
              </a>
            </p>
          </div>
        </div>

        {/* Metin */}
        <div className="order-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-coral/10 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-coral" />
            <span className="text-sm font-semibold text-coral tracking-wide uppercase">
              Tuz Bülteni · Sayı 02
            </span>
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-warm-900 leading-tight mb-5">
            İkinci Sayımız
            <br />
            Yayında
          </h2>

          <p className="text-warm-900/55 text-sm md:text-base leading-relaxed mb-4 max-w-md">
            İkinci sayımızda tuzun peşindeyiz: sanatta, tarihte, kültürde ve
            yaşamda. 13 yazı, 9 yazar, 1 tema.
          </p>

          <div className="flex gap-6 mb-8">
            {stats.map((s) => (
              <div key={s.label}>
                <span className="block text-2xl font-bold text-coral">
                  {s.value}
                </span>
                <span className="text-xs text-warm-900/40">{s.label}</span>
              </div>
            ))}
          </div>

          <Link
            href="/bulten?ref=tuz-bulten"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            Bülteni Keşfet
            <span className="text-base">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
