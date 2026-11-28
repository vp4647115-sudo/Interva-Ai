import type { Metadata } from "next";
import { BRAND_NAME, SITE_URL } from "@/lib/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: BRAND_NAME,
      title,
      description,
      url,
      images: [{ url: new URL("/opengraph-image", SITE_URL).toString(), width: 1200, height: 630, alt: `${BRAND_NAME} interview preparation` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/opengraph-image", SITE_URL).toString()],
    },
  };
}
