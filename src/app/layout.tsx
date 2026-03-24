import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PageTracker from "@/components/PageTracker";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  style: ["italic"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://klemensart.com"),
  title: {
    default: "Klemens — Kültür, Sanat ve Düşünce",
    template: "%s — Klemens",
  },
  description:
    "Yeni nesil kültür, sanat ve düşünce ekosistemi. Sanat tarihi atölyeleri, kültür testleri, interaktif harita, dijital sergiler ve derinlemesine içerikler.",
  keywords: [
    "kültür sanat",
    "sanat tarihi",
    "kültür platformu",
    "sanat atölyesi",
    "kültür etkinlikleri",
    "dijital sergi",
    "Ankara kültür",
    "sanat eğitimi",
    "klemens",
    "klemens art",
  ],
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

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Klemens",
  alternateName: "Klemens Art",
  url: "https://klemensart.com",
  inLanguage: "tr",
  publisher: { "@type": "Organization", name: "Klemens Art" },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://klemensart.com/icerikler?kategori={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://klemensart.com/#localbusiness",
  name: "Klemens Art",
  description: "Ankara merkezli kültür, sanat ve düşünce platformu. Sanat tarihi atölyeleri, kültür etkinlikleri ve dijital sergiler.",
  url: "https://klemensart.com",
  logo: "https://klemensart.com/logos/logo-wide-dark.PNG",
  image: "https://klemensart.com/logos/logo-wide-dark.PNG",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ankara",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 39.9334,
    longitude: 32.8597,
  },
  sameAs: [
    "https://instagram.com/klemens.art",
    "https://x.com/KlemensArt",
    "https://www.linkedin.com/company/klemens-art",
    "https://www.youtube.com/@KlemensArt",
  ],
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
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
        <link rel="preconnect" href="https://sgabkrzzzszfqrtgkord.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://sgabkrzzzszfqrtgkord.supabase.co" />
      </head>
      <body className={`${jakarta.variable} ${playfair.variable} font-sans antialiased bg-white text-warm-900`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        {children}
        <CookieConsent />
        <GoogleAnalytics />
        <PageTracker />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
