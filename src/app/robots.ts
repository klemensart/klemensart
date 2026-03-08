import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/club/profil", "/admin/", "/auth/"],
      },
    ],
    sitemap: "https://klemensart.com/sitemap.xml",
  };
}
