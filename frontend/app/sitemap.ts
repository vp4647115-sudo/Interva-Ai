import type { MetadataRoute } from "next";

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
  return publicRoutes.map((route) => ({
    url: `https://intervai.vpnpro.in${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
