import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/auth/",
          "/answer-library",
          "/application-kits",
          "/backend-api/",
          "/communication",
          "/cover-letters",
          "/dashboard",
          "/interview-buddy",
          "/jobs",
          "/mock-interviews",
          "/onboarding",
          "/preferences",
          "/profile",
          "/resume",
          "/saved-jobs",
          "/api/",
          "/docs",
          "/openapi.json",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
