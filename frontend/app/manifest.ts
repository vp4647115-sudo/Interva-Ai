import type { MetadataRoute } from "next";
import { BRAND_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    description: "AI-powered interview preparation and practice.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6C4CFF",
    icons: [
      { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
