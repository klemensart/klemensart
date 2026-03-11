import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanat Tahmini Oyunu",
  description:
    "Hangi sanatçının eseri? Sanat tarihindeki ünlü tabloları tanıyın, bilginizi test edin.",
  alternates: { canonical: "/oyun/sanat-tahmini" },
  openGraph: {
    title: "Sanat Tahmini Oyunu — Klemens",
    description: "Hangi sanatçının eseri? Sanat bilginizi test edin.",
    url: "https://klemensart.com/oyun/sanat-tahmini",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanat Tahmini Oyunu",
    description: "Hangi sanatçının eseri? Sanat bilginizi test edin.",
    images: ["/logos/logo-wide-dark.PNG"],
  },
};

export default function OyunLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div
        aria-hidden="false"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        <h1>Sanat Tahmini Oyunu</h1>
        <p>
          Sanat tarihinin en ünlü tablolarını tanıyın, hangi sanatçının eseri olduğunu tahmin edin.
          Leonardo da Vinci, Van Gogh, Monet ve daha birçok ustanın başyapıtlarıyla bilginizi test edin.
        </p>
      </div>
    </>
  );
}
