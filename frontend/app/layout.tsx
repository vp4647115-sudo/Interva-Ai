import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { CookieConsent } from "@/components/privacy/CookieConsent";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://intervai.vpnpro.in"),
  title: "IntervAi — Practice interviews with AI",
  description:
    "Role-specific AI mock interviews with structured feedback, scores, and a personalized practice plan.",
  openGraph: {
    type: "website",
    siteName: "IntervAi",
    title: "IntervAi — Practice interviews with AI",
    description:
      "Role-specific AI mock interviews with structured feedback, scores, and a personalized practice plan.",
    url: "https://intervai.vpnpro.in",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "IntervAi interview preparation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IntervAi — Practice interviews with AI",
    description:
      "Role-specific AI mock interviews with structured feedback, scores, and a personalized practice plan.",
    images: ["/opengraph-image"],
  },
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
            {children}
            <CookieConsent />
          </ToastProvider>
        </QueryProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "IntervAi",
                  url: "https://intervai.vpnpro.in",
                  logo: "https://intervai.vpnpro.in/favicon.ico",
                  sameAs: [
                    "https://x.com/vp4647115",
                    "https://www.linkedin.com/in/vaibhav-patil2032",
                    "https://github.com/vp4647115-sudo",
                  ],
                },
                {
                  "@type": "WebSite",
                  name: "IntervAi",
                  url: "https://intervai.vpnpro.in",
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
