import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.SITE_URL || "https://daat.tech").replace(/\/$/, "");
  return {
    rules: [
      { userAgent: ["OAI-SearchBot", "ChatGPT-User", "Googlebot", "Google-Extended"], allow: "/", disallow: ["/api/"] },
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
