import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const { projects } = await getContent();
  return ["", "/work", "/about", "/services", "/contact", "/privacy", ...projects.map((p) => `/work/${p.slug}`)].map((path) => ({ url: `${base}${path}` }));
}
