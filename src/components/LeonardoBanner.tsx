import Image from "next/image";

export default function LeonardoBanner() {
  return (
    <section className="relative overflow-hidden" style={{ background: "#141414" }}>
      {/* Float animation */}
      <style>{`
        @keyframes leonardo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Text */}
        <div>
          <span
            className="block mb-4"
            style={{
              color: "#FF6D60",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            LEONARDO&apos;NUN AT&Ouml;LYESİ
          </span>
          <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-5">
            R&ouml;nesans&apos;&#305;n Dehas&#305;yla
            <br />
            Y&uuml;z Y&uuml;ze
          </h2>
          <p className="text-white/40 text-sm md:text-base leading-relaxed mb-8 max-w-md">
            5 gizemli oda, 25 zorlu soru. Leonardo da Vinci sizi
            at&ouml;lyesinde a&#287;&#305;rl&#305;yor &mdash; bilginizi
            s&#305;nay&#305;n, sanat tarihini ke&#351;fedin.
          </p>
          <a
            href="/testler/leonardo-atolyesi"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            At&ouml;lyeye Gir
            <span className="text-base">&rarr;</span>
          </a>
        </div>

        {/* Portrait */}
        <div className="flex justify-center md:justify-end">
          <div
            className="relative rounded-2xl overflow-hidden border border-white/5"
            style={{
              animation: "leonardo-float 3s ease-in-out infinite",
              boxShadow: "0 0 60px rgba(255,109,96,0.08)",
            }}
          >
            <Image
              src="/images/leonardo/fallback-portrait.webp"
              alt="Leonardo da Vinci portresi"
              width={480}
              height={720}
              className="block"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
