import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Completing Sign In",
  description: "Complete secure sign-in to your IntervAi account.",
  path: "/auth/callback",
  noIndex: true,
});

export default function AuthCallbackLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
