import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Reset Password",
  description: "Request a secure password reset for your IntervAi account.",
  path: "/auth/reset-password",
  noIndex: true,
});

export default function ResetPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
