import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Verify Your Account",
  description: "Verify your IntervAi account to access interview preparation features.",
  path: "/auth/verify",
  noIndex: true,
});

export default function VerifyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
