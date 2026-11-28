import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/auth/", "/dashboard", "/onboarding", "/profile", "/preferences"] },
    ],
    sitemap: "https://intervai.vpnpro.in/sitemap.xml",
    host: "https://intervai.vpnpro.in",
  };
}
