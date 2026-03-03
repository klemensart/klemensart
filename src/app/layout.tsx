import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Klemens — Kültür, Sanat ve Düşünce",
  description:
    "Sanat tarihi, sinema, psikoloji ve felsefe alanlarında insani ve sıcak bir keşif yolculuğu. Zoom atölyeler, kültür testleri ve tematik içerikler.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${jakarta.variable} ${playfair.variable} font-sans antialiased bg-white text-warm-900`}>
        {children}
      </body>
    </html>
  );
}
