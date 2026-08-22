import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "InterviewAI — Practice interviews with AI",
  description:
    "Role-specific AI mock interviews with structured feedback, scores, and a personalized practice plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={jakarta.variable}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
