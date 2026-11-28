import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { CookieConsent } from "@/components/privacy/CookieConsent";
import { BRAND_NAME, SITE_URL } from "@/lib/site";
import { AppBreadcrumbs } from "@/components/seo/AppBreadcrumbs";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "IntervAi — Practice interviews with AI",
  description:
    "Role-specific AI mock interviews with structured feedback, scores, and a personalized practice plan.",
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    title: "IntervAi — Practice interviews with AI",
    description:
      "Role-specific AI mock interviews with structured feedback, scores, and a personalized practice plan.",
    url: SITE_URL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "IntervAi interview preparation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IntervAi — Practice interviews with AI",
    description:
      "Role-specific AI mock interviews with structured feedback, scores, and a personalized practice plan.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={jakarta.variable}>
        <QueryProvider>
          <ToastProvider>
            <AppBreadcrumbs />
            {children}
            <CookieConsent />
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
