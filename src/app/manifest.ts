import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Klemens — Kültür Sanat Platformu",
    short_name: "Klemens",
    description:
      "Ankara merkezli bağımsız kültür-sanat platformu. Yazılar, etkinlikler, atölyeler ve kültür haritası.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8F5",
    theme_color: "#FF6D60",
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
