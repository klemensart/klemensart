import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://klemensart.com"),
  title: {
    default: "Klemens — Kültür, Sanat ve Düşünce",
    template: "%s — Klemens",
  },
  description:
    "Yeni nesil kültür, sanat ve düşünce ekosistemi. Sanat tarihi atölyeleri, kültür testleri, interaktif harita, dijital sergiler ve derinlemesine içerikler.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Klemens",
    images: [{ url: "/logos/logo-wide-dark.PNG", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@KlemensArt",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Klemens Art",
  description: "Yeni nesil kültür, sanat ve düşünce ekosistemi.",
  url: "https://klemensart.com",
  logo: "https://klemensart.com/logos/logo-wide-dark.PNG",
  sameAs: [
    "https://instagram.com/klemens.art",
    "https://x.com/KlemensArt",
    "https://www.linkedin.com/company/klemens-art",
    "https://www.youtube.com/@KlemensArt",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={`${jakarta.variable} ${playfair.variable} font-sans antialiased bg-white text-warm-900`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
