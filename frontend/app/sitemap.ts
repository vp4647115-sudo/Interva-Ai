import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const publicRoutes = [
  "",
  "/about",
  "/blog",
  "/careers",
  "/contact",
  "/cookies",
  "/documentation",
  "/faq",
  "/help-center",
  "/interview-guides",
  "/press-kit",
  "/privacy",
  "/question-bank",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return publicRoutes.map((route) => ({
    url: new URL(route || "/", SITE_URL).toString(),
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
