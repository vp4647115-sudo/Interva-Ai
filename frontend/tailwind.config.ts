import type { Config } from "tailwindcss";

// Design tokens from design.md §3–5. No ad hoc hex colors in components (rule.md §3).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#6C4CFF", hover: "#5B3FE6", soft: "#F0ECFF" },
        lavender: "#EDE3F8",
        pink: { soft: "#F9EAF3", accent: "#F72585" },
        success: { DEFAULT: "#22C55E", soft: "#E9F9EF" },
        warning: { DEFAULT: "#F59E0B", soft: "#FFF7E6" },
        error: { DEFAULT: "#EF4444", soft: "#FEF2F2" },
        background: "#F7F7F8",
        surface: "#FFFFFF",
        "surface-alt": "#FAFAFC",
        border: "#E7E7EC",
        ink: { primary: "#111111", secondary: "#667085", muted: "#98A2B3" },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Inter", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        input: "14px",
        card: "24px",
        modal: "28px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 8px 30px rgba(17,17,17,0.06)",
        modal: "0 20px 60px rgba(17,17,17,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
